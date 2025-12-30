
import React from 'react';
import { X, Bell, Clock, Ticket } from 'lucide-react';

interface NotificationsProps {
  onClose: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ onClose }) => {
  const notifications = [
    {
      id: 1,
      title: "Welcome to Local!",
      message: "Find the best services and vendors near you. Start exploring now!",
      time: "Just now",
      icon: Bell,
      color: "bg-blue-100 text-blue-600"
    },
    {
      id: 2,
      title: "50% Off Sale",
      message: "Great discounts on Electronics this weekend at Nehru Place.",
      time: "2 hours ago",
      icon: Ticket,
      color: "bg-purple-100 text-purple-600"
    },
    {
      id: 3,
      title: "Order Status",
      message: "Your enquiry to 'Tech World Repairs' has been viewed.",
      time: "1 day ago",
      icon: Clock,
      color: "bg-green-100 text-green-600"
    }
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[calc(4rem+env(safe-area-inset-top))] px-4 pointer-events-none">
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      ></div>
      
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto animate-in slide-in-from-top-4 fade-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/80 backdrop-blur-md">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Bell className="w-4 h-4 text-red-600" /> Notifications
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto">
          {notifications.map((item) => (
            <div key={item.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex justify-between items-start">
                   <h4 className="font-bold text-sm text-slate-800">{item.title}</h4>
                   <span className="text-[10px] text-gray-400 font-medium">{item.time}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.message}</p>
              </div>
            </div>
          ))}
          <div className="p-4 text-center">
             <button className="text-xs font-bold text-red-600 hover:underline">Mark all as read</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
