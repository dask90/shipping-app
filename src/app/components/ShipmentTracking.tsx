import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { ArrowLeft, Package, MapPin, Phone, User, CheckCircle, Clock, TruckIcon } from 'lucide-react';

import { useShipment } from '@/app/context/ShipmentContext';

interface ShipmentTrackingProps {
  onNavigate: (screen: string) => void;
}

export function ShipmentTracking({ onNavigate }: ShipmentTrackingProps) {
  const { shipments } = useShipment();
  // Simulate tracking the first active shipment or specific ID
  const shipment = shipments.find(s => s.id === 'SHP001234') || shipments[0];

  const showAgentDetails = ['assigned', 'picked_up', 'in_transit', 'delivered'].includes(shipment?.status || '');

  // Mock steps based on status for the timeline
  const getTrackingSteps = (status: string) => {
    const steps = [
      { status: 'completed', title: 'Order Placed', description: 'Shipment created', timestamp: shipment?.date },
      { status: status === 'pending_approval' ? 'active' : 'completed', title: 'Pending Approval', description: 'Waiting for staff approval' },
      {
        status: status === 'approved' ? 'active' : ['assigned', 'picked_up', 'in_transit', 'delivered'].includes(status) ? 'completed' : 'pending',
        title: 'Approved',
        description: 'Approved by staff'
      },
      {
        status: status === 'assigned' ? 'active' : ['picked_up', 'in_transit', 'delivered'].includes(status) ? 'completed' : 'pending',
        title: 'Agent Assigned',
        description: 'Delivery agent assigned'
      },
      {
        status: status === 'in_transit' ? 'active' : status === 'delivered' ? 'completed' : 'pending',
        title: 'In Transit',
        description: 'On the way to destination'
      },
      {
        status: status === 'delivered' ? 'completed' : 'pending',
        title: 'Delivered',
        description: 'Package delivered'
      }
    ];
    return steps;
  };

  const trackingSteps = getTrackingSteps(shipment?.status || 'pending_approval');

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
            <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Kumasi,Ghana&zoom=10&size=600x400&path=color:0x0000ff|weight:5|Accra,Ghana|Kumasi,Ghana&key=YOUR_API_KEY_HERE')] bg-cover bg-center" />

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
            {trackingSteps.map((step, index) => (
              <div key={index} className="flex items-start">
                <div className="relative">
                  {/* Icon */}
                  <div
                    className={`w - 10 h - 10 rounded - full flex items - center justify - center ${step.status === 'completed'
                      ? 'bg-green-100'
                      : step.status === 'active'
                        ? 'bg-blue-100'
                        : 'bg-muted'
                      } `}
                  >
                    {step.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : step.status === 'active' ? (
                      <TruckIcon className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Connecting Line */}
                  {index < trackingSteps.length - 1 && (
                    <div
                      className={`absolute left - 5 top - 10 w - 0.5 h - 12 ${step.status === 'completed' ? 'bg-green-300' : 'bg-border'
                        } `}
                    />
                  )}
                </div>

                <div className="ml-4 flex-1">
                  <div className="mb-1">{step.title}</div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {step.description}
                  </div>
                  {step.timestamp && (
                    <div className="text-xs text-muted-foreground">
                      {step.timestamp}
                    </div>
                  )}
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
