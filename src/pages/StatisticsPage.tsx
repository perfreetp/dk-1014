import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { TrendingUp, Target, Award, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { mockStatistics, mockTasks } from '../data/mockData';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function StatisticsPage() {
  const statistics = mockStatistics;
  const totalTasks = mockTasks.length;
  const completedTasks = mockTasks.filter((t) => t.status === 'completed').length;

  const doughnutData = {
    labels: statistics.riskDistribution.map((item) => item.type),
    datasets: [
      {
        data: statistics.riskDistribution.map((item) => item.count),
        backgroundColor: ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#8b5cf6'],
        borderWidth: 0,
      },
    ],
  };

  const barData = {
    labels: statistics.personalPerformance.map((item) => item.name),
    datasets: [
      {
        label: '绩效得分',
        data: statistics.personalPerformance.map((item) => item.score),
        backgroundColor: '#3b82f6',
        borderRadius: 8,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' as const, labels: { padding: 15, usePointStyle: true } } },
    cutout: '60%',
  };

  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, max: 100 } },
  };

  const statCards = [
    {
      icon: Target,
      label: '任务完成率',
      value: `${statistics.completionRate}%`,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      icon: CheckCircle,
      label: '已完成任务',
      value: completedTasks.toString(),
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      icon: AlertTriangle,
      label: '待处理任务',
      value: (totalTasks - completedTasks).toString(),
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
    },
    {
      icon: Users,
      label: '参与人员',
      value: statistics.personalPerformance.length.toString(),
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">风险类型分布</h2>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">个人绩效排名</h2>
          <div className="h-64">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">绩效详情</h2>
        <div className="space-y-4">
          {statistics.personalPerformance.map((person, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                index === 0 ? 'bg-yellow-400 text-white' :
                index === 1 ? 'bg-gray-300 text-white' :
                index === 2 ? 'bg-orange-400 text-white' :
                'bg-gray-100 text-gray-600'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">{person.name}</span>
                  <span className="text-sm text-gray-500">完成 {person.completedTasks} 个任务</span>
                </div>
                <div className="mt-2 bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                    style={{ width: `${person.score}%` }}
                  />
                </div>
              </div>
              <span className={`text-lg font-bold ${
                person.score >= 90 ? 'text-green-600' :
                person.score >= 80 ? 'text-blue-600' :
                person.score >= 70 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {person.score}分
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-8 h-8" />
          <div>
            <h2 className="font-bold text-lg">本周工作概览</h2>
            <p className="text-blue-200 text-sm">数据更新时间: 2024-12-15</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-3xl font-bold">85.5%</p>
            <p className="text-blue-200 text-sm">平均完成率</p>
          </div>
          <div>
            <p className="text-3xl font-bold">15</p>
            <p className="text-blue-200 text-sm">风险预警数</p>
          </div>
          <div>
            <p className="text-3xl font-bold">4</p>
            <p className="text-blue-200 text-sm">参与人数</p>
          </div>
        </div>
      </div>
    </div>
  );
}