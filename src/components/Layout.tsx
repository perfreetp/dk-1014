import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ClipboardList, Building2, FileText, BarChart3, MessageSquare, Settings, Menu, X, ChevronLeft } from 'lucide-react';

const navItems = [
  { id: 'tasks', label: '任务管理', icon: ClipboardList, path: '/tasks' },
  { id: 'merchants', label: '商户档案', icon: Building2, path: '/merchants' },
  { id: 'statistics', label: '统计报表', icon: BarChart3, path: '/statistics' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const showBackButton = location.pathname !== '/tasks' && location.pathname !== '/merchants' && location.pathname !== '/statistics';

  const handleBack = () => {
    if (location.pathname.startsWith('/merchants/')) {
      navigate('/merchants');
    } else if (location.pathname.startsWith('/tasks/')) {
      navigate('/tasks');
    } else {
      navigate('/tasks');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md lg:hidden"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-blue-900 text-white transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-blue-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold">风险巡检助手</h1>
                <p className="text-blue-300 text-sm">Merchant Risk Assistant</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-800'}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-blue-700">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-all">
              <Settings className="w-5 h-5" />
              <span className="font-medium">设置</span>
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="flex-1 min-h-screen">
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {showBackButton && (
                <button
                  onClick={handleBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <h2 className="text-lg font-semibold text-gray-800">
                {location.pathname === '/tasks' && '任务管理'}
                {location.pathname === '/merchants' && '商户档案'}
                {location.pathname === '/statistics' && '统计报表'}
                {location.pathname.includes('/verify') && '现场核验'}
                {location.pathname.includes('/diagnosis') && '交易诊断'}
                {location.pathname.includes('/communication') && '沟通记录'}
                {location.pathname.includes('/disposal') && '处置中心'}
              </h2>
            </div>
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </header>

        <div className="p-4 lg:p-6">{children}</div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-40">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 px-4 py-2 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}