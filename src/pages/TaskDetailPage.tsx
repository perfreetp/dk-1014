import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Building2, Camera, FileText, MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react';
import { mockTasks, mockMerchants } from '../data/mockData';
import { TaskStatus } from '../types';
import { storage } from '../utils/storage';

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState(mockTasks.find((t) => t.id === parseInt(id!)));
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'pending');

  useEffect(() => {
    const storedTasks = storage.getTasks();
    const storedTask = storedTasks.find((t) => t.id === parseInt(id!));
    if (storedTask) {
      setTask(storedTask);
      setStatus(storedTask.status);
    }
  }, [id]);

  if (!task) {
    return <div className="text-center text-gray-500 py-10">任务不存在</div>;
  }

  const merchant = mockMerchants.find((m) => m.id === task.merchantId);

  const statusConfig = {
    pending: { label: '待处理', color: 'bg-gray-100 text-gray-700' },
    in_progress: { label: '处理中', color: 'bg-blue-100 text-blue-700' },
    completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
  };

  const priorityConfig = {
    high: { label: '高优先级', color: 'bg-red-100 text-red-700 border-red-200' },
    medium: { label: '中优先级', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    low: { label: '低优先级', color: 'bg-green-100 text-green-700 border-green-200' },
  };

  const handleUpdateStatus = (newStatus: TaskStatus) => {
    const updatedTasks = storage.updateTaskStatus(task.id, newStatus);
    setStatus(newStatus);
    const updatedTask = updatedTasks.find((t) => t.id === task.id);
    if (updatedTask) {
      setTask(updatedTask);
    }
    alert(`任务状态已更新为: ${statusConfig[newStatus].label}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{task.merchantName}</h1>
            <span className={`inline-block mt-2 px-3 py-1 text-sm font-medium rounded-full ${priorityConfig[task.priority].color}`}>
              {priorityConfig[task.priority].label}
            </span>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[status].color}`}>
            {statusConfig[status].label}
          </span>
        </div>

        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-blue-500" />
            <span>{merchant?.address}</span>
          </div>
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-blue-500" />
            <span>收单费率: {merchant?.rate * 100}%</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-500" />
            <span>截止日期: {task.deadline}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">状态变更</h2>
        <div className="flex gap-3">
          {(['pending', 'in_progress', 'completed'] as TaskStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => handleUpdateStatus(s)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                status === s
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              {s === 'pending' && <AlertTriangle className="w-4 h-4" />}
              {s === 'in_progress' && <Clock className="w-4 h-4" />}
              {s === 'completed' && <CheckCircle className="w-4 h-4" />}
              <span className="text-sm">{statusConfig[s].label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate(`/merchants/${merchant?.id}`)}
          className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <span className="font-medium text-gray-800">商户档案</span>
        </button>

        <button
          onClick={() => navigate(`/merchants/${merchant?.id}/verify`)}
          className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors"
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Camera className="w-6 h-6 text-green-600" />
          </div>
          <span className="font-medium text-gray-800">现场核验</span>
        </button>

        <button
          onClick={() => navigate(`/merchants/${merchant?.id}/diagnosis`)}
          className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors"
        >
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-orange-600" />
          </div>
          <span className="font-medium text-gray-800">交易诊断</span>
        </button>

        <button
          onClick={() => navigate(`/merchants/${merchant?.id}/communication`)}
          className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-purple-600" />
          </div>
          <span className="font-medium text-gray-800">沟通记录</span>
        </button>
      </div>

      <button
        onClick={() => navigate(`/merchants/${merchant?.id}/disposal`)}
        className="w-full bg-orange-500 text-white rounded-xl p-4 flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors"
      >
        <AlertTriangle className="w-5 h-5" />
        <span className="font-medium">提交处置建议</span>
      </button>
    </div>
  );
}