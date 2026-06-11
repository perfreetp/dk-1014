import { useState, useEffect } from 'react';
import { X, MapPin, Clock, CheckCircle, SkipForward, MapPinOff, RefreshCw } from 'lucide-react';
import { Task, RouteVisitState } from '../types';
import { storage } from '../utils/storage';
import { mockMerchants } from '../data/mockData';

interface RoutePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: () => void;
}

export default function RoutePlanModal({ isOpen, onClose, onStatusChange }: RoutePlanModalProps) {
  const [routeTasks, setRouteTasks] = useState<
    (Task & { visited: boolean; skipped: boolean; currentIndex: number; address: string })[]
  >([]);

  useEffect(() => {
    if (isOpen) {
      const pendingTasks = storage.getTasks().filter((t) => t.status === 'pending' || t.status === 'in_progress');
      const visitStates = storage.getRouteVisitStates();
      const sortedTasks = [...pendingTasks].sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });

      setRouteTasks(
        sortedTasks.map((task, index) => {
          const merchant = mockMerchants.find((m) => m.id === task.merchantId);
          const state = visitStates.find((s) => s.taskId === task.id);
          return {
            ...task,
            visited: state?.visited || false,
            skipped: state?.skipped || false,
            currentIndex: index + 1,
            address: merchant?.address || '地址未知',
          };
        })
      );
    }
  }, [isOpen]);

  const handleMarkVisited = (taskId: number) => {
    storage.updateRouteVisitState(taskId, { visited: true, skipped: false });
    const updated = routeTasks.map((t) => (t.id === taskId ? { ...t, visited: true, skipped: false } : t));
    setRouteTasks(updated);
    onStatusChange();
  };

  const handleSkip = (taskId: number) => {
    storage.updateRouteVisitState(taskId, { skipped: true, visited: false });
    const updated = routeTasks.map((t) => (t.id === taskId ? { ...t, skipped: true, visited: false } : t));
    setRouteTasks(updated);
    onStatusChange();
  };

  const handleCompleteVisit = (taskId: number) => {
    storage.updateTaskStatus(taskId, 'completed', 'route_plan');
    storage.updateRouteVisitState(taskId, { visited: true, completedAt: new Date().toLocaleString('zh-CN') });
    const updated = routeTasks.map((t) => (t.id === taskId ? { ...t, visited: true, skipped: false } : t));
    setRouteTasks(updated);
    onStatusChange();
  };

  const handleClearRoute = () => {
    if (confirm('确定要清空今日路线状态吗？这将重置所有到店、跳过状态。')) {
      storage.clearRouteVisitStates();
      setRouteTasks(routeTasks.map((t) => ({ ...t, visited: false, skipped: false })));
      onStatusChange();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return '高';
      case 'medium':
        return '中';
      case 'low':
        return '低';
      default:
        return priority;
    }
  };

  const completedCount = routeTasks.filter((t) => t.visited).length;
  const skippedCount = routeTasks.filter((t) => t.skipped).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full sm:w-[480px] sm:rounded-2xl rounded-t-2xl max-h-[80vh] overflow-hidden animate-slide-up">
        <div className="sticky top-0 bg-white border-b px-4 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">今日拜访路线</h2>
            <p className="text-sm text-gray-500">
              已完成 {completedCount} / {routeTasks.length} 商户
              {skippedCount > 0 && <span className="ml-2 text-gray-400">| 已跳过 {skippedCount}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearRoute}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
              title="重置路线状态"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-4 space-y-3">
          {routeTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无待处理任务</p>
            </div>
          ) : (
            routeTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-xl border-2 transition-all ${
                  task.visited
                    ? 'border-green-200 bg-green-50'
                    : task.skipped
                    ? 'border-gray-200 bg-gray-50 opacity-60'
                    : 'border-gray-100 bg-white hover:border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {task.currentIndex}
                    </span>
                    <h3 className="font-medium text-gray-800">{task.merchantName}</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {getPriorityLabel(task.priority)}
                  </span>
                </div>

                <div className="mb-3 space-y-1">
                  <div className="flex items-start gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{task.address}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      截止: {task.deadline}
                    </span>
                  </div>
                </div>

                {!task.visited && !task.skipped && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMarkVisited(task.id)}
                      className="flex-1 py-2 px-3 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <MapPin className="w-4 h-4" />
                      已到店
                    </button>
                    <button
                      onClick={() => handleSkip(task.id)}
                      className="flex-1 py-2 px-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <SkipForward className="w-4 h-4" />
                      跳过
                    </button>
                    <button
                      onClick={() => handleCompleteVisit(task.id)}
                      className="flex-1 py-2 px-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      完成
                    </button>
                  </div>
                )}

                {task.visited && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>已完成拜访</span>
                  </div>
                )}

                {task.skipped && (
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <MapPinOff className="w-4 h-4" />
                    <span>已跳过</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}