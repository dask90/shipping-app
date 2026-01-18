import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  Package,
  TruckIcon,
  CheckCircle,
  Clock,
  MapPin,
  Plus,
} from "lucide-react";

interface CustomerDashboardProps {
  onNavigate: (screen: string) => void;
}

import { useShipment } from '@/app/context/ShipmentContext';

export function CustomerDashboard({
  onNavigate,
}: CustomerDashboardProps) {
  const { shipments } = useShipment();

  // Filter only for the "logged in" customer (Kwame Mensah - simulated)
  const myShipments = shipments; // showing all for demo, typically filtered by user ID

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Delivered
          </Badge>
        );
      case "in-transit":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <TruckIcon className="w-3 h-3 mr-1" />
            In Transit
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return null;
    }
  };

  const stats = {
    active: myShipments.filter(
      (s) =>
        s.status === "in_transit" || s.status === "pending_approval" || s.status === "approved" || s.status === "assigned",
    ).length,
    delivered: myShipments.filter(
      (s) => s.status === "delivered",
    ).length,
    inTransit: myShipments.filter(
      (s) => s.status === "in_transit",
    ).length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-white p-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl mb-1">Welcome back, John</h1>
          <p className="text-blue-100">Manage your shipments</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-16">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-4 shadow-md">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl mb-1">
                {stats.active}
              </div>
              <div className="text-xs text-muted-foreground">
                Active
              </div>
            </div>
          </Card>

          <Card className="p-4 shadow-md">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl mb-1">
                {stats.delivered}
              </div>
              <div className="text-xs text-muted-foreground">
                Delivered
              </div>
            </div>
          </Card>

          <Card className="p-4 shadow-md">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mb-2">
                <TruckIcon className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-2xl mb-1">
                {stats.inTransit}
              </div>
              <div className="text-xs text-muted-foreground">
                In Transit
              </div>
            </div>
          </Card>
        </div>

        {/* Create Shipment Button */}
        <Button
          onClick={() => onNavigate("create-shipment")}
          className="w-full mb-6 bg-accent hover:bg-accent/90 text-accent-foreground h-14 shadow-md"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Shipment
        </Button>

        {/* Recent Shipments */}
        <div className="mb-6">
          <h2 className="mb-4">Recent Shipments</h2>
          <div className="space-y-3">
            {myShipments.map((shipment) => (
              <Card
                key={shipment.id}
                className="p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onNavigate("tracking")}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Tracking ID
                    </div>
                    <div>{shipment.id}</div>
                  </div>
                  {getStatusBadge(shipment.status)}
                </div>

                <div className="flex items-center text-sm mb-2">
                  <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>{shipment.fromCity}</span>
                  <span className="mx-2 text-muted-foreground">
                    →
                  </span>
                  <span>{shipment.toCity}</span>
                </div>

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Created: {shipment.date}</span>
                  <span>
                    Price: {shipment.price}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="grid grid-cols-4 gap-2">
            <button className="flex flex-col items-center py-2 text-primary">
              <Package className="w-5 h-5 mb-1" />
              <span className="text-xs">Home</span>
            </button>
            <button
              className="flex flex-col items-center py-2 text-muted-foreground"
              onClick={() => onNavigate("notifications")}
            >
              <Clock className="w-5 h-5 mb-1" />
              <span className="text-xs">Activity</span>
            </button>
            <button
              className="flex flex-col items-center py-2 text-muted-foreground"
              onClick={() => onNavigate("tracking")}
            >
              <TruckIcon className="w-5 h-5 mb-1" />
              <span className="text-xs">Track</span>
            </button>
            <button
              className="flex flex-col items-center py-2 text-muted-foreground"
              onClick={() => onNavigate("profile")}
            >
              <div className="w-5 h-5 mb-1 bg-muted rounded-full" />
              <span className="text-xs">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}