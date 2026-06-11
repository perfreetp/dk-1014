import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Building2, Phone, FileText, Camera, BarChart3, MessageSquare, AlertTriangle, Clock, History, Filter, ChevronRight } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { mockMerchants, mockTransactions, mockComplaints, generateDailyTransactions } from '../data/mockData';
import { storage } from '../utils/storage';
import { TimelineItem } from '../types';
import Timeline from '../components/Timeline';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement);

export default function MerchantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const merchant = mockMerchants.find((m) => m.id === parseInt(id!));
  const transactions = mockTransactions.filter((t) => t.merchantId === parseInt(id!));
  const complaints = mockComplaints.filter((c) => c.merchantId === parseInt(id!));
  const dailyData = generateDailyTransactions();
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    const merchantId = parseInt(id!);
    const verifications = storage.getVerificationsByMerchantId(merchantId);
    const communications = storage.getCommunicationsByMerchantId(merchantId);
    const disposals = storage.getDisposalsByMerchantId(merchantId);
    const taskStatusChanges = storage.getTaskStatusChangesByMerchantId(merchantId);

    const items: TimelineItem[] = [];

    const statusLabels: Record<string, string> = {
      pending: '待处理',
      in_progress: '处理中',
      completed: '已完成',
    };

    taskStatusChanges.forEach((change) => {
      items.push({
        id: `task-change-${change.id}`,
        type: 'task',
        title: `任务状态变更`,
        description: `${statusLabels[change.oldStatus] || change.oldStatus} → ${statusLabels[change.newStatus] || change.newStatus} (${change.source === 'route_plan' ? '拜访路线' : change.source === 'task_detail' ? '任务详情' : '系统'})`,
        time: change.changedAt,
        icon: 'task',
      });
    });

    verifications.forEach((v) => {
      items.push({
        id: `verification-${v.id}`,
        type: 'verification',
        title: '现场核验',
        description: `终端编号: ${v.terminalNumber || '未填写'}`,
        time: v.createdAt,
        icon: 'verification',
      });
    });

    communications.forEach((c) => {
      items.push({
        id: `communication-${c.id}`,
        type: 'communication',
        title: `沟通记录${c.followedUp ? ' (已跟进)' : ''}`,
        description: `${c.notes.substring(0, 50)}${c.notes.length > 50 ? '...' : ''}`,
        time: c.createdAt,
        icon: 'communication',
      });
    });

    disposals.forEach((d) => {
      const typeLabels = { limit: '限额', pause_settlement: '暂停结算', review: '复查', release: '解除预警' };
      items.push({
        id: `disposal-${d.id}`,
        type: 'disposal',
        title: typeLabels[d.type],
        description: `状态: ${d.status === 'pending' ? '待审批' : d.status === 'approved' ? '已批准' : '已拒绝'}`,
        time: d.createdAt,
        icon: 'disposal',
      });
    });

    items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    setTimelineItems(items);
  }, [id]);

  const filteredTimelineItems = filterType === 'all'
    ? timelineItems
    : timelineItems.filter((item) => item.type === filterType);

  const handleTimelineItemClick = (item: TimelineItem) => {
    if (item.type === 'verification') {
      navigate(`/merchants/${id}/verify`);
    } else if (item.type === 'communication') {
      navigate(`/merchants/${id}/communication`);
    } else if (item.type === 'disposal') {
      navigate(`/merchants/${id}/disposal`);
    } else if (item.type === 'task') {
      const tasks = storage.getTasks().filter((t) => t.merchantId === parseInt(id!));
      if (tasks.length > 0) {
        navigate(`/tasks/${tasks[0].id}`);
      }
    }
  };

  if (!merchant) {
    return <div className="text-center text-gray-500 py-10">商户不存在</div>;
  }

  const lineChartData = {
    labels: dailyData.map((d) => d.day),
    datasets: [
      {
        label: '交易金额',
        data: dailyData.map((d) => d.amount),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const barChartData = {
    labels: dailyData.map((d) => d.day),
    datasets: [
      {
        label: '交易笔数',
        data: dailyData.map((d) => d.count),
        backgroundColor: '#10b981',
        borderRadius: 8,
      },
    ],
  };

  const totalTransactions = transactions.length;
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const refundAmount = transactions.reduce((sum, t) => sum + t.refundAmount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{merchant.name}</h1>
            <span className="inline-block mt-2 px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-full">
              收单费率: {(merchant.rate * 100).toFixed(2)}%
            </span>
          </div>
          <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
            <Building2 className="w-7 h-7 text-blue-600" />
          </div>
        </div>

        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-blue-500" />
            <span>{merchant.address}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-blue-500" />
            <span>{merchant.contact}</span>
          </div>
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-500" />
            <span>营业执照号: {merchant.licenseNumber}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-500" />
            <span>开户日期: {merchant.createdAt}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">交易笔数</p>
          <p className="text-2xl font-bold text-gray-800">{totalTransactions}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">交易总额</p>
          <p className="text-2xl font-bold text-blue-600">¥{totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">退款金额</p>
          <p className="text-2xl font-bold text-red-500">¥{refundAmount.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-gray-600" />
            <h2 className="font-semibold text-gray-800">时间线</h2>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1"
            >
              <option value="all">全部</option>
              <option value="task">任务</option>
              <option value="verification">核验</option>
              <option value="communication">沟通</option>
              <option value="disposal">处置</option>
            </select>
          </div>
        </div>

        {filteredTimelineItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>暂无{filterType !== 'all' ? '该类型' : ''}记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTimelineItems.map((item, index) => (
              <div
                key={item.id}
                onClick={() => handleTimelineItemClick(item)}
                className="flex gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    item.type === 'task' ? 'bg-blue-100 text-blue-600' :
                    item.type === 'verification' ? 'bg-green-100 text-green-600' :
                    item.type === 'communication' ? 'bg-purple-100 text-purple-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {item.type === 'task' && <FileText className="w-5 h-5" />}
                    {item.type === 'verification' && <Camera className="w-5 h-5" />}
                    {item.type === 'communication' && <MessageSquare className="w-5 h-5" />}
                    {item.type === 'disposal' && <AlertTriangle className="w-5 h-5" />}
                  </div>
                  {index < filteredTimelineItems.length - 1 && (
                    <div className="w-0.5 h-8 bg-gray-200 mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-800">{item.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{item.time}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">近7日交易趋势</h2>
        <div className="h-64">
          <Line
            data={lineChartData}
            options={{
              responsive: true,
              plugins: { legend: { position: 'top' as const } },
              scales: { y: { beginAtZero: true } },
            }}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">近7日交易笔数</h2>
        <div className="h-64">
          <Bar
            data={barChartData}
            options={{
              responsive: true,
              plugins: { legend: { position: 'top' as const } },
              scales: { y: { beginAtZero: true } },
            }}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">投诉记录</h2>
        {complaints.length === 0 ? (
          <p className="text-gray-500 text-center py-4">暂无投诉记录</p>
        ) : (
          <div className="space-y-3">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-700">{complaint.content}</p>
                <p className="text-xs text-gray-400 mt-1">{complaint.createdAt}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate(`/merchants/${merchant.id}/verify`)}
          className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 hover:bg-gray-50 transition-colors"
        >
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Camera className="w-5 h-5 text-green-600" />
          </div>
          <span className="font-medium text-gray-800">现场核验</span>
        </button>
        <button
          onClick={() => navigate(`/merchants/${merchant.id}/diagnosis`)}
          className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 hover:bg-gray-50 transition-colors"
        >
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-orange-600" />
          </div>
          <span className="font-medium text-gray-800">交易诊断</span>
        </button>
        <button
          onClick={() => navigate(`/merchants/${merchant.id}/communication`)}
          className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 hover:bg-gray-50 transition-colors"
        >
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-purple-600" />
          </div>
          <span className="font-medium text-gray-800">沟通记录</span>
        </button>
        <button
          onClick={() => navigate(`/merchants/${merchant.id}/disposal`)}
          className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 hover:bg-gray-50 transition-colors"
        >
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <span className="font-medium text-gray-800">处置中心</span>
        </button>
      </div>
    </div>
  );
}