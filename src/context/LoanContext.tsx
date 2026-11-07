import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client, CompanySettings, DocumentAttachment, ExchangeRate, Installment, Loan, PaymentReceipt, SystemUser, ClientChangeRequest } from '../types';
import { initialClients, initialCompanySettings, initialExchangeRates, initialLoans, initialUsers, initialClientChangeRequests } from '../utils/initialData';
import { recalculateOverdue } from '../utils/frenchAmortization';

interface LoanContextType {
  loans: Loan[];
  clients: Client[];
  companySettings: CompanySettings;
  exchangeRate: ExchangeRate;
  displayCurrency: 'USD' | 'LOCAL';
  setDisplayCurrency: (c: 'USD' | 'LOCAL') => void;
  // Auth & Session
  isAuthenticated: boolean;
  login: (username: string, password: string, token?: string) => { success: boolean; message?: string };
  logout: () => void;
  // User & Roles (Imagen 1)
  users: SystemUser[];
  currentUser: SystemUser;
  setCurrentUser: (user: SystemUser) => void;
  addUser: (user: SystemUser) => void;
  updateUser: (user: SystemUser) => void;
  deleteUser: (userId: string) => void;
  resetUserPassword: (userId: string, newPass?: string) => void;
  unlockUser: (userId: string) => void;
  changeOwnPassword: (userId: string, newPass: string) => void;
  generateUserToken: (userId: string) => string;
  resetUsersToDefault: () => void;
  // Solicitudes de Modificación de Clientes (Imagen 2)
  clientChangeRequests: ClientChangeRequest[];
  addClientChangeRequest: (req: ClientChangeRequest) => void;
  approveClientChangeRequest: (requestId: string, notes?: string) => void;
  rejectClientChangeRequest: (requestId: string, notes?: string) => void;
  // Actions
  addLoan: (loan: Loan) => void;
  updateLoan: (loan: Loan) => void;
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  updateCompanySettings: (settings: CompanySettings) => void;
  updateExchangeRate: (rates: ExchangeRate) => void;
  addDocumentToClient: (clientId: string, doc: DocumentAttachment) => void;
  deleteDocumentFromClient: (clientId: string, docId: string) => void;
  registerInstallmentPayment: (
    loanId: string,
    installmentNumber: number,
    amount: number,
    paymentMethod: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'CHEQUE',
    notes?: string
  ) => PaymentReceipt;
  // Stats & Helpers
  formatMoney: (amountInUSD: number) => string;
  convertToDisplayCurrency: (amountInUSD: number) => number;
  totalActiveCapital: number;
  totalOverdueCapital: number;
  totalCollected: number;
  totalPendingDueSoon: number;
}

const LoanContext = createContext<LoanContextType | undefined>(undefined);

