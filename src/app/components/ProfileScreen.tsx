import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Settings,
  Bell,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronRight
} from 'lucide-react';

interface ProfileScreenProps {
  onNavigate: (screen: string) => void;
}

const recentShipments = [
  { id: 'SHP001235', date: '2026-01-15', amount: '₵687', status: 'Delivered' },
  { id: 'SHP001234', date: '2026-01-18', amount: '₵767', status: 'In Transit' },
  { id: 'SHP001233', date: '2026-01-12', amount: '₵550', status: 'Delivered' },
];

export function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-white p-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center mb-4 text-blue-100 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-2xl mb-1">Profile & Settings</h1>
          <p className="text-blue-100">Manage your account</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-12">
        {/* Profile Card */}
        <Card className="p-6 shadow-lg mb-6">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mr-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="mb-1">Kwame Mensah</h2>
              <p className="text-sm text-muted-foreground">Customer ID: CUST12345</p>
            </div>
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  value="kwame.mensah@example.com"
                  className="pl-10"
                  readOnly
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value="+233 20 123 4567"
                  className="pl-10"
                  readOnly
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Saved Address */}
        <Card className="p-6 shadow-md mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-primary" />
              Saved Pickup Address
            </h3>
            <Button variant="ghost" size="sm">
              Edit
            </Button>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm">
              45 Independence Avenue,<br />
              Osu, Accra, Ghana
            </p>
          </div>
        </Card>

        {/* Shipping History */}
        <Card className="p-6 shadow-md mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center">
              <Package className="w-5 h-5 mr-2 text-primary" />
              Recent History
            </h3>
            <button className="text-sm text-primary hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentShipments.map((shipment) => (
              <div
                key={shipment.id}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div>
                  <div className="text-sm mb-1">{shipment.id}</div>
                  <div className="text-xs text-muted-foreground">
                    {shipment.date}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm mb-1">{shipment.amount}</div>
                  <div className="text-xs text-muted-foreground">
                    {shipment.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Settings Options */}
        <Card className="p-6 shadow-md mb-6">
          <h3 className="mb-4">Settings</h3>
          <div className="space-y-1">
            <button className="w-full flex items-center justify-between py-3 hover:bg-muted/50 rounded-lg px-3 -mx-3">
              <div className="flex items-center">
                <Bell className="w-5 h-5 mr-3 text-muted-foreground" />
                <span>Notifications</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button className="w-full flex items-center justify-between py-3 hover:bg-muted/50 rounded-lg px-3 -mx-3">
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 mr-3 text-muted-foreground" />
                <span>Payment Methods</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button className="w-full flex items-center justify-between py-3 hover:bg-muted/50 rounded-lg px-3 -mx-3">
              <div className="flex items-center">
                <Settings className="w-5 h-5 mr-3 text-muted-foreground" />
                <span>Preferences</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button className="w-full flex items-center justify-between py-3 hover:bg-muted/50 rounded-lg px-3 -mx-3">
              <div className="flex items-center">
                <HelpCircle className="w-5 h-5 mr-3 text-muted-foreground" />
                <span>Help & Support</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </Card>

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
