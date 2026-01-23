import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  Package,
  TruckIcon,
  DollarSign,
  Search,
  Filter,
  Download,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';

interface AdminDashboardProps {
}

import { useShipment } from '@/app/context/ShipmentContext';

export function AdminDashboard({ }: AdminDashboardProps) {
  const { shipments, userProfile, signOut } = useShipment();
  // Using context data instead of local static data
  const shipmentData = shipments;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Delivered
          </Badge>
        );
      case 'in-transit':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <TruckIcon className="w-3 h-3 mr-1" />
            In Transit
          </Badge>
        );
      case 'pending':
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

  // Removed unused analytics

  // Filter Logic
  const filteredShipments = shipmentData.filter((shipment) => {
    const matchesSearch =
      shipment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.toCity.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    const matchesCity = cityFilter === 'all' || shipment.fromCity === cityFilter || shipment.toCity === cityFilter;

    return matchesSearch && matchesStatus && matchesCity;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">{userProfile?.name || 'Admin'} Dashboard</h1>
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <NotificationCenter />
              <Button variant="ghost" className="hover:bg-muted" onClick={() => signOut()}>
                Logout
              </Button>
            </div>
            <Button variant="outline" className="flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 flex items-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Shipments</div>
              <div className="text-2xl font-bold">{shipmentData.length}</div>
            </div>
          </Card>
          <Card className="p-4 flex items-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Pending</div>
              <div className="text-2xl font-bold">
                {shipmentData.filter((s) => s.status === 'pending_approval').length}
              </div>
            </div>
          </Card>
          <Card className="p-4 flex items-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Delivered</div>
              <div className="text-2xl font-bold">
                {shipmentData.filter((s) => s.status === 'delivered').length}
              </div>
            </div>
          </Card>
          <Card className="p-4 flex items-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Revenue</div>
              <div className="text-2xl font-bold">₵12,450</div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, Customer, or City..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-[200px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="picked_up">Picked Up</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-[200px]">
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  <SelectItem value="Accra">Accra</SelectItem>
                  <SelectItem value="Kumasi">Kumasi</SelectItem>
                  <SelectItem value="Tamale">Tamale</SelectItem>
                  <SelectItem value="Takoradi">Takoradi</SelectItem>
                  <SelectItem value="Tema">Tema</SelectItem>
                  <SelectItem value="Cape Coast">Cape Coast</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Shipments Table */}
        <Card className="shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShipments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No shipments found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredShipments.map((shipment) => (
                  <TableRow key={shipment.id} className="hover:bg-muted/50 cursor-pointer">
                    <TableCell>
                      <div>{shipment.id}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{shipment.customerName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium">From: {shipment.fromCity}</span>
                        <span className="text-xs text-muted-foreground">To: {shipment.toCity}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                    <TableCell>
                      {shipment.agentName ? (
                        <div className="flex items-center">
                          <TruckIcon className="w-3 h-3 mr-1 text-muted-foreground" />
                          <span className="text-sm">{shipment.agentName}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {shipment.price}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div >
  );
}
