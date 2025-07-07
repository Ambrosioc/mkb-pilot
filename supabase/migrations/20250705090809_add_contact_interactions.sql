-- Create contact_interactions table
CREATE TABLE IF NOT EXISTS contact_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('note', 'email', 'call', 'meeting', 'other')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_contact_interactions_contact_id ON contact_interactions(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_interactions_date ON contact_interactions(date);
CREATE INDEX IF NOT EXISTS idx_contact_interactions_type ON contact_interactions(type);

-- Enable RLS
ALTER TABLE contact_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow authenticated users to read all interactions
CREATE POLICY "Users can read contact interactions" ON contact_interactions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert interactions
CREATE POLICY "Users can insert contact interactions" ON contact_interactions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update their own interactions
CREATE POLICY "Users can update contact interactions" ON contact_interactions
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete interactions
CREATE POLICY "Users can delete contact interactions" ON contact_interactions
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contact_interactions_updated_at 
    BEFORE UPDATE ON contact_interactions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
