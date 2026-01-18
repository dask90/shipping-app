import React, { createContext, useContext, useState } from 'react';

export type ShipmentStatus =
    | 'pending_approval'
    | 'approved'
    | 'assigned'
    | 'picked_up'
    | 'in_transit'
    | 'delivered'
    | 'cancelled';

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
}

interface ShipmentContextType {
    shipments: Shipment[];
    userRole: 'customer' | 'staff' | 'agent' | 'admin';
    currentUser: any;
    setUserRole: (role: 'customer' | 'staff' | 'agent' | 'admin') => void;
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
    }
];

export function ShipmentProvider({ children }: { children: React.ReactNode }) {
    const [shipments, setShipments] = useState<Shipment[]>(initialShipments);
    const [userRole, setUserRole] = useState<'customer' | 'staff' | 'agent' | 'admin'>('customer');

    const createShipment = (data: Omit<Shipment, 'id' | 'status' | 'date'>) => {
        const newShipment: Shipment = {
            ...data,
            id: `SHP${String(shipments.length + 1).padStart(3, '0')}`,
            status: 'pending_approval',
            date: new Date().toISOString().split('T')[0],
        };
        setShipments([newShipment, ...shipments]);
    };

    const approveShipment = (id: string) => {
        setShipments(prev => prev.map(s =>
            s.id === id ? { ...s, status: 'approved' } : s
        ));
    };

    const assignAgent = (id: string, agentName: string, agentId: string) => {
        setShipments(prev => prev.map(s =>
            s.id === id ? {
                ...s,
                status: 'assigned',
                agentName,
                agentId,
                agentPhone: '+233 20 555 9999' // Mock phone
            } : s
        ));
    };

    const confirmPickup = (id: string) => {
        setShipments(prev => prev.map(s =>
            s.id === id ? { ...s, status: 'picked_up' } : s
        ));
    };

    const markInTransit = (id: string) => {
        setShipments(prev => prev.map(s =>
            s.id === id ? { ...s, status: 'in_transit' } : s
        ));
    };

    const markDelivered = (id: string) => {
        setShipments(prev => prev.map(s =>
            s.id === id ? { ...s, status: 'delivered' } : s
        ));
    };

    return (
        <ShipmentContext.Provider value={{
            shipments,
            userRole,
            currentUser: { name: 'Demo User' },
            setUserRole,
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
