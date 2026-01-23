import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export type ShipmentStatus =
    | 'pending_approval'
    | 'approved'
    | 'assigned'
    | 'accepted'
    | 'picked_up'
    | 'in_transit'
    | 'delivered'
    | 'cancelled';

export interface ShipmentHistory {
    status: ShipmentStatus;
    date: string;
    location: string;
    description: string;
}

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning';
    read: boolean;
    created_at: string;
    shipment_id?: string;
}

export interface Shipment {
    id: string;
    customerName: string;
    customerPhone?: string;
    fromCity: string;
    toCity: string;
    status: ShipmentStatus;
    agentName?: string;
    agentId?: string;
    agentPhone?: string;
    price: string;
    date: string;
    description: string;
    weight?: string;
    pickupAddress?: string;
    deliveryAddress?: string;
    recipientName?: string;
    recipientPhone?: string;
    history: ShipmentHistory[];
    customer_id?: string;
    currentLat?: number;
    currentLng?: number;
}

interface ShipmentContextType {
    shipments: Shipment[];
    userRole: 'customer' | 'staff' | 'agent' | 'admin';
    currentUser: any;
    userProfile: any;
    setUserRole: (role: 'customer' | 'staff' | 'agent' | 'admin') => void;
    trackingId: string | null;
    setTrackingId: (id: string | null) => void;
    createShipment: (shipment: Omit<Shipment, 'id' | 'status' | 'date' | 'history'>) => Promise<void>;
    approveShipment: (id: string) => Promise<void>;
    assignAgent: (id: string, agentName: string, agentId: string) => Promise<void>;
    confirmPickup: (id: string) => Promise<void>;
    markInTransit: (id: string) => Promise<void>;
    markDelivered: (id: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signUp: (email: string, password: string, name: string, phone: string, role: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    sendPhoneOtp: (phone: string) => Promise<{ error: any }>;
    verifyPhoneOtp: (phone: string, token: string) => Promise<{ error: any }>;
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    clearNotifications: () => Promise<void>;
    updateProfile: (data: { name?: string; phone?: string; avatar_url?: string; address?: string }) => Promise<{ error: any }>;
    uploadAvatar: (file: File) => Promise<{ publicUrl: string | null; error: any }>;
    updateEmail: (newEmail: string) => Promise<{ error: any }>;
    availableAgents: any[];
    fetchAgents: () => Promise<void>;
    acceptRequest: (id: string) => Promise<void>;
    updateCurrentLocation: (id: string, lat: number, lng: number) => Promise<void>;
    reportIssue: (shipmentId: string, issueType: string, description: string) => Promise<{ error: any }>;
    sendMessage: (shipmentId: string, receiverId: string, content: string) => Promise<{ error: any }>;
    fetchMessages: (shipmentId: string) => Promise<{ data: any[] | null; error: any }>;
    issues: any[];
    fetchIssues: () => Promise<void>;
    resolveIssue: (issueId: string) => Promise<void>;
}

const ShipmentContext = createContext<ShipmentContextType | undefined>(undefined);


export function ShipmentProvider({ children }: { children: React.ReactNode }) {
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [userRole, setUserRole] = useState<'customer' | 'staff' | 'agent' | 'admin'>('customer');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [trackingId, setTrackingId] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [availableAgents, setAvailableAgents] = useState<any[]>([]);
    const [issues, setIssues] = useState<any[]>([]);

    // Fetch profile
    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('[Supabase Profile Error]', error);
            return;
        }

        if (data) {
            setUserProfile(data);
            setUserRole(data.role as any);
        }
    };

    const fetchAgents = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'agent');

        if (data) {
            setAvailableAgents(data);
        } else if (error) {
            console.error('[Supabase Fetch Agents Error]', error);
        }
    };

    const fetchShipments = async () => {
        const { data, error } = await supabase
            .from('shipments')
            .select('*')
            .order('date', { ascending: false });

        if (data) {
            setShipments(data as Shipment[]);
        } else if (error) {
            console.error(`[Supabase Fetch Error] ${error.message}`, error);
            setShipments([]);
        }
    };

    const fetchNotifications = async (userId: string) => {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (data) {
            setNotifications(data as Notification[]);
            setUnreadCount(data.filter(n => !n.read).length);
        } else if (error) {
            console.error(`[Supabase Notifications Error] ${error.message}`, error);
        }
    };

    const fetchIssues = async () => {
        const { data, error } = await supabase
            .from('shipment_issues')
            .select('*, shipments(id, customerName)')
            .order('created_at', { ascending: false });

        if (data) {
            setIssues(data);
        } else if (error) {
            console.error('[Supabase Fetch Issues Error]', error);
        }
    };

    // Fetch from Supabase
    useEffect(() => {
        // Handle Auth State Changes
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setCurrentUser(session?.user ?? null);
            if (session?.user) {
                await fetchProfile(session.user.id);
                await fetchNotifications(session.user.id);
            } else {
                setUserProfile(null);
                setUserRole('customer');
                setNotifications([]);
                setUnreadCount(0);
            }
        });

        fetchShipments();
        fetchAgents();
        fetchIssues();

        // Set up real-time subscription for shipments
        const shipmentSub = supabase
            .channel('shipments_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'shipments' }, (payload) => {
                if (payload.eventType === 'UPDATE') {
                    setShipments(prev => prev.map(s => s.id === payload.new.id ? { ...s, ...payload.new } : s));
                    // Show a toast when status changes
                    if (payload.old.status !== payload.new.status) {
                        toast.info(`Shipment ${payload.new.id} status updated to ${payload.new.status.replace('_', ' ')}`);
                    }
                } else {
                    fetchShipments();
                }
            })
            .subscribe();

        // Set up real-time subscription for notifications
        let notificationSub: any;
        if (currentUser) {
            notificationSub = supabase
                .channel('notifications_changes')
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${currentUser.id}`
                }, (payload) => {
                    setNotifications(prev => [payload.new as Notification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                    toast.success(payload.new.title);
                })
                .subscribe();
        }

        return () => {
            authSubscription.unsubscribe();
            supabase.removeChannel(shipmentSub);
            if (notificationSub) supabase.removeChannel(notificationSub);
        };
    }, [currentUser?.id]);

    const createShipment = async (data: Omit<Shipment, 'id' | 'status' | 'date' | 'history'>) => {
        const date = new Date().toISOString().split('T')[0];
        const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        const id = `SHP${String(shipments.length + 1).padStart(3, '0')}`;

        const newHistory = [
            { status: 'pending_approval' as ShipmentStatus, date: `${date} ${time}`, location: data.fromCity, description: 'Shipment created' }
        ];

        const { data: insertedData, error } = await supabase
            .from('shipments')
            .insert([{
                ...data,
                id,
                status: 'pending_approval',
                date,
                history: newHistory,
                customer_id: currentUser?.id
            }])
            .select();

        if (error) {
            console.error(`[Supabase Create Error] ${error.message}`, error);
            return;
        }

        if (insertedData) {
            setShipments(prev => [insertedData[0] as Shipment, ...prev]);
        }
    };

    const approveShipment = async (id: string) => {
        const date = new Date().toISOString().split('T')[0];
        const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        const shipment = shipments.find(s => s.id === id);
        if (!shipment) return;

        const updatedHistory = [...shipment.history, {
            status: 'approved' as ShipmentStatus,
            date: `${date} ${time}`,
            location: shipment.fromCity,
            description: 'Approved by staff'
        }];

        const { error } = await supabase
            .from('shipments')
            .update({
                status: 'approved',
                history: updatedHistory
            })
            .eq('id', id);

        if (error) {
            console.error(`[Supabase Approval Error] ${error.message}`, error);
            return;
        }

        setShipments(prev => prev.map(s =>
            s.id === id ? {
                ...s,
                status: 'approved',
                history: updatedHistory
            } : s
        ));
    };

    const assignAgent = async (id: string, agentName: string, agentId: string) => {
        const date = new Date().toISOString().split('T')[0];
        const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        const shipment = shipments.find(s => s.id === id);
        if (!shipment) return;

        const updatedHistory = [...shipment.history, {
            status: 'assigned' as ShipmentStatus,
            date: `${date} ${time}`,
            location: shipment.fromCity,
            description: `Agent ${agentName} assigned`
        }];

        const { error } = await supabase
            .from('shipments')
            .update({
                status: 'assigned',
                agentName,
                agentId,
                agentPhone: '+233 20 555 9999',
                history: updatedHistory
            })
            .eq('id', id);

        if (error) {
            console.error(`[Supabase Assignment Error] ${error.message}`, error);
            return;
        }

        setShipments(prev => prev.map(s =>
            s.id === id ? {
                ...s,
                status: 'assigned',
                agentName,
                agentId,
                agentPhone: '+233 20 555 9999',
                history: updatedHistory
            } : s
        ));
    };

    const acceptRequest = async (id: string) => {
        const date = new Date().toISOString().split('T')[0];
        const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        const shipment = shipments.find(s => s.id === id);
        if (!shipment) return;

        const updatedHistory = [...shipment.history, {
            status: 'accepted' as ShipmentStatus,
            date: `${date} ${time}`,
            location: 'Agent Hub',
            description: 'Request accepted by agent'
        }];

        const { error } = await supabase
            .from('shipments')
            .update({
                status: 'accepted',
                history: updatedHistory
            })
            .eq('id', id);

        if (error) {
            console.error(`[Supabase Acceptance Error] ${error.message}`, error);
            return;
        }

        setShipments(prev => prev.map(s =>
            s.id === id ? {
                ...s,
                status: 'accepted',
                history: updatedHistory
            } : s
        ));
    };

    const confirmPickup = async (id: string) => {
        const date = new Date().toISOString().split('T')[0];
        const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        const shipment = shipments.find(s => s.id === id);
        if (!shipment) return;

        const updatedHistory = [...shipment.history, {
            status: 'picked_up' as ShipmentStatus,
            date: `${date} ${time}`,
            location: shipment.fromCity,
            description: 'Package picked up by agent'
        }];

        const { error } = await supabase
            .from('shipments')
            .update({
                status: 'picked_up',
                history: updatedHistory
            })
            .eq('id', id);

        if (error) {
            console.error(`[Supabase Pickup Error] ${error.message}`, error);
            return;
        }

        setShipments(prev => prev.map(s =>
            s.id === id ? {
                ...s,
                status: 'picked_up',
                history: updatedHistory
            } : s
        ));
    };

    const markInTransit = async (id: string) => {
        const date = new Date().toISOString().split('T')[0];
        const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        const shipment = shipments.find(s => s.id === id);
        if (!shipment) return;

        const updatedHistory = [...shipment.history, {
            status: 'in_transit' as ShipmentStatus,
            date: `${date} ${time}`,
            location: 'In Transit',
            description: 'Package is on the way'
        }];

        const { error } = await supabase
            .from('shipments')
            .update({
                status: 'in_transit',
                history: updatedHistory,
                currentLat: 5.6037,
                currentLng: -0.1870
            })
            .eq('id', id);

        if (error) {
            console.error(`[Supabase Transit Error] ${error.message}`, error);
            return;
        }

        setShipments(prev => prev.map(s =>
            s.id === id ? {
                ...s,
                status: 'in_transit',
                history: updatedHistory,
                currentLat: 5.6037,
                currentLng: -0.1870
            } : s
        ));
    };

    const updateCurrentLocation = async (id: string, lat: number, lng: number) => {
        const { error } = await supabase
            .from('shipments')
            .update({
                currentLat: lat,
                currentLng: lng
            })
            .eq('id', id);

        if (error) {
            console.error(`[Supabase Update Location Error] ${error.message}`, error);
            return;
        }

        setShipments(prev => prev.map(s =>
            s.id === id ? {
                ...s,
                currentLat: lat,
                currentLng: lng
            } : s
        ));
    };

    const markDelivered = async (id: string) => {
        const date = new Date().toISOString().split('T')[0];
        const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        const shipment = shipments.find(s => s.id === id);
        if (!shipment) return;

        const updatedHistory = [...shipment.history, {
            status: 'delivered' as ShipmentStatus,
            date: `${date} ${time}`,
            location: shipment.toCity,
            description: 'Package delivered to recipient'
        }];

        const { error } = await supabase
            .from('shipments')
            .update({
                status: 'delivered',
                history: updatedHistory
            })
            .eq('id', id);

        if (error) {
            console.error(`[Supabase Delivery Error] ${error.message}`, error);
            return;
        }

        setShipments(prev => prev.map(s =>
            s.id === id ? {
                ...s,
                status: 'delivered',
                history: updatedHistory
            } : s
        ));
    };

    const reportIssue = async (shipmentId: string, issueType: string, description: string) => {
        if (!currentUser) return { error: new Error('Not logged in') };

        const { error } = await supabase
            .from('shipment_issues')
            .insert([{
                shipment_id: shipmentId,
                user_id: currentUser.id,
                issue_type: issueType,
                description,
                status: 'open'
            }]);

        if (!error) {
            toast.success('Issue reported successfully');
        } else {
            console.error('[Supabase Report Issue Error]', error);
        }

        return { error };
    };

    const sendMessage = async (shipmentId: string, receiverId: string, content: string) => {
        if (!currentUser) return { error: new Error('Not logged in') };

        const { error } = await supabase
            .from('messages')
            .insert([{
                shipment_id: shipmentId,
                sender_id: currentUser.id,
                receiver_id: receiverId,
                content
            }]);

        if (error) {
            console.error('[Supabase Send Message Error]', error);
        }

        return { error };
    };

    const fetchMessages = async (shipmentId: string) => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('shipment_id', shipmentId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('[Supabase Fetch Messages Error]', error);
        }

        return { data, error };
    };

    const resolveIssue = async (issueId: string) => {
        const { error } = await supabase
            .from('shipment_issues')
            .update({ status: 'resolved' })
            .eq('id', issueId);

        if (!error) {
            setIssues(prev => prev.map(issue => issue.id === issueId ? { ...issue, status: 'resolved' } : issue));
            toast.success('Issue marked as resolved');
        } else {
            console.error('[Supabase Resolve Issue Error]', error);
        }
    };

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error };
    };

    const signUp = async (email: string, password: string, name: string, phone: string, role: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                }
            }
        });

        if (error) return { error };

        if (data.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: data.user.id,
                        name,
                        phone,
                        role,
                    }
                ]);
            return { error: profileError };
        }

        return { error: null };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const sendPhoneOtp = async (phone: string) => {
        const { error } = await supabase.auth.updateUser({
            phone,
        });
        return { error };
    };

    const verifyPhoneOtp = async (phone: string, token: string) => {
        const { error } = await supabase.auth.verifyOtp({
            phone,
            token,
            type: 'phone_change'
        });
        return { error };
    };

    const updateEmail = async (newEmail: string) => {
        const { error } = await supabase.auth.updateUser({ email: newEmail });
        return { error };
    };

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id);

        if (!error) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const clearNotifications = async () => {
        if (!currentUser) return;
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('user_id', currentUser.id);

        if (!error) {
            setNotifications([]);
            setUnreadCount(0);
        }
    };

    const updateProfile = async (data: { name?: string; phone?: string; avatar_url?: string; address?: string }) => {
        if (!currentUser) return { error: new Error('Not logged in') };

        const { error } = await supabase
            .from('profiles')
            .update(data)
            .eq('id', currentUser.id);

        if (!error) {
            setUserProfile((prev: any) => ({ ...prev, ...data }));
        }

        return { error };
    };

    const uploadAvatar = async (file: File) => {
        if (!currentUser) return { publicUrl: null, error: new Error('Not logged in') };

        const fileExt = file.name.split('.').pop();
        const fileName = `${currentUser.id}-${Math.random()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file);

        if (uploadError) {
            return { publicUrl: null, error: uploadError };
        }

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return { publicUrl, error: null };
    };

    return (
        <ShipmentContext.Provider value={{
            shipments,
            userRole,
            currentUser,
            userProfile,
            setUserRole,
            trackingId,
            setTrackingId,
            createShipment,
            approveShipment,
            assignAgent,
            confirmPickup,
            markInTransit,
            markDelivered,
            signIn,
            signUp,
            signOut,
            sendPhoneOtp,
            verifyPhoneOtp,
            notifications,
            unreadCount,
            markAsRead,
            clearNotifications,
            updateProfile,
            uploadAvatar,
            updateEmail,
            availableAgents,
            fetchAgents,
            acceptRequest,
            updateCurrentLocation,
            reportIssue,
            sendMessage,
            fetchMessages,
            issues,
            fetchIssues,
            resolveIssue
        }}>
            {children}
        </ShipmentContext.Provider>
    );
}

export function useShipment() {
    const context = useContext(ShipmentContext);
    if (context === undefined) {
        throw new Error('useShipment must be used within a ShipmentProvider');
    }
    return context;
}
