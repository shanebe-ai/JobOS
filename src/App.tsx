import { useState, useEffect } from 'react';
import { DashboardLayout } from './ui/layout/DashboardLayout';
import { JobBoard } from './ui/views/JobBoard';
import { AddJobView } from './ui/views/AddJobView';
import { JobDetail } from './ui/views/JobDetail';
import { RoutineView } from './ui/views/RoutineView';
// ... existing imports

import { StorageService } from './services/storage';
import './index.css';

const App = () => {
  const [activeView, setActiveView] = useState<'board' | 'add-job' | 'detail' | 'routine'>('board');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  useEffect(() => {
    StorageService.initialize();
  }, []);

  const handleNavigate = (view: 'board' | 'add-job' | 'detail' | 'routine') => {
    setActiveView(view);
    if (view !== 'detail') setSelectedJobId(null);
  };

  const handleSelectJob = (id: string) => {
    setSelectedJobId(id);
    setActiveView('detail');
  };
  // ... existing code
  return (
    <DashboardLayout activeView={activeView} onNavigate={handleNavigate}>
      {activeView === 'board' && <JobBoard onSelectJob={handleSelectJob} />}
      {activeView === 'add-job' && <AddJobView onJobAdded={() => handleNavigate('board')} onCancel={() => handleNavigate('board')} />}
      {activeView === 'routine' && <RoutineView />}
      {activeView === 'detail' && selectedJobId && (
        <JobDetail jobId={selectedJobId} onBack={() => handleNavigate('board')} />
      )}
    </DashboardLayout>
  );
}

export default App;
