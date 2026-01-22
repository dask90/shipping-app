import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { ArrowLeft, Package, MapPin, Phone, User, CheckCircle, Clock, TruckIcon, Search } from 'lucide-react';

import { useShipment, ShipmentStatus } from '@/app/context/ShipmentContext';

interface ShipmentTrackingProps {
  onNavigate: (screen: string) => void;
}

export function ShipmentTracking({ onNavigate }: ShipmentTrackingProps) {
  const { shipments, trackingId, setTrackingId } = useShipment();
  const [searchId, setSearchId] = useState('');

  // Find the specific shipment
  const shipment = shipments.find(s => s.id === (trackingId || searchId.toUpperCase()));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId) {
      setTrackingId(searchId.toUpperCase());
    }
  };

  const getStatusIcon = (status: ShipmentStatus) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_transit': return <TruckIcon className="w-5 h-5 text-blue-600" />;
      default: return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const showAgentDetails = shipment && ['assigned', 'picked_up', 'in_transit', 'delivered'].includes(shipment.status);

  if (!shipment && !trackingId) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-primary text-white p-6 pb-20">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center mb-4 text-blue-100 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <h1 className="text-2xl mb-2">Track Shipment</h1>
            <p className="text-blue-100">Enter your tracking ID below</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-10">
          <Card className="p-6 shadow-xl">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="e.g. SHP001"
                  className="pl-10"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                />
              </div>
              <Button type="submit">Track</Button>
            </form>
          </Card>

          <div className="mt-12 text-center text-muted-foreground">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-10" />
            <p>No active shipment selected. Enter an ID to track progress.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <Package className="w-16 h-16 text-muted mb-4" />
        <h2 className="text-xl mb-2">Shipment Not Found</h2>
        <p className="text-muted-foreground mb-6">We couldn't find a shipment with ID "{trackingId}"</p>
        <Button onClick={() => { setTrackingId(null); setSearchId(''); }}>Try Another ID</Button>
      </div>
    );
  }

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
            Back to Dashboard
          </button>
          <h1 className="text-2xl mb-2">Track Shipment</h1>
          <p className="text-blue-100">Real-time tracking information</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-12">
        {/* Map View */}
        <Card className="shadow-lg mb-6 overflow-hidden border-0">
          <div className="w-full h-64 bg-muted relative">
            <section className="absolute inset-0 w-full h-full">
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(shipment?.toCity || 'Accra, Ghana')}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
              ></iframe>
            </section>

            <div className="absolute bottom-4 right-4 bg-background/90 p-2 rounded-lg backdrop-blur-sm text-xs shadow-sm">
              <div className="font-semibold">Live Location</div>
              <div className="text-muted-foreground">Updated 2m ago</div>
            </div>
          </div>

          <div className="p-4 bg-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Tracking ID</div>
                <div className="text-xl font-bold">{shipment?.id}</div>
              </div>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                <TruckIcon className="w-3 h-3 mr-1" />
                {shipment?.status?.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Route Information */}
        <Card className="p-6 shadow-md mb-4">
          <h3 className="mb-4">Route Information</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-start flex-1">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">From</div>
                <div>{shipment?.fromCity}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Sender: {shipment?.customerName}
                </div>
              </div>
            </div>

            <div className="px-4">
              <div className="w-16 h-0.5 bg-border" />
            </div>

            <div className="flex items-start flex-1">
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center mr-3">
                <MapPin className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">To</div>
                <div>{shipment?.toCity}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Recipient: Abena Osei {/* Mock recipient for now */}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Proof of Delivery (Shown if Delivered) */}
        {/* For demo, we show it if status is not pending */}
        <Card className="p-6 shadow-md mb-4">
          <h3 className="mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            Proof of Delivery
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-border rounded-lg p-2 text-center">
              <div className="h-24 bg-muted mb-2 flex items-center justify-center text-muted-foreground text-xs italic">
                [Signature Image]
              </div>
              <p className="text-xs text-muted-foreground">Signed by Recipient</p>
            </div>
            <div className="border border-border rounded-lg p-2 text-center">
              <div className="h-24 bg-muted mb-2 flex items-center justify-center text-muted-foreground text-xs">
                <Package className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-xs text-muted-foreground">Package Photo</p>
            </div>
          </div>
        </Card>

        {/* Timeline */}
        <Card className="p-6 shadow-md mb-4">
          <h3 className="mb-6">Shipment Timeline</h3>
          <div className="space-y-6">
            {[...shipment.history].reverse().map((entry, index) => (
              <div key={index} className="flex items-start">
                <div className="relative">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-muted/50">
                    {getStatusIcon(entry.status)}
                  </div>

                  {/* Connecting Line */}
                  {index < shipment.history.length - 1 && (
                    <div className="absolute left-5 top-10 w-0.5 h-12 bg-border" />
                  )}
                </div>

                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div className="font-semibold">{entry.description}</div>
                    <div className="text-[10px] text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded">
                      {entry.date}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    {entry.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Delivery Agent Info */}
        {showAgentDetails && (
          <Card className="p-6 shadow-md mb-4">
            <h3 className="mb-4">Delivery Agent</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div>{shipment?.agentName}</div>
                  <div className="text-sm text-muted-foreground">Agent ID: {shipment?.agentId}</div>
                  <div className="text-xs text-muted-foreground">{shipment?.agentPhone}</div>
                </div>
              </div>
              <Button size="sm" className="bg-accent hover:bg-accent/90">
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1">
            Share Tracking
          </Button>
          <Button variant="outline" className="flex-1">
            Report Issue
          </Button>
        </div>
      </div>
    </div>
  );
}
