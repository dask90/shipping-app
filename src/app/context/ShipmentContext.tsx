import React, { createContext, useContext, useState } from 'react';

export type ShipmentStatus =
    | 'pending_approval'
    | 'approved'
    | 'assigned'
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

export interface Shipment {
    id: string;
    customerName: string;
    fromCity: string;
    toCity: string;
    status: ShipmentStatus;
    agentName?: string;
    agentId?: string;
    agentPhone?: string;
    price: string;
    date: string;
    description: string;
    history: ShipmentHistory[];
}

interface ShipmentContextType {
    shipments: Shipment[];
    userRole: 'customer' | 'staff' | 'agent' | 'admin';
    currentUser: any;
    setUserRole: (role: 'customer' | 'staff' | 'agent' | 'admin') => void;
    trackingId: string | null;
    setTrackingId: (id: string | null) => void;
    createShipment: (shipment: Omit<Shipment, 'id' | 'status' | 'date'>) => void;
    approveShipment: (id: string) => void;
    assignAgent: (id: string, agentName: string, agentId: string) => void;
    confirmPickup: (id: string) => void;
    markInTransit: (id: string) => void;
    markDelivered: (id: string) => void;
}

const ShipmentContext = createContext<ShipmentContextType | undefined>(undefined);

// Initial Mock Data
const initialShipments: Shipment[] = [
    {
        id: 'SHP001',
        customerName: 'Kwame Mensah',
        fromCity: 'Accra',
        toCity: 'Kumasi',
        status: 'pending_approval',
        price: '₵75.00',
        date: '2026-01-18',
        description: 'Electronics',
        history: [
            { status: 'pending_approval', date: '2026-01-18 10:30', location: 'Accra Central', description: 'Shipment request received' }
        ]
    },
    {
        id: 'SHP002',
        customerName: 'Abena Osei',
        fromCity: 'Tamale',
        toCity: 'Takoradi',
        status: 'approved',
        price: '₵120.00',
        date: '2026-01-17',
        description: 'Documents',
        history: [
            { status: 'pending_approval', date: '2026-01-17 09:00', location: 'Tamale Main', description: 'Shipment request received' },
            { status: 'approved', date: '2026-01-17 14:20', location: 'Tamale Main', description: 'Approved by staff' }
        ]
    },
    {
        id: 'SHP003',
        customerName: 'Kojo Asante',
        fromCity: 'Tema',
        toCity: 'Cape Coast',
        status: 'assigned',
        agentName: 'Kofi Boateng',
        agentId: 'AGT001',
        agentPhone: '+233 20 555 0123',
        price: '₵65.50',
        date: '2026-01-18',
        description: 'Clothing',
        history: [
            { status: 'pending_approval', date: '2026-01-18 08:30', location: 'Tema Port', description: 'Shipment request received' },
            { status: 'approved', date: '2026-01-18 10:00', location: 'Tema Port', description: 'Approved by staff' },
            { status: 'assigned', date: '2026-01-18 11:45', location: 'Tema Port', description: 'Agent Kofi Boateng assigned' }
        ]
    },
    {
        id: 'SHP004',
        customerName: 'Ama Darko',
        fromCity: 'Kumasi',
        toCity: 'Sunyani',
        status: 'in_transit',
        agentName: 'Yaw Addo',
        agentId: 'AGT002',
        agentPhone: '+233 20 555 0124',
        price: '₵90.00',
        date: '2026-01-16',
        description: 'Spare Parts',
        history: [
            { status: 'pending_approval', date: '2026-01-16 07:15', location: 'Kumasi Hub', description: 'Shipment request received' },
            { status: 'approved', date: '2026-01-16 09:30', location: 'Kumasi Hub', description: 'Approved by staff' },
            { status: 'assigned', date: '2026-01-16 11:00', location: 'Kumasi Hub', description: 'Agent Yaw Addo assigned' },
            { status: 'picked_up', date: '2026-01-16 13:45', location: 'Kumasi Hub', description: 'Package picked up by agent' },
            { status: 'in_transit', date: '2026-01-16 15:20', location: 'Nsawam', description: 'Package in transit near Nsawam' }
        ]
    },
    {
        id: 'SHP005',
        customerName: 'Samuel Appiah',
        fromCity: 'Takoradi',
        toCity: 'Accra',
        status: 'delivered',
        agentName: 'Kofi Boateng',
        agentId: 'AGT001',
        agentPhone: '+233 20 555 0123',
        price: '₵55.00',
        date: '2026-01-15',
        description: 'Books',
        history: [
            { status: 'pending_approval', date: '2026-01-15 08:00', location: 'Takoradi Harbor', description: 'Shipment request received' },
            { status: 'approved', date: '2026-01-15 09:30', location: 'Takoradi Harbor', description: 'Approved by staff' },
            { status: 'assigned', date: '2026-01-15 10:45', location: 'Takoradi Harbor', description: 'Agent Kofi Boateng assigned' },
            { status: 'picked_up', date: '2026-01-15 12:00', location: 'Takoradi Harbor', description: 'Package picked up' },
            { status: 'in_transit', date: '2026-01-15 14:30', location: 'Central Region', description: 'In transit' },
            { status: 'delivered', date: '2026-01-15 17:15', location: 'Accra', description: 'Delivered to recipient' }
        ]
    }
];

export function ShipmentProvider({ children }: { children: React.ReactNode }) {
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [userRole, setUserRole] = useState<'customer' | 'staff' | 'agent' | 'admin'>('customer');
    const [trackingId, setTrackingId] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load from localStorage
    React.useEffect(() => {
        const saved = localStorage.getItem('shipexpress_shipments');
        if (saved) {
            try {
                setShipments(JSON.parse(saved));
            } catch (e) {
                setShipments(initialShipments);
            }
        } else {
            setShipments(initialShipments);
        }
        setIsInitialized(true);
    }, []);

    // Save to localStorage
    React.useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('shipexpress_shipments', JSON.stringify(shipments));
        }
    }, [shipments, isInitialized]);

    const createShipment = (data: Omit<Shipment, 'id' | 'status' | 'date' | 'history'>) => {
        const date = new Date().toISOString().split('T')[0];
        const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        const newShipment: Shipment = {
            ...data,
            id: `SHP${String(shipments.length + 1).padStart(3, '0')}`,
            status: 'pending_approval',
            date,
            history: [
                { status: 'pending_approval', date: `${date} ${time}`, location: data.fromCity, description: 'Shipment created' }
            ]
        };
        setShipments(prev => [newShipment, ...prev]);
    };

    const approveShipment = (id: string) => {
        const date = new Date().toISOString().split('T')[0];
        const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        setShipments(prev => prev.map(s =>
            s.id === id ? {
                ...s,
                status: 'approved',
                history: [...s.history, { status: 'approved', date: `${date} ${time}`, location: s.fromCity, description: 'Approved by staff' }]
            } : s
        ));
    };

    const assignAgent = (id: string, agentName: string, agentId: string) => {
        const date = new Date().toISOString().split('T')[0];
        const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        setShipments(prev => prev.map(s =>
            s.id === id ? {
                ...s,
                status: 'assigned',
                agentName,
                agentId,
                agentPhone: '+233 20 555 9999',
                history: [...s.history, { status: 'assigned', date: `${date} ${time}`, location: s.fromCity, description: `Agent ${agentName} assigned` }]
            } : s
        ));
    };

    const confirmPickup = (id: string) => {
        const date = new Date().toISOString().split('T')[0];
        const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        setShipments(prev => prev.map(s =>
            s.id === id ? {
                ...s,
                status: 'picked_up',
                history: [...s.history, { status: 'picked_up', date: `${date} ${time}`, location: s.fromCity, description: 'Package picked up by agent' }]
            } : s
        ));
    };

    const markInTransit = (id: string) => {
        const date = new Date().toISOString().split('T')[0];
        const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        setShipments(prev => prev.map(s =>
            s.id === id ? {
                ...s,
                status: 'in_transit',
                history: [...s.history, { status: 'in_transit', date: `${date} ${time}`, location: 'In Transit', description: 'Package is on the way' }]
            } : s
        ));
    };

    const markDelivered = (id: string) => {
        const date = new Date().toISOString().split('T')[0];
        const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        setShipments(prev => prev.map(s =>
            s.id === id ? {
                ...s,
                status: 'delivered',
                history: [...s.history, { status: 'delivered', date: `${date} ${time}`, location: s.toCity, description: 'Package delivered to recipient' }]
            } : s
        ));
    };

    return (
        <ShipmentContext.Provider value={{
            shipments,
            userRole,
            currentUser: { name: 'Demo User' },
            setUserRole,
            trackingId,
            setTrackingId,
            createShipment,
            approveShipment,
            assignAgent,
            confirmPickup,
            markInTransit,
            markDelivered
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
