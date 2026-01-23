'use client';

import { useShipment } from '@/app/context/ShipmentContext';
import { Bell, Trash2, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';

export function NotificationCenter() {
    const { notifications, unreadCount, markAsRead, clearNotifications } = useShipment();

    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'warning':
                return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            default:
                return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/20">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 border-2 border-primary text-[10px]">
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 shadow-2xl border-border">
                <div className="p-4 border-b border-border flex justify-between items-center bg-muted/50 rounded-t-lg">
                    <h3 className="font-bold text-sm">Notifications</h3>
                    <div className="flex gap-2">
                        {notifications.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-[10px] hover:text-red-500"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearNotifications();
                                }}
                            >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Clear All
                            </Button>
                        )}
                    </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p className="text-xs">No notifications yet</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`p-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer relative ${!notif.read ? 'bg-primary/5' : ''}`}
                                onClick={() => !notif.read && markAsRead(notif.id)}
                            >
                                <div className="flex gap-3">
                                    <div className="mt-0.5">{getIcon(notif.type)}</div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-semibold text-xs leading-none">{notif.title}</h4>
                                            {!notif.read && <div className="w-2 h-2 bg-primary rounded-full" />}
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                                        <span className="text-[10px] text-muted-foreground mt-2 block">
                                            {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {notifications.length > 0 && (
                    <div className="p-2 border-t border-border bg-muted/20 rounded-b-lg">
                        <Button variant="ghost" size="sm" className="w-full text-[10px] h-8">
                            View All Activity
                        </Button>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
