import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ScreenName, Transaction, TransactionType } from './types';
import { SplashScreen } from './screens/SplashScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { LoginScreen } from './screens/LoginScreen';
import { SignUpScreen } from './screens/SignUpScreen';
import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
import { HomeScreen } from './screens/HomeScreen';
import { AllTransactionsScreen } from './screens/AllTransactionsScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { CategoriesScreen } from './screens/CategoriesScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { AddRecordModal } from './screens/AddRecordModal';
import { TransactionDetailsModal } from './screens/TransactionDetailsModal';
import { SideDrawer } from './components/SideDrawer';
import { HelpSupportModal } from './screens/HelpSupportModal';
import { PrivacyTermsModal } from './screens/PrivacyTermsModal';
import { Toast, ToastMessage } from './components/Toast';
import { ConfirmModal } from './components/ConfirmModal';

const AppContent: React.FC = () => {
  const { user, loading, logout } = useAuth();

  const [currentScreen, setCurrentScreen] = useState<ScreenName>('splash');
  const [screenStack, setScreenStack] = useState<ScreenName[]>(['home']);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Navigation handlers with stack history to prevent splash screen reload on back button
  const handleNavigate = (targetScreen: ScreenName) => {
    if (targetScreen === currentScreen) return;
    try {
      window.history.pushState({ screen: targetScreen }, '');
    } catch (e) {
      // ignore
    }
    setScreenStack((prev) => [...prev, targetScreen]);
    setCurrentScreen(targetScreen);
  };

  const handleGoBack = () => {
    if (screenStack.length > 1) {
      const nextStack = [...screenStack];
      nextStack.pop(); // Remove active screen
      const prevScreen = nextStack[nextStack.length - 1];
      setScreenStack(nextStack);
      setCurrentScreen(prevScreen || 'home');
    } else {
      setCurrentScreen('home');
    }
  };

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.screen && e.state.screen !== 'splash') {
        setCurrentScreen(e.state.screen);
      } else if (currentScreen !== 'home' && currentScreen !== 'splash') {
        handleGoBack();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [screenStack, currentScreen]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [addRecordType, setAddRecordType] = useState<TransactionType>('expense');
  const [activeBookId, setActiveBookId] = useState<string | undefined>(undefined);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);

  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [privacyTermsType, setPrivacyTermsType] = useState<'privacy' | 'terms' | null>(null);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);

  // Toast notification state
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      id: Math.random().toString(),
      type,
      message,
    });
  };

  // Splash Screen Complete Flow
  const handleSplashComplete = () => {
    if (user) {
      setCurrentScreen('home');
    } else {
      const isDone = localStorage.getItem('mw_onboarding_done');
      if (isDone === 'true') {
        setCurrentScreen('login');
      } else {
        setCurrentScreen('onboarding');
      }
    }
  };

  // Auth State change watch
  useEffect(() => {
    if (!loading && currentScreen !== 'splash') {
      if (user && (currentScreen === 'login' || currentScreen === 'signup' || currentScreen === 'onboarding')) {
        setCurrentScreen('home');
      } else if (!user && currentScreen !== 'login' && currentScreen !== 'signup' && currentScreen !== 'forgot-password' && currentScreen !== 'onboarding') {
        setCurrentScreen('login');
      }
    }
  }, [user, loading]);

  const handleSelectTransaction = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setIsDetailsModalOpen(true);
  };

  const handleOpenEditFromDetails = (tx: Transaction) => {
    setIsDetailsModalOpen(false);
    setEditingTransaction(tx);
    setAddRecordType(tx.type);
    setIsAddModalOpen(true);
  };

  const handleOpenAddRecord = (initialType?: TransactionType, bookId?: string) => {
    setEditingTransaction(null);
    setAddRecordType(initialType || 'expense');
    if (bookId) setActiveBookId(bookId);
    setIsAddModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#14213D] selection:bg-purple-100 selection:text-purple-900 font-sans">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Screen Router */}
      {currentScreen === 'splash' && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}

      {currentScreen === 'onboarding' && (
        <OnboardingScreen onFinish={() => setCurrentScreen('login')} />
      )}

      {currentScreen === 'login' && (
        <LoginScreen
          onNavigate={(screen) => setCurrentScreen(screen)}
          onSuccess={(msg) => showToast(msg, 'success')}
        />
      )}

      {currentScreen === 'signup' && (
        <SignUpScreen
          onNavigate={(screen) => setCurrentScreen(screen)}
          onSuccess={(msg) => showToast(msg, 'success')}
        />
      )}

      {currentScreen === 'forgot-password' && (
        <ForgotPasswordScreen
          onNavigate={(screen) => setCurrentScreen(screen)}
          onSuccess={(msg) => showToast(msg, 'success')}
        />
      )}

      {currentScreen === 'home' && (
        <HomeScreen
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onNavigate={handleNavigate}
          onOpenAddModal={handleOpenAddRecord}
          onSelectTransaction={handleSelectTransaction}
          onSuccessToast={(msg) => showToast(msg, 'success')}
        />
      )}

      {currentScreen === 'all-transactions' && (
        <AllTransactionsScreen
          onNavigate={handleNavigate}
          onGoBack={handleGoBack}
          onSelectTransaction={handleSelectTransaction}
        />
      )}

      {currentScreen === 'reports' && (
        <ReportsScreen onNavigate={handleNavigate} onGoBack={handleGoBack} />
      )}

      {currentScreen === 'categories' && (
        <CategoriesScreen
          onNavigate={handleNavigate}
          onGoBack={handleGoBack}
          onSuccess={(msg) => showToast(msg, 'success')}
        />
      )}

      {currentScreen === 'profile' && (
        <ProfileScreen
          onNavigate={handleNavigate}
          onGoBack={handleGoBack}
          onSuccess={(msg) => showToast(msg, 'success')}
        />
      )}

      {currentScreen === 'settings' && (
        <SettingsScreen
          onNavigate={handleNavigate}
          onGoBack={handleGoBack}
          onSuccess={(msg) => showToast(msg, 'success')}
        />
      )}

      {currentScreen === 'notifications' && (
        <NotificationsScreen
          onNavigate={handleNavigate}
          onGoBack={handleGoBack}
          onSuccess={(msg) => showToast(msg, 'success')}
        />
      )}

      {/* Side Drawer */}
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onNavigate={handleNavigate}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenPrivacyTerms={(type) => setPrivacyTermsType(type)}
        onLogoutConfirm={() => setShowLogoutConfirm(true)}
        currentScreen={currentScreen}
      />

      {/* Add / Edit Record Modal */}
      <AddRecordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        editTransaction={editingTransaction}
        initialType={addRecordType}
        activeBookId={activeBookId}
        onSuccess={(msg) => showToast(msg, 'success')}
      />

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={isDetailsModalOpen}
        transaction={selectedTransaction}
        onClose={() => setIsDetailsModalOpen(false)}
        onEdit={handleOpenEditFromDetails}
        onSuccess={(msg) => showToast(msg, 'success')}
      />

      {/* Help & Support Modal */}
      <HelpSupportModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Privacy / Terms Modal */}
      <PrivacyTermsModal
        isOpen={Boolean(privacyTermsType)}
        type={privacyTermsType}
        onClose={() => setPrivacyTermsType(null)}
      />

      {/* Logout Confirm Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Logout?"
        message="Are you sure you want to log out of your wallet?"
        confirmLabel="Logout"
        cancelLabel="Cancel"
        isDanger={true}
        onConfirm={async () => {
          await logout();
          setShowLogoutConfirm(false);
          showToast('Logged out successfully.');
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
