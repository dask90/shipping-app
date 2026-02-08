import { useState } from 'react';
import { AuthScreen } from '@/app/components/AuthScreen';
import { CustomerDashboard } from '@/app/components/CustomerDashboard';
import { CreateShipment } from '@/app/components/CreateShipment';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { ShipmentTracking } from '@/app/components/ShipmentTracking';
import { NotificationsScreen } from '@/app/components/NotificationsScreen';
import { ProfileScreen } from '@/app/components/ProfileScreen';
import { AdminDashboard } from '@/app/components/AdminDashboard';
import { StaffDashboard } from '@/app/components/StaffDashboard';
import { AgentDashboard } from '@/app/components/AgentDashboard';
import { ShipmentProvider, useShipment } from '@/app/context/ShipmentContext';
import { CustomerNavbar } from '@/app/components/CustomerNavbar';
import { Clock, LogOut } from 'lucide-react';



function PendingApproval() {
  const { signOut, userProfile } = useShipment();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="max-w-md w-full p-8 text-center space-y-6 border-none shadow-2xl bg-white/80 backdrop-blur-sm">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-10 h-10 text-amber-600 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Account Pending Approval</h2>
          <p className="text-muted-foreground">
            Hi {userProfile?.name}, your {userProfile?.role} account has been created but requires administrator approval before you can access the dashboard.
          </p>
        </div>
        <div className="p-4 bg-muted/50 rounded-lg text-sm text-left border border-border">
          <p className="font-semibold mb-1">What happens next?</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Administrator will review your request</li>
            <li>Once approved, you will have full access</li>
            <li>Usually takes less than 24 hours</li>
          </ul>
        </div>
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4" />
          Sign Out & Return Home
        </Button>
      </Card>
    </div>
  );
}

function AppContent() {
  const { currentUser, userRole, setTrackingId, isLoadingProfile, userProfile } = useShipment();
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

  // Check for approval (only for staff/admin/agent - customers are auto-approved)
  if (userProfile && !userProfile.is_approved) {
    return <PendingApproval />;
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