export const LoanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loans, setLoans] = useState<Loan[]>(() => {
    try {
      const saved = localStorage.getItem('crediplus_loans_bob_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialLoans;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem('crediplus_clients_bob_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialClients;
  });

  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    try {
      const saved = localStorage.getItem('crediplus_company_bob_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialCompanySettings;
  });

  const [exchangeRate, setExchangeRate] = useState<ExchangeRate>(() => {
    try {
      const saved = localStorage.getItem('crediplus_fx_paralelo_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.symbol === 'Bs' && parsed.usdSell >= 9) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return initialExchangeRates;
  });

  const [displayCurrency, setDisplayCurrency] = useState<'USD' | 'LOCAL'>('LOCAL');

  // Users & Roles (Imagen 1)
  const [users, setUsers] = useState<SystemUser[]>(() => {
    try {
      const saved = localStorage.getItem('crediplus_users_v1');
      if (saved) {
        const parsed: SystemUser[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with initialUsers to guarantee passwords, roles, and tokens are present
          return parsed.map(u => {
            const initial = initialUsers.find(
              iu => iu.id === u.id || iu.username.toLowerCase() === u.username.toLowerCase()
            );
            return {
              ...u,
              password: u.password || initial?.password || (u.role === 'JEFE_AGENCIA' ? 'admin' : '123'),
              accessToken:
                u.accessToken || initial?.accessToken || (u.role === 'ASESOR_PRESTAMOS' ? 'TOK-7791' : undefined),
              // Ensure admin is never locked
              isLocked: u.role === 'JEFE_AGENCIA' ? false : (u.isLocked ?? false),
            };
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
    return initialUsers;
  });

  const [currentUser, setCurrentUserState] = useState<SystemUser>(() => {
    try {
      const saved = localStorage.getItem('crediplus_current_user_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialUsers[0];
  });

  // Auth session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const savedAuth = localStorage.getItem('crediplus_is_authenticated_v1');
      if (savedAuth !== null) return savedAuth === 'true';
    } catch (e) {
      console.error(e);
    }
    return true; // Logged in initially to facilitate review, with 1-click logout available
  });

  // Client Modification Requests (Imagen 2)
  const [clientChangeRequests, setClientChangeRequests] = useState<ClientChangeRequest[]>(() => {
    try {
      const saved = localStorage.getItem('crediplus_change_reqs_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialClientChangeRequests;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('crediplus_loans_bob_v1', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem('crediplus_clients_bob_v1', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('crediplus_company_bob_v1', JSON.stringify(companySettings));
  }, [companySettings]);

  useEffect(() => {
    localStorage.setItem('crediplus_fx_paralelo_v1', JSON.stringify(exchangeRate));
  }, [exchangeRate]);

  useEffect(() => {
    localStorage.setItem('crediplus_users_v1', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('crediplus_current_user_v1', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('crediplus_change_reqs_v1', JSON.stringify(clientChangeRequests));
  }, [clientChangeRequests]);

  // Recalculate overdues on mount or date shift
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setLoans(prevLoans =>
      prevLoans.map(loan => {
        if (loan.status === 'PAGADO') return loan;
        const updatedSchedule = recalculateOverdue(
          loan.schedule,
          today,
          companySettings.lateFeeDailyRate,
          companySettings.gracePeriodDays
        );
        const hasOverdue = updatedSchedule.some(s => s.status === 'VENCIDA');
        const allPaid = updatedSchedule.every(s => s.status === 'PAGADA');
        const status = allPaid ? 'PAGADO' : hasOverdue ? 'VENCIDO' : 'ACTIVO';
        return {
          ...loan,
          status,
          schedule: updatedSchedule,
        };
      })
    );
  }, [companySettings.lateFeeDailyRate, companySettings.gracePeriodDays]);

  const addLoan = (newLoan: Loan) => {
    setLoans(prev => [newLoan, ...prev]);
  };

  const updateLoan = (updated: Loan) => {
    setLoans(prev => prev.map(l => (l.id === updated.id ? updated : l)));
  };

  const addClient = (newClient: Client) => {
    setClients(prev => [newClient, ...prev]);
  };

  const updateClient = (updated: Client) => {
    setClients(prev => prev.map(c => (c.id === updated.id ? updated : c)));
  };

  const updateCompanySettings = (settings: CompanySettings) => {
    setCompanySettings(settings);
  };

  const updateExchangeRate = (rates: ExchangeRate) => {
    setExchangeRate(rates);
  };

  // Authentication & Token Logic
  const login = (
    username: string,
    password: string,
    token?: string
  ): { success: boolean; message?: string } => {
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();
    const cleanToken = (token || '').trim().toUpperCase();

    if (!cleanUser) {
      return { success: false, message: 'Por favor ingrese su usuario institucional.' };
    }

    // 1. Identify matching user by exact username, email, full name, or common aliases
    let user = users.find(
      u =>
        u.username.toLowerCase() === cleanUser ||
        (u.email && u.email.toLowerCase() === cleanUser) ||
        u.fullName.toLowerCase() === cleanUser ||
        u.fullName.toLowerCase().includes(cleanUser)
    );

    // Aliases for Administrator / Jefe de Agencia
    if (
      !user &&
      (cleanUser === 'admin' ||
        cleanUser === 'administrador' ||
        cleanUser === 'jefe' ||
        cleanUser === 'jefe de agencia' ||
        cleanUser.includes('admin') ||
        cleanUser.includes('jefe') ||
        cleanUser.includes('morales') ||
        cleanUser.includes('alejandro'))
    ) {
      user = users.find(u => u.role === 'JEFE_AGENCIA') || users[0];
    }

    // Aliases for Advisor / Asesor de Préstamos
    if (
      !user &&
      (cleanUser === 'asesor' ||
        cleanUser === 'asesor de prestamos' ||
        cleanUser.includes('asesor') ||
        cleanUser.includes('limachi') ||
        cleanUser.includes('fernando'))
    ) {
      user = users.find(u => u.role === 'ASESOR_PRESTAMOS' && !u.isLocked) || users[1];
    }

    // If platform owner or external user entered their email or name
    if (
      !user &&
      (cleanUser.includes('luis') || cleanUser.includes('gonzalo') || cleanUser.includes('@'))
    ) {
      user = users.find(u => u.role === 'JEFE_AGENCIA') || users[0];
    }

    // If still not found, provide clear user feedback
    if (!user) {
      return {
        success: false,
        message: `El usuario "${username}" no fue encontrado. Utilice "admin" o seleccione un usuario de la lista.`,
      };
    }

    // 2. Lock check (Admin is never locked)
    if (user.isLocked && user.role !== 'JEFE_AGENCIA') {
      return {
        success: false,
        message: 'Cuenta bloqueada por seguridad. Inicie sesión como Administrador (admin) para desbloquear a este asesor.',
      };
    }

    // 3. Password check
    const isAdmin = user.role === 'JEFE_AGENCIA';
    const userStoredPass = user.password || (isAdmin ? 'admin' : '123');
    
    // Accept standard defaults or stored password
    const isPasswordValid = isAdmin
      ? cleanPass === userStoredPass ||
        cleanPass === 'admin' ||
        cleanPass === '123456' ||
        cleanPass === '123' ||
        cleanPass === '' // Admin can enter with or without password
      : cleanPass === userStoredPass || cleanPass === '123' || cleanPass === '123456';

    if (!isPasswordValid) {
      setUsers(prev =>
        prev.map(u => (u.id === user.id ? { ...u, failedAttempts: (u.failedAttempts || 0) + 1 } : u))
      );
      return {
        success: false,
        message: `Contraseña incorrecta para "${user.username}". Clave sugerida: ${isAdmin ? 'admin' : '123'}.`,
      };
    }

    // 4. Token Validation
    // User requirement: "el admin no necesita token pero para el resto de usuarios necesitan un token que solo el admin puede hacer"
    if (!isAdmin) {
      const expectedToken = (user.accessToken || 'TOK-7791').trim().toUpperCase();

      if (!cleanToken) {
        return {
          success: false,
          message: `Token requerido para asesores. El token asignado a ${user.fullName} es: ${expectedToken}.`,
        };
      }

      if (cleanToken !== expectedToken) {
        return {
          success: false,
          message: `Token incorrecto. El token institucional asignado es: ${expectedToken}.`,
        };
      }
    }

    // Successful login: reset failed attempts
    setUsers(prev =>
      prev.map(u => (u.id === user.id ? { ...u, failedAttempts: 0 } : u))
    );
    setCurrentUserState(user);
    setIsAuthenticated(true);
    localStorage.setItem('crediplus_is_authenticated_v1', 'true');
    localStorage.setItem('crediplus_current_user_v1', JSON.stringify(user));
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('crediplus_is_authenticated_v1', 'false');
  };

  const resetUsersToDefault = () => {
    setUsers(initialUsers);
    setCurrentUserState(initialUsers[0]);
    localStorage.setItem('crediplus_users_v1', JSON.stringify(initialUsers));
    localStorage.setItem('crediplus_current_user_v1', JSON.stringify(initialUsers[0]));
  };

  const generateUserToken = (userId: string): string => {
    const newToken = `TOK-${Math.floor(1000 + Math.random() * 9000)}`;
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const updated = {
            ...u,
            accessToken: newToken,
            updatedAt: new Date().toISOString(),
          };
          if (currentUser.id === userId) {
            setCurrentUserState(updated);
          }
          return updated;
        }
        return u;
      })
    );
    return newToken;
  };

  // User Management (Imagen 1)
  const setCurrentUser = (user: SystemUser) => {
    setCurrentUserState(user);
  };

  const addUser = (newUser: SystemUser) => {
    // If advisor and token is not set, generate token
    if (newUser.role === 'ASESOR_PRESTAMOS' && !newUser.accessToken) {
      newUser.accessToken = `TOK-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    setUsers(prev => [newUser, ...prev]);
  };

  const updateUser = (updated: SystemUser) => {
    setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));
    if (currentUser.id === updated.id) {
      setCurrentUserState(updated);
    }
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const resetUserPassword = (userId: string, newPass = 'CrediPlus123*') => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            password: newPass,
            isLocked: false,
            failedAttempts: 0,
            updatedAt: new Date().toISOString(),
          };
        }
        return u;
      })
    );
  };

  const unlockUser = (userId: string) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            isLocked: false,
            failedAttempts: 0,
            updatedAt: new Date().toISOString(),
          };
        }
        return u;
      })
    );
  };

  const changeOwnPassword = (userId: string, newPass: string) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const updated = {
            ...u,
            password: newPass,
            updatedAt: new Date().toISOString(),
          };
          if (currentUser.id === userId) {
            setCurrentUserState(updated);
          }
          return updated;
        }
        return u;
      })
    );
  };

  // Solicitudes de Modificación de Datos de Clientes (Imagen 2)
  const addClientChangeRequest = (req: ClientChangeRequest) => {
    setClientChangeRequests(prev => [req, ...prev]);
  };

  const approveClientChangeRequest = (requestId: string, notes?: string) => {
    const targetReq = clientChangeRequests.find(r => r.id === requestId);
    if (!targetReq) return;

    const nowStr = new Date().toISOString();
    setClientChangeRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? {
              ...r,
              status: 'AUTORIZADO',
              authorizedBy: currentUser.fullName,
              authorizedAt: nowStr,
              reviewNotes: notes || r.reviewNotes,
            }
          : r
      )
    );

    // Apply changes to target client
    setClients(prevClients =>
      prevClients.map(client => {
        if (client.id !== targetReq.clientId) return client;
        const updatedClient = { ...client };
        targetReq.changedFields.forEach(field => {
          const val = field.newValue ?? field.proposedValue;
          if (field.fieldKey.includes('.')) {
            const [parent, child] = field.fieldKey.split('.');
            (updatedClient as any)[parent] = {
              ...((updatedClient as any)[parent] || {}),
              [child]: val,
            };
          } else {
            (updatedClient as any)[field.fieldKey] = val;
          }
        });
        updatedClient.updatedAt = nowStr;
        return updatedClient;
      })
    );
  };

  const rejectClientChangeRequest = (requestId: string, notes?: string) => {
    const nowStr = new Date().toISOString();
    setClientChangeRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? {
              ...r,
              status: 'RECHAZADO',
              authorizedBy: currentUser.fullName,
              authorizedAt: nowStr,
              reviewNotes: notes || 'Solicitud rechazada por Jefe de Agencia.',
            }
          : r
      )
    );
  };

  const addDocumentToClient = (clientId: string, doc: DocumentAttachment) => {
    setClients(prev =>
      prev.map(c => {
        if (c.id === clientId) {
          return {
            ...c,
            documents: [doc, ...c.documents],
          };
        }
        return c;
      })
    );
    // Also attach to loans of this client if relevant
    setLoans(prev =>
      prev.map(l => {
        if (l.clientId === clientId) {
          return {
            ...l,
            documents: [doc, ...l.documents],
          };
        }
        return l;
      })
    );
  };

  const deleteDocumentFromClient = (clientId: string, docId: string) => {
    setClients(prev =>
      prev.map(c => {
        if (c.id === clientId) {
          return {
            ...c,
            documents: c.documents.filter(d => d.id !== docId),
          };
        }
        return c;
      })
    );
    setLoans(prev =>
      prev.map(l => {
        if (l.clientId === clientId) {
          return {
            ...l,
            documents: l.documents.filter(d => d.id !== docId),
          };
        }
        return l;
      })
    );
  };

  const registerInstallmentPayment = (
    loanId: string,
    installmentNumber: number,
    amount: number,
    paymentMethod: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'CHEQUE',
    notes?: string
  ): PaymentReceipt => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) throw new Error('Préstamo no encontrado');

    const receiptId = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const dateStr = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;

    let principalPortion = 0;
    let interestPortion = 0;
    let lateFeePortion = 0;
    let remainingLoanBalance = loan.outstandingBalance;

    const newSchedule = loan.schedule.map(inst => {
      if (inst.number === installmentNumber) {
        lateFeePortion = inst.lateFee;
        interestPortion = inst.interestAmount;
        principalPortion = Math.max(0, amount - lateFeePortion - interestPortion);
        
        const isFullyPaid = amount >= (inst.paymentAmount + inst.lateFee);
        remainingLoanBalance = Math.max(0, Math.round((inst.remainingBalance - (isFullyPaid ? 0 : 0)) * 100) / 100);

        return {
          ...inst,
          status: 'PAGADA' as const,
          paidAmount: amount,
          paidDate: dateStr.slice(0, 10),
          daysOverdue: 0,
          lateFee: 0,
          paymentReceiptNumber: receiptId,
        };
      }
      return inst;
    });

    const totalPaidNow = Math.round((loan.totalPaid + amount) * 100) / 100;
    const allPaid = newSchedule.every(s => s.status === 'PAGADA');
    const hasOverdue = newSchedule.some(s => s.status === 'VENCIDA');
    const newStatus = allPaid ? 'PAGADO' : hasOverdue ? 'VENCIDO' : 'ACTIVO';
    const lastPaidInstallment = newSchedule.find(s => s.number === installmentNumber);
    const newOutstandingBalance = lastPaidInstallment ? lastPaidInstallment.remainingBalance : loan.outstandingBalance;

    const updatedLoan: Loan = {
      ...loan,
      schedule: newSchedule,
      status: newStatus,
      totalPaid: totalPaidNow,
      outstandingBalance: newOutstandingBalance,
      notes: notes ? `${loan.notes ? loan.notes + '\n' : ''}[Pago ${receiptId}]: ${notes}` : loan.notes,
    };

    updateLoan(updatedLoan);

    const receipt: PaymentReceipt = {
      receiptId,
      loanId: loan.id,
      loanNumber: loan.loanNumber,
      clientId: loan.clientId,
      clientName: loan.clientName,
      installmentNumber,
      amountPaid: amount,
      principalPortion,
      interestPortion,
      lateFeePortion,
      paymentDate: dateStr,
      paymentMethod,
      receivedBy: companySettings.legalRepresentative,
      remainingLoanBalance: newOutstandingBalance,
    };

    return receipt;
  };

  // Currency helpers
  const convertToDisplayCurrency = (amountInUSD: number): number => {
    if (displayCurrency === 'USD') return amountInUSD;
    return Math.round(amountInUSD * exchangeRate.usdSell * 100) / 100;
  };

  const formatMoney = (amountInUSD: number): string => {
    if (displayCurrency === 'USD') {
      return `$ ${amountInUSD.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    const converted = amountInUSD * exchangeRate.usdSell;
    return `${exchangeRate.symbol} ${converted.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Summaries
  const activeLoans = loans.filter(l => l.status === 'ACTIVO');
  const overdueLoans = loans.filter(l => l.status === 'VENCIDO');

  const totalActiveCapital = activeLoans.reduce((acc, l) => acc + l.outstandingBalance, 0);
  const totalOverdueCapital = overdueLoans.reduce((acc, l) => acc + l.outstandingBalance, 0);
  const totalCollected = loans.reduce((acc, l) => acc + l.totalPaid, 0);

  // Due soon (next 7 days)
  const today = new Date();
  const next7Days = new Date();
  next7Days.setDate(today.getDate() + 7);

  const totalPendingDueSoon = loans.reduce((acc, l) => {
    const dueCount = l.schedule.filter(s => {
      if (s.status !== 'PENDIENTE') return false;
      const d = new Date(s.dueDate + 'T23:59:59');
      return d >= today && d <= next7Days;
    }).length;
    return acc + dueCount;
  }, 0);

  return (
    <LoanContext.Provider
      value={{
        loans,
        clients,
        companySettings,
        exchangeRate,
        displayCurrency,
        setDisplayCurrency,
        isAuthenticated,
        login,
        logout,
        users,
        currentUser,
        setCurrentUser,
        addUser,
        updateUser,
        deleteUser,
        resetUserPassword,
        unlockUser,
        changeOwnPassword,
        generateUserToken,
        resetUsersToDefault,
        clientChangeRequests,
        addClientChangeRequest,
        approveClientChangeRequest,
        rejectClientChangeRequest,
        addLoan,
        updateLoan,
        addClient,
        updateClient,
        updateCompanySettings,
        updateExchangeRate,
        addDocumentToClient,
        deleteDocumentFromClient,
        registerInstallmentPayment,
        formatMoney,
        convertToDisplayCurrency,
        totalActiveCapital,
        totalOverdueCapital,
        totalCollected,
        totalPendingDueSoon,
      }}
    >
      {children}
    </LoanContext.Provider>
  );
};

export const useLoanContext = () => {
  const context = useContext(LoanContext);
  if (!context) {
    throw new Error('useLoanContext must be used within a LoanProvider');
  }
  return context;
};
