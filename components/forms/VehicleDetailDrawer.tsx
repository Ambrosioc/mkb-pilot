'use client';

import { supabase } from '@/lib/supabase';
import {
  Car,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Loader2,
  Mail,
  Printer,
  Receipt,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { usePoleAccess } from '@/hooks/usePoleAccess';
import { arrayBufferToBase64, generateDocumentNumber, generateDocumentPDF } from '@/lib/pdf-generator';

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
  const [emailMessage, setEmailMessage] = useState('');

  // Vérifier les permissions pour la création de documents
  const { canWrite } = usePoleAccess('Stock');

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
      setEmailMessage('');
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
          brands(name),
          models(name)
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
    setDocumentForm({
      ...documentForm,
      type,
      customPrice: advertisement?.price || 0
    });
    setDocumentFormOpen(true);
  };

  const handleDocumentFormChange = (field: keyof DocumentFormData, value: any) => {
    setDocumentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateDocument = async () => {
    if (!vehicle || !documentForm.contactId) {
      toast.error('Veuillez sélectionner un client');
      return;
    }

    setIsGeneratingDocument(true);

    try {
      // Calculate final price with discount
      const basePrice = documentForm.customPrice || advertisement?.price || 0;
      const discountAmount = (basePrice * (documentForm.discount || 0)) / 100;
      const priceBeforeTax = basePrice - discountAmount;
      const vatAmount = (priceBeforeTax * documentForm.vatRate) / 100;
      const totalPrice = priceBeforeTax + vatAmount;

      console.log('🔧 [DOCUMENT] Génération du document:', {
        vehicle_id: vehicle.id,
        contact_id: documentForm.contactId,
        type: documentForm.type,
        base_price: basePrice,
        discount_percentage: documentForm.discount || 0,
        discount_amount: discountAmount,
        vat_rate: documentForm.vatRate,
        vat_amount: vatAmount,
        final_price: totalPrice
      });

      // Récupérer les informations du contact
      const selectedContact = contacts.find(c => c.id === documentForm.contactId);
      if (!selectedContact) {
        throw new Error('Contact non trouvé');
      }

      // Générer le numéro de document
      const documentNumber = generateDocumentNumber(documentForm.type);

      // Préparer les données pour le PDF
      const pdfDocumentData = {
        type: documentForm.type,
        number: documentNumber,
        date: new Date(documentForm.date),
        customer: {
          name: selectedContact.nom,
          email: selectedContact.email || '',
          phone: selectedContact.telephone || '',
          address: selectedContact.societe || '',
        },
        vehicle: {
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          reference: vehicle.reference,
          color: vehicle.color,
          mileage: vehicle.mileage,
        },
        items: [
          {
            description: `${vehicle.brand} ${vehicle.model} (${vehicle.year}) - ${vehicle.reference}`,
            quantity: 1,
            unitPrice: basePrice,
            taxRate: documentForm.vatRate,
          }
        ],
        notes: documentForm.notes,
        paymentTerms: documentForm.type === 'facture' ? 'Paiement à 30 jours' : 'Devis valable 30 jours',
        companyInfo: {
          name: 'MKB Automobile',
          address: '123 Rue de l\'Automobile, 75000 Paris',
          phone: '+33 1 23 45 67 89',
          email: 'contact@mkbautomobile.fr',
          website: 'www.mkbautomobile.fr',
          siret: '12345678901234',
          tva: 'FR12345678901',
        },
      };

      console.log('📄 [DOCUMENT] Génération du PDF...');

      // Générer le PDF
      const pdfBytes = await generateDocumentPDF(pdfDocumentData);
      const pdfBase64 = arrayBufferToBase64(pdfBytes);

      console.log('✅ [DOCUMENT] PDF généré avec succès');

      // Create document record in database
      const { data: documentData, error: documentError } = await supabase
        .from('sales_documents')
        .insert([
          {
            vehicle_id: vehicle.id,
            contact_id: documentForm.contactId,
            type: documentForm.type,
            number: documentNumber,
            date: documentForm.date,
            base_price: basePrice,
            discount_percentage: documentForm.discount || 0,
            discount_amount: discountAmount,
            vat_rate: documentForm.vatRate,
            vat_amount: vatAmount,
            final_price: totalPrice,
            notes: documentForm.notes,
            status: 'created',
            pdf_url: null,
            pdf_content: pdfBase64,
            sent_by_email: false
          }
        ])
        .select('id')
        .single();

      if (documentError) {
        console.error('❌ [DOCUMENT] Erreur lors de la création du document:', documentError);
        throw documentError;
      }

      console.log('✅ [DOCUMENT] Document créé avec succès:', documentData.id);

      // Créer l'URL du PDF pour l'affichage
      const pdfUrl = `/api/documents/${documentData.id}/pdf`;

      setDocumentId(documentData.id);
      setDocumentPreviewUrl(pdfUrl);
      toast.success(`${documentForm.type === 'devis' ? 'Devis' : 'Facture'} généré avec succès !`);

      // Close the form and show the preview
      setDocumentFormOpen(false);

    } catch (error) {
      console.error('❌ [DOCUMENT] Erreur lors de la génération du document:', error);
      toast.error(`Erreur lors de la génération du ${documentForm.type === 'devis' ? 'devis' : 'facture'}`);
    } finally {
      setIsGeneratingDocument(false);
    }
  };

  const handleSendEmail = async () => {
    if (!documentId || !vehicle) return;

    const selectedContact = contacts.find(c => c.id === documentForm.contactId);

    if (!selectedContact?.email) {
      toast.error('Le contact sélectionné n\'a pas d\'adresse email');
      return;
    }

    setIsSendingEmail(true);

    try {
      // Récupérer le contenu PDF du document
      const { data: documentData, error: documentError } = await supabase
        .from('sales_documents')
        .select('pdf_content, number, type')
        .eq('id', documentId)
        .single();

      if (documentError || !documentData?.pdf_content) {
        throw new Error('Impossible de récupérer le contenu du document');
      }

      // Préparer les informations du véhicule
      const vehicleInfo = `${vehicle.brand} ${vehicle.model} (${vehicle.year}) - ${vehicle.reference}`;

      // Envoyer l'email via l'API
      const response = await fetch('/api/send-email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          documentId,
          recipientEmail: selectedContact.email,
          recipientName: selectedContact.nom,
          documentType: documentData.type,
          documentNumber: documentData.number,
          pdfBase64: documentData.pdf_content,
          vehicleInfo,
          message: emailMessage || documentForm.notes || undefined,
          sendCopy: true // Envoyer une copie à l'utilisateur connecté
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de l\'envoi');
      }

      toast.success(`Document envoyé par email à ${selectedContact.email}`);
      setSendEmailOpen(false);

    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Erreur lors de l\'envoi de l\'email');
    } finally {
      setIsSendingEmail(false);
    }
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
                    {documentPreviewUrl ? (
                      <div className="space-y-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                          <div className="bg-green-100 p-2 rounded-full">
                            <FileText className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-green-800">Document généré avec succès !</h3>
                            <p className="text-sm text-green-700 mt-1">
                              Votre {documentForm.type === 'devis' ? 'devis' : 'facture'} a été créé et est prêt à être téléchargé ou envoyé.
                            </p>
                          </div>
                        </div>

                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-gray-50 p-4 border-b flex items-center justify-between">
                            <h3 className="font-medium text-mkb-black">
                              Aperçu du {documentForm.type === 'devis' ? 'devis' : 'facture'}
                            </h3>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (documentPreviewUrl) {
                                    const printWindow = window.open(documentPreviewUrl, '_blank');
                                    if (printWindow) {
                                      printWindow.onload = () => {
                                        printWindow.print();
                                      };
                                    }
                                  }
                                }}
                              >
                                <Printer className="h-4 w-4 mr-2" />
                                Imprimer
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (documentPreviewUrl) {
                                    window.open(documentPreviewUrl, '_blank');
                                  }
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Aperçu
                              </Button>
                            </div>
                          </div>
                          <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
                            {documentPreviewUrl ? (
                              <iframe
                                src={documentPreviewUrl}
                                className="w-full h-full border-0"
                                title="Aperçu du document"
                              />
                            ) : (
                              <div className="bg-white shadow-lg w-[80%] h-[80%] flex flex-col items-center justify-center">
                                <FileText className="h-16 w-16 text-gray-300 mb-4" />
                                <p className="text-gray-500">Chargement de l&apos;aperçu...</p>
                                <p className="text-xs text-gray-400 mt-2">
                                  Le PDF se charge dans l&apos;iframe ci-dessus
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-4">
                          <Button
                            className="w-full bg-mkb-blue hover:bg-mkb-blue/90"
                            onClick={() => window.open(documentPreviewUrl, '_blank')}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Télécharger le document
                          </Button>

                          <Button
                            className="w-full"
                            variant="outline"
                            onClick={() => setSendEmailOpen(true)}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Envoyer l&apos;email au client
                          </Button>
                        </div>
                      </div>
                    ) : canWrite ? (
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
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-700">Accès restreint</h3>
                        <p className="text-gray-500 mt-2">Vous n&apos;avez pas les permissions nécessaires pour créer des documents.</p>
                        <p className="text-sm text-gray-400 mt-1">Niveau requis : Écriture (niveau 4 ou moins)</p>
                      </div>
                    )}
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

      {/* Document Form Dialog */}
      <Dialog open={documentFormOpen} onOpenChange={setDocumentFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {documentType === 'devis' ? 'Créer un devis' : 'Créer une facture'}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations pour générer {documentType === 'devis' ? 'un devis' : 'une facture'} pour ce véhicule
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact">Client *</Label>
                <Select
                  value={documentForm.contactId}
                  onValueChange={(value) => handleDocumentFormChange('contactId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map(contact => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.nom} {contact.societe ? `(${contact.societe})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {documentForm.contactId && (
                  <div className="mt-2 text-xs text-gray-500">
                    {contacts.find(c => c.id === documentForm.contactId)?.email || 'Pas d&apos;email'}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="date">Date d&apos;émission *</Label>
                <Input
                  type="date"
                  value={documentForm.date}
                  onChange={(e) => handleDocumentFormChange('date', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Informations de prix</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="customPrice">Prix personnalisé (€)</Label>
                  <Input
                    type="number"
                    value={documentForm.customPrice}
                    onChange={(e) => handleDocumentFormChange('customPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label htmlFor="discount">Remise (%)</Label>
                  <Input
                    type="number"
                    value={documentForm.discount}
                    onChange={(e) => handleDocumentFormChange('discount', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label htmlFor="vatRate">Taux de TVA (%)</Label>
                  <Select
                    value={documentForm.vatRate.toString()}
                    onValueChange={(value) => handleDocumentFormChange('vatRate', parseFloat(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Taux de TVA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0%</SelectItem>
                      <SelectItem value="5.5">5.5%</SelectItem>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="20">20%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  placeholder="Informations complémentaires à inclure dans le document..."
                  value={documentForm.notes}
                  onChange={(e) => handleDocumentFormChange('notes', e.target.value)}
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Aperçu du prix</h3>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Prix de base</span>
                  <span>{formatPrice(documentForm.customPrice || advertisement?.price || 0)}</span>
                </div>

                {(documentForm.discount || 0) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Remise ({documentForm.discount}%)</span>
                    <span>-{formatPrice(((documentForm.customPrice || advertisement?.price || 0) * (documentForm.discount || 0)) / 100)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span>Prix HT</span>
                  <span>{formatPrice(
                    (documentForm.customPrice || advertisement?.price || 0) -
                    ((documentForm.customPrice || advertisement?.price || 0) * (documentForm.discount || 0)) / 100
                  )}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>TVA ({documentForm.vatRate}%)</span>
                  <span>{formatPrice(
                    ((documentForm.customPrice || advertisement?.price || 0) -
                      ((documentForm.customPrice || advertisement?.price || 0) * (documentForm.discount || 0)) / 100) *
                    (documentForm.vatRate / 100)
                  )}</span>
                </div>

                <div className="flex justify-between font-medium border-t pt-2 mt-2">
                  <span>Total TTC</span>
                  <span className="text-mkb-blue">{formatPrice(
                    ((documentForm.customPrice || advertisement?.price || 0) -
                      ((documentForm.customPrice || advertisement?.price || 0) * (documentForm.discount || 0)) / 100) *
                    (1 + (documentForm.vatRate / 100))
                  )}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDocumentFormOpen(false)}>
              Annuler
            </Button>
            <Button
              className="bg-mkb-blue hover:bg-mkb-blue/90"
              onClick={generateDocument}
              disabled={isGeneratingDocument || !documentForm.contactId}
            >
              {isGeneratingDocument ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Générer le {documentType === 'devis' ? 'devis' : 'facture'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={sendEmailOpen} onOpenChange={setSendEmailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Envoyer par email</DialogTitle>
            <DialogDescription>
              Envoyer le document au client par email
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Informations d&apos;envoi</h3>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Client</span>
                  <span className="font-medium">{contacts.find(c => c.id === documentForm.contactId)?.nom}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Email</span>
                  <span className="font-medium">{contacts.find(c => c.id === documentForm.contactId)?.email}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="send-copy" />
              <Label htmlFor="send-copy">M&apos;envoyer une copie</Label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setSendEmailOpen(false)}>
              Annuler
            </Button>
            <Button
              className="bg-mkb-blue hover:bg-mkb-blue/90"
              onClick={handleSendEmail}
              disabled={isSendingEmail}
            >
              {isSendingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Envoyer l&apos;email
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

