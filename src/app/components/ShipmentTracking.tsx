import { useState, useEffect, useRef } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import {
  ArrowLeft, Package, MapPin, Phone, User, CheckCircle,
  Clock, TruckIcon, Search, Share2, AlertTriangle,
  MessageSquare, X, Send, PhoneOff, Mic, Video
} from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

import { useShipment, ShipmentStatus } from '@/app/context/ShipmentContext';

const LiveTrackingMap = dynamic(() => import('./LiveTrackingMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center text-xs">Loading Live Map...</div>
});

interface ShipmentTrackingProps {
  onNavigate: (screen: string) => void;
}

export function ShipmentTracking({ onNavigate }: ShipmentTrackingProps) {
  const { shipments, trackingId, setTrackingId, reportIssue, sendMessage, fetchMessages, currentUser, subscribeToMessages } = useShipment();
  const [searchId, setSearchId] = useState('');

  // UI States
  const [showReportModal, setShowReportModal] = useState(false);
  const [issueType, setIssueType] = useState('Damaged Package');
  const [issueDescription, setIssueDescription] = useState('');

  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);

  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Find the specific shipment
  const shipment = shipments.find(s => s.id === (trackingId || searchId.toUpperCase()));

  useEffect(() => {
    if (shipment) {
      const loadMessages = async () => {
        const { data } = await fetchMessages(shipment.id);
        if (data) setMessages(data);
      };
      loadMessages();

      const unsubscribe = subscribeToMessages(shipment.id, (newMessage) => {
        setMessages(prev => {
          if (prev.find(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      });

      return () => unsubscribe();
    }
  }, [shipment?.id]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCalling) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isCalling]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId) {
      setTrackingId(searchId.toUpperCase());
    }
  };

  const handleShare = () => {
    if (shipment) {
      const url = `${window.location.origin}?track=${shipment.id}`;
      navigator.clipboard.writeText(url);
      toast.success('Tracking link copied to clipboard!');
    }
  };

  const handleReportIssue = async () => {
    if (shipment) {
      await reportIssue(shipment.id, issueType, issueDescription);
      setShowReportModal(false);
      setIssueDescription('');
    }
  };

  const handleSendMessage = async () => {
    if (shipment && chatMessage.trim() && shipment.agentId) {
      await sendMessage(shipment.id, shipment.agentId, chatMessage);
      setChatMessage('');
      // Optimistic update
      setMessages(prev => [...prev, {
        content: chatMessage,
        sender_id: currentUser?.id,
        created_at: new Date().toISOString()
      }]);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl mb-2">Track Shipment</h1>
              <p className="text-blue-100">Real-time tracking information</p>
            </div>
            <Button variant="secondary" size="icon" onClick={handleShare} className="rounded-full">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-12">
        {/* Map View */}
        <Card className="shadow-lg mb-6 overflow-hidden border-0">
          <div className="w-full h-80 bg-muted relative">
            <LiveTrackingMap
              currentPos={shipment.currentLat && shipment.currentLng ? [shipment.currentLat, shipment.currentLng] : undefined}
              destinationPos={shipment.toLat && shipment.toLng ? [shipment.toLat, shipment.toLng] : undefined}
              agentName={shipment.agentName}
            />

            <div className="absolute bottom-4 right-4 z-[400] bg-background/90 p-2 rounded-lg backdrop-blur-sm text-xs shadow-sm border border-border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                <div className="font-semibold">Live Tracking Active</div>
              </div>
              <div className="text-muted-foreground">Updating in real-time</div>
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
                  Recipient: {shipment?.recipientName || 'Arrive Recipient'}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Proof of Delivery (Shown if Delivered) */}
        {shipment.status === 'delivered' && (
          <Card className="p-6 shadow-md mb-4 animate-in fade-in slide-in-from-bottom-2">
            <h3 className="mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Proof of Delivery
            </h3>
            <div className="space-y-4">
              {shipment.deliveryPhotoUrl ? (
                <div className="border border-border rounded-xl overflow-hidden shadow-sm">
                  <img
                    src={shipment.deliveryPhotoUrl}
                    alt="Proof of Delivery"
                    className="w-full h-auto max-h-80 object-cover"
                  />
                  <div className="p-3 bg-muted/30 text-xs text-center text-muted-foreground">
                    Delivered on {shipment.history.find(h => h.status === 'delivered')?.date}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-border rounded-lg p-2 text-center">
                    <div className="h-24 bg-muted mb-2 flex items-center justify-center text-muted-foreground text-xs italic">
                      [Signature Available]
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
              )}
            </div>
          </Card>
        )}

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
          <Card className="p-6 shadow-md mb-4 bg-accent/5 border-accent/20">
            <h3 className="mb-4">Delivery Agent</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-3 relative">
                  <User className="w-6 h-6 text-primary" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                </div>
                <div>
                  <div className="font-semibold">{shipment?.agentName}</div>
                  <div className="text-sm text-muted-foreground">Agent ID: {shipment?.agentId}</div>
                  <div className="text-xs text-muted-foreground">{shipment?.agentPhone}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" onClick={() => setShowChat(true)} className="rounded-full">
                  <MessageSquare className="w-4 h-4" />
                </Button>
                <Button size="icon" onClick={() => setIsCalling(true)} className="rounded-full bg-accent hover:bg-accent/90">
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share Tracking
          </Button>
          <Button
            variant="outline"
            className="flex-1 rounded-xl border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => setShowReportModal(true)}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Report Issue
          </Button>
        </div>
      </div>

      {/* Report Issue Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-md p-6 animate-in zoom-in-95">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                Report an Issue
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowReportModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Issue Type</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                >
                  <option>Damaged Package</option>
                  <option>Missing Items</option>
                  <option>Delivery Delay</option>
                  <option>Rude Agent</option>
                  <option>Incorrect Location</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Textarea
                  placeholder="Please provide more details about the issue..."
                  className="h-32"
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowReportModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={handleReportIssue} disabled={!issueDescription.trim()}>
                  Submit Report
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Call Simulation Overlay */}
      {isCalling && (
        <div className="fixed inset-0 z-[60] bg-primary/95 text-white flex flex-col items-center justify-between p-12">
          <div className="text-center mt-20">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl font-bold border-4 border-accent animate-pulse">
              {shipment?.agentName?.charAt(0)}
            </div>
            <h2 className="text-3xl font-bold mb-2">{shipment?.agentName}</h2>
            <p className="text-blue-200">Arrive Agent • {shipment?.agentPhone}</p>
            <div className="mt-4 text-xl font-mono text-accent">{formatDuration(callDuration)}</div>
          </div>

          <div className="flex gap-8 mb-20">
            <Button size="icon" variant="ghost" className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20">
              <Mic className="w-6 h-6" />
            </Button>
            <Button size="icon" className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 shadow-xl shadow-red-900/50" onClick={() => { setIsCalling(false); setCallDuration(0); }}>
              <PhoneOff className="w-8 h-8" />
            </Button>
            <Button size="icon" variant="ghost" className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20">
              <Video className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}

      {/* Chat Drawer */}
      <div className={`fixed inset-x-0 bottom-0 z-[55] bg-background border-t shadow-2xl transition-transform duration-300 transform ${showChat ? 'translate-y-0' : 'translate-y-full'} h-4/5 flex flex-col`}>
        <div className="p-4 border-b flex items-center justify-between bg-primary text-white">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-2">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold leading-tight">{shipment?.agentName}</div>
              <div className="text-[10px] text-blue-100">Usually replies in 2 mins</div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setShowChat(false)} className="text-white hover:bg-white/10">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
          <div className="text-center">
            <Badge variant="outline" className="bg-white border-0 text-muted-foreground text-[10px]">TODAY</Badge>
          </div>

          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full opacity-40">
              <MessageSquare className="w-12 h-12 mb-2" />
              <p className="text-sm">Start a conversation with your agent</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender_id === currentUser?.id
                ? 'bg-primary text-white rounded-br-none shadow-md shadow-primary/20'
                : 'bg-white text-foreground rounded-bl-none shadow-sm'
                }`}>
                {msg.content}
                <div className={`text-[9px] mt-1 ${msg.sender_id === currentUser?.id ? 'text-blue-100' : 'text-muted-foreground'}`}>
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
              className="rounded-full bg-muted/50 border-0 focus-visible:ring-primary"
            />
            <Button size="icon" className="rounded-full shrink-0" onClick={handleSendMessage} disabled={!chatMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
