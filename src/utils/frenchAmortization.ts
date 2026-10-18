import { Installment, InstallmentStatus, PaymentFrequency } from '../types';

export interface FrenchScheduleParams {
  principal: number;
  monthlyInterestRatePercent: number; // Ej: 3.5% mensual
  termPeriods: number; // Número de cuotas
  frequency: PaymentFrequency;
  startDate: string; // YYYY-MM-DD
  insuranceOrMonthlyFee?: number; // Cargos fijos por cuota
}

export function getPeriodicRate(monthlyRatePercent: number, frequency: PaymentFrequency): number {
  const r = monthlyRatePercent / 100;
  switch (frequency) {
    case 'MENSUAL':
      return r;
    case 'QUINCENAL':
      return r / 2; // O tasa efectiva quincenal
    case 'SEMANAL':
      return r / 4;
    case 'DIARIO':
      return r / 30;
    default:
      return r;
  }
}

export function addPeriodsToDate(dateStr: string, periods: number, frequency: PaymentFrequency): string {
  const d = new Date(dateStr + 'T12:00:00');
  
  if (frequency === 'MENSUAL') {
    d.setMonth(d.getMonth() + periods);
  } else if (frequency === 'QUINCENAL') {
    d.setDate(d.getDate() + (periods * 15));
  } else if (frequency === 'SEMANAL') {
    d.setDate(d.getDate() + (periods * 7));
  } else if (frequency === 'DIARIO') {
    d.setDate(d.getDate() + periods);
  }

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function calculateFrenchInstallment(principal: number, periodicRate: number, totalPeriods: number): number {
  if (totalPeriods <= 0) return 0;
  if (periodicRate === 0) {
    return principal / totalPeriods;
  }
  // Formula: R = P * ( i / (1 - (1 + i)^(-n)) )
  const factor = Math.pow(1 + periodicRate, totalPeriods);
  const installment = principal * ((periodicRate * factor) / (factor - 1));
  return Math.round(installment * 100) / 100;
}

export function generateFrenchSchedule(params: FrenchScheduleParams): Installment[] {
  const { principal, monthlyInterestRatePercent, termPeriods, frequency, startDate, insuranceOrMonthlyFee = 0 } = params;
  const periodicRate = getPeriodicRate(monthlyInterestRatePercent, frequency);
  const fixedPayment = calculateFrenchInstallment(principal, periodicRate, termPeriods);

  const schedule: Installment[] = [];
  let currentBalance = principal;

  for (let i = 1; i <= termPeriods; i++) {
    const interest = Math.round(currentBalance * periodicRate * 100) / 100;
    let principalAmort = Math.round((fixedPayment - interest) * 100) / 100;

    // Adjust for the last installment rounding
    if (i === termPeriods) {
      principalAmort = currentBalance;
    } else if (principalAmort > currentBalance) {
      principalAmort = currentBalance;
    }

    const totalInstallment = Math.round((principalAmort + interest + insuranceOrMonthlyFee) * 100) / 100;
    currentBalance = Math.max(0, Math.round((currentBalance - principalAmort) * 100) / 100);
    const dueDate = addPeriodsToDate(startDate, i, frequency);

    schedule.push({
      number: i,
      dueDate,
      paymentAmount: totalInstallment,
      principalAmount: principalAmort,
      interestAmount: interest,
      insuranceOrFees: insuranceOrMonthlyFee,
      remainingBalance: currentBalance,
      status: 'PENDIENTE',
      paidAmount: 0,
      daysOverdue: 0,
      lateFee: 0,
    });
  }

  return schedule;
}

/**
 * Recalcula días de mora y recargo por mora para cuotas no pagadas
 */
export function recalculateOverdue(
  schedule: Installment[],
  referenceDateStr: string,
  dailyLateFeePercent: number = 0.15, // 0.15% diario sobre cuota
  gracePeriodDays: number = 2
): Installment[] {
  const refDate = new Date(referenceDateStr + 'T23:59:59');

  return schedule.map(inst => {
    if (inst.status === 'PAGADA') return inst;

    const dueDate = new Date(inst.dueDate + 'T23:59:59');
    const diffTime = refDate.getTime() - dueDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > gracePeriodDays) {
      const daysOverdue = diffDays;
      // Mora = Cuota * (Tasa diaria % / 100) * días de mora
      const lateFee = Math.round((inst.paymentAmount * (dailyLateFeePercent / 100) * daysOverdue) * 100) / 100;
      return {
        ...inst,
        status: 'VENCIDA' as InstallmentStatus,
        daysOverdue,
        lateFee,
      };
    } else {
      return {
        ...inst,
        status: inst.paidAmount > 0 ? ('PARCIAL' as InstallmentStatus) : ('PENDIENTE' as InstallmentStatus),
        daysOverdue: 0,
        lateFee: 0,
      };
    }
  });
}

export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  const symbols: Record<string, string> = {
    BOB: 'Bs',
    USD: '$',
    PEN: 'S/',
    MXN: '$',
    COP: '$',
    EUR: '€',
  };
  const sym = symbols[currencyCode] || currencyCode || 'Bs';
  return `${sym} ${amount.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
