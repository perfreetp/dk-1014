import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, ChevronDown, ChevronUp, Camera, MessageSquare, AlertTriangle, Building2, Calendar, CheckCircle } from 'lucide-react';
import { storage } from '../utils/storage';
import { mockMerchants } from '../data/mockData';
import { Verification, Communication, Disposal } from '../types';

interface MerchantSummary {
  merchantId: number;
  merchantName: string;
  address: string;
  latestVerification?: Verification;
  latestCommunication?: Communication;
  latestDisposal?: Disposal;
  verificationCount: number;
  communicationCount: number;
  disposalCount: number;
}

export default function SummaryPage() {
  const navigate = useNavigate();
  const [summaries, setSummaries] = useState<MerchantSummary[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const verifications = storage.getVerifications();
    const communications = storage.getCommunications();
    const disposals = storage.getDisposals();

    const merchantMap = new Map<number, MerchantSummary>();

    mockMerchants.forEach((merchant) => {
      merchantMap.set(merchant.id, {
        merchantId: merchant.id,
        merchantName: merchant.name,
        address: merchant.address,
        verificationCount: 0,
        communicationCount: 0,
        disposalCount: 0,
      });
    });

    verifications.forEach((v) => {
      const summary = merchantMap.get(v.merchantId);
      if (summary) {
        summary.verificationCount++;
        if (!summary.latestVerification || new Date(v.createdAt) > new Date(summary.latestVerification.createdAt)) {
          summary.latestVerification = v;
        }
      }
    });

    communications.forEach((c) => {
      const summary = merchantMap.get(c.merchantId);
      if (summary) {
        summary.communicationCount++;
        if (!summary.latestCommunication || new Date(c.createdAt) > new Date(summary.latestCommunication.createdAt)) {
          summary.latestCommunication = c;
        }
      }
    });

    disposals.forEach((d) => {
      const summary = merchantMap.get(d.merchantId);
      if (summary) {
        summary.disposalCount++;
        if (!summary.latestDisposal || new Date(d.createdAt) > new Date(summary.latestDisposal.createdAt)) {
          summary.latestDisposal = d;
        }
      }
    });

    const sortedSummaries = Array.from(merchantMap.values())
      .filter((s) => s.verificationCount > 0 || s.communicationCount > 0 || s.disposalCount > 0)
      .sort((a, b) => {
        const aLatest = Math.max(
          a.latestVerification ? new Date(a.latestVerification.createdAt).getTime() : 0,
          a.latestCommunication ? new Date(a.latestCommunication.createdAt).getTime() : 0,
          a.latestDisposal ? new Date(a.latestDisposal.createdAt).getTime() : 0
        );
        const bLatest = Math.max(
          b.latestVerification ? new Date(b.latestVerification.createdAt).getTime() : 0,
          b.latestCommunication ? new Date(b.latestCommunication.createdAt).getTime() : 0,
          b.latestDisposal ? new Date(b.latestDisposal.createdAt).getTime() : 0
        );
        return bLatest - aLatest;
      });

    setSummaries(sortedSummaries);
  }, []);

  const handleExport = () => {
    const lines: string[] = [];
    lines.push('商户风险巡检摘要报告');
    lines.push(`导出时间: ${new Date().toLocaleString('zh-CN')}`);
    lines.push(`商户总数: ${summaries.length}`);
    lines.push('');

    summaries.forEach((summary) => {
      lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      lines.push(`【${summary.merchantName}】`);
      lines.push(`地址: ${summary.address}`);
      lines.push('');

      if (summary.latestVerification) {
        lines.push(`▶ 最近核验: ${summary.latestVerification.createdAt}`);
        lines.push(`  终端编号: ${summary.latestVerification.terminalNumber || '未填写'}`);
        lines.push(`  核验次数: ${summary.verificationCount}`);
      }

      if (summary.latestCommunication) {
        lines.push(`▶ 最近沟通: ${summary.latestCommunication.createdAt}`);
        lines.push(`  访谈要点: ${summary.latestCommunication.notes.substring(0, 100)}`);
        lines.push(`  记录人: ${summary.latestCommunication.recorder}`);
        lines.push(`  已跟进: ${summary.latestCommunication.followedUp ? '是' : '否'}`);
        lines.push(`  沟通次数: ${summary.communicationCount}`);
      }

      if (summary.latestDisposal) {
        const typeLabels = { limit: '限额', pause_settlement: '暂停结算', review: '复查', release: '解除预警' };
        lines.push(`▶ 最近处置: ${summary.latestDisposal.createdAt}`);
        lines.push(`  处置类型: ${typeLabels[summary.latestDisposal.type]}`);
        lines.push(`  处置次数: ${summary.disposalCount}`);
      }
      lines.push('');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `巡检摘要_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'limit':
        return { label: '限额', color: 'text-yellow-600 bg-yellow-100' };
      case 'pause_settlement':
        return { label: '暂停结算', color: 'text-red-600 bg-red-100' };
      case 'review':
        return { label: '复查', color: 'text-blue-600 bg-blue-100' };
      case 'release':
        return { label: '解除预警', color: 'text-green-600 bg-green-100' };
      default:
        return { label: '未知', color: 'text-gray-600 bg-gray-100' };
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800">巡检摘要</h1>
            <p className="text-sm text-gray-500">已巡检商户 {summaries.length} 家</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            导出报告
          </button>
        </div>
      </div>

      {summaries.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">暂无巡检记录</p>
          <p className="text-sm text-gray-400 mt-2">完成核验、沟通或处置后，数据将汇总在这里</p>
        </div>
      ) : (
        <div className="space-y-3">
          {summaries.map((summary) => (
            <div key={summary.merchantId} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div
                onClick={() => setExpandedId(expandedId === summary.merchantId ? null : summary.merchantId)}
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{summary.merchantName}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        {summary.verificationCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            {summary.verificationCount}次核验
                          </span>
                        )}
                        {summary.communicationCount > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {summary.communicationCount}次沟通
                          </span>
                        )}
                        {summary.disposalCount > 0 && (
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {summary.disposalCount}次处置
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {expandedId === summary.merchantId ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {expandedId === summary.merchantId && (
                <div className="border-t px-4 py-4 space-y-4 bg-gray-50">
                  {summary.latestVerification && (
                    <div className="p-3 bg-white rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Camera className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-800">最近核验</span>
                        <span className="text-xs text-gray-400">{summary.latestVerification.createdAt}</span>
                      </div>
                      <p className="text-sm text-gray-600">终端编号: {summary.latestVerification.terminalNumber || '未填写'}</p>
                      {summary.latestVerification.storefrontImage && (
                        <img
                          src={summary.latestVerification.storefrontImage}
                          alt="门头"
                          className="mt-2 w-32 h-20 object-cover rounded-lg"
                        />
                      )}
                    </div>
                  )}

                  {summary.latestCommunication && (
                    <div className="p-3 bg-white rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-800">最近沟通</span>
                        <span className="text-xs text-gray-400">{summary.latestCommunication.createdAt}</span>
                        {summary.latestCommunication.followedUp && (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle className="w-3 h-3" />
                            已跟进
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{summary.latestCommunication.notes}</p>
                      <p className="text-xs text-gray-500 mt-1">记录人: {summary.latestCommunication.recorder}</p>
                    </div>
                  )}

                  {summary.latestDisposal && (
                    <div className="p-3 bg-white rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-gray-800">最近处置</span>
                        <span className="text-xs text-gray-400">{summary.latestDisposal.createdAt}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeInfo(summary.latestDisposal.type).color}`}>
                          {getTypeInfo(summary.latestDisposal.type).label}
                        </span>
                        {summary.latestDisposal.type === 'limit' && (
                          <span className="text-sm text-gray-600">¥{summary.latestDisposal.amount.toLocaleString()}</span>
                        )}
                        {summary.latestDisposal.reviewDate && (
                          <span className="text-sm text-gray-600">复查: {summary.latestDisposal.reviewDate}</span>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => navigate(`/merchants/${summary.merchantId}`)}
                    className="w-full py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    查看商户详情
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}