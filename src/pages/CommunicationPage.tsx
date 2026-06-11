import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MessageSquare, Calendar, User, Send, FileText } from 'lucide-react';
import { mockMerchants, mockCommunications } from '../data/mockData';
import { Communication } from '../types';

export default function CommunicationPage() {
  const { id } = useParams<{ id: string }>();
  const merchant = mockMerchants.find((m) => m.id === parseInt(id!));
  const [communications, setCommunications] = useState<Communication[]>(
    mockCommunications.filter((c) => c.merchantId === parseInt(id!))
  );
  const [newNote, setNewNote] = useState('');
  const [requirements, setRequirements] = useState('');
  const [commitmentDate, setCommitmentDate] = useState('');
  const [recorder, setRecorder] = useState('');

  if (!merchant) {
    return <div className="text-center text-gray-500 py-10">商户不存在</div>;
  }

  const handleSubmit = () => {
    if (!newNote || !recorder) {
      alert('请填写访谈要点和记录人');
      return;
    }

    const newCommunication: Communication = {
      id: communications.length + 1,
      merchantId: parseInt(id!),
      notes: newNote,
      rectificationRequirements: requirements,
      commitmentDate: commitmentDate,
      recorder: recorder,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setCommunications([newCommunication, ...communications]);
    setNewNote('');
    setRequirements('');
    setCommitmentDate('');
    setRecorder('');
    alert('沟通记录已保存');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800 mb-4">沟通记录 - {merchant.name}</h1>
        
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4" />
              访谈要点
            </label>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="请输入访谈要点..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4" />
              整改要求
            </label>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="请输入整改要求（可选）..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                承诺日期
              </label>
              <input
                type="date"
                value={commitmentDate}
                onChange={(e) => setCommitmentDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4" />
                记录人
              </label>
              <input
                type="text"
                value={recorder}
                onChange={(e) => setRecorder(e.target.value)}
                placeholder="请输入记录人"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            保存记录
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">历史沟通记录</h2>
        
        {communications.length === 0 ? (
          <p className="text-gray-500 text-center py-8">暂无沟通记录</p>
        ) : (
          <div className="space-y-4">
            {communications.map((comm) => (
              <div key={comm.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{comm.recorder}</span>
                  </div>
                  <span className="text-xs text-gray-400">{comm.createdAt}</span>
                </div>
                
                <div className="mb-3">
                  <p className="text-sm text-gray-600">{comm.notes}</p>
                </div>
                
                {comm.rectificationRequirements && (
                  <div className="bg-yellow-50 rounded-lg p-3 mb-3">
                    <p className="text-xs font-medium text-yellow-700 mb-1">整改要求</p>
                    <p className="text-sm text-yellow-800">{comm.rectificationRequirements}</p>
                  </div>
                )}
                
                {comm.commitmentDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>承诺完成日期: {comm.commitmentDate}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}