/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LoanProvider, useLoanContext } from './context/LoanContext';
import { Sidebar, NavView } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { FrenchCalculator } from './components/FrenchCalculator';
import { ActivePortfolio } from './components/ActivePortfolio';
import { PendingPayments } from './components/PendingPayments';
import { OverdueLoans } from './components/OverdueLoans';
import { CivilContractView } from './components/CivilContractView';
import { ClientDocumentsView } from './components/ClientDocumentsView';
import { AccountingReports } from './components/AccountingReports';
import { ExchangeRateConfig } from './components/ExchangeRateConfig';
import { PaymentModal } from './components/PaymentModal';
import { NewLoanModal } from './components/NewLoanModal';
import { Loan } from './types';

function MainAppContent() {
  const [currentView, setCurrentView] = useState<NavView>('DASHBOARD');

  // Modals state
  const [isNewLoanModalOpen, setIsNewLoanModalOpen] = useState(false);
  const [newLoanInitialParams, setNewLoanInitialParams] = useState<any>(null);

  const [paymentLoan, setPaymentLoan] = useState<Loan | null>(null);
  const [paymentInstallmentNumber, setPaymentInstallmentNumber] = useState<number | undefined>(undefined);

  // Selected loan or client for deep-linking between views
  const [contractSelectedLoan, setContractSelectedLoan] = useState<Loan | null>(null);
  const [docsSelectedClientId, setDocsSelectedClientId] = useState<string | undefined>(undefined);

  const handleOpenPayment = (loan: Loan, installmentNumber?: number) => {
    setPaymentLoan(loan);
    setPaymentInstallmentNumber(installmentNumber);
  };

  const handleViewContract = (loan: Loan) => {
    setContractSelectedLoan(loan);
    setCurrentView('CONTRACTS');
  };

  const handleViewDocs = (clientId: string) => {
    setDocsSelectedClientId(clientId);
    setCurrentView('DOCUMENTS');
  };

  const handleConvertToLoanFromCalculator = (params: any) => {
    setNewLoanInitialParams(params);
    setIsNewLoanModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden text-slate-900 select-none font-sans">
      {/* Sidebar (Barra Lateral) */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenNewLoanModal={() => {
          setNewLoanInitialParams(null);
          setIsNewLoanModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <Header
          currentView={currentView}
          onOpenNewLoanModal={() => {
            setNewLoanInitialParams(null);
            setIsNewLoanModalOpen(true);
          }}
        />

        {/* Dynamic View Body */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {currentView === 'DASHBOARD' && (
              <DashboardOverview
                onNavigate={setCurrentView}
                onOpenNewLoanModal={() => {
                  setNewLoanInitialParams(null);
                  setIsNewLoanModalOpen(true);
                }}
                onSelectLoanForPayment={handleOpenPayment}
              />
            )}

            {currentView === 'CALCULATOR' && (
              <FrenchCalculator onConvertToLoan={handleConvertToLoanFromCalculator} />
            )}

            {currentView === 'ACTIVE_PORTFOLIO' && (
              <ActivePortfolio
                onSelectLoanForPayment={handleOpenPayment}
                onViewContract={handleViewContract}
                onViewClientDocs={handleViewDocs}
              />
            )}

            {currentView === 'PENDING_PAYMENTS' && (
              <PendingPayments onSelectLoanForPayment={handleOpenPayment} />
            )}

            {currentView === 'OVERDUE_LOANS' && (
              <OverdueLoans
                onSelectLoanForPayment={handleOpenPayment}
                onViewContract={handleViewContract}
              />
            )}

            {currentView === 'CONTRACTS' && (
              <CivilContractView initialLoan={contractSelectedLoan} />
            )}

            {currentView === 'DOCUMENTS' && (
              <ClientDocumentsView initialClientId={docsSelectedClientId} />
            )}

            {currentView === 'ACCOUNTING' && <AccountingReports />}

            {currentView === 'EXCHANGE_RATE' && <ExchangeRateConfig />}
          </div>
        </main>
      </div>

      {/* Payment Register Modal */}
      {paymentLoan && (
        <PaymentModal
          loan={paymentLoan}
          initialInstallmentNumber={paymentInstallmentNumber}
          onClose={() => {
            setPaymentLoan(null);
            setPaymentInstallmentNumber(undefined);
          }}
        />
      )}

      {/* New Loan Wizard Modal */}
      {isNewLoanModalOpen && (
        <NewLoanModal
          initialValues={newLoanInitialParams}
          onClose={() => {
            setIsNewLoanModalOpen(false);
            setNewLoanInitialParams(null);
          }}
          onSuccess={newLoan => {
            setIsNewLoanModalOpen(false);
            setNewLoanInitialParams(null);
            setContractSelectedLoan(newLoan);
            setCurrentView('ACTIVE_PORTFOLIO');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <LoanProvider>
      <MainAppContent />
    </LoanProvider>
  );
}
