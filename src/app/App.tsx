import { useState } from 'react';
import { AuthScreen } from '@/app/components/AuthScreen';
import { CustomerDashboard } from '@/app/components/CustomerDashboard';
import { CreateShipment } from '@/app/components/CreateShipment';
import { ShipmentTracking } from '@/app/components/ShipmentTracking';
import { NotificationsScreen } from '@/app/components/NotificationsScreen';
import { ProfileScreen } from '@/app/components/ProfileScreen';
import { AdminDashboard } from '@/app/components/AdminDashboard';
import { StaffDashboard } from '@/app/components/StaffDashboard';
import { AgentDashboard } from '@/app/components/AgentDashboard';
import { ShipmentProvider, useShipment } from '@/app/context/ShipmentContext';
import { CustomerNavbar } from '@/app/components/CustomerNavbar';
import { Toaster } from 'sonner';



function AppContent() {
  const { currentUser, userRole, setTrackingId, isLoadingProfile } = useShipment();
  const [currentScreen, setCurrentScreen] = useState<string>('dashboard');

  const handleNavigate = (screen: string) => {
    if (screen === 'auth') {
      setTrackingId(null);
    }
    setCurrentScreen(screen);
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-muted-foreground animate-pulse font-medium">Authenticating...</p>
        </div>
      </div>
    );
  }

  // If not logged in, always show Auth
  if (!currentUser) {
    return <AuthScreen />;
  }

  const isCustomerScreen = userRole === 'customer' &&
    ['dashboard', 'create-shipment', 'tracking', 'notifications', 'profile'].includes(currentScreen);

  const renderScreen = () => {
    // Role-based dashboards
    if (currentScreen === 'dashboard') {
      switch (userRole) {
        case 'staff': return <StaffDashboard onNavigate={handleNavigate} />;
        case 'agent': return <AgentDashboard onNavigate={handleNavigate} />;
        case 'admin': return <AdminDashboard onNavigate={handleNavigate} />;
        default: return <CustomerDashboard onNavigate={handleNavigate} />;
      }
    }

    // Explicit screens
    switch (currentScreen) {
      case 'staff': return <StaffDashboard onNavigate={handleNavigate} />;
      case 'agent': return <AgentDashboard onNavigate={handleNavigate} />;
      case 'admin': return <AdminDashboard onNavigate={handleNavigate} />;
      case 'create-shipment': return <CreateShipment onNavigate={handleNavigate} />;
      case 'tracking': return <ShipmentTracking onNavigate={handleNavigate} />;
      case 'notifications': return <NotificationsScreen onNavigate={handleNavigate} />;
      case 'profile': return <ProfileScreen onNavigate={handleNavigate} />;
      default:
        if (userRole === 'customer') return <CustomerDashboard onNavigate={handleNavigate} />;
        return <AuthScreen />; // Fallback
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pb-20">
        {renderScreen()}
      </main>
      {isCustomerScreen && (
        <CustomerNavbar currentScreen={currentScreen} onNavigate={handleNavigate} />
      )}
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <ShipmentProvider>
      <AppContent />
    </ShipmentProvider>
  );
}
