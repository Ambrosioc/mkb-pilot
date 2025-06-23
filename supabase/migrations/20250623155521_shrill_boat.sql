/*
  # MKB Pilot Database Schema

  1. User Management
    - `users` - Staff members linked to auth.users
    - `roles` - Hierarchical roles with levels
    - `user_roles` - User-role assignments
    - `historique_acces` - Role change history

  2. Vehicles & Advertisements
    - `vehicles` - Vehicle information
    - `advertisements` - Vehicle listings

  3. Contacts & CRM
    - `contacts` - Customer and prospect information
    - `contact_tags` - Contact categorization
    - `contact_history` - Interaction tracking

  4. Sales Documents
    - `sales_documents` - Quotes and invoices
*/

-- Drop tables in reverse dependency order to avoid constraint issues
DROP TABLE IF EXISTS historique_acces;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS sales_documents;
DROP TABLE IF EXISTS contact_history;
DROP TABLE IF EXISTS contact_tags;
DROP TABLE IF EXISTS advertisements;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;

-- 1. User Management

-- Users table linked to auth.users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  prenom TEXT NOT NULL,
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT,
  actif BOOLEAN DEFAULT TRUE,
  photo_url TEXT,
  date_creation TIMESTAMPTZ DEFAULT now()
);

-- Roles table with hierarchical levels
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  nom TEXT NOT NULL UNIQUE,
  niveau INTEGER NOT NULL,
  description TEXT
);

-- User-role assignments
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES roles(id) ON DELETE RESTRICT,
  date_attribution TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)  -- Each user can have only one active role
);

-- Role change history
CREATE TABLE IF NOT EXISTS historique_acces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  attribue_par UUID REFERENCES users(id) ON DELETE SET NULL,
  ancien_role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
  nouveau_role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
  date_changement TIMESTAMPTZ DEFAULT now()
);

-- 2. Vehicles & Advertisements

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  reference TEXT,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year SMALLINT NOT NULL,
  first_registration TEXT,
  mileage INTEGER NOT NULL DEFAULT 0,
  type TEXT,
  color TEXT,
  fuel_type TEXT,
  gearbox TEXT,
  din_power SMALLINT,
  nb_seats SMALLINT DEFAULT 5,
  nb_doors SMALLINT DEFAULT 5,
  average_consumption REAL,
  road_consumption REAL,
  city_consumption REAL,
  emissions SMALLINT,
  location TEXT,
  fiscal_power SMALLINT,
  status TEXT DEFAULT 'disponible',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Advertisements table
CREATE TABLE IF NOT EXISTS advertisements (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  car_id BIGINT REFERENCES vehicles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  photos TEXT[] DEFAULT '{}',
  price REAL NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Contacts & CRM

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  nom TEXT NOT NULL,
  email TEXT,
  telephone TEXT,
  type TEXT NOT NULL,
  societe TEXT,
  statut TEXT DEFAULT 'actif',
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contact tags table
CREATE TABLE IF NOT EXISTS contact_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  color TEXT DEFAULT '#2bbbdc',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Contact interaction history
CREATE TABLE IF NOT EXISTS contact_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  contenu TEXT,
  date TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Sales Documents

-- Sales documents (quotes and invoices)
CREATE TABLE IF NOT EXISTS sales_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('facture', 'devis')),
  vehicle_id BIGINT REFERENCES vehicles(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  base_price REAL NOT NULL DEFAULT 0,
  discount REAL DEFAULT 0,
  tva_rate REAL DEFAULT 20,
  final_price REAL NOT NULL DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'en attente',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for foreign keys and frequently queried columns
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_historique_acces_user_id ON historique_acces(user_id);
CREATE INDEX IF NOT EXISTS idx_historique_acces_attribue_par ON historique_acces(attribue_par);
CREATE INDEX IF NOT EXISTS idx_advertisements_car_id ON advertisements(car_id);
CREATE INDEX IF NOT EXISTS idx_contact_tags_contact_id ON contact_tags(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_history_contact_id ON contact_history(contact_id);
CREATE INDEX IF NOT EXISTS idx_sales_documents_vehicle_id ON sales_documents(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_sales_documents_contact_id ON sales_documents(contact_id);
CREATE INDEX IF NOT EXISTS idx_sales_documents_type ON sales_documents(type);
CREATE INDEX IF NOT EXISTS idx_sales_documents_status ON sales_documents(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_contacts_statut ON contacts(statut);
CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(type);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_modified_column trigger to relevant tables
CREATE TRIGGER update_vehicles_updated_at
BEFORE UPDATE ON vehicles
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_advertisements_updated_at
BEFORE UPDATE ON advertisements
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_contacts_updated_at
BEFORE UPDATE ON contacts
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_sales_documents_updated_at
BEFORE UPDATE ON sales_documents
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Pre-populate roles table with default roles
INSERT INTO roles (id, nom, niveau, description) VALUES
(1, 'CEO', 1, 'Accès global'),
(2, 'G4', 2, 'Direction (COO, CTO, CCO, etc.)'),
(3, 'Responsable de Pôle', 3, 'Chef de pôle'),
(4, 'Collaborateur confirmé', 4, 'Accès intermédiaire'),
(5, 'Collaborateur simple', 5, 'Accès restreint')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE historique_acces ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_documents ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for authenticated users
-- In a production environment, these would be more granular based on user roles
CREATE POLICY "Authenticated users can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read all roles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read all user_roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read all historique_acces"
  ON historique_acces FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read/write vehicles"
  ON vehicles FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read/write advertisements"
  ON advertisements FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read/write contacts"
  ON contacts FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read/write contact_tags"
  ON contact_tags FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read/write contact_history"
  ON contact_history FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read/write sales_documents"
  ON sales_documents FOR ALL
  TO authenticated
  USING (true);

-- Comment on tables for documentation
COMMENT ON TABLE users IS 'Staff members linked to auth.users';
COMMENT ON TABLE roles IS 'Hierarchical roles with levels (1=highest, 5=lowest)';
COMMENT ON TABLE user_roles IS 'Active role assignments for users';
COMMENT ON TABLE historique_acces IS 'History of role changes';
COMMENT ON TABLE vehicles IS 'Vehicle inventory information';
COMMENT ON TABLE advertisements IS 'Vehicle listings and marketing information';
COMMENT ON TABLE contacts IS 'Customer and prospect contact information';
COMMENT ON TABLE contact_tags IS 'Tags for contact categorization';
COMMENT ON TABLE contact_history IS 'History of interactions with contacts';
COMMENT ON TABLE sales_documents IS 'Quotes and invoices for vehicles';