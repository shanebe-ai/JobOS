import { useState, useEffect } from 'react';
import { DashboardLayout } from './ui/layout/DashboardLayout';
import { DashboardView } from './ui/views/DashboardView';
import JobBoard from './ui/views/JobBoard';
import { AddJobView } from './ui/views/AddJobView';
import { JobDetail } from './ui/views/JobDetail';
import { RoutineView } from './ui/views/RoutineView';
import { ExtensionInstallView } from './ui/views/ExtensionInstallView';
import { LoginView } from './ui/views/LoginView';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StorageService } from './services/storage';
import './index.css';

type AppView = 'dashboard' | 'board' | 'add-job' | 'detail' | 'routine' | 'extension-install';

const AppContent = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);

  // Namespace storage to this user and initialize on login
  useEffect(() => {
    if (user) {
      StorageService.setUserId(user.id);
      StorageService.initialize();
    }
  }, [user?.id]);

  if (!user) return <LoginView />;

  const handleNavigate = (view: AppView) => {
    setActiveView(view);
    if (view !== 'detail') setSelectedJobId(null);
  };

  const handleSelectJob = (id: string) => {
    setSelectedJobId(id);
    setActiveView('detail');
  };

  return (
    <DashboardLayout
      activeView={activeView}
      onNavigate={handleNavigate}
      onAddCustomTask={() => {
        setActiveView('routine');
        setIsRoutineModalOpen(true);
      }}
    >
      {activeView === 'dashboard' && <DashboardView onNavigate={handleNavigate} onSelectJob={handleSelectJob} />}
      {activeView === 'board' && <JobBoard onSelectJob={handleSelectJob} onNavigate={handleNavigate} />}
      {activeView === 'add-job' && <AddJobView onJobAdded={() => handleNavigate('board')} onCancel={() => handleNavigate('board')} />}
      {activeView === 'routine' && (
        <RoutineView
          onNavigate={handleNavigate}
          isAddModalOpen={isRoutineModalOpen}
          onSetAddModalOpen={setIsRoutineModalOpen}
        />
      )}
      {activeView === 'detail' && selectedJobId && (
        <JobDetail jobId={selectedJobId} onBack={() => handleNavigate('board')} />
      )}
      {activeView === 'extension-install' && <ExtensionInstallView />}
    </DashboardLayout>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
