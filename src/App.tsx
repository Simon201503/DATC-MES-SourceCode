import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { useInitMockData } from './utils/mockData';
import { useStore } from './store';

// Pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Login = React.lazy(() => import('./pages/Login'));
const Profile = React.lazy(() => import('./pages/Profile'));
const UserManagement = React.lazy(() => import('./pages/UserManagement'));
const IssueList = React.lazy(() => import('./pages/IssueList'));
const EquipmentLibrary = React.lazy(() => import('./pages/Library/Equipment'));
const ToolLibrary = React.lazy(() => import('./pages/Library/Tool'));
const ConsumableLibrary = React.lazy(() => import('./pages/Library/Consumable'));
const StandardProcess = React.lazy(() => import('./pages/Library/StandardProcess'));
const ProcessList = React.lazy(() => import('./pages/Process/List'));
const ProcessEditor = React.lazy(() => import('./pages/Process/Editor'));
const ProcessTrackingList = React.lazy(() => import('./pages/Tracking/List'));
const ProcessTrackingDetail = React.lazy(() => import('./pages/Tracking/Detail'));

function App() {
  useInitMockData();
  const { currentUser } = useStore();

  return (
    <BrowserRouter basename="/pms">
      <React.Suspense fallback={<div className="flex h-screen items-center justify-center text-gray-500">加载中...</div>}>
        <Routes>
          <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" replace />} />
          
          {currentUser ? (
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="issues" element={<IssueList />} />
              <Route path="library">
                <Route path="equipment" element={<EquipmentLibrary />} />
                <Route path="tool" element={<ToolLibrary />} />
                <Route path="consumable" element={<ConsumableLibrary />} />
                <Route path="standard-process" element={<StandardProcess />} />
              </Route>
              <Route path="process">
                <Route path="list" element={<ProcessList />} />
                <Route path="editor" element={<ProcessEditor />} />
                <Route path="editor/:id" element={<ProcessEditor />} />
                <Route path="tracking" element={<ProcessTrackingList />} />
                <Route path="tracking/:id" element={<ProcessTrackingDetail />} />
              </Route>
            </Route>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}

export default App;
