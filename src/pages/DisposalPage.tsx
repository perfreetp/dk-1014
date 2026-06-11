import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Clock, Send, Wallet, Pause, RefreshCw, ShieldOff } from 'lucide-react';
import { mockMerchants } from '../data/mockData';
import { storage } from '../utils/storage';
import { Disposal, DisposalType } from '../types';

export default function DisposalPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const merchant = mockMerchants.find((m) => m.id === parseInt(id!));
  const [disposals, setDisposals] = useState<Disposal[]>([]);

  const [selectedType, setSelectedType] = useState<DisposalType>('limit');
  const [formData, setFormData] = useState({
    amount: '',
    approver: '',
    reviewDate: '',
  });

  useEffect(() => {
    const merchantId = parseInt(id!);
    const existingDisposals = storage.getDisposalsByMerchantId(merchantId);
    setDisposals(existingDisposals);
  }, [id]);

  const handleSubmit = () => {
    if (!formData.approver.trim()) {
      alert('请填写审批人');
      return;
    }

    if (selectedType === 'limit' && (!formData.amount || parseFloat(formData.amount) <= 0)) {
      alert('请填写有效的限额金额');
      return;
    }

    const newDisposal: Disposal = {
      id: Date.now(),
      merchantId: parseInt(id!),
      type: selectedType,
      amount: formData.amount ? parseFloat(formData.amount) : 0,
      status: 'pending',
      approver: formData.approver,
      createdAt: new Date().toLocaleString('zh-CN'),
      reviewDate: selectedType === 'review' ? formData.reviewDate : undefined,
    };

    storage.saveDisposal(newDisposal);
    setDisposals((prev) => [newDisposal, ...prev]);
    setFormData({ amount: '', approver: '', reviewDate: '' });
    alert('处置申请已提交');
  };

  const handleBack = () => {
    navigate(`/merchants/${id}`);
  };

  const getTypeInfo = (type: DisposalType) => {
    switch (type) {
      case 'limit':
        return { label: '限额', icon: Wallet, color: 'text-yellow-600 bg-yellow-100' };
      case 'pause_settlement':
        return { label: '暂停结算', icon: Pause, color: 'text-red-600 bg-red-100' };
      case 'review':
        return { label: '复查', icon: RefreshCw, color: 'text-blue-600 bg-blue-100' };
      case 'release':
        return { label: '解除预警', icon: ShieldOff, color: 'text-green-600 bg-green-100' };
      default:
        return { label: '未知', icon: AlertTriangle, color: 'text-gray-600 bg-gray-100' };
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: '待审批', color: 'text-yellow-600 bg-yellow-100' };
      case 'approved':
        return { label: '已批准', color: 'text-green-600 bg-green-100' };
      case 'rejected':
        return { label: '已拒绝', color: 'text-red-600 bg-red-100' };
      default:
        return { label: '未知', color: 'text-gray-600 bg-gray-100' };
    }
  };

  if (!merchant) {
    return <div className="text-center text-gray-500 py-10">商户不存在</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <button onClick={handleBack} className="text-gray-500 hover:text-gray-700 mb-4">
          ← 返回商户档案
        </button>
        <h1 className="text-lg font-bold text-gray-800">{merchant.name}</h1>
        <p className="text-sm text-gray-500">处置中心</p>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <h2 className="font-semibold text-gray-800 mb-4">发起处置申请</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">处置类型</label>
          <div className="grid grid-cols-2 gap-2">
            {(['limit', 'pause_settlement', 'review', 'release'] as DisposalType[]).map((type) => {
              const info = getTypeInfo(type);
              const Icon = info.icon;
              return (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedType(type);
                    setFormData({ amount: '', approver: '', reviewDate: '' });
                  }}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    selectedType === type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${selectedType === type ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${selectedType === type ? 'text-blue-700' : 'text-gray-700'}`}>
                    {info.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {selectedType === 'limit' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">限额金额</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
              placeholder="请输入限额金额"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {selectedType === 'review' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">复查日期</label>
            <input
              type="date"
              value={formData.reviewDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, reviewDate: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">审批人</label>
          <input
            type="text"
            value={formData.approver}
            onChange={(e) => setFormData((prev) => ({ ...prev, approver: e.target.value }))}
            placeholder="请输入审批人姓名"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          提交申请
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">历史处置记录</h2>

        {disposals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>暂无处置记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {disposals.map((disposal) => {
              const typeInfo = getTypeInfo(disposal.type);
              const statusInfo = getStatusInfo(disposal.status);
              const TypeIcon = typeInfo.icon;

              return (
                <div key={disposal.id} className="p-4 rounded-xl border border-gray-100 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeInfo.color}`}>
                        <TypeIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{typeInfo.label}</h3>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{disposal.createdAt}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {disposal.type === 'limit' && (
                      <div className="p-2 bg-yellow-50 rounded-lg">
                        <p className="text-xs text-gray-500">限额金额</p>
                        <p className="font-medium text-yellow-700">¥{disposal.amount.toLocaleString()}</p>
                      </div>
                    )}

                    {disposal.type === 'review' && disposal.reviewDate && (
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <p className="text-xs text-gray-500">复查日期</p>
                        <p className="font-medium text-blue-700">{disposal.reviewDate}</p>
                      </div>
                    )}

                    <div className="p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">审批人</p>
                      <p className="font-medium text-gray-700">{disposal.approver}</p>
                    </div>

                    <div className="p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">状态</p>
                      <p className="font-medium text-gray-700">{statusInfo.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}