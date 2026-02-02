import { Package, TruckIcon, Clock, User } from "lucide-react";

interface CustomerNavbarProps {
    currentScreen: string;
    onNavigate: (screen: string) => void;
}

export function CustomerNavbar({ currentScreen, onNavigate }: CustomerNavbarProps) {
    const navItems = [
        { id: 'dashboard', label: 'Home', icon: Package },
        { id: 'notifications', label: 'Activity', icon: Clock },
        { id: 'tracking', label: 'Track', icon: TruckIcon },
        { id: 'profile', label: 'Profile', icon: User },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
            <div className="max-w-4xl mx-auto px-4 py-3">
                <div className="grid grid-cols-4 gap-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentScreen === item.id || (item.id === 'dashboard' && currentScreen === 'dashboard');

                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id)}
                                className={`flex flex-col items-center py-2 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <Icon className="w-5 h-5 mb-1" />
                                <span className="text-xs">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
