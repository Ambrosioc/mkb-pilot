'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Drawer, 
  DrawerClose, 
  DrawerContent, 
  DrawerDescription, 
  DrawerFooter, 
  DrawerHeader, 
  DrawerTitle 
} from '@/components/ui/drawer';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  FileText, 
  Loader2, 
  Mail, 
  Receipt, 
  Save, 
  X 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

// Schéma de validation pour le formulaire
const documentFormSchema = z.object({
  type: z.enum(['devis', 'facture']),
  contactId: z.string().min(1, 'Veuillez sélectionner un client'),
  date: z.string().min(1, 'La date est requise'),
  dueDate: z.string().optional(),
  items: z.array(
    z.object({
      description: z.string().min(1, 'La description est requise'),
      quantity: z.number().min(1, 'La quantité doit être au moins 1'),
      unitPrice: z.number().min(0, 'Le prix unitaire doit être positif'),
      taxRate: z.number().min(0, 'Le taux de TVA doit être positif'),
    })
  ).min(1, 'Au moins un article est requis'),
  notes: z.string().optional(),
  paymentTerms: z.string().optional(),
});

type DocumentFormValues = z.infer<typeof documentFormSchema>;

interface Contact {
  id: string;
  nom: string;
  email: string;
  telephone?: string;
  societe?: string;
}

interface Vehicle {
  id: string;
  reference: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  mileage?: number;
}

interface DocumentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleId: string;
  onSuccess?: () => void;
}

