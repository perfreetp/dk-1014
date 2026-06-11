import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Camera, MessageSquare, AlertTriangle, Clock, ChevronRight, Building2 } from 'lucide-react';
import { storage } from '../utils/storage';
import { mockMerchants } from '../data/mockData';
import { Disposal } from '../types';

export default function ReviewCalendarPage() {
  const navigate = useNavigate();
  const [reviewDisposals, setReviewDisposals] = useState<Disposal[]>([]);
  const [filterDays, setFilterDays] = useState<number>(7);

  useEffect(() => {
    const disposals = storage.getReviewDisposals();
    setReviewDisposals(disposals);
  }, []);

  const getDaysUntilReview = (reviewDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const review = new Date(reviewDate);
    review.setHours(0, 0, 0, 0);
    const diffTime = review.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredDisposals = reviewDisposals
    .filter((d) => d.reviewDate)
    .filter((d) => {
      const days = getDaysUntilReview(d.reviewDate!);
      return days <= filterDays;
    })
    .sort((a, b) => {
      const daysA = getDaysUntilReview(a.reviewDate!);
      const daysB = getDaysUntilReview(b.reviewDate!);
      return daysA - daysB;
    });

  const getDaysLabel = (days: number) => {
    if (days < 0) return { text: `已过期 ${Math.abs(days)} 天`, color: 'text-red-600 bg-red-100' };
    if (days === 0) return { text: '今日复查', color: 'text-red-600 bg-red-100' };
    if (days === 1) return { text: '明日复查', color: 'text-orange-600 bg-orange-100' };
    if (days <= 3) return { text: `${days} 天后`, color: 'text-yellow-600 bg-yellow-100' };
    return { text: `${days} 天后`, color: 'text-blue-600 bg-blue-100' };
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800">复查日历</h1>
            <p className="text-sm text-gray-500">待复查商户 {filteredDisposals.length} 家</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={filterDays}
              onChange={(e) => setFilterDays(parseInt(e.target.value))}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1"
            >
              <option value={3}>近3天</option>
              <option value={7}>近7天</option>
              <option value={14}>近14天</option>
              <option value={30}>近30天</option>
            </select>
          </div>
        </div>
      </div>

      {filteredDisposals.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">暂无待复查商户</p>
          <p className="text-sm text-gray-400 mt-2">在处置中心提交复查申请后，商户将显示在这里</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDisposals.map((disposal) => {
            const merchant = mockMerchants.find((m) => m.id === disposal.merchantId);
            const days = getDaysUntilReview(disposal.reviewDate!);
            const daysInfo = getDaysLabel(days);

            return (
              <div key={disposal.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{merchant?.name || `商户 #${disposal.merchantId}`}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">复查日期: {disposal.reviewDate}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${daysInfo.color}`}>
                    {daysInfo.text}
                  </span>
                </div>

                {merchant && (
                  <div className="flex items-start gap-2 text-sm text-gray-500 mb-3">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">{merchant.address}</span>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => navigate(`/merchants/${disposal.merchantId}`)}
                    className="flex items-center justify-center gap-1 py-2 px-3 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                  >
                    <Building2 className="w-4 h-4" />
                    档案
                  </button>
                  <button
                    onClick={() => navigate(`/merchants/${disposal.merchantId}/verify`)}
                    className="flex items-center justify-center gap-1 py-2 px-3 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    核验
                  </button>
                  <button
                    onClick={() => navigate(`/merchants/${disposal.merchantId}/communication`)}
                    className="flex items-center justify-center gap-1 py-2 px-3 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    沟通
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}