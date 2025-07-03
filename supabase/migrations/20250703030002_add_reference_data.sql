-- Add reference data from CSV files
-- Migration: 20250703030002_add_reference_data

-- Insert car types (types de véhicules)
INSERT INTO car_types (name) VALUES 
('Berline'),
('SUV'),
('Break'),
('Citadine'),
('Utilitaire'),
('Cabriolet'),
('Coupé'),
('Monospace'),
('Pick-up'),
('4x4')
ON CONFLICT (name) DO NOTHING;

-- Insert fuel types (types de carburant)
INSERT INTO fuel_types (name) VALUES 
('Essence'),
('Diesel'),
('Hybride'),
('Électrique'),
('GPL'),
('Hydrogène'),
('Hybride rechargeable'),
('Éthanol')
ON CONFLICT (name) DO NOTHING;

-- Insert dossier types (types de dossiers)
INSERT INTO dossier_types (name, description) VALUES 
('DPV', 'Dossier de Vente'),
('REMA FR', 'Remise France'),
('REMA ALL', 'Remise Allemagne'),
('REMA BE', 'Remise Belgique'),
('STOCK', 'Véhicule en stock'),
('REPRISE', 'Véhicule en reprise')
ON CONFLICT (name) DO NOTHING;

-- Insert brands (marques)
INSERT INTO brands (name) VALUES 
('Peugeot'),
('Renault'),
('Citroën'),
('Volkswagen'),
('BMW'),
('Mercedes'),
('Audi'),
('Ford'),
('Opel'),
('Toyota'),
('Honda'),
('Nissan'),
('Mazda'),
('Volvo'),
('Skoda'),
('Seat'),
('Fiat'),
('Alfa Romeo'),
('Jaguar'),
('Land Rover'),
('Mini'),
('Smart'),
('Tesla'),
('Hyundai'),
('Kia'),
('Dacia'),
('DS'),
('Lexus'),
('Infiniti'),
('Subaru'),
('Mitsubishi'),
('Suzuki'),
('Daihatsu'),
('Lancia'),
('Lada'),
('Chevrolet'),
('Chrysler'),
('Jeep'),
('Dodge'),
('Porsche'),
('Ferrari'),
('Lamborghini'),
('Maserati'),
('Bentley'),
('Rolls-Royce'),
('Aston Martin'),
('McLaren'),
('Bugatti'),
('Pagani'),
('Koenigsegg')
ON CONFLICT (name) DO NOTHING;

-- Insert models for each brand
-- Peugeot (brand_id = 1)
INSERT INTO models (brand_id, name) VALUES
(1, '208'), (1, '308'), (1, '408'), (1, '508'), (1, '2008'), (1, '3008'), (1, '5008'), (1, 'Rifter'), (1, 'Traveller'), (1, 'Partner'), (1, 'Expert'), (1, 'Boxer')
ON CONFLICT (brand_id, name) DO NOTHING;

-- Renault (brand_id = 2)
INSERT INTO models (brand_id, name) VALUES
(2, 'Clio'), (2, 'Captur'), (2, 'Megane'), (2, 'Scenic'), (2, 'Kadjar'), (2, 'Koleos'), (2, 'Talisman'), (2, 'Espace'), (2, 'Kangoo'), (2, 'Trafic'), (2, 'Master')
ON CONFLICT (brand_id, name) DO NOTHING;

-- Citroën (brand_id = 3)
INSERT INTO models (brand_id, name) VALUES
(3, 'C1'), (3, 'C3'), (3, 'C4'), (3, 'C5'), (3, 'C-Elysee'), (3, 'Berlingo'), (3, 'C3 Aircross'), (3, 'C4 Cactus'), (3, 'C4 Picasso'), (3, 'C5 Aircross'), (3, 'Jumpy'), (3, 'Jumper')
ON CONFLICT (brand_id, name) DO NOTHING;

-- Volkswagen (brand_id = 4)
INSERT INTO models (brand_id, name) VALUES
(4, 'Polo'), (4, 'Golf'), (4, 'Passat'), (4, 'Arteon'), (4, 'T-Cross'), (4, 'T-Roc'), (4, 'Tiguan'), (4, 'Touareg'), (4, 'Touran'), (4, 'Sharan'), (4, 'Caddy'), (4, 'Transporter')
ON CONFLICT (brand_id, name) DO NOTHING;

-- BMW (brand_id = 5)
INSERT INTO models (brand_id, name) VALUES
(5, 'Série 1'), (5, 'Série 2'), (5, 'Série 3'), (5, 'Série 4'), (5, 'Série 5'), (5, 'Série 6'), (5, 'Série 7'), (5, 'Série 8'), (5, 'X1'), (5, 'X2'), (5, 'X3'), (5, 'X4'), (5, 'X5'), (5, 'X6'), (5, 'X7'), (5, 'i3'), (5, 'i4'), (5, 'i7'), (5, 'iX'), (5, 'Z4')
ON CONFLICT (brand_id, name) DO NOTHING;

-- Mercedes (brand_id = 6)
INSERT INTO models (brand_id, name) VALUES
(6, 'Classe A'), (6, 'Classe B'), (6, 'Classe C'), (6, 'Classe E'), (6, 'Classe S'), (6, 'CLA'), (6, 'CLS'), (6, 'GLA'), (6, 'GLB'), (6, 'GLC'), (6, 'GLE'), (6, 'GLS'), (6, 'G'), (6, 'AMG GT'), (6, 'EQA'), (6, 'EQB'), (6, 'EQC'), (6, 'EQE'), (6, 'EQS')
ON CONFLICT (brand_id, name) DO NOTHING;

-- Audi (brand_id = 7)
INSERT INTO models (brand_id, name) VALUES
(7, 'A1'), (7, 'A3'), (7, 'A4'), (7, 'A5'), (7, 'A6'), (7, 'A7'), (7, 'A8'), (7, 'Q2'), (7, 'Q3'), (7, 'Q4'), (7, 'Q5'), (7, 'Q7'), (7, 'Q8'), (7, 'TT'), (7, 'R8'), (7, 'e-tron'), (7, 'e-tron GT')
ON CONFLICT (brand_id, name) DO NOTHING;

-- Ford (brand_id = 8)
INSERT INTO models (brand_id, name) VALUES
(8, 'Fiesta'), (8, 'Focus'), (8, 'Mondeo'), (8, 'Kuga'), (8, 'Puma'), (8, 'EcoSport'), (8, 'Edge'), (8, 'Explorer'), (8, 'Mustang'), (8, 'Transit'), (8, 'Ranger')
ON CONFLICT (brand_id, name) DO NOTHING;

-- Opel (brand_id = 9)
INSERT INTO models (brand_id, name) VALUES
(9, 'Corsa'), (9, 'Astra'), (9, 'Insignia'), (9, 'Mokka'), (9, 'Crossland'), (9, 'Grandland'), (9, 'Combo'), (9, 'Vivaro'), (9, 'Movano')
ON CONFLICT (brand_id, name) DO NOTHING;

-- Toyota (brand_id = 10)
INSERT INTO models (brand_id, name) VALUES
(10, 'Yaris'), (10, 'Corolla'), (10, 'Camry'), (10, 'C-HR'), (10, 'RAV4'), (10, 'Highlander'), (10, 'Prius'), (10, 'Auris'), (10, 'Avensis'), (10, 'Hilux'), (10, 'Proace')
ON CONFLICT (brand_id, name) DO NOTHING;

-- Honda (brand_id = 11)
INSERT INTO models (brand_id, name) VALUES
(11, 'Jazz'), (11, 'Civic'), (11, 'CR-V'), (11, 'HR-V'), (11, 'CR-Z'), (11, 'Insight'), (11, 'Accord'), (11, 'Pilot'), (11, 'Ridgeline')
ON CONFLICT (brand_id, name) DO NOTHING;

-- Nissan (brand_id = 12)
INSERT INTO models (brand_id, name) VALUES
(12, 'Micra'), (12, 'Juke'), (12, 'Qashqai'), (12, 'X-Trail'), (12, 'Leaf'), (12, 'Ariya'), (12, 'Note'), (12, 'Pulsar'), (12, 'Navara'), (12, 'NV200')
ON CONFLICT (brand_id, name) DO NOTHING;

-- Mazda (brand_id = 13)
INSERT INTO models (brand_id, name) VALUES
(13, '2'), (13, '3'), (13, '6'), (13, 'CX-3'), (13, 'CX-30'), (13, 'CX-5'), (13, 'CX-60'), (13, 'MX-30'), (13, 'MX-5')
ON CONFLICT (brand_id, name) DO NOTHING;

-- Volvo (brand_id = 14)
INSERT INTO models (brand_id, name) VALUES
(14, 'C40'), (14, 'XC40'), (14, 'XC60'), (14, 'XC90'), (14, 'S60'), (14, 'S90'), (14, 'V60'), (14, 'V90'), (14, 'EX30'), (14, 'EX90')
ON CONFLICT (brand_id, name) DO NOTHING;

-- Skoda (brand_id = 15)
INSERT INTO models (brand_id, name) VALUES
(15, 'Fabia'), (15, 'Octavia'), (15, 'Superb'), (15, 'Kamiq'), (15, 'Karoq'), (15, 'Kodiaq'), (15, 'Scala'), (15, 'Enyaq')
ON CONFLICT (brand_id, name) DO NOTHING;

-- Seat (brand_id = 16)
INSERT INTO models (brand_id, name) VALUES
(16, 'Ibiza'), (16, 'Leon'), (16, 'Arona'), (16, 'Ateca'), (16, 'Tarraco'), (16, 'Alhambra'), (16, 'Mii')
ON CONFLICT (brand_id, name) DO NOTHING;

-- Fiat (brand_id = 17)
INSERT INTO models (brand_id, name) VALUES
(17, '500'), (17, 'Panda'), (17, 'Tipo'), (17, '500X'), (17, '500L'), (17, 'Doblo'), (17, 'Scudo'), (17, 'Ducato')
ON CONFLICT (brand_id, name) DO NOTHING;

-- Alfa Romeo (brand_id = 18)
INSERT INTO models (brand_id, name) VALUES
(18, 'Giulietta'), (18, 'Giulia'), (18, 'Stelvio'), (18, 'Tonale'), (18, 'MiTo'), (18, '4C')
ON CONFLICT (brand_id, name) DO NOTHING;

-- Jaguar (brand_id = 19)
INSERT INTO models (brand_id, name) VALUES
(19, 'XE'), (19, 'XF'), (19, 'XJ'), (19, 'F-Pace'), (19, 'E-Pace'), (19, 'I-Pace'), (19, 'F-Type')
ON CONFLICT (brand_id, name) DO NOTHING;

-- Land Rover (brand_id = 20)
INSERT INTO models (brand_id, name) VALUES
(20, 'Range Rover'), (20, 'Range Rover Sport'), (20, 'Range Rover Evoque'), (20, 'Range Rover Velar'), (20, 'Discovery'), (20, 'Discovery Sport'), (20, 'Defender')
ON CONFLICT (brand_id, name) DO NOTHING;

-- Mini (brand_id = 21)
INSERT INTO models (brand_id, name) VALUES
(21, 'Cooper'), (21, 'Countryman'), (21, 'Clubman'), (21, 'Cabrio'), (21, 'Electric')
ON CONFLICT (brand_id, name) DO NOTHING;

-- Smart (brand_id = 22)
INSERT INTO models (brand_id, name) VALUES
(22, 'Fortwo'), (22, 'Forfour'), (22, 'EQ Fortwo'), (22, 'EQ Forfour')
ON CONFLICT (brand_id, name) DO NOTHING;

-- Tesla (brand_id = 23)
INSERT INTO models (brand_id, name) VALUES
(23, 'Model S'), (23, 'Model 3'), (23, 'Model X'), (23, 'Model Y'), (23, 'Cybertruck')
ON CONFLICT (brand_id, name) DO NOTHING;

-- Hyundai (brand_id = 24)
INSERT INTO models (brand_id, name) VALUES
(24, 'i10'), (24, 'i20'), (24, 'i30'), (24, 'i40'), (24, 'Tucson'), (24, 'Santa Fe'), (24, 'Kona'), (24, 'IONIQ'), (24, 'Bayon'), (24, 'Staria')
ON CONFLICT (brand_id, name) DO NOTHING;

-- Kia (brand_id = 25)
INSERT INTO models (brand_id, name) VALUES
(25, 'Picanto'), (25, 'Rio'), (25, 'Ceed'), (25, 'Sportage'), (25, 'Sorento'), (25, 'Niro'), (25, 'EV6'), (25, 'Soul'), (25, 'Stonic')
ON CONFLICT (brand_id, name) DO NOTHING;

-- Dacia (brand_id = 26)
INSERT INTO models (brand_id, name) VALUES
(26, 'Sandero'), (26, 'Logan'), (26, 'Duster'), (26, 'Spring'), (26, 'Jogger')
ON CONFLICT (brand_id, name) DO NOTHING;

-- DS (brand_id = 27)
INSERT INTO models (brand_id, name) VALUES
(27, 'DS 3'), (27, 'DS 4'), (27, 'DS 7'), (27, 'DS 9')
ON CONFLICT (brand_id, name) DO NOTHING;

-- Lexus (brand_id = 28)
INSERT INTO models (brand_id, name) VALUES
(28, 'CT'), (28, 'UX'), (28, 'NX'), (28, 'RX'), (28, 'ES'), (28, 'IS'), (28, 'LS'), (28, 'LC'), (28, 'RC'), (28, 'LBX')
ON CONFLICT (brand_id, name) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE car_types IS 'Types de véhicules disponibles dans le système';
COMMENT ON TABLE fuel_types IS 'Types de carburant disponibles';
COMMENT ON TABLE dossier_types IS 'Types de dossiers: DPV, REMA FR, REMA ALL, REMA BE, STOCK, REPRISE';
COMMENT ON TABLE brands IS 'Marques de véhicules avec leurs modèles associés';
COMMENT ON TABLE models IS 'Modèles de véhicules liés aux marques'; 