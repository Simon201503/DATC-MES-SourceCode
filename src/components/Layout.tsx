import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Wrench, 
  Package, 
  Box, 
  BookOpen, 
  FileEdit, 
  ClipboardList,
  LogOut,
  UserCircle,
  Users,
  AlertTriangle
} from 'lucide-react';
import { clsx } from 'clsx';
import { useStore } from '../store';

const NAV_ITEMS = [
  { path: '/', label: '首页概览', icon: Home },
  { path: '/process/list', label: '工艺管理', icon: FileEdit },
  { path: '/process/tracking', label: '生产执行', icon: ClipboardList },
  { path: '/issues', label: '现场问题处理', icon: AlertTriangle, requireEngineer: true },
  { path: '/library/standard-process', label: '标准工序', icon: BookOpen },
  { path: '/library/equipment', label: '设备库', icon: Box },
  { path: '/library/tool', label: '工具库', icon: Wrench },
  { path: '/library/consumable', label: '耗材库', icon: Package },
  { path: '/users', label: '用户管理', icon: Users, adminOnly: true },
];

export const Layout: React.FC = () => {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (item.adminOnly && !currentUser?.roles.includes('admin')) {
      return false;
    }
    if (item.requireEngineer && (!currentUser?.roles.includes('process_engineer') && !currentUser?.roles.includes('admin'))) {
      return false;
    }
    if (!currentUser?.roles.includes('process_engineer') && !currentUser?.roles.includes('admin')) {
      return item.path === '/' || item.path === '/process/tracking';
    }
    return true;
  });

  return (
    <div className="flex h-screen w-full text-gray-900 overflow-hidden font-sans">
      {/* Desktop / Tablet Landscape Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[rgba(255,255,255,0.70)] backdrop-blur-xl border-r border-black/5 shadow-[var(--shadow-soft)] z-10">
        <div className="h-16 flex items-center px-6 border-b border-black/5">
          <div className="w-9 h-9 rounded-2xl bg-[rgba(10,132,255,0.14)] text-[color:var(--accent)] flex items-center justify-center mr-3 shadow-sm">
            <FileEdit className="w-5 h-5" />
          </div>
          <h1 className="text-base font-bold tracking-wide">DATC-MES</h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => clsx(
                      "flex items-center px-3 py-2.5 rounded-xl transition-colors duration-200 text-sm font-medium",
                      isActive 
                        ? "bg-[rgba(10,132,255,0.12)] text-[color:var(--accent)]" 
                        : "text-gray-700 hover:bg-black/5 hover:text-gray-900"
                    )}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-black/5 flex flex-col gap-2">
          <NavLink 
            to="/profile"
            className={({ isActive }) => clsx(
              "flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-colors",
              isActive ? "bg-[rgba(10,132,255,0.12)] text-[color:var(--accent)]" : "text-gray-700 hover:bg-black/5"
            )}
          >
            <UserCircle className="w-5 h-5 mr-3" />
            <div className="flex-1 min-w-0">
              <p className="truncate font-semibold text-gray-900">{currentUser?.name}</p>
              <p className="text-[10px] text-gray-500 truncate">
                {currentUser?.roles.map(r => 
                  r === 'admin' ? '管理员' : r === 'process_engineer' ? '工艺工程师' : r === 'operator' ? '操作员' : '检验员'
                ).join(', ')}
              </p>
            </div>
          </NavLink>
          <button 
            onClick={handleLogout}
            className="flex items-center px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full"
          >
            <LogOut className="w-5 h-5 mr-3" />
            退出登录
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative pb-[84px] lg:pb-0">
        {/* Mobile / Tablet Portrait Header */}
        <header className="lg:hidden h-14 flex items-center justify-between px-4 bg-[rgba(255,255,255,0.72)] backdrop-blur-xl border-b border-black/5 z-10 shrink-0">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-xl bg-[rgba(10,132,255,0.14)] text-[color:var(--accent)] flex items-center justify-center mr-2 shadow-sm">
              <FileEdit className="w-4 h-4" />
            </div>
            <h1 className="text-sm font-bold tracking-wide">DATC-PMS</h1>
          </div>
          <div className="flex items-center gap-3">
            <NavLink to="/profile" className="text-gray-600 hover:text-[color:var(--accent)] transition-colors">
              <UserCircle className="w-6 h-6" />
            </NavLink>
            <button onClick={handleLogout} className="text-red-500 hover:text-red-600 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-auto px-3 py-3 pb-24 sm:px-4 sm:py-4 sm:pb-28 lg:p-6">
          <div className="w-full h-full">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Mobile / Tablet Portrait Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 px-2 pb-safe pb-2 sm:px-3 sm:pb-3">
        <nav className="h-14 sm:h-16 bg-[rgba(255,255,255,0.88)] backdrop-blur-xl border border-black/5 shadow-lg rounded-2xl flex items-center justify-start gap-1 overflow-x-auto hide-scrollbar px-1.5 sm:px-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
              >
                {({ isActive }) => (
                  <div className={clsx(
                    "flex flex-col items-center justify-center w-[60px] min-w-[60px] sm:w-16 sm:min-w-[64px] h-full space-y-0.5 rounded-2xl transition-colors shrink-0 px-1",
                    isActive ? "text-[color:var(--accent)] font-semibold" : "text-gray-500 hover:bg-black/5"
                  )}>
                    <Icon className={clsx("w-5 h-5", isActive && "scale-110 transition-transform")} />
                    <span className="text-[9px] sm:text-[10px] leading-tight text-center line-clamp-2">{item.label}</span>
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
