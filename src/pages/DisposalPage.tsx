import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle, Clock, CheckCircle, XCircle, Send, DollarSign, Timer, RotateCcw, Unlock } from 'lucide-react';
import { mockMerchants, mockDisposals } from '../data/mockData';
import { Disposal, DisposalType } from '../types';

export default function DisposalPage() {
  const { id } = useParams<{ id: string }>();
  const merchant = mockMerchants.find((m) => m.id === parseInt(id!));
  const [disposals, setDisposals] = useState<Disposal[]>(
    mockDisposals.filter((d) => d.merchantId === parseInt(id!))
  );
  const [selectedType, setSelectedType] = useState<DisposalType>('limit');
  const [amount, setAmount] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!merchant) {
    return <div className="text-center text-gray-500 py-10">商户不存在</div>;
  }

  const disposalTypes = [
    { key: 'limit' as DisposalType, label: '限额', icon: DollarSign, desc: '设置交易限额' },
    { key: 'pause_settlement' as DisposalType, label: '暂停结算', icon: Timer, desc: '暂停商户结算' },
    { key: 'review' as DisposalType, label: '复查', icon: RotateCcw, desc: '安排复查时间' },
    { key: 'release' as DisposalType, label: '解除预警', icon: Unlock, desc: '解除风险预警' },
  ];

  const statusConfig = {
    pending: { label: '待审批', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    approved: { label: '已批准', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    rejected: { label: '已拒绝', color: 'bg-red-100 text-red-700', icon: XCircle },
  };

  const handleSubmit = () => {
    if (selectedType === 'limit' && !amount) {
      alert('请输入限额金额');
      return;
    }

    const newDisposal: Disposal = {
      id: disposals.length + 1,
      merchantId: parseInt(id!),
      type: selectedType,
      amount: parseFloat(amount) || 0,
      status: 'pending',
      approver: '',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setDisposals([newDisposal, ...disposals]);
    setAmount('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    alert('处置申请已提交，等待审批');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-8 h-8" />
          <div>
            <h1 className="text-xl font-bold">处置中心</h1>
            <p className="text-orange-200 text-sm">{merchant.name}</p>
          </div>
        </div>
        <p className="text-sm text-orange-100">
          根据交易诊断结果，选择合适的处置措施，提交后需等待审批。
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">选择处置类型</h2>
        
        <div className="grid grid-cols-2 gap-3">
          {disposalTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.key}
                onClick={() => setSelectedType(type.key)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedType === type.key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                  selectedType === type.key ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Icon className={`w-5 h-5 ${selectedType === type.key ? 'text-blue-600' : 'text-gray-500'}`} />
                </div>
                <h3 className={`font-medium ${selectedType === type.key ? 'text-blue-700' : 'text-gray-800'}`}>
                  {type.label}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{type.desc}</p>
              </button>
            );
          })}
        </div>

        {selectedType === 'limit' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">限额金额（元）</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="请输入限额金额"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          className={`w-full mt-6 py-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
            submitted ? 'bg-green-500' : 'bg-orange-500 hover:bg-orange-600'
          } text-white`}
        >
          {submitted ? (
            <>
              <CheckCircle className="w-5 h-5" />
              提交成功
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              提交处置申请
            </>
          )}
        </button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">历史处置记录</h2>
        
        {disposals.length === 0 ? (
          <p className="text-gray-500 text-center py-8">暂无处置记录</p>
        ) : (
          <div className="space-y-3">
            {disposals.map((disposal) => {
              const typeLabel = disposalTypes.find((t) => t.key === disposal.type)?.label || disposal.type;
              const StatusIcon = statusConfig[disposal.status].icon;
              return (
                <div key={disposal.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">{typeLabel}</span>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[disposal.status].color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig[disposal.status].label}
                    </span>
                  </div>
                  {disposal.amount > 0 && (
                    <p className="text-sm text-gray-600">金额: ¥{disposal.amount.toLocaleString()}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">{disposal.createdAt}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}