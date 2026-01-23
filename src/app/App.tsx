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
import { Toaster } from 'sonner';

type Screen = 'dashboard' | 'create-shipment' | 'tracking' | 'notifications' | 'profile' | 'admin' | 'staff' | 'agent' | 'auth';

function AppContent() {
  const { currentUser, userRole, setTrackingId } = useShipment();
  const [currentScreen, setCurrentScreen] = useState<string>('dashboard');

  const handleNavigate = (screen: string) => {
    if (screen === 'auth') {
      setTrackingId(null);
    }
    setCurrentScreen(screen as Screen);
  };

  // If not logged in, always show Auth
  if (!currentUser) {
    return <AuthScreen />;
  }


  const renderScreen = () => {
    // If we're on the default dashboard, redirect based on role
    if (currentScreen === 'dashboard') {
      switch (userRole) {
        case 'staff': return <StaffDashboard onNavigate={handleNavigate} />;
        case 'agent': return <AgentDashboard onNavigate={handleNavigate} />;
        case 'admin': return <AdminDashboard onNavigate={handleNavigate} />;
        default: return <CustomerDashboard onNavigate={handleNavigate} />;
      }
    }

    switch (currentScreen) {
      case 'staff': return <StaffDashboard onNavigate={handleNavigate} />;
      case 'agent': return <AgentDashboard onNavigate={handleNavigate} />;
      case 'admin': return <AdminDashboard onNavigate={handleNavigate} />;
      case 'dashboard': return <CustomerDashboard onNavigate={handleNavigate} />;
      case 'create-shipment': return <CreateShipment onNavigate={handleNavigate} />;
      case 'tracking': return <ShipmentTracking onNavigate={handleNavigate} />;
      case 'notifications': return <NotificationsScreen onNavigate={handleNavigate} />;
      case 'profile': return <ProfileScreen onNavigate={handleNavigate} />;
      default: return <CustomerDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      {renderScreen()}
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <ShipmentProvider>
      <AppContent />
    </ShipmentProvider>
  );
}
