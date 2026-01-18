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
  const { userRole, setUserRole } = useShipment();

  const handleLogin = (role: 'customer' | 'staff' | 'agent' | 'admin' = 'customer') => {
    setUserRole(role);
    switch (role) {
      case 'staff': setCurrentScreen('staff'); break;
      case 'agent': setCurrentScreen('agent'); break;
      case 'admin': setCurrentScreen('admin'); break;
      default: setCurrentScreen('dashboard');
    }
  };

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as Screen);
  };

  // Demo Role Switcher
  const RoleSwitcher = () => (
    <div className="fixed bottom-4 right-4 z-50 flex gap-2 bg-black/80 p-2 rounded-lg backdrop-blur text-white text-xs">
      <button onClick={() => handleLogin('customer')} className={`px-2 py-1 rounded ${userRole === 'customer' ? 'bg-primary' : 'hover:bg-white/20'}`}>Customer</button>
      <button onClick={() => handleLogin('staff')} className={`px-2 py-1 rounded ${userRole === 'staff' ? 'bg-primary' : 'hover:bg-white/20'}`}>Staff</button>
      <button onClick={() => handleLogin('agent')} className={`px-2 py-1 rounded ${userRole === 'agent' ? 'bg-primary' : 'hover:bg-white/20'}`}>Agent</button>
      <button onClick={() => handleLogin('admin')} className={`px-2 py-1 rounded ${userRole === 'admin' ? 'bg-primary' : 'hover:bg-white/20'}`}>Admin</button>
    </div>
  );

  if (currentScreen === 'auth') {
    return <AuthScreen onLogin={() => handleLogin('customer')} />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'staff': return <StaffDashboard />;
      case 'agent': return <AgentDashboard />;
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
      {currentScreen !== 'auth' && <RoleSwitcher />}
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
