import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { useShipment } from '@/app/context/ShipmentContext';
import { CheckCircle, XCircle, User, Package, MapPin, Truck, Clock } from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/app/components/ui/input';
import { Search, Filter } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';

interface StaffDashboardProps {
    onNavigate: (screen: string) => void;
}

export function StaffDashboard({ onNavigate }: StaffDashboardProps) {
    const { shipments, approveShipment, assignAgent } = useShipment();
    const [selectedAgent, setSelectedAgent] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [cityFilter, setCityFilter] = useState('all');
    const [shipmentToReject, setShipmentToReject] = useState<string | null>(null);

    // Filter Logic
    const filteredShipments = shipments.filter((shipment) => {
        const matchesSearch =
            shipment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            shipment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            shipment.toCity.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
        const matchesCity = cityFilter === 'all' || shipment.fromCity === cityFilter || shipment.toCity === cityFilter;

        return matchesSearch && matchesStatus && matchesCity;
    });

    const pendingShipments = shipments.filter(s => s.status === 'pending_approval' && s.id.toLowerCase().includes(searchQuery.toLowerCase()));
    const approvedShipments = shipments.filter(s => s.status === 'approved' && s.id.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleApprove = (id: string) => {
        approveShipment(id);
        toast.success(`Shipment ${id} approved`);
    };

    const handleRejectClick = (id: string) => {
        setShipmentToReject(id);
    };

    const handleRejectConfirm = () => {
        if (shipmentToReject) {
            // In a real app, this would update the status to 'rejected'
            toast.error(`Shipment ${shipmentToReject} rejected`);
            setShipmentToReject(null);
        }
    };

    const handleAssign = (id: string) => {
        if (!selectedAgent) return;
        // Mock agent ID mapping
        const agentId = selectedAgent === 'Kofi Boateng' ? 'AGT001' : 'AGT002';
        assignAgent(id, selectedAgent, agentId);
        toast.success(`Agent assigned to ${id}`);
        setSelectedAgent('');
    };

    return (
        <div className="min-h-screen bg-background pb-24">
            <div className="bg-primary text-white p-6 pb-20">
                <div className="max-w-4xl mx-auto flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl mb-1">Staff Dashboard</h1>
                        <p className="text-blue-100">Manage approvals and assignments</p>
                    </div>
                    <Button
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={() => onNavigate('auth')}
                    >
                        Logout
                    </Button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-12">
                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="p-4 flex items-center shadow-md">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Total Incoming</div>
                            <div className="text-2xl font-bold">{shipments.length}</div>
                        </div>
                    </Card>
                    <Card className="p-4 flex items-center shadow-md">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mr-4">
                            <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Pending Approval</div>
                            <div className="text-2xl font-bold">{pendingShipments.length}</div>
                        </div>
                    </Card>
                    <Card className="p-4 flex items-center shadow-md">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                            <Truck className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Active Deliveries</div>
                            <div className="text-2xl font-bold">{shipments.filter(s => ['in_transit', 'assigned', 'picked_up'].includes(s.status)).length}</div>
                        </div>
                    </Card>
                    <Card className="p-4 flex items-center shadow-md">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Completed</div>
                            <div className="text-2xl font-bold">{shipments.filter(s => s.status === 'delivered').length}</div>
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

                <Card className="p-6 shadow-lg min-h-[500px]">
                    <Tabs defaultValue="operations">
                        <TabsList className="grid w-full grid-cols-3 mb-6">
                            <TabsTrigger value="operations">
                                Operations Log
                            </TabsTrigger>
                            <TabsTrigger value="approvals" className="relative">
                                Pending Approvals
                                {pendingShipments.length > 0 && (
                                    <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                                        {pendingShipments.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="assignments">
                                Agent Assignments
                                {approvedShipments.length > 0 && (
                                    <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                                        {approvedShipments.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="operations">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tracking ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Route</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Assigned Agent</TableHead>
                                        <TableHead>Date</TableHead>
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
                                            <TableRow key={shipment.id}>
                                                <TableCell className="font-medium">{shipment.id}</TableCell>
                                                <TableCell>{shipment.customerName}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col text-xs">
                                                        <span>From: {shipment.fromCity}</span>
                                                        <span>To: {shipment.toCity}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            shipment.status === 'delivered' ? 'default' :
                                                                shipment.status === 'pending_approval' ? 'destructive' :
                                                                    'secondary'
                                                        }
                                                        className="uppercase text-[10px]"
                                                    >
                                                        {shipment.status.replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {shipment.agentName ? (
                                                        <div className="flex items-center text-sm">
                                                            <User className="w-3 h-3 mr-1 text-muted-foreground" />
                                                            {shipment.agentName}
                                                            {shipment.agentPhone && (
                                                                <span className="text-xs text-muted-foreground ml-1 block">
                                                                    ({shipment.agentPhone})
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {shipment.date}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TabsContent>

                        <TabsContent value="approvals" className="space-y-4">
                            {pendingShipments.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">
                                    No pending approvals.
                                </div>
                            ) : (
                                pendingShipments.map(shipment => (
                                    <Card key={shipment.id} className="p-4 border border-input">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="font-semibold text-lg">{shipment.id}</div>
                                                <div className="text-sm text-muted-foreground">{shipment.date} • {shipment.customerName}</div>
                                            </div>
                                            <Badge variant="outline">Pending</Badge>
                                        </div>

                                        <div className="flex items-center text-sm mb-4 bg-muted/50 p-3 rounded-md">
                                            <MapPin className="w-4 h-4 mr-2 text-primary" />
                                            <span>{shipment.fromCity}</span>
                                            <span className="mx-2">→</span>
                                            <span>{shipment.toCity}</span>
                                        </div>

                                        <div className="flex justify-between items-center text-sm mb-4">
                                            <div className="flex items-center text-muted-foreground">
                                                <Package className="w-4 h-4 mr-1" />
                                                {shipment.description}
                                            </div>
                                            <div className="font-bold text-primary">{shipment.price}</div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button onClick={() => handleApprove(shipment.id)} className="flex-1 bg-green-600 hover:bg-green-700">
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Approve
                                            </Button>
                                            <Button variant="destructive" className="flex-1" onClick={() => handleRejectClick(shipment.id)}>
                                                <XCircle className="w-4 h-4 mr-2" />
                                                Reject
                                            </Button>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="assignments" className="space-y-4">
                            {approvedShipments.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">
                                    No shipments waiting for assignment.
                                </div>
                            ) : (
                                approvedShipments.map(shipment => (
                                    <Card key={shipment.id} className="p-4 border border-input">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="font-semibold text-lg">{shipment.id}</div>
                                                <div className="text-sm text-muted-foreground">{shipment.fromCity} → {shipment.toCity}</div>
                                            </div>
                                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
                                        </div>

                                        <div className="flex gap-2 items-end">
                                            <div className="flex-1">
                                                <Select onValueChange={setSelectedAgent}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Delivery Agent" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Kofi Boateng">Kofi Boateng (Available)</SelectItem>
                                                        <SelectItem value="Yaw Addo">Yaw Addo (Busy)</SelectItem>
                                                        <SelectItem value="Kwabena Yeboah">Kwabena Yeboah (Available)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button onClick={() => handleAssign(shipment.id)} disabled={!selectedAgent}>
                                                <User className="w-4 h-4 mr-2" />
                                                Assign
                                            </Button>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </TabsContent>
                    </Tabs>
                </Card>
            </div>

            <AlertDialog open={!!shipmentToReject} onOpenChange={(open) => !open && setShipmentToReject(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reject Shipment?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to reject shipment {shipmentToReject}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRejectConfirm} className="bg-destructive hover:bg-destructive/90">
                            Reject
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
