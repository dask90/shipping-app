import { useState, useEffect, useRef } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { useShipment } from '@/app/context/ShipmentContext';
import { Package, MapPin, Truck, CheckCircle, Navigation, MessageSquare, Send, X, User, PhoneOff, Mic, Video } from 'lucide-react';
import { toast } from 'sonner';

import { NotificationCenter } from './NotificationCenter';

interface AgentDashboardProps {
    onNavigate: (screen: string) => void;
}

export function AgentDashboard({ onNavigate: _onNavigate }: AgentDashboardProps) {
    const { shipments, currentUser, acceptRequest, confirmPickup, markInTransit, markDelivered, userProfile, signOut, sendMessage, fetchMessages, subscribeToMessages } = useShipment();

    // UI States
    const [activeChatShipment, setActiveChatShipment] = useState<any>(null);
    const [chatMessage, setChatMessage] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [deliveryShipmentId, setDeliveryShipmentId] = useState<string | null>(null);
    const [deliveryPhoto, setDeliveryPhoto] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isCalling, setIsCalling] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [callingTask, setCallingTask] = useState<any>(null);
    const chatScrollRef = useRef<HTMLDivElement>(null);

    // Filter for shipments assigned to the current agent
    const myTasks = shipments.filter(s =>
        (s.agentId === currentUser?.id) &&
        ['assigned', 'accepted', 'picked_up', 'in_transit'].includes(s.status)
    );

    const completedTasks = shipments.filter(s =>
        (s.agentId === currentUser?.id) &&
        s.status === 'delivered'
    );

    useEffect(() => {
        if (activeChatShipment) {
            const loadMessages = async () => {
                const { data } = await fetchMessages(activeChatShipment.id);
                if (data) setMessages(data);
            };
            loadMessages();

            const unsubscribe = subscribeToMessages(activeChatShipment.id, (newMessage) => {
                setMessages(prev => {
                    if (prev.find(m => m.id === newMessage.id)) return prev;
                    return [...prev, newMessage];
                });
            });

            return () => unsubscribe();
        }
    }, [activeChatShipment?.id]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isCalling) {
            timer = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isCalling]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAction = async (id: string, currentStatus: string) => {
        switch (currentStatus) {
            case 'assigned':
                acceptRequest(id);
                toast.success('Request Accepted');
                break;
            case 'accepted':
                confirmPickup(id);
                toast.success('Pickup Confirmed');
                break;
            case 'picked_up':
                markInTransit(id);
                toast.info('Shipment In Transit');
                break;
            case 'in_transit':
                setDeliveryShipmentId(id);
                setShowDeliveryModal(true);
                break;
        }
    };

    const handleDeliveryConfirm = async () => {
        if (deliveryShipmentId && deliveryPhoto) {
            await markDelivered(deliveryShipmentId, deliveryPhoto);
            setShowDeliveryModal(false);
            setDeliveryShipmentId(null);
            setDeliveryPhoto(null);
            toast.success('Shipment Delivered!');
        } else {
            toast.error('Please take/upload a delivery photo');
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        // In a real app, upload to Supabase Storage
        // For this demo, we'll use a FileReader to get a base64 string
        const reader = new FileReader();
        reader.onloadend = () => {
            setDeliveryPhoto(reader.result as string);
            setIsUploading(false);
            toast.success('Photo uploaded');
        };
        reader.readAsDataURL(file);
    };

    const handleSendMessage = async () => {
        if (activeChatShipment && chatMessage.trim() && activeChatShipment.customer_id) {
            await sendMessage(activeChatShipment.id, activeChatShipment.customer_id, chatMessage);
            setChatMessage('');
            // Optimistic update
            setMessages(prev => [...prev, {
                content: chatMessage,
                sender_id: currentUser?.id,
                created_at: new Date().toISOString()
            }]);
        }
    };

    const getActionButton = (status: string, id: string) => {
        switch (status) {
            case 'assigned':
                return (
                    <Button onClick={() => handleAction(id, status)} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept Request
                    </Button>
                );
            case 'accepted':
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
                    <Button onClick={() => handleAction(id, status)} className="w-full bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Finish Delivery
                    </Button>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
            <div className="bg-accent text-accent-foreground p-6 pb-20">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl mb-1">Agent Dashboard</h1>
                            <p className="opacity-90">Welcome, {userProfile?.name || 'Agent'}</p>
                            <div className="flex items-center gap-2">
                                <NotificationCenter />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-2 h-7 text-xs hover:bg-black/10 px-2"
                                    onClick={() => signOut()}
                                >
                                    Logout Portal
                                </Button>
                            </div>
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
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => { setCallingTask(task); setIsCalling(true); }} className="h-8 w-8 rounded-full">
                                            <Navigation className="h-4 w-4 text-blue-500 rotate-45" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => setActiveChatShipment(task)} className="h-8 w-8 rounded-full">
                                            <MessageSquare className="h-4 w-4 text-accent" />
                                        </Button>
                                        <Badge variant="outline" className="uppercase h-6">{task.status.replace('_', ' ')}</Badge>
                                    </div>
                                </div>

                                <div className="bg-muted rounded-lg p-3 mb-4 text-sm">
                                    <div className="flex items-start mb-2">
                                        <MapPin className="w-4 h-4 mr-2 mt-0.5 text-red-500 shrink-0" />
                                        <div>
                                            <div className="font-medium text-xs text-muted-foreground uppercase mb-1">Pickup</div>
                                            <div className="font-medium">{task.pickupAddress || `Office, ${task.fromCity}`}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <Navigation className="w-4 h-4 mr-2 mt-0.5 text-green-500 shrink-0" />
                                        <div>
                                            <div className="font-medium text-xs text-muted-foreground uppercase mb-1">Delivery</div>
                                            <div className="font-medium">{task.deliveryAddress || `Residential, ${task.toCity}`}</div>
                                            <div className="text-xs text-muted-foreground">{task.customerName} ({task.customerPhone})</div>
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

            {/* Agent Chat Drawer */}
            <div className={`fixed inset-x-0 bottom-0 z-[55] bg-background border-t shadow-2xl transition-transform duration-300 transform ${activeChatShipment ? 'translate-y-0' : 'translate-y-full'} h-4/5 flex flex-col`}>
                <div className="p-4 border-b flex items-center justify-between bg-accent text-accent-foreground">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center mr-2">
                            <User className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="font-semibold leading-tight">{activeChatShipment?.customerName}</div>
                            <div className="text-[10px] opacity-80">Customer for {activeChatShipment?.id}</div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setActiveChatShipment(null)} className="text-accent-foreground hover:bg-black/10">
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full opacity-40">
                            <MessageSquare className="w-12 h-12 mb-2" />
                            <p className="text-sm">No messages yet</p>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender_id === currentUser?.id
                                ? 'bg-accent text-accent-foreground rounded-br-none shadow-md shadow-accent/20'
                                : 'bg-white text-foreground rounded-bl-none shadow-sm'
                                }`}>
                                {msg.content}
                                <div className={`text-[9px] mt-1 ${msg.sender_id === currentUser?.id ? 'opacity-70' : 'text-muted-foreground'}`}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t bg-background">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Type a message..."
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="rounded-full bg-muted/50 border-0 focus-visible:ring-accent"
                        />
                        <Button size="icon" className="rounded-full shrink-0 bg-accent hover:bg-accent/90" onClick={handleSendMessage} disabled={!chatMessage.trim()}>
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Delivery Proof Modal */}
            {showDeliveryModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <Card className="w-full max-w-md p-6 animate-in zoom-in-95">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold flex items-center">
                                <Truck className="w-5 h-5 mr-2 text-accent" />
                                Proof of Delivery
                            </h2>
                            <Button variant="ghost" size="icon" onClick={() => setShowDeliveryModal(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="space-y-4 text-center">
                            <div className="text-sm text-muted-foreground mb-4">
                                Please take a photo of the item being handed over to the recipient.
                            </div>

                            <div className="w-full h-48 bg-muted rounded-xl border-2 border-dashed border-muted-foreground/20 flex flex-items-center justify-center overflow-hidden relative group">
                                {deliveryPhoto ? (
                                    <img src={deliveryPhoto} alt="Delivery proof" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <Truck className="w-12 h-12 text-muted-foreground/30 mb-2" />
                                        <p className="text-xs text-muted-foreground">No photo captured</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handlePhotoUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>

                            <Button
                                className="w-full bg-accent hover:bg-accent/90"
                                disabled={!deliveryPhoto || isUploading}
                                onClick={handleDeliveryConfirm}
                            >
                                {isUploading ? 'Uploading...' : 'Confirm Delivery'}
                            </Button>

                            <Button variant="ghost" onClick={() => setShowDeliveryModal(false)} className="w-full">
                                Cancel
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Call Simulation Overlay */}
            {isCalling && (
                <div className="fixed inset-0 z-[60] bg-accent/95 text-accent-foreground flex flex-col items-center justify-between p-12">
                    <div className="text-center mt-20">
                        <div className="w-24 h-24 bg-black/10 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl font-bold border-4 border-white animate-pulse">
                            {callingTask?.customerName?.charAt(0)}
                        </div>
                        <h2 className="text-3xl font-bold mb-2">{callingTask?.customerName}</h2>
                        <p className="opacity-80">Customer • {callingTask?.customerPhone}</p>
                        <div className="mt-4 text-xl font-mono">{formatDuration(callDuration)}</div>
                    </div>

                    <div className="flex gap-8 mb-20 text-white">
                        <Button size="icon" variant="ghost" className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20">
                            <Mic className="w-6 h-6" />
                        </Button>
                        <Button size="icon" className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 shadow-xl shadow-red-900/50" onClick={() => { setIsCalling(false); setCallDuration(0); setCallingTask(null); }}>
                            <PhoneOff className="w-8 h-8" />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20">
                            <Video className="w-6 h-6" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