export function DocumentForm({ open, onOpenChange, vehicleId, onSuccess }: DocumentFormProps) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<{
    documentId: string;
    documentNumber: string;
    pdfBase64: string;
  } | null>(null);
  const [isSendEmailOpen, setIsSendEmailOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [sendCopy, setSendCopy] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Initialiser le formulaire
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      type: 'devis',
      contactId: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      items: [
        {
          description: '',
          quantity: 1,
          unitPrice: 0,
          taxRate: 20,
        },
      ],
      notes: '',
      paymentTerms: 'Paiement à réception',
    },
  });

  // Charger les données du véhicule et des contacts
  useEffect(() => {
    if (open && vehicleId) {
      const fetchData = async () => {
        setLoading(true);
        try {
          // Récupérer les informations du véhicule
          const { data: vehicleData, error: vehicleError } = await supabase
            .from('cars_v2')
            .select('id, reference, brand, model, year, color, mileage, price')
            .eq('id', vehicleId)
            .single();

          if (vehicleError) throw vehicleError;
          setVehicle(vehicleData);

          // Mettre à jour le prix dans le formulaire
          if (vehicleData.price) {
            const items = form.getValues('items');
            items[0].description = `${vehicleData.brand} ${vehicleData.model} (${vehicleData.year}) - Réf: ${vehicleData.reference}`;
            items[0].unitPrice = vehicleData.price;
            form.setValue('items', items);
          }

          // Récupérer la liste des contacts
          const { data: contactsData, error: contactsError } = await supabase
            .from('contacts')
            .select('id, nom, email, telephone, societe')
            .order('nom');

          if (contactsError) throw contactsError;
          setContacts(contactsData);
        } catch (error) {
          console.error('Erreur lors du chargement des données:', error);
          toast.error('Erreur lors du chargement des données');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [open, vehicleId, form]);

  // Mettre à jour le contact sélectionné
  useEffect(() => {
    const contactId = form.watch('contactId');
    if (contactId) {
      const contact = contacts.find(c => c.id === contactId);
      setSelectedContact(contact || null);
    } else {
      setSelectedContact(null);
    }
  }, [form.watch('contactId'), contacts]);

  // Gérer la soumission du formulaire
  const onSubmit = async (values: DocumentFormValues) => {
    if (!vehicle) {
      toast.error('Informations du véhicule manquantes');
      return;
    }

    setIsGenerating(true);

    try {
      // Trouver le contact sélectionné
      const selectedContact = contacts.find(c => c.id === values.contactId);
      if (!selectedContact) {
        throw new Error('Contact non trouvé');
      }

      // Préparer les données pour la génération du PDF
      const documentData = {
        type: values.type,
        number: `${values.type === 'devis' ? 'D' : 'F'}${format(new Date(), 'yyyyMMdd')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        date: new Date(values.date),
        dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
        customer: {
          name: selectedContact.nom,
          address: selectedContact.societe || '',
          email: selectedContact.email,
          phone: selectedContact.telephone || '',
        },
        vehicle: {
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          reference: vehicle.reference,
          color: vehicle.color,
          mileage: vehicle.mileage,
        },
        items: values.items,
        notes: values.notes,
        paymentTerms: values.paymentTerms,
        companyInfo: {
          name: 'MKB Automobile',
          address: '123 Avenue des Véhicules, 75000 Paris',
          phone: '01 23 45 67 89',
          email: 'contact@mkbautomobile.com',
          website: 'www.mkbautomobile.com',
          siret: '123 456 789 00012',
          tva: 'FR 12 345 678 901',
        },
      };

      // Appeler l'API pour générer le document
      const response = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify(documentData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la génération du document');
      }

      // Stocker les informations du document généré
      setGeneratedDocument({
        documentId: result.documentId,
        documentNumber: result.documentNumber,
        pdfBase64: result.pdfBase64,
      });

      toast.success(`${values.type === 'devis' ? 'Devis' : 'Facture'} généré avec succès`);
    } catch (error) {
      console.error('Erreur lors de la génération du document:', error);
      toast.error('Erreur lors de la génération du document');
    } finally {
      setIsGenerating(false);
    }
  };

  // Télécharger le PDF
  const handleDownload = () => {
    if (!generatedDocument) return;

    const documentType = form.getValues('type') === 'devis' ? 'Devis' : 'Facture';
    const fileName = `${documentType}_${generatedDocument.documentNumber}.pdf`;
    
    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${generatedDocument.pdfBase64}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`${documentType} téléchargé`);
  };

  // Ouvrir la boîte de dialogue d'envoi d'email
  const handleOpenSendEmail = () => {
    if (!generatedDocument || !selectedContact) return;
    setIsSendEmailOpen(true);
  };

  // Envoyer le document par email
  const handleSendEmail = async () => {
    if (!generatedDocument || !selectedContact) return;

    setIsSendingEmail(true);

    try {
      const documentType = form.getValues('type');
      const vehicleInfo = `${vehicle?.brand} ${vehicle?.model} (${vehicle?.year}) - Réf: ${vehicle?.reference}`;

      // Appeler l'API pour envoyer l'email
      const response = await fetch('/api/send-email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          documentId: generatedDocument.documentId,
          recipientEmail: selectedContact.email,
          recipientName: selectedContact.nom,
          documentType,
          documentNumber: generatedDocument.documentNumber,
          pdfBase64: generatedDocument.pdfBase64,
          vehicleInfo,
          message: emailMessage,
          sendCopy,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de l\'envoi de l\'email');
      }

      toast.success(`${documentType === 'devis' ? 'Devis' : 'Facture'} envoyé par email avec succès`);
      setIsSendEmailOpen(false);
      
      // Fermer le drawer après envoi réussi
      if (onSuccess) {
        onSuccess();
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      toast.error('Erreur lors de l\'envoi de l\'email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Ajouter un article
  const addItem = () => {
    const items = form.getValues('items');
    form.setValue('items', [
      ...items,
      {
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 20,
      },
    ]);
  };

  // Supprimer un article
  const removeItem = (index: number) => {
    const items = form.getValues('items');
    if (items.length > 1) {
      form.setValue('items', items.filter((_, i) => i !== index));
    }
  };

  // Calculer le total HT
  const calculateTotalHT = () => {
    const items = form.getValues('items');
    return items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  // Calculer le total TVA
  const calculateTotalTVA = () => {
    const items = form.getValues('items');
    return items.reduce((total, item) => total + (item.quantity * item.unitPrice * item.taxRate / 100), 0);
  };

  // Calculer le total TTC
  const calculateTotalTTC = () => {
    return calculateTotalHT() + calculateTotalTVA();
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[90vh] max-h-[90vh] p-0">
          <div className="flex flex-col h-full">
            <DrawerHeader className="border-b pb-4 px-4">
              <DrawerTitle className="text-xl font-bold text-mkb-black flex items-center gap-2">
                {form.watch('type') === 'devis' ? (
                  <FileText className="h-5 w-5 text-mkb-blue" />
                ) : (
                  <Receipt className="h-5 w-5 text-mkb-blue" />
                )}
                {form.watch('type') === 'devis' ? 'Créer un devis' : 'Créer une facture'}
              </DrawerTitle>
              <DrawerDescription>
                {vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.year}) - Réf: ${vehicle.reference}` : 'Chargement...'}
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto px-4 py-6">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 text-mkb-blue animate-spin" />
                </div>
              ) : generatedDocument ? (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-green-800">Document généré avec succès !</h3>
                      <p className="text-sm text-green-700 mt-1">
                        Votre {form.getValues('type') === 'devis' ? 'devis' : 'facture'} a été créé et est prêt à être téléchargé ou envoyé.
                      </p>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b flex items-center justify-between">
                      <h3 className="font-medium text-mkb-black">
                        {form.getValues('type') === 'devis' ? 'Devis' : 'Facture'} n° {generatedDocument.documentNumber}
                      </h3>
                    </div>
                    <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
                      <div className="bg-white shadow-lg w-[80%] h-[80%] flex flex-col items-center justify-center">
                        <FileText className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-gray-500">Aperçu du document</p>
                        <p className="text-xs text-gray-400 mt-2">
                          (Cliquez sur Télécharger pour voir le PDF)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <Button
                      className="w-full bg-mkb-blue hover:bg-mkb-blue/90"
                      onClick={handleDownload}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger le document
                    </Button>

                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={handleOpenSendEmail}
                      disabled={!selectedContact?.email}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Envoyer par email
                      {!selectedContact?.email && " (email manquant)"}
                    </Button>
                  </div>
                </div>
              ) : (
                <Form form={form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Tabs defaultValue="devis" onValueChange={(value) => form.setValue('type', value as 'devis' | 'facture')}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="devis">Devis</TabsTrigger>
                        <TabsTrigger value="facture">Facture</TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contactId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client *</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner un client" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {contacts.map(contact => (
                                  <SelectItem key={contact.id} value={contact.id}>
                                    {contact.nom} {contact.societe ? `(${contact.societe})` : ''}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date d'émission *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {form.watch('type') === 'facture' && (
                      <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date d'échéance</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-700">Articles</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addItem}
                        >
                          Ajouter un article
                        </Button>
                      </div>

                      {form.watch('items').map((_, index) => (
                        <div key={index} className="space-y-4 p-4 border rounded-md">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">Article {index + 1}</h4>
                            {index > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <FormField
                            control={form.control}
                            name={`items.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description *</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name={`items.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Quantité *</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="1"
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`items.${index}.unitPrice`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Prix unitaire (€) *</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`items.${index}.taxRate`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Taux TVA (%) *</FormLabel>
                                  <Select
                                    value={field.value.toString()}
                                    onValueChange={(value) => field.onChange(parseFloat(value))}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Taux de TVA" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="0">0%</SelectItem>
                                      <SelectItem value="5.5">5.5%</SelectItem>
                                      <SelectItem value="10">10%</SelectItem>
                                      <SelectItem value="20">20%</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Récapitulatif</h3>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Total HT</span>
                          <span>{calculateTotalHT().toLocaleString('fr-FR')} €</span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span>TVA</span>
                          <span>{calculateTotalTVA().toLocaleString('fr-FR')} €</span>
                        </div>

                        <div className="flex justify-between font-medium border-t pt-2 mt-2">
                          <span>Total TTC</span>
                          <span className="text-mkb-blue">{calculateTotalTTC().toLocaleString('fr-FR')} €</span>
                        </div>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Informations complémentaires..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentTerms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conditions de paiement</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              )}
            </div>

            <DrawerFooter className="border-t pt-4 px-4 mt-auto">
              <div className="flex justify-end gap-4">
                <DrawerClose asChild>
                  <Button variant="outline">
                    <X className="mr-2 h-4 w-4" />
                    Annuler
                  </Button>
                </DrawerClose>

                {!generatedDocument ? (
                  <Button
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isGenerating || loading}
                    className="bg-mkb-blue hover:bg-mkb-blue/90 text-white min-w-[140px]"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Génération...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Générer le {form.watch('type') === 'devis' ? 'devis' : 'la facture'}
                      </>
                    )}
                  </Button>
                ) : null}
              </div>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Dialogue d'envoi d'email */}
      <Dialog open={isSendEmailOpen} onOpenChange={setIsSendEmailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Envoyer par email</DialogTitle>
            <DialogDescription>
              Envoyer le document au client par email
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Informations d'envoi</h3>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Client</span>
                  <span className="font-medium">{selectedContact?.nom}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Email</span>
                  <span className="font-medium">{selectedContact?.email}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message (optionnel)</Label>
              <Textarea
                id="message"
                placeholder="Ajoutez un message personnalisé..."
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="send-copy"
                checked={sendCopy}
                onCheckedChange={setSendCopy}
              />
              <Label htmlFor="send-copy">M'envoyer une copie</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSendEmailOpen(false)} disabled={isSendingEmail}>
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
                  Envoyer l'email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}