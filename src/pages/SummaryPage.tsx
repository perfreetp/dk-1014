import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, ChevronDown, ChevronUp, Camera, MessageSquare, AlertTriangle, Building2, Calendar, CheckCircle, X, Store, CreditCard, FileCheck, Monitor } from 'lucide-react';
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
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);

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
    lines.push('══════════════════════════════════════════════════════════════');
    lines.push('                    商户风险巡检摘要报告                        ');
    lines.push('══════════════════════════════════════════════════════════════');
    lines.push(`导出时间: ${new Date().toLocaleString('zh-CN')}`);
    lines.push(`已巡检商户总数: ${summaries.length}`);
    lines.push('');

    summaries.forEach((summary, index) => {
      lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      lines.push(`【${index + 1}. ${summary.merchantName}】`);
      lines.push(`   地址: ${summary.address}`);
      lines.push('');

      if (summary.latestVerification) {
        const v = summary.latestVerification;
        lines.push(`   ▶ 现场核验 (共${summary.verificationCount}次)`);
        lines.push(`     提交时间: ${v.createdAt}`);
        lines.push(`     终端编号: ${v.terminalNumber || '未填写'}`);
        lines.push(`     门头照片: ${v.storefrontImage ? '已上传' : '未上传'}`);
        lines.push(`     收银台照片: ${v.checkoutImage ? '已上传' : '未上传'}`);
        lines.push(`     营业执照照片: ${v.licenseImage ? '已上传' : '未上传'}`);
        lines.push('');
      }

      if (summary.latestCommunication) {
        const c = summary.latestCommunication;
        lines.push(`   ▶ 沟通记录 (共${summary.communicationCount}次)`);
        lines.push(`     提交时间: ${c.createdAt}`);
        lines.push(`     访谈要点: ${c.notes}`);
        if (c.rectificationRequirements) {
          lines.push(`     整改要求: ${c.rectificationRequirements}`);
        }
        lines.push(`     记录人: ${c.recorder}`);
        lines.push(`     跟进状态: ${c.followedUp ? '已跟进' : '待跟进'}`);
        lines.push('');
      }

      if (summary.latestDisposal) {
        const d = summary.latestDisposal;
        const typeLabels = { limit: '限额', pause_settlement: '暂停结算', review: '复查', release: '解除预警' };
        lines.push(`   ▶ 处置记录 (共${summary.disposalCount}次)`);
        lines.push(`     提交时间: ${d.createdAt}`);
        lines.push(`     处置类型: ${typeLabels[d.type]}`);
        if (d.type === 'limit') {
          lines.push(`     限额金额: ¥${d.amount.toLocaleString()}`);
        }
        if (d.reviewDate) {
          lines.push(`     复查日期: ${d.reviewDate}`);
        }
        lines.push(`     审批人: ${d.approver}`);
        lines.push('');
      }
    });

    lines.push('══════════════════════════════════════════════════════════════');
    lines.push('                        报告结束                                ');
    lines.push('══════════════════════════════════════════════════════════════');

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
                    <div className="p-4 bg-white rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-800">最近核验</span>
                          <span className="text-xs text-gray-400">{summary.latestVerification.createdAt}</span>
                        </div>
                        <button
                          onClick={() => setSelectedVerification(summary.latestVerification)}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          查看详情
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">门头照片</p>
                          {summary.latestVerification.storefrontImage ? (
                            <img
                              src={summary.latestVerification.storefrontImage}
                              alt="门头"
                              className="w-full h-16 object-cover rounded-lg cursor-pointer hover:opacity-80"
                              onClick={() => setSelectedVerification(summary.latestVerification)}
                            />
                          ) : (
                            <div className="w-full h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Store className="w-4 h-4 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">收银台</p>
                          {summary.latestVerification.checkoutImage ? (
                            <img
                              src={summary.latestVerification.checkoutImage}
                              alt="收银台"
                              className="w-full h-16 object-cover rounded-lg cursor-pointer hover:opacity-80"
                              onClick={() => setSelectedVerification(summary.latestVerification)}
                            />
                          ) : (
                            <div className="w-full h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              <CreditCard className="w-4 h-4 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">营业执照</p>
                          {summary.latestVerification.licenseImage ? (
                            <img
                              src={summary.latestVerification.licenseImage}
                              alt="营业执照"
                              className="w-full h-16 object-cover rounded-lg cursor-pointer hover:opacity-80"
                              onClick={() => setSelectedVerification(summary.latestVerification)}
                            />
                          ) : (
                            <div className="w-full h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              <FileCheck className="w-4 h-4 text-gray-300" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Monitor className="w-4 h-4" />
                        <span>终端编号: {summary.latestVerification.terminalNumber || '未填写'}</span>
                      </div>
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

      {selectedVerification && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedVerification(null)} />
          <div className="relative bg-white w-full sm:w-[480px] sm:rounded-2xl rounded-t-2xl max-h-[80vh] overflow-hidden">
            <div className="sticky top-0 bg-white border-b px-4 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">核验详情</h3>
              <button onClick={() => setSelectedVerification(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(80vh-60px)] p-4 space-y-4">
              {selectedVerification.storefrontImage && (
                <div>
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                    <Store className="w-4 h-4" />
                    门头照片
                  </p>
                  <img
                    src={selectedVerification.storefrontImage}
                    alt="门头"
                    className="w-full aspect-video rounded-lg object-cover"
                  />
                </div>
              )}
              {selectedVerification.checkoutImage && (
                <div>
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    收银台照片
                  </p>
                  <img
                    src={selectedVerification.checkoutImage}
                    alt="收银台"
                    className="w-full aspect-video rounded-lg object-cover"
                  />
                </div>
              )}
              {selectedVerification.licenseImage && (
                <div>
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                    <FileCheck className="w-4 h-4" />
                    营业执照
                  </p>
                  <img
                    src={selectedVerification.licenseImage}
                    alt="营业执照"
                    className="w-full aspect-video rounded-lg object-cover"
                  />
                </div>
              )}
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  终端编号
                </p>
                <p className="text-lg font-medium text-gray-800 mt-1">{selectedVerification.terminalNumber || '未填写'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  提交日期
                </p>
                <p className="text-lg font-medium text-gray-800 mt-1">{selectedVerification.createdAt}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}