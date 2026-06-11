import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, SkipForward, MessageSquare, Calendar, AlertTriangle, Building2, Camera, Clock, ChevronRight } from 'lucide-react';
import { storage } from '../utils/storage';
import { mockMerchants } from '../data/mockData';
import { Disposal, Communication, RouteVisitState, Task } from '../types';

export default function DailySummaryPage() {
  const navigate = useNavigate();
  const [visitStates, setVisitStates] = useState<RouteVisitState[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reviewDisposals, setReviewDisposals] = useState<Disposal[]>([]);
  const [pendingCommunications, setPendingCommunications] = useState<Communication[]>([]);

  useEffect(() => {
    const states = storage.getRouteVisitStates();
    const allTasks = storage.getTasks();
    const disposals = storage.getReviewDisposals();
    const communications = storage.getCommunications().filter((c) => !c.followedUp);

    setVisitStates(states);
    setTasks(allTasks);
    setReviewDisposals(disposals);
    setPendingCommunications(communications);
  }, []);

  const completedCount = visitStates.filter((s) => s.visited).length;
  const skippedCount = visitStates.filter((s) => s.skipped).length;
  const pendingCount = pendingCommunications.length;

  const getDaysUntilReview = (reviewDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const review = new Date(reviewDate);
    review.setHours(0, 0, 0, 0);
    const diffTime = review.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nearReviewDisposals = reviewDisposals
    .filter((d) => d.reviewDate)
    .filter((d) => getDaysUntilReview(d.reviewDate!) <= 7)
    .sort((a, b) => getDaysUntilReview(a.reviewDate!) - getDaysUntilReview(b.reviewDate!));

  const todayDate = new Date().toLocaleDateString('zh-CN');

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800">日终汇总</h1>
            <p className="text-sm text-gray-500">{todayDate}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">今日工作概览</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">已完成</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{completedCount}</p>
          <p className="text-xs text-gray-400 mt-1">家商户</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <SkipForward className="w-4 h-4 text-gray-600" />
            </div>
            <span className="text-sm text-gray-500">已跳过</span>
          </div>
          <p className="text-2xl font-bold text-gray-600">{skippedCount}</p>
          <p className="text-xs text-gray-400 mt-1">家商户</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">待跟进</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">{pendingCount}</p>
          <p className="text-xs text-gray-400 mt-1">条沟通</p>
        </div>
      </div>

      {nearReviewDisposals.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-800">临近复查</h2>
            </div>
            <span className="text-xs text-gray-500">{nearReviewDisposals.length} 家</span>
          </div>
          <div className="space-y-2">
            {nearReviewDisposals.slice(0, 5).map((d) => {
              const merchant = mockMerchants.find((m) => m.id === d.merchantId);
              const days = getDaysUntilReview(d.reviewDate!);
              const daysText = days < 0 ? `已过期${Math.abs(days)}天` : days === 0 ? '今日' : `${days}天后`;
              const daysColor = days <= 0 ? 'text-red-600 bg-red-100' : days <= 2 ? 'text-orange-600 bg-orange-100' : 'text-blue-600 bg-blue-100';

              return (
                <div
                  key={d.id}
                  onClick={() => navigate(`/merchants/${d.merchantId}`)}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-800">{merchant?.name || `商户 #${d.merchantId}`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${daysColor}`}>{daysText}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pendingCommunications.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              <h2 className="font-semibold text-gray-800">待跟进沟通</h2>
            </div>
            <span className="text-xs text-gray-500">{pendingCommunications.length} 条</span>
          </div>
          <div className="space-y-2">
            {pendingCommunications.slice(0, 5).map((c) => {
              const merchant = mockMerchants.find((m) => m.id === c.merchantId);

              return (
                <div
                  key={c.id}
                  onClick={() => navigate(`/merchants/${c.merchantId}/communication`)}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-800">{merchant?.name || `商户 #${c.merchantId}`}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{c.notes}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-xs text-gray-400">{c.recorder}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <h2 className="font-semibold text-gray-800">待处理任务</h2>
        </div>
        <div className="space-y-2">
          {tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').slice(0, 5).map((task) => {
            const merchant = mockMerchants.find((m) => m.id === task.merchantId);
            const statusColor = task.status === 'pending' ? 'text-gray-600 bg-gray-100' : 'text-blue-600 bg-blue-100';
            const statusText = task.status === 'pending' ? '待处理' : '处理中';

            return (
              <div
                key={task.id}
                onClick={() => navigate(`/tasks/${task.id}`)}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-800">{task.merchantName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>{statusText}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            );
          })}
          {tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">暂无待处理任务</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/review-calendar')}
          className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 hover:bg-gray-50 transition-colors"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-800">复查日历</p>
            <p className="text-xs text-gray-500">{nearReviewDisposals.length} 家待复查</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/summary')}
          className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 hover:bg-gray-50 transition-colors"
        >
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Camera className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-800">巡检摘要</p>
            <p className="text-xs text-gray-500">导出交班报告</p>
          </div>
        </button>
      </div>
    </div>
  );
}