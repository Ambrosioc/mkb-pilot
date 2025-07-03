import { supabase } from '@/lib/supabase';
import {
  Car,
  ChevronRight,
  FileText,
  Loader2,
  Receipt,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

import { DocumentForm } from '@/components/forms/DocumentForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Types
interface VehicleDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleId?: string;
}

interface VehicleData {
  id: string;
  reference: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  color: string;
  type: string;
  location: string;
  price_purchase?: number;
  price?: number;
  status: string;
  first_registration?: string;
  fuel_type?: string;
  gearbox?: string;
  din_power?: number;
  fiscal_power?: number;
  nb_seats?: number;
  nb_doors?: number;
  average_consumption?: number;
  road_consumption?: number;
  city_consumption?: number;
  emissions?: number;
  created_at?: string;
  updated_at?: string;
  // Additional fields from joins
  brands?: { name: string };
  models?: { name: string };
}

interface AdvertisementData {
  id: string;
  car_id: string;
  title: string;
  description: string;
  price: number;
  photos: string[];
  created_at?: string;
  updated_at?: string;
}

interface ContactData {
  id: string;
  nom: string;
  email: string | null;
  telephone: string | null;
  societe: string | null;
  type: string;
}

interface DocumentFormData {
  contactId: string;
  date: string;
  type: 'devis' | 'facture';
  customPrice?: number;
  discount?: number;
  vatRate: number;
  notes?: string;
}

export function VehicleDetailDrawer({ open, onOpenChange, vehicleId }: VehicleDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [advertisement, setAdvertisement] = useState<AdvertisementData | null>(null);
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentType, setDocumentType] = useState<'devis' | 'facture' | null>(null);
  const [documentFormOpen, setDocumentFormOpen] = useState(false);
  const [documentForm, setDocumentForm] = useState<DocumentFormData>({
    contactId: '',
    date: new Date().toISOString().split('T')[0] || '',
    type: 'devis',
    vatRate: 20,
    customPrice: 0,
    discount: 0,
    notes: ''
  });
  const [isGeneratingDocument, setIsGeneratingDocument] = useState(false);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [sendEmailOpen, setSendEmailOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Fetch vehicle data when drawer opens
  React.useEffect(() => {
    if (open && vehicleId) {
      fetchVehicleData(vehicleId);
    } else {
      // Reset state when drawer closes
      setVehicle(null);
      setAdvertisement(null);
      setLoading(true);
      setActiveTab('details');
      setDocumentType(null);
      setDocumentFormOpen(false);
      setDocumentPreviewUrl(null);
      setDocumentId(null);
      setSendEmailOpen(false);
    }
  }, [open, vehicleId]);

  const fetchVehicleData = async (id: string) => {
    setLoading(true);
    try {
      // Fetch vehicle data with joins for brand and model names
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('cars_v2')
        .select(`
          *,
          brands!left(name),
          models!left(name)
        `)
        .eq('id', id)
        .single();

      if (vehicleError) throw vehicleError;

      // Transform the data to include brand and model names
      const transformedVehicle = {
        ...vehicleData,
        brand: (vehicleData.brands as any)?.name || 'N/A',
        model: (vehicleData.models as any)?.name || 'N/A'
      };

      setVehicle(transformedVehicle);

      // Fetch advertisement data
      const { data: adData, error: adError } = await supabase
        .from('advertisements')
        .select('*')
        .eq('car_id', id)
        .single();

      if (!adError && adData) {
        setAdvertisement(adData);
      } else {
        console.log('Aucune annonce trouvée pour ce véhicule:', adError?.message);
        setAdvertisement(null);
      }

      // Fetch contacts for document creation
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('id, nom, email, telephone, societe, type')
        .order('nom');

      if (!contactsError && contactsData) {
        setContacts(contactsData);
      } else {
        console.error('Erreur lors de la récupération des contacts:', contactsError);
        setContacts([]);
      }

    } catch (error) {
      console.error('Error fetching vehicle data:', error);
      toast.error('Erreur lors du chargement des données du véhicule');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = (type: 'devis' | 'facture') => {
    setDocumentType(type);
    setDocumentFormOpen(true);
  };

  const handleDocumentFormChange = (field: keyof DocumentFormData, value: any) => {
    setDocumentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponible': return 'bg-green-100 text-green-800';
      case 'reserve': case 'réservé': return 'bg-orange-100 text-orange-800';
      case 'vendu': return 'bg-blue-100 text-blue-800';
      case 'a-verifier': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'disponible': return 'Disponible';
      case 'reserve': case 'réservé': return 'Réservé';
      case 'vendu': return 'Vendu';
      case 'a-verifier': return 'À Vérifier';
      default: return 'Inconnu';
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return '€0';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[85vh] max-h-[85vh] p-0">
          <div className="flex flex-col h-full">
            <DrawerHeader className="border-b pb-4 px-4">
              <DrawerTitle className="text-xl font-bold text-mkb-black flex items-center gap-2">
                <Car className="h-5 w-5 text-mkb-blue" />
                {loading ? 'Chargement...' : `${vehicle?.brand} ${vehicle?.model} (${vehicle?.year})`}
              </DrawerTitle>
              <DrawerDescription>
                {loading ? 'Récupération des informations...' : `Référence: ${vehicle?.reference} • ${vehicle?.mileage?.toLocaleString()} km`}
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto px-4 py-6">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 text-mkb-blue animate-spin" />
                </div>
              ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="details">Détails</TabsTrigger>
                    <TabsTrigger value="advertisement">Annonce</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-6">
                    {/* Vehicle Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-mkb-black">Informations générales</h3>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-500">Marque</Label>
                            <p className="font-medium">{vehicle?.brand}</p>
                          </div>
                          <div>
                            <Label className="text-gray-500">Modèle</Label>
                            <p className="font-medium">{vehicle?.model}</p>
                          </div>
                          <div>
                            <Label className="text-gray-500">Année</Label>
                            <p className="font-medium">{vehicle?.year}</p>
                          </div>
                          <div>
                            <Label className="text-gray-500">Kilométrage</Label>
                            <p className="font-medium">{vehicle?.mileage?.toLocaleString()} km</p>
                          </div>
                          <div>
                            <Label className="text-gray-500">Couleur</Label>
                            <p className="font-medium">{vehicle?.color}</p>
                          </div>
                          <div>
                            <Label className="text-gray-500">Type</Label>
                            <p className="font-medium">{vehicle?.type}</p>
                          </div>
                          <div>
                            <Label className="text-gray-500">Localisation</Label>
                            <p className="font-medium">{vehicle?.location}</p>
                          </div>
                          <div>
                            <Label className="text-gray-500">Statut</Label>
                            <Badge className={getStatusColor(vehicle?.status || '')}>
                              {getStatusText(vehicle?.status || '')}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-mkb-black">Caractéristiques techniques</h3>

                        <div className="grid grid-cols-2 gap-4">
                          {vehicle?.first_registration && (
                            <div>
                              <Label className="text-gray-500">1ère immatriculation</Label>
                              <p className="font-medium">{vehicle.first_registration}</p>
                            </div>
                          )}
                          {vehicle?.fuel_type && (
                            <div>
                              <Label className="text-gray-500">Carburant</Label>
                              <p className="font-medium">{vehicle.fuel_type}</p>
                            </div>
                          )}
                          {vehicle?.gearbox && (
                            <div>
                              <Label className="text-gray-500">Boîte</Label>
                              <p className="font-medium">{vehicle.gearbox}</p>
                            </div>
                          )}
                          {vehicle?.din_power && (
                            <div>
                              <Label className="text-gray-500">Puissance DIN</Label>
                              <p className="font-medium">{vehicle.din_power} ch</p>
                            </div>
                          )}
                          {vehicle?.fiscal_power && (
                            <div>
                              <Label className="text-gray-500">Puissance fiscale</Label>
                              <p className="font-medium">{vehicle.fiscal_power} CV</p>
                            </div>
                          )}
                          {vehicle?.nb_seats && (
                            <div>
                              <Label className="text-gray-500">Places</Label>
                              <p className="font-medium">{vehicle.nb_seats}</p>
                            </div>
                          )}
                          {vehicle?.nb_doors && (
                            <div>
                              <Label className="text-gray-500">Portes</Label>
                              <p className="font-medium">{vehicle.nb_doors}</p>
                            </div>
                          )}
                          {vehicle?.emissions && (
                            <div>
                              <Label className="text-gray-500">Émissions CO2</Label>
                              <p className="font-medium">{vehicle.emissions} g/km</p>
                            </div>
                          )}
                        </div>

                        {(vehicle?.average_consumption || vehicle?.road_consumption || vehicle?.city_consumption) && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Consommation</h4>
                            <div className="grid grid-cols-3 gap-2">
                              {vehicle?.average_consumption && (
                                <div className="bg-gray-50 p-2 rounded text-center">
                                  <p className="text-xs text-gray-500">Mixte</p>
                                  <p className="font-medium">{vehicle.average_consumption} L/100km</p>
                                </div>
                              )}
                              {vehicle?.road_consumption && (
                                <div className="bg-gray-50 p-2 rounded text-center">
                                  <p className="text-xs text-gray-500">Route</p>
                                  <p className="font-medium">{vehicle.road_consumption} L/100km</p>
                                </div>
                              )}
                              {vehicle?.city_consumption && (
                                <div className="bg-gray-50 p-2 rounded text-center">
                                  <p className="text-xs text-gray-500">Ville</p>
                                  <p className="font-medium">{vehicle.city_consumption} L/100km</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-mkb-black">Informations commerciales</h3>

                        <div className="grid grid-cols-2 gap-4">
                          {vehicle?.price_purchase && (
                            <div>
                              <Label className="text-gray-500">Prix d&apos;achat</Label>
                              <p className="font-medium">{formatPrice(vehicle.price_purchase)}</p>
                            </div>
                          )}
                          {vehicle?.price && (
                            <div>
                              <Label className="text-gray-500">Prix de vente</Label>
                              <p className="font-medium">{formatPrice(vehicle.price)}</p>
                            </div>
                          )}
                          {advertisement?.price && (
                            <div>
                              <Label className="text-gray-500">Prix annonce</Label>
                              <p className="font-medium">{formatPrice(advertisement.price)}</p>
                            </div>
                          )}
                          {vehicle?.created_at && (
                            <div>
                              <Label className="text-gray-500">Date d&apos;ajout</Label>
                              <p className="font-medium">{new Date(vehicle.created_at).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="advertisement" className="space-y-6">
                    {advertisement ? (
                      <>
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-mkb-black">Annonce</h3>

                          <div className="space-y-4">
                            <div>
                              <Label className="text-gray-500">Titre</Label>
                              <p className="font-medium">{advertisement.title}</p>
                            </div>

                            <div>
                              <Label className="text-gray-500">Description</Label>
                              <div className="bg-gray-50 p-3 rounded-md mt-1">
                                <p className="text-sm whitespace-pre-line">{advertisement.description}</p>
                              </div>
                            </div>

                            <div>
                              <Label className="text-gray-500">Prix affiché</Label>
                              <p className="font-medium text-lg text-mkb-blue">{formatPrice(advertisement.price)}</p>
                            </div>
                          </div>
                        </div>

                        {advertisement.photos && advertisement.photos.length > 0 && (
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-mkb-black">Photos</h3>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {advertisement.photos.map((photo, index) => (
                                <div key={index} className="aspect-video rounded-md overflow-hidden bg-gray-100">
                                  <img
                                    src={photo}
                                    alt={`${vehicle?.brand} ${vehicle?.model}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-700">Aucune annonce associée</h3>
                        <p className="text-gray-500 mt-2">Ce véhicule n&apos;a pas d&apos;annonce publiée.</p>
                        <Button className="mt-4 bg-mkb-blue hover:bg-mkb-blue/90">
                          Créer une annonce
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="documents" className="space-y-6">
                    <div className="space-y-6">
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-700">Créer un document</h3>
                        <p className="text-gray-500 mt-2">Générez un devis ou une facture pour ce véhicule.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                          className="h-20 bg-mkb-blue hover:bg-mkb-blue/90"
                          onClick={() => handleCreateDocument('devis')}
                        >
                          <FileText className="h-6 w-6 mr-3" />
                          <div className="text-left">
                            <div className="font-medium">Créer un devis</div>
                            <div className="text-xs opacity-90">Générer un devis pour ce véhicule</div>
                          </div>
                        </Button>

                        <Button
                          className="h-20 bg-mkb-yellow hover:bg-mkb-yellow/90 text-mkb-black"
                          onClick={() => handleCreateDocument('facture')}
                        >
                          <Receipt className="h-6 w-6 mr-3" />
                          <div className="text-left">
                            <div className="font-medium">Créer une facture</div>
                            <div className="text-xs opacity-90">Générer une facture pour ce véhicule</div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>

            <DrawerFooter className="border-t pt-4 px-4 mt-auto">
              <div className="flex justify-end gap-4">
                <DrawerClose asChild>
                  <Button variant="outline">
                    <X className="mr-2 h-4 w-4" />
                    Fermer
                  </Button>
                </DrawerClose>

                {activeTab === 'details' && (
                  <Button
                    className="bg-mkb-blue hover:bg-mkb-blue/90 text-white"
                    onClick={() => setActiveTab('advertisement')}
                  >
                    Voir l&apos;annonce
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}

                {activeTab === 'advertisement' && (
                  <Button
                    className="bg-mkb-blue hover:bg-mkb-blue/90 text-white"
                    onClick={() => setActiveTab('documents')}
                  >
                    Créer un document
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Document Form */}
      {documentFormOpen && vehicleId && (
        <DocumentForm
          open={documentFormOpen}
          onOpenChange={setDocumentFormOpen}
          vehicleId={vehicleId}
          onSuccess={() => {
            // Refresh data after document creation
            if (vehicleId) {
              fetchVehicleData(vehicleId);
            }
          }}
        />
      )}
    </>
  );
}