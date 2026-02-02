-- Comprehensive SQL fix for shipments table
-- Run this in the Supabase SQL Editor

-- Add all missing columns with double quotes to preserve camelCase where used in code
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS "customerName" TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS "customerPhone" TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS "fromCity" TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS "toCity" TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS "agentName" TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS "agentId" TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS "agentPhone" TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS "price" TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS "date" TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS "weight" TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS "pickupAddress" TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS "deliveryAddress" TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS "recipientName" TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS "recipientPhone" TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS "history" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS "customer_id" UUID REFERENCES auth.users(id);

-- Tracking Columns (Live Location)
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS "currentLat" DOUBLE PRECISION;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS "currentLng" DOUBLE PRECISION;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS "lastUpdated" TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Dynamic Destination Coordinates
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS "fromLat" DOUBLE PRECISION;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS "fromLng" DOUBLE PRECISION;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS "toLat" DOUBLE PRECISION;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS "toLng" DOUBLE PRECISION;

-- Ensure RLS policies are up to date
DROP POLICY IF EXISTS "Users can view their own shipments" ON shipments;
CREATE POLICY "Users can view their own shipments" ON shipments
    FOR SELECT USING (auth.uid() = customer_id OR auth.uid()::text = "agentId");

DROP POLICY IF EXISTS "Users can insert their own shipments" ON shipments;
CREATE POLICY "Users can insert their own shipments" ON shipments
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Agents can update shipment location" ON shipments;
CREATE POLICY "Agents can update shipment location" ON shipments
    FOR UPDATE USING (auth.uid()::text = "agentId");

-- Staff and Admin can do everything
DROP POLICY IF EXISTS "Staff and Admin full access" ON shipments;
CREATE POLICY "Staff and Admin full access" ON shipments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND (role = 'staff' OR role = 'admin')
        )
    );

ALTER TABLE shipments ADD COLUMN IF NOT EXISTS "deliveryPhotoUrl" TEXT;

-- Messages Table for Real-time Chat
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shipment_id TEXT NOT NULL,
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    receiver_id UUID NOT NULL REFERENCES auth.users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
CREATE POLICY "Users can view their own messages" ON messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can send their own messages" ON messages;
CREATE POLICY "Users can send their own messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Staff and Admin can view all messages
DROP POLICY IF EXISTS "Staff and Admin can view all messages" ON messages;
CREATE POLICY "Staff and Admin can view all messages" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND (role = 'staff' OR role = 'admin')
        )
    );

-- Populate demo coordinates
UPDATE shipments SET "toLat" = 5.6037, "toLng" = -0.1870, "fromLat" = 5.62, "fromLng" = -0.19 WHERE "toCity" = 'Accra';
UPDATE shipments SET "toLat" = 6.6666, "toLng" = -1.6163, "fromLat" = 5.6037, "fromLng" = -0.1870 WHERE "toCity" = 'Kumasi';
UPDATE shipments SET "toLat" = 9.4075, "toLng" = -0.8533, "fromLat" = 6.6666, "fromLng" = -1.6163 WHERE "toCity" = 'Tamale';
