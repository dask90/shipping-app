import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { useShipment } from '@/app/context/ShipmentContext';
import { Package, MapPin, Truck, CheckCircle, Navigation } from 'lucide-react';
import { toast } from 'sonner';

interface AgentDashboardProps {
    onNavigate: (screen: string) => void;
}

export function AgentDashboard({ onNavigate }: AgentDashboardProps) {
    const { shipments, confirmPickup, markInTransit, markDelivered } = useShipment();

    // Filter for shipments assigned to "Kofi Boateng" (Mock logged-in agent)
    // In a real app, filtering would be by the logged-in agent's ID
    const myTasks = shipments.filter(s =>
        (s.agentName === 'Kofi Boateng') &&
        ['assigned', 'picked_up', 'in_transit'].includes(s.status)
    );

    const completedTasks = shipments.filter(s =>
        (s.agentName === 'Kofi Boateng') &&
        s.status === 'delivered'
    );

    const handleUpdateLocation = () => {
        const locations = ['Nsawam Checkpoint', 'Bunso Junction', 'Nkawkaw Rest Stop', 'Ejisu Toll Booth', 'Winneba Junction'];
        const randomLoc = locations[Math.floor(Math.random() * locations.length)];
        toast.info(`Location updated: ${randomLoc}`);
    };

    const handleAction = (id: string, currentStatus: string) => {
        switch (currentStatus) {
            case 'assigned':
                confirmPickup(id);
                toast.success('Pickup Confirmed');
                break;
            case 'picked_up':
                markInTransit(id);
                toast.info('Shipment In Transit');
                break;
            case 'in_transit':
                markDelivered(id);
                toast.success('Shipment Delivered!');
                break;
        }
    };

    const getActionButton = (status: string, id: string) => {
        switch (status) {
            case 'assigned':
                return (
                    <Button onClick={() => handleAction(id, status)} className="w-full">
                        <Package className="w-4 h-4 mr-2" />
                        Confirm Pickup
                    </Button>
                );
            case 'picked_up':
                return (
                    <Button onClick={() => handleAction(id, status)} className="w-full bg-blue-600 hover:bg-blue-700">
                        <Truck className="w-4 h-4 mr-2" />
                        Start Journey
                    </Button>
                );
            case 'in_transit':
                return (
                    <div className="flex gap-2">
                        <Button onClick={() => handleUpdateLocation()} variant="outline" className="flex-1">
                            <MapPin className="w-4 h-4 mr-2" />
                            Update Loc
                        </Button>
                        <Button onClick={() => handleAction(id, status)} className="flex-1 bg-green-600 hover:bg-green-700">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Delivered
                        </Button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-background pb-24">
            <div className="bg-accent text-accent-foreground p-6 pb-20">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl mb-1">Agent Dashboard</h1>
                            <p className="opacity-90">Welcome, Kofi Boateng</p>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2 h-7 text-xs hover:bg-black/10 px-2"
                                onClick={() => onNavigate('auth')}
                            >
                                Logout Portal
                            </Button>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold">{myTasks.length}</div>
                            <div className="text-xs uppercase tracking-wider opacity-80">Active Tasks</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-12 space-y-6">

                {/* Active Tasks List */}
                <div>
                    <h2 className="font-semibold mb-3 px-1">My Route</h2>
                    {myTasks.length === 0 ? (
                        <Card className="p-8 text-center text-muted-foreground">
                            No active tasks assigned currently.
                        </Card>
                    ) : (
                        myTasks.map(task => (
                            <Card key={task.id} className="p-4 mb-3 shadow-md border-l-4 border-l-accent overflow-hidden">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="font-bold text-lg">{task.id}</div>
                                        <div className="text-sm text-muted-foreground">{task.fromCity} → {task.toCity}</div>
                                    </div>
                                    <Badge variant="outline" className="uppercase">{task.status.replace('_', ' ')}</Badge>
                                </div>

                                <div className="bg-muted rounded-lg p-3 mb-4 text-sm">
                                    <div className="flex items-start mb-2">
                                        <MapPin className="w-4 h-4 mr-2 mt-0.5 text-red-500 shrink-0" />
                                        <div>
                                            <div className="font-medium">Pickup</div>
                                            <div className="text-muted-foreground">Office, {task.fromCity}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <Navigation className="w-4 h-4 mr-2 mt-0.5 text-green-500 shrink-0" />
                                        <div>
                                            <div className="font-medium">Delivery</div>
                                            <div className="text-muted-foreground">Residential, {task.toCity}</div>
                                        </div>
                                    </div>
                                </div>

                                {getActionButton(task.status, task.id)}
                            </Card>
                        ))
                    )}
                </div>

                {/* Recently Completed */}
                <div>
                    <h2 className="font-semibold mb-3 px-1">Completed Today</h2>
                    {completedTasks.map(task => (
                        <Card key={task.id} className="p-3 mb-2 opacity-70">
                            <div className="flex justify-between items-center">
                                <div className="text-sm font-medium">{task.id}</div>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Delivered</Badge>
                            </div>
                        </Card>
                    ))}
                </div>

            </div>
        </div>
    );
}
