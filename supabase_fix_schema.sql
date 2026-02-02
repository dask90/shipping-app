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
