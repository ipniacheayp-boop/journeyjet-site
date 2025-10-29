-- Add 'agent' role to app_role enum if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid  
    WHERE t.typname = 'app_role' AND e.enumlabel = 'agent'
  ) THEN
    ALTER TYPE app_role ADD VALUE 'agent';
  END IF;
END $$;

-- Add missing fields to agent_profiles
ALTER TABLE agent_profiles 
ADD COLUMN IF NOT EXISTS gst_number TEXT,
ADD COLUMN IF NOT EXISTS contact_person TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'suspended'));

-- Create agent_clients table for storing client information
CREATE TABLE IF NOT EXISTS agent_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agent_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on agent_clients
ALTER TABLE agent_clients ENABLE ROW LEVEL SECURITY;

-- RLS policies for agent_clients
CREATE POLICY "Agents can view their own clients"
  ON agent_clients FOR SELECT
  USING (agent_id IN (
    SELECT id FROM agent_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Agents can insert their own clients"
  ON agent_clients FOR INSERT
  WITH CHECK (agent_id IN (
    SELECT id FROM agent_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Agents can update their own clients"
  ON agent_clients FOR UPDATE
  USING (agent_id IN (
    SELECT id FROM agent_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Agents can delete their own clients"
  ON agent_clients FOR DELETE
  USING (agent_id IN (
    SELECT id FROM agent_profiles WHERE user_id = auth.uid()
  ));

-- Create agent_feedback table
CREATE TABLE IF NOT EXISTS agent_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agent_profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on agent_feedback
ALTER TABLE agent_feedback ENABLE ROW LEVEL SECURITY;

-- RLS policies for agent_feedback
CREATE POLICY "Agents can view their own feedback"
  ON agent_feedback FOR SELECT
  USING (agent_id IN (
    SELECT id FROM agent_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Agents can create feedback"
  ON agent_feedback FOR INSERT
  WITH CHECK (agent_id IN (
    SELECT id FROM agent_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all feedback"
  ON agent_feedback FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update feedback"
  ON agent_feedback FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Update trigger for agent_clients
CREATE OR REPLACE FUNCTION update_agent_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agent_clients_updated_at
  BEFORE UPDATE ON agent_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_clients_updated_at();

-- Update trigger for agent_feedback
CREATE TRIGGER update_agent_feedback_updated_at
  BEFORE UPDATE ON agent_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_clients_updated_at();