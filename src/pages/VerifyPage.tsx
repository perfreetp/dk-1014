import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Camera, Upload, CheckCircle, Store, Receipt, FileText, Monitor } from 'lucide-react';
import { mockMerchants } from '../data/mockData';

export default function VerifyPage() {
  const { id } = useParams<{ id: string }>();
  const merchant = mockMerchants.find((m) => m.id === parseInt(id!));
  const [images, setImages] = useState({
    storefront: '',
    checkout: '',
    license: '',
  });
  const [terminalNumber, setTerminalNumber] = useState('');
  const [verified, setVerified] = useState(false);

  if (!merchant) {
    return <div className="text-center text-gray-500 py-10">商户不存在</div>;
  }

  const handleImageUpload = (type: 'storefront' | 'checkout' | 'license') => {
    const mockImage = `https://neeko-copilot.bytedance.net/api/text_to_image?prompt=business%20${type === 'storefront' ? 'store%20front%20exterior' : type === 'checkout' ? 'cash%20register%20desk' : 'business%20license%20document'}&image_size=portrait_4_3`;
    setImages((prev) => ({ ...prev, [type]: mockImage }));
  };

  const handleSubmit = () => {
    if (images.storefront && images.checkout && images.license && terminalNumber) {
      setVerified(true);
      alert('核验信息已提交成功');
    } else {
      alert('请完成所有核验项');
    }
  };

  const verifyItems = [
    { key: 'storefront', label: '门头照片', icon: Store, desc: '拍摄商户门头全貌' },
    { key: 'checkout', label: '收银台照片', icon: Receipt, desc: '拍摄收银台及设备' },
    { key: 'license', label: '营业执照', icon: FileText, desc: '拍摄营业执照正本' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800 mb-4">现场核验 - {merchant.name}</h1>
        
        <div className="space-y-4">
          {verifyItems.map((item) => {
            const Icon = item.icon;
            const hasImage = images[item.key as keyof typeof images];
            return (
              <div key={item.key} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${hasImage ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {hasImage ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Icon className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{item.label}</h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
                
                {hasImage ? (
                  <div className="relative">
                    <img
                      src={hasImage}
                      alt={item.label}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleImageUpload(item.key as 'storefront' | 'checkout' | 'license')}
                      className="absolute top-2 right-2 bg-white/90 p-2 rounded-full shadow-md hover:bg-white transition-colors"
                    >
                      <Camera className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleImageUpload(item.key as 'storefront' | 'checkout' | 'license')}
                    className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-400 transition-colors"
                  >
                    <Camera className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-500">点击拍照或上传</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Monitor className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-800">终端编号</h3>
            <p className="text-sm text-gray-500">扫描或输入终端编号</p>
          </div>
        </div>
        
        <input
          type="text"
          placeholder="请输入终端编号"
          value={terminalNumber}
          onChange={(e) => setTerminalNumber(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={verified}
        className={`w-full py-4 rounded-xl font-medium transition-colors ${
          verified
            ? 'bg-green-500 text-white'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {verified ? (
          <span className="flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            核验完成
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Upload className="w-5 h-5" />
            提交核验信息
          </span>
        )}
      </button>
    </div>
  );
}