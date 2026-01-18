import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { ArrowLeft, Package, TruckIcon, CheckCircle, AlertCircle, Bell } from 'lucide-react';

interface NotificationsScreenProps {
  onNavigate: (screen: string) => void;
}

const notifications = [
  {
    id: 1,
    type: 'delivery',
    title: 'Package Delivered',
    message: 'Your shipment SHP001235 has been delivered successfully',
    timestamp: '2 hours ago',
    read: false,
    icon: CheckCircle,
    color: 'green',
  },
  {
    id: 2,
    type: 'transit',
    title: 'In Transit Update',
    message: 'SHP001234 is now in transit to Kumasi Hub',
    timestamp: '5 hours ago',
    read: false,
    icon: TruckIcon,
    color: 'blue',
  },
  {
    id: 3,
    type: 'pickup',
    title: 'Pickup Scheduled',
    message: 'Your package SHP001234 will be picked up today between 2 PM - 5 PM',
    timestamp: '1 day ago',
    read: true,
    icon: Package,
    color: 'amber',
  },
  {
    id: 4,
    type: 'alert',
    title: 'Delivery Delayed',
    message: 'SHP001233 delivery delayed due to weather conditions. New ETA: Jan 21',
    timestamp: '2 days ago',
    read: true,
    icon: AlertCircle,
    color: 'red',
  },
  {
    id: 5,
    type: 'delivery',
    title: 'Out for Delivery',
    message: 'SHP001232 is out for delivery. Expected by 6 PM today',
    timestamp: '3 days ago',
    read: true,
    icon: TruckIcon,
    color: 'blue',
  },
  {
    id: 6,
    type: 'pickup',
    title: 'Package Picked Up',
    message: 'Your shipment SHP001231 has been collected from Accra Office',
    timestamp: '4 days ago',
    read: true,
    icon: Package,
    color: 'amber',
  },
];

export function NotificationsScreen({ onNavigate }: NotificationsScreenProps) {
  const getIconColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-100 text-green-600';
      case 'blue':
        return 'bg-blue-100 text-blue-600';
      case 'amber':
        return 'bg-amber-100 text-amber-600';
      case 'red':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
              const Icon = notification.icon;
              return (
                <Card
                  key={notification.id}
                  className={`p-4 shadow-md cursor-pointer transition-all ${!notification.read ? 'border-l-4 border-l-primary bg-blue-50/30' : ''
                    }`}
                  onClick={() => onNavigate('tracking')}
                >
                  <div className="flex items-start">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${getIconColor(notification.color)}`}>
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
                        {notification.timestamp}
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
