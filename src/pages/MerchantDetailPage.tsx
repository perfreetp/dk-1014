import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Building2, Phone, FileText, Camera, BarChart3, MessageSquare, AlertTriangle, Clock } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { mockMerchants, mockTransactions, mockComplaints, generateDailyTransactions } from '../data/mockData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement);

export default function MerchantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const merchant = mockMerchants.find((m) => m.id === parseInt(id!));
  const transactions = mockTransactions.filter((t) => t.merchantId === parseInt(id!));
  const complaints = mockComplaints.filter((c) => c.merchantId === parseInt(id!));
  const dailyData = generateDailyTransactions();

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