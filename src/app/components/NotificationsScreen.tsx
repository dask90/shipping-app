import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { ArrowLeft, CheckCircle, AlertCircle, Bell } from 'lucide-react';

interface NotificationsScreenProps {
  onNavigate: (screen: string) => void;
}

import { useShipment } from '@/app/context/ShipmentContext';

export function NotificationsScreen({ onNavigate }: NotificationsScreenProps) {
  const { notifications, unreadCount, markAsRead } = useShipment();

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-600';
      case 'info':
        return 'bg-blue-100 text-blue-600';
      case 'warning':
        return 'bg-amber-100 text-amber-600';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertCircle;
      default: return Bell;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-white p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center mb-4 text-blue-100 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl mb-1">Notifications</h1>
              <p className="text-blue-100">Stay updated on your shipments</p>
            </div>
            {unreadCount > 0 && (
              <Badge className="bg-accent text-accent-foreground">
                {unreadCount} new
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = getIcon(notification.type);
              return (
                <Card
                  key={notification.id}
                  className={`p-4 shadow-md cursor-pointer transition-all ${!notification.read ? 'border-l-4 border-l-primary bg-blue-50/30' : ''
                    }`}
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.shipment_id) onNavigate('tracking');
                  }}
                >
                  <div className="flex items-start">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${getIconColor(notification.type)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className={!notification.read ? 'font-semibold' : ''}>
                          {notification.title}
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full ml-2 flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 shadow-md text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2">No Notifications</h3>
            <p className="text-sm text-muted-foreground">
              You're all caught up! Check back later for updates.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
