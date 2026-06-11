import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, Upload, Store, CreditCard, FileText, Monitor, Plus, X, ChevronRight, Calendar } from 'lucide-react';
import { mockMerchants } from '../data/mockData';
import { storage } from '../utils/storage';
import { Verification } from '../types';

export default function VerifyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const merchant = mockMerchants.find((m) => m.id === parseInt(id!));
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);

  const [formData, setFormData] = useState({
    storefrontImage: '',
    checkoutImage: '',
    licenseImage: '',
    terminalNumber: '',
  });

  useEffect(() => {
    const merchantId = parseInt(id!);
    const existingVerifications = storage.getVerificationsByMerchantId(merchantId);
    setVerifications(existingVerifications);
  }, [id]);

  const handleImageUpload = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({ ...prev, [field]: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    const newVerification: Verification = {
      id: Date.now(),
      merchantId: parseInt(id!),
      storefrontImage: formData.storefrontImage,
      checkoutImage: formData.checkoutImage,
      licenseImage: formData.licenseImage,
      terminalNumber: formData.terminalNumber,
      createdAt: new Date().toLocaleString('zh-CN'),
    };

    storage.saveVerification(newVerification);
    setVerifications((prev) => [newVerification, ...prev]);
    setFormData({ storefrontImage: '', checkoutImage: '', licenseImage: '', terminalNumber: '' });
    alert('核验记录已保存');
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
        <p className="text-sm text-gray-500">现场核验</p>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">新增核验记录</h2>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1 text-blue-600 text-sm hover:text-blue-700"
          >
            查看历史记录
            <ChevronRight className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-90' : ''}`} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Store className="w-4 h-4" />
              门头照片
            </label>
            <div className="relative">
              {formData.storefrontImage ? (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img src={formData.storefrontImage} alt="门头" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                  <Camera className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">点击上传门头照片</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleImageUpload('storefrontImage', e)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="w-4 h-4" />
              收银台照片
            </label>
            <div className="relative">
              {formData.checkoutImage ? (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img src={formData.checkoutImage} alt="收银台" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                  <Camera className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">点击上传收银台照片</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleImageUpload('checkoutImage', e)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4" />
              营业执照照片
            </label>
            <div className="relative">
              {formData.licenseImage ? (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img src={formData.licenseImage} alt="营业执照" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                  <Camera className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">点击上传营业执照照片</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleImageUpload('licenseImage', e)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Monitor className="w-4 h-4" />
              终端编号
            </label>
            <input
              type="text"
              value={formData.terminalNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, terminalNumber: e.target.value }))}
              placeholder="请输入终端编号"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            提交核验记录
          </button>
        </div>
      </div>

      {showHistory && verifications.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">历史核验记录 ({verifications.length})</h3>
          <div className="space-y-3">
            {verifications.map((v) => (
              <div
                key={v.id}
                onClick={() => setSelectedVerification(v)}
                className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">核验记录 #{v.id}</span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {v.createdAt}
                  </span>
                </div>
                {v.terminalNumber && (
                  <p className="text-xs text-gray-500 mt-1">终端编号: {v.terminalNumber}</p>
                )}
              </div>
            ))}
          </div>
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
                  <p className="text-sm text-gray-500 mb-2">门头照片</p>
                  <img
                    src={selectedVerification.storefrontImage}
                    alt="门头"
                    className="w-full aspect-video rounded-lg object-cover"
                  />
                </div>
              )}
              {selectedVerification.checkoutImage && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">收银台照片</p>
                  <img
                    src={selectedVerification.checkoutImage}
                    alt="收银台"
                    className="w-full aspect-video rounded-lg object-cover"
                  />
                </div>
              )}
              {selectedVerification.licenseImage && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">营业执照</p>
                  <img
                    src={selectedVerification.licenseImage}
                    alt="营业执照"
                    className="w-full aspect-video rounded-lg object-cover"
                  />
                </div>
              )}
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">终端编号</p>
                <p className="text-lg font-medium text-gray-800">{selectedVerification.terminalNumber || '未填写'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">提交日期</p>
                <p className="text-lg font-medium text-gray-800">{selectedVerification.createdAt}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}