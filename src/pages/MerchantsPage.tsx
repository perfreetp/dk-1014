import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Building2, Phone, Clock } from 'lucide-react';
import { mockMerchants } from '../data/mockData';
import { Merchant } from '../types';

export default function MerchantsPage() {
  const [merchants] = useState<Merchant[]>(mockMerchants);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredMerchants = merchants.filter((merchant) =>
    merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    merchant.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetail = (merchant: Merchant) => {
    navigate(`/merchants/${merchant.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="搜索商户名称或地址..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
        />
      </div>

      <div className="grid gap-4">
        {filteredMerchants.map((merchant) => (
          <button
            key={merchant.id}
            onClick={() => handleViewDetail(merchant)}
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">{merchant.name}</h3>
                  <div className="space-y-2 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{merchant.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{merchant.contact}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>开户日期: {merchant.createdAt}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">{(merchant.rate * 100).toFixed(2)}%</div>
                <div className="text-xs text-gray-400">收单费率</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}