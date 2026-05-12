
import React from 'react';
import { Store, UserPlus, Package, DollarSign } from 'lucide-react';

const ActivityFeedItem = ({ type, title, description, time }) => {
  const getIcon = () => {
    switch (type) {
      case 'shop': return <Store className="w-4 h-4 text-blue-500" />;
      case 'user': return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'order': return <Package className="w-4 h-4 text-secondary" />;
      case 'revenue': return <DollarSign className="w-4 h-4 text-primary" />;
      default: return <div className="w-2 h-2 rounded-full bg-gray-400" />;
    }
  };

  const getBg = () => {
    switch (type) {
      case 'shop': return 'bg-blue-100';
      case 'user': return 'bg-green-100';
      case 'order': return 'bg-pink-100';
      case 'revenue': return 'bg-blue-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="flex gap-4 items-start relative pb-6 last:pb-0">
      {/* Connector Line */}
      <div className="absolute left-4 top-8 bottom-0 w-px bg-border -ml-px last:hidden"></div>
      
      <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 shrink-0 ${getBg()}`}>
        {getIcon()}
      </div>
      
      <div className="flex-1 pt-1">
        <div className="flex justify-between items-start">
          <h5 className="text-sm font-semibold text-foreground">{title}</h5>
          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{time}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
};

export default ActivityFeedItem;
