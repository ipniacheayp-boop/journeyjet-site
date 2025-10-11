-- Phase 1: Agent & Booking System Schema

-- Add agent profile fields
CREATE TABLE IF NOT EXISTS public.agent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  agent_code VARCHAR(20) UNIQUE NOT NULL,
  company_name TEXT,
  commission_rate DECIMAL(5,2) DEFAULT 10.00, -- percentage
  stripe_connect_account_id TEXT,
  phone VARCHAR(20),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Agent wallet for prepaid credits
CREATE TABLE IF NOT EXISTS public.agent_wallet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agent_profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance DECIMAL(10,2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'USD',
  last_topup_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Agent wallet transactions
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agent_profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('topup', 'debit', 'refund')) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT,
  description TEXT,
  balance_after DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Agent commissions tracking
CREATE TABLE IF NOT EXISTS public.agent_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agent_profiles(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  base_fare DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payout_status TEXT CHECK (payout_status IN ('pending', 'processing', 'paid', 'failed')) DEFAULT 'pending',
  stripe_transfer_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Webhook events for idempotency
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL, -- Stripe event ID or Amadeus callback ID
  event_type TEXT NOT NULL,
  provider TEXT CHECK (provider IN ('stripe', 'amadeus')) NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add new fields to existing bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES public.agent_profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS amadeus_order_id TEXT,
ADD COLUMN IF NOT EXISTS amadeus_pnr TEXT,
ADD COLUMN IF NOT EXISTS hold_expiry TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS fare_validated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ticket_issued_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS refund_status TEXT CHECK (refund_status IN ('none', 'requested', 'processing', 'completed', 'failed')) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS refund_reason TEXT;

-- Enable RLS on new tables
ALTER TABLE public.agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_profiles
CREATE POLICY "Agents can view their own profile"
  ON public.agent_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all agent profiles"
  ON public.agent_profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert agent profiles"
  ON public.agent_profiles FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Agents can update their own profile"
  ON public.agent_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any agent profile"
  ON public.agent_profiles FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for agent_wallet
CREATE POLICY "Agents can view their own wallet"
  ON public.agent_wallet FOR SELECT
  USING (agent_id IN (SELECT id FROM public.agent_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all wallets"
  ON public.agent_wallet FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for wallet_transactions
CREATE POLICY "Agents can view their own transactions"
  ON public.wallet_transactions FOR SELECT
  USING (agent_id IN (SELECT id FROM public.agent_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all transactions"
  ON public.wallet_transactions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for agent_commissions
CREATE POLICY "Agents can view their own commissions"
  ON public.agent_commissions FOR SELECT
  USING (agent_id IN (SELECT id FROM public.agent_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all commissions"
  ON public.agent_commissions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update commissions"
  ON public.agent_commissions FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for webhook_events (admin only)
CREATE POLICY "Admins can view webhook events"
  ON public.webhook_events FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_profiles_user_id ON public.agent_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_wallet_agent_id ON public.agent_wallet(agent_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_agent_id ON public.wallet_transactions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_commissions_agent_id ON public.agent_commissions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_commissions_booking_id ON public.agent_commissions(booking_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON public.webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_agent_id ON public.bookings(agent_id);
CREATE INDEX IF NOT EXISTS idx_bookings_amadeus_order_id ON public.bookings(amadeus_order_id);

-- Trigger for updated_at on agent_profiles
CREATE TRIGGER update_agent_profiles_updated_at
  BEFORE UPDATE ON public.agent_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on agent_wallet
CREATE TRIGGER update_agent_wallet_updated_at
  BEFORE UPDATE ON public.agent_wallet
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add 'agent' role to app_role enum if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role' AND typcategory = 'E') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
  END IF;
  
  -- Add 'agent' to existing enum
  BEGIN
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'agent';
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;