import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { useInitMockData } from './utils/mockData';
import { useStore } from './store';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Profile from './pages/Profile';
import UserManagement from './pages/UserManagement';
import IssueList from './pages/IssueList';
import EquipmentLibrary from './pages/Library/Equipment';
import ToolLibrary from './pages/Library/Tool';
import ConsumableLibrary from './pages/Library/Consumable';
import StandardProcess from './pages/Library/StandardProcess';
import ProcessList from './pages/Process/List';
import ProcessEditor from './pages/Process/Editor';
import ProcessTrackingList from './pages/Tracking/List';
import ProcessTrackingDetail from './pages/Tracking/Detail';

function App() {
  useInitMockData();
  const { currentUser } = useStore();

  return (
    <BrowserRouter basename="/pms">
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
    </BrowserRouter>
  );
}

export default App;
