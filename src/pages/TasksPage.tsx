import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, AlertCircle, CheckCircle, Navigation, Filter, Search } from 'lucide-react';
import { mockMerchants } from '../data/mockData';
import { Task, Priority, TaskStatus } from '../types';
import { storage } from '../utils/storage';
import RoutePlanModal from '../components/RoutePlanModal';

const priorityConfig = {
  high: { label: '高', color: 'bg-red-100 text-red-700 border-red-200' },
  medium: { label: '中', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  low: { label: '低', color: 'bg-green-100 text-green-700 border-green-200' },
};

const statusConfig = {
  pending: { label: '待处理', color: 'bg-gray-100 text-gray-700', icon: AlertCircle },
  in_progress: { label: '处理中', color: 'bg-blue-100 text-blue-700', icon: Clock },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700', icon: CheckCircle },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRouteModal, setShowRouteModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedTasks = storage.getTasks();
    if (storedTasks.length > 0) {
      setTasks(storedTasks);
    }
  }, []);

  const filteredTasks = tasks.filter((task) => {
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesSearch = task.merchantName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesStatus && matchesSearch;
  });

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  const handleViewTask = (task: Task) => {
    navigate(`/tasks/${task.id}`);
  };

  const handlePlanRoute = () => {
    setShowRouteModal(true);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{pendingCount}</p>
              <p className="text-sm text-gray-500">待处理</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{inProgressCount}</p>
              <p className="text-sm text-gray-500">处理中</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{completedCount}</p>
              <p className="text-sm text-gray-500">已完成</p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handlePlanRoute}
        className="w-full bg-blue-600 text-white rounded-xl p-4 flex items-center justify-center gap-2 mb-6 hover:bg-blue-700 transition-colors"
      >
        <Navigation className="w-5 h-5" />
        <span className="font-medium">规划今日拜访路线</span>
      </button>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索商户名称..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部优先级</option>
                <option value="high">高优先级</option>
                <option value="medium">中优先级</option>
                <option value="low">低优先级</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部状态</option>
                <option value="pending">待处理</option>
                <option value="in_progress">处理中</option>
                <option value="completed">已完成</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Filter className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>暂无符合条件的任务</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const StatusIcon = statusConfig[task.status].icon;
              const merchant = mockMerchants.find((m) => m.id === task.merchantId);
              return (
                <button
                  key={task.id}
                  onClick={() => handleViewTask(task)}
                  className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-800">{task.merchantName}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${priorityConfig[task.priority].color}`}>
                          {priorityConfig[task.priority].label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {merchant?.address || '地址未填写'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          截止: {task.deadline}
                        </span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${statusConfig[task.status].color}`}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{statusConfig[task.status].label}</span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {showRouteModal && (
        <RoutePlanModal tasks={tasks} onClose={() => setShowRouteModal(false)} />
      )}
    </div>
  );
}