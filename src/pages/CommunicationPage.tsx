import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, CheckCircle, User, Calendar, Filter, Send } from 'lucide-react';
import { mockMerchants } from '../data/mockData';
import { storage } from '../utils/storage';
import { Communication } from '../types';

export default function CommunicationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const merchant = mockMerchants.find((m) => m.id === parseInt(id!));
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [filterRecorder, setFilterRecorder] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const [formData, setFormData] = useState({
    notes: '',
    rectificationRequirements: '',
    commitmentDate: '',
    recorder: '',
  });

  useEffect(() => {
    const merchantId = parseInt(id!);
    const existingCommunications = storage.getCommunicationsByMerchantId(merchantId);
    setCommunications(existingCommunications);
  }, [id]);

  const recorders = useMemo(() => {
    const uniqueRecorders = [...new Set(communications.map((c) => c.recorder))];
    return uniqueRecorders.filter(Boolean);
  }, [communications]);

  const filteredCommunications = useMemo(() => {
    return communications.filter((c) => {
      const matchesRecorder = !filterRecorder || c.recorder === filterRecorder;
      const matchesDate = !filterDate || c.createdAt.includes(filterDate);
      return matchesRecorder && matchesDate;
    });
  }, [communications, filterRecorder, filterDate]);

  const handleSubmit = () => {
    if (!formData.notes.trim()) {
      alert('请填写访谈要点');
      return;
    }
    if (!formData.recorder.trim()) {
      alert('请填写记录人');
      return;
    }

    const newCommunication: Communication = {
      id: Date.now(),
      merchantId: parseInt(id!),
      notes: formData.notes,
      rectificationRequirements: formData.rectificationRequirements,
      commitmentDate: formData.commitmentDate,
      recorder: formData.recorder,
      createdAt: new Date().toLocaleString('zh-CN'),
      followedUp: false,
    };

    storage.saveCommunication(newCommunication);
    setCommunications((prev) => [newCommunication, ...prev]);
    setFormData({ notes: '', rectificationRequirements: '', commitmentDate: '', recorder: '' });
    alert('沟通记录已保存');
  };

  const handleMarkFollowedUp = (communicationId: number) => {
    storage.toggleCommunicationFollowedUp(communicationId);
    setCommunications((prev) =>
      prev.map((c) => (c.id === communicationId ? { ...c, followedUp: !c.followedUp } : c))
    );
  };

  const handleBack = () => {
    navigate(`/merchants/${id}`);
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
        <p className="text-sm text-gray-500">沟通记录</p>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <h2 className="font-semibold text-gray-800 mb-4">新增沟通记录</h2>
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4" />
              访谈要点 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="请输入访谈要点"
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4" />
              整改要求
            </label>
            <textarea
              value={formData.rectificationRequirements}
              onChange={(e) => setFormData((prev) => ({ ...prev, rectificationRequirements: e.target.value }))}
              placeholder="请输入整改要求"
              rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4" />
              承诺日期
            </label>
            <input
              type="date"
              value={formData.commitmentDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, commitmentDate: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4" />
              记录人 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.recorder}
              onChange={(e) => setFormData((prev) => ({ ...prev, recorder: e.target.value }))}
              placeholder="请输入记录人姓名"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            保存记录
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">历史沟通记录</h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <select
            value={filterRecorder}
            onChange={(e) => setFilterRecorder(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">全部记录人</option>
            {recorders.map((recorder) => (
              <option key={recorder} value={recorder}>
                {recorder}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            placeholder="搜索日期"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </div>

        {filteredCommunications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>暂无沟通记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCommunications.map((comm) => (
              <div
                key={comm.id}
                className={`p-4 rounded-xl border transition-all ${
                  comm.followedUp ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">{comm.recorder}</span>
                    {comm.followedUp && (
                      <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        已跟进
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{comm.createdAt}</span>
                </div>

                <p className="text-sm text-gray-700 mb-2">{comm.notes}</p>

                {comm.rectificationRequirements && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-500">整改要求</p>
                    <p className="text-sm text-gray-700">{comm.rectificationRequirements}</p>
                  </div>
                )}

                {comm.commitmentDate && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>承诺日期: {comm.commitmentDate}</span>
                  </div>
                )}

                {!comm.followedUp && (
                  <button
                    onClick={() => handleMarkFollowedUp(comm.id)}
                    className="mt-3 py-2 px-4 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                  >
                    标记为已跟进
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}