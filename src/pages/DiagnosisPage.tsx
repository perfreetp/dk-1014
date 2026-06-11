import { useParams } from 'react-router-dom';
import { AlertTriangle, AlertCircle, CheckCircle, TrendingUp, Moon, RefreshCw, Scissors, DollarSign } from 'lucide-react';
import { mockMerchants, mockDiagnosis } from '../data/mockData';

export default function DiagnosisPage() {
  const { id } = useParams<{ id: string }>();
  const merchant = mockMerchants.find((m) => m.id === parseInt(id!));
  const diagnosis = mockDiagnosis;

  if (!merchant) {
    return <div className="text-center text-gray-500 py-10">商户不存在</div>;
  }

  const riskItems = [
    { key: 'abnormalPeak', label: '异常峰值', icon: TrendingUp, desc: '交易金额出现异常峰值', value: diagnosis.abnormalPeak },
    { key: 'nightTransactions', label: '夜间交易', icon: Moon, desc: '非营业时间存在交易', value: diagnosis.nightTransactions },
    { key: 'highRefundRate', label: '退款偏高', icon: RefreshCw, desc: '退款率超过正常范围', value: diagnosis.highRefundRate },
    { key: 'splitting', label: '分单交易', icon: Scissors, desc: '存在疑似分单行为', value: diagnosis.splitting },
    { key: 'suspectedCashout', label: '疑似套现', icon: DollarSign, desc: '存在疑似套现特征', value: diagnosis.suspectedCashout },
  ];

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { label: '高风险', color: 'bg-red-100 text-red-700', bgColor: 'bg-red-500' };
    if (score >= 60) return { label: '中风险', color: 'bg-yellow-100 text-yellow-700', bgColor: 'bg-yellow-500' };
    return { label: '低风险', color: 'bg-green-100 text-green-700', bgColor: 'bg-green-500' };
  };

  const riskLevel = getRiskLevel(diagnosis.riskScore);
  const abnormalCount = riskItems.filter((item) => item.value).length;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">交易诊断报告</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${riskLevel.color}`}>
            {riskLevel.label}
          </span>
        </div>
        
        <div className="text-center py-4">
          <div className="relative w-32 h-32 mx-auto">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke={riskLevel.bgColor === 'bg-red-500' ? '#ef4444' : riskLevel.bgColor === 'bg-yellow-500' ? '#eab308' : '#22c55e'}
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${diagnosis.riskScore * 3.52} 352`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold">{diagnosis.riskScore}</span>
              <span className="text-sm text-blue-200">风险评分</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-sm text-blue-200">检测项数</p>
            <p className="text-xl font-bold">5</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-sm text-blue-200">异常项数</p>
            <p className="text-xl font-bold text-red-300">{abnormalCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">诊断详情</h2>
        
        <div className="space-y-3">
          {riskItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className={`flex items-center gap-4 p-4 rounded-xl ${
                  item.value ? 'bg-red-50 border border-red-100' : 'bg-green-50 border border-green-100'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  item.value ? 'bg-red-100' : 'bg-green-100'
                }`}>
                  {item.value ? (
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-medium ${item.value ? 'text-red-800' : 'text-green-800'}`}>
                      {item.label}
                    </h3>
                    {item.value && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-red-200 text-red-700 rounded-full">
                        异常
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">风险提示</h2>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-orange-800">
                当前商户存在 {abnormalCount} 项异常指标，建议尽快进行现场核查，
                重点关注交易模式和商户经营状况，必要时采取风险控制措施。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}