import { ClipboardList, Camera, MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react';
import { TimelineItem } from '../types';

interface TimelineProps {
  items: TimelineItem[];
}

export default function Timeline({ items }: TimelineProps) {
  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'task':
        return <ClipboardList className="w-5 h-5" />;
      case 'verification':
        return <Camera className="w-5 h-5" />;
      case 'communication':
        return <MessageSquare className="w-5 h-5" />;
      case 'disposal':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getIconBg = (iconType: string) => {
    switch (iconType) {
      case 'task':
        return 'bg-blue-100 text-blue-600';
      case 'verification':
        return 'bg-green-100 text-green-600';
      case 'communication':
        return 'bg-purple-100 text-purple-600';
      case 'disposal':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>暂无记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconBg(item.type)}`}>
              {getIcon(item.type)}
            </div>
            {index < items.length - 1 && (
              <div className="w-0.5 h-8 bg-gray-200 mt-2" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-800">{item.title}</h3>
              <span className="text-xs text-gray-400">{item.time}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}