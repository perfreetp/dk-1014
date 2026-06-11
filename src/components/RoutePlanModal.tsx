import { X, MapPin, AlertCircle, Clock } from 'lucide-react';
import { Task } from '../types';
import { mockMerchants } from '../data/mockData';

interface RoutePlanModalProps {
  tasks: Task[];
  onClose: () => void;
}

export default function RoutePlanModal({ tasks, onClose }: RoutePlanModalProps) {
  const pendingTasks = tasks.filter((t) => t.status === 'pending').sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const priorityConfig = {
    high: { label: '高', color: 'bg-red-100 text-red-700' },
    medium: { label: '中', color: 'bg-yellow-100 text-yellow-700' },
    low: { label: '低', color: 'bg-green-100 text-green-700' },
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center">
      <div className="bg-white w-full lg:w-2/3 lg:max-w-2xl rounded-t-2xl lg:rounded-2xl max-h-[80vh] overflow-hidden animate-fadeIn">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">今日拜访路线</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">共 {pendingTasks.length} 个待处理任务，按优先级排序</p>
        </div>

        <div className="overflow-y-auto max-h-[60vh] p-6 space-y-3">
          {pendingTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>暂无待处理任务</p>
            </div>
          ) : (
            pendingTasks.map((task, index) => {
              const merchant = mockMerchants.find((m) => m.id === task.merchantId);
              return (
                <div
                  key={task.id}
                  className="flex gap-4 p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex flex-col items-center">
                    <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    {index < pendingTasks.length - 1 && (
                      <div className="w-0.5 h-8 bg-blue-200 mt-2" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{task.merchantName}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${priorityConfig[task.priority].color}`}>
                        {priorityConfig[task.priority].label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>{merchant?.address || '地址未填写'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>截止日期: {task.deadline}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            确认路线
          </button>
        </div>
      </div>
    </div>
  );
}