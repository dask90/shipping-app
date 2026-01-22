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

type Screen = 'auth' | 'dashboard' | 'create-shipment' | 'tracking' | 'notifications' | 'profile' | 'admin' | 'staff' | 'agent';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
  const { setUserRole, setTrackingId } = useShipment();

  const handleLogin = (role: 'customer' | 'staff' | 'agent' | 'admin') => {
    setUserRole(role);
    switch (role) {
      case 'staff': setCurrentScreen('staff'); break;
      case 'agent': setCurrentScreen('agent'); break;
      case 'admin': setCurrentScreen('admin'); break;
      default: setCurrentScreen('dashboard');
    }
  };

  const handleNavigate = (screen: string) => {
    if (screen === 'auth') {
      setUserRole('customer');
      setTrackingId(null);
    }
    setCurrentScreen(screen as Screen);
  };

  if (currentScreen === 'auth') {
    return <AuthScreen onLogin={handleLogin} />;
  }

  const renderScreen = () => {
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
