'use client';

import { supabase } from '@/lib/supabase';
import {
    Archive,
    Calendar,
    Car,
    ChevronRight,
    Clock,
    Download,
    Edit,
    Eye,
    FileText,
    Loader2,
    Mail,
    MessageSquare,
    Phone,
    Plus,
    Receipt,
    Send,
    User,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { TagManager } from '@/components/ui/TagManager';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

// Types
interface ContactDetailDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contactId?: string;
    onContactUpdated?: () => void;
    onVehicleClick?: (vehicleId: string) => void;
}

interface Contact {
    id: string;
    nom: string;
    email: string | null;
    telephone: string | null;
    societe: string | null;
    type: string;
    statut: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

interface Interaction {
    id: string;
    contact_id: string;
    type: string;
    date: string;
    description: string;
    created_at: string;
    updated_at: string;
}

interface Vehicle {
    id: string;
    brand: string;
    model: string;
    year: number;
    reference: string;
}

interface Document {
    id: string;
    type: string;
    date: string;
    final_price: number;
    status: string;
    number: string;
    vehicle_id: string;
    // Vehicle data from join
    cars_v2?: any;
}

export function ContactDetailDrawer({ open, onOpenChange, contactId, onContactUpdated, onVehicleClick }: ContactDetailDrawerProps) {
    const [activeTab, setActiveTab] = useState('details');
    const [contact, setContact] = useState<Contact | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [interactions, setInteractions] = useState<Interaction[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContact, setEditedContact] = useState<Partial<Contact>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [isAddingNoteLoading, setIsAddingNoteLoading] = useState(false);
    const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [sendingDocumentId, setSendingDocumentId] = useState<string | null>(null);

    // Fetch contact data when drawer opens
    useEffect(() => {
        if (open && contactId) {
            fetchContactData(contactId);
        } else {
            // Reset state when drawer closes
            setContact(null);
            setTags([]);
            setInteractions([]);
            setVehicles([]);
            setDocuments([]);
            setLoading(true);
            setActiveTab('details');
            setIsEditing(false);
            setEditedContact({});
            setIsAddingNote(false);
            setNewNote('');
        }
    }, [open, contactId]);

    const fetchContactData = async (id: string) => {
        setLoading(true);
        try {
            // Fetch contact data
            const { data: contactData, error: contactError } = await supabase
                .from('contacts')
                .select('*')
                .eq('id', id)
                .single();

            if (contactError) throw contactError;
            setContact(contactData);
            setEditedContact(contactData);

            // Fetch tags
            const { data: tagsData, error: tagsError } = await supabase
                .from('contact_tags')
                .select('tag')
                .eq('contact_id', id);

            if (!tagsError && tagsData) {
                setTags(tagsData.map(t => t.tag));
            }

            // Fetch interactions
            const { data: interactionsData, error: interactionsError } = await supabase
                .from('contact_interactions')
                .select('*')
                .eq('contact_id', id)
                .order('date', { ascending: false });

            if (!interactionsError && interactionsData) {
                setInteractions(interactionsData);
            }

            // Fetch documents (devis and factures) for this contact
            const { data: documentsData, error: documentsError } = await supabase
                .from('sales_documents')
                .select(`
                    id,
                    type,
                    date,
                    final_price,
                    status,
                    number,
                    vehicle_id,
                    cars_v2!vehicle_id(
                        reference,
                        year,
                        brands(name),
                        models(name)
                    )
                `)
                .eq('contact_id', id)
                .order('date', { ascending: false });

            if (!documentsError && documentsData) {
                setDocuments(documentsData as any);
            } else {
                console.error('Erreur lors de la récupération des documents:', documentsError);
                setDocuments([]);
            }

            // Extract unique vehicles from documents
            const uniqueVehicles = new Map();
            if (documentsData) {
                documentsData.forEach((doc: any) => {
                    if (doc.cars_v2 && doc.vehicle_id && !uniqueVehicles.has(doc.vehicle_id)) {
                        uniqueVehicles.set(doc.vehicle_id, {
                            id: doc.vehicle_id,
                            brand: doc.cars_v2.brands?.name || 'N/A',
                            model: doc.cars_v2.models?.name || 'N/A',
                            year: doc.cars_v2.year,
                            reference: doc.cars_v2.reference
                        });
                    }
                });
            }
            setVehicles(Array.from(uniqueVehicles.values()));

        } catch (error) {
            console.error('Error fetching contact data:', error);
            toast.error('Erreur lors du chargement des données du contact');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveChanges = async () => {
        if (!contact) return;

        setIsSaving(true);

        try {
            // Update contact in database
            const { error } = await supabase
                .from('contacts')
                .update(editedContact)
                .eq('id', contact.id);

            if (error) throw error;

            // Update local state
            setContact({ ...contact, ...editedContact });
            setIsEditing(false);

            toast.success('Contact mis à jour avec succès');

            // Notify parent component
            if (onContactUpdated) {
                onContactUpdated();
            }

        } catch (error) {
            console.error('Error updating contact:', error);
            toast.error('Erreur lors de la mise à jour du contact');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddNote = async () => {
        if (!contact || !newNote.trim()) return;

        setIsAddingNoteLoading(true);

        try {
            // Add note as an interaction
            const { error } = await supabase
                .from('contact_interactions')
                .insert({
                    contact_id: contact.id,
                    type: 'note',
                    date: new Date().toISOString().split('T')[0],
                    description: newNote
                });

            if (error) throw error;

            // Refresh interactions
            const { data: interactionsData } = await supabase
                .from('contact_interactions')
                .select('*')
                .eq('contact_id', contact.id)
                .order('date', { ascending: false });

            if (interactionsData) {
                setInteractions(interactionsData);
            }

            setNewNote('');
            setIsAddingNote(false);
            toast.success('Note ajoutée avec succès');

        } catch (error) {
            console.error('Error adding note:', error);
            toast.error('Erreur lors de l\'ajout de la note');
        } finally {
            setIsAddingNoteLoading(false);
        }
    };

    const handleArchiveContact = async () => {
        if (!contact) return;

        setIsArchiving(true);

        try {
            // Update contact status to 'archivé'
            const { error } = await supabase
                .from('contacts')
                .update({ statut: 'archivé' })
                .eq('id', contact.id);

            if (error) throw error;

            toast.success('Contact archivé avec succès');

            // Close dialogs and drawer
            setIsArchiveDialogOpen(false);
            onOpenChange(false);

            // Notify parent component
            if (onContactUpdated) {
                onContactUpdated();
            }

        } catch (error) {
            console.error('Error archiving contact:', error);
            toast.error('Erreur lors de l\'archivage du contact');
        } finally {
            setIsArchiving(false);
        }
    };

    const handleUnarchiveContact = async () => {
        if (!contact) return;

        setIsArchiving(true);

        try {
            // Update contact status to 'actif'
            const { error } = await supabase
                .from('contacts')
                .update({ statut: 'actif' })
                .eq('id', contact.id);

            if (error) throw error;

            toast.success('Contact désarchivé avec succès');

            // Close dialogs and drawer
            setIsArchiveDialogOpen(false);
            onOpenChange(false);

            // Notify parent component
            if (onContactUpdated) {
                onContactUpdated();
            }

        } catch (error) {
            console.error('Error unarchiving contact:', error);
            toast.error('Erreur lors de la désarchivage du contact');
        } finally {
            setIsArchiving(false);
        }
    };

    const handleTagsChange = (newTags: string[]) => {
        setTags(newTags);

        // Notify parent component
        if (onContactUpdated) {
            onContactUpdated();
        }
    };

    const handleVehicleClick = (vehicleId: string) => {
        if (onVehicleClick) {
            onVehicleClick(vehicleId);
        }
    };

    const handleViewDocument = (documentId: string) => {
        // Open document in new tab
        window.open(`/api/documents/${documentId}/pdf`, '_blank');
    };

    const handleDownloadDocument = (documentId: string) => {
        // Download document
        const link = document.createElement('a');
        link.href = `/api/documents/${documentId}/pdf`;
        link.download = `document-${documentId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSendDocumentByEmail = async (document: Document) => {
        if (!contact?.email) {
            toast.error('Ce contact n\'a pas d\'adresse email');
            return;
        }

        setIsSendingEmail(true);
        setSendingDocumentId(document.id);

        try {
            // Récupérer le contenu PDF du document
            const { data: documentData, error: documentError } = await supabase
                .from('sales_documents')
                .select('pdf_content, number, type')
                .eq('id', document.id)
                .single();

            if (documentError || !documentData?.pdf_content) {
                throw new Error('Impossible de récupérer le contenu du document');
            }

            // Préparer les informations du véhicule
            const vehicleInfo = document.cars_v2
                ? `${document.cars_v2.brands?.name} ${document.cars_v2.models?.name} (${document.cars_v2.year}) - ${document.cars_v2.reference}`
                : 'Véhicule non spécifié';

            // Envoyer l'email via l'API
            const response = await fetch('/api/send-email', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                },
                body: JSON.stringify({
                    documentId: document.id,
                    recipientEmail: contact.email,
                    recipientName: contact.nom,
                    documentType: documentData.type,
                    documentNumber: documentData.number,
                    pdfBase64: documentData.pdf_content,
                    vehicleInfo,
                    message: undefined,
                    sendCopy: false
                })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Erreur lors de l\'envoi');
            }

            toast.success(`${document.type === 'devis' ? 'Devis' : 'Facture'} envoyé par email avec succès`);

            // Rafraîchir les données du contact pour mettre à jour le statut
            if (contactId) {
                fetchContactData(contactId);
            }

        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email:', error);
            toast.error('Erreur lors de l\'envoi de l\'email');
        } finally {
            setIsSendingEmail(false);
            setSendingDocumentId(null);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Client particulier': return 'bg-blue-100 text-blue-800';
            case 'Client pro': return 'bg-purple-100 text-purple-800';
            case 'Lead': return 'bg-yellow-100 text-yellow-800';
            case 'Partenaire': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'actif': return 'bg-green-100 text-green-800';
            case 'prospect': return 'bg-orange-100 text-orange-800';
            case 'inactif': return 'bg-gray-100 text-gray-800';
            case 'archivé': return 'bg-gray-100 text-gray-600';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getInteractionIcon = (type: string) => {
        switch (type) {
            case 'note': return MessageSquare;
            case 'email': return Mail;
            case 'call': return Phone;
            case 'meeting': return Calendar;
            default: return Clock;
        }
    };

    const getInteractionColor = (type: string) => {
        switch (type) {
            case 'note': return 'text-purple-500';
            case 'email': return 'text-blue-500';
            case 'call': return 'text-green-500';
            case 'meeting': return 'text-orange-500';
            default: return 'text-gray-500';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <>
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="h-[85vh] max-h-[85vh] p-0">
                    <div className="flex flex-col h-full">
                        <DrawerHeader className="border-b pb-4 px-4">
                            <DrawerTitle className="text-xl font-bold text-mkb-black flex items-center gap-2">
                                <User className="h-5 w-5 text-mkb-blue" />
                                {loading ? 'Chargement...' : contact?.nom}
                            </DrawerTitle>
                            <DrawerDescription>
                                {loading ? 'Récupération des informations...' : (
                                    contact?.societe ? `${contact.societe} • ${contact.type}` : contact?.type
                                )}
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
                                        <TabsTrigger value="interactions">Interactions</TabsTrigger>
                                        <TabsTrigger value="related">Éléments liés</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="details" className="space-y-6">
                                        {/* Contact Details */}
                                        {isEditing ? (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="nom">Nom complet</Label>
                                                        <Input
                                                            id="nom"
                                                            value={editedContact.nom || ''}
                                                            onChange={(e) => setEditedContact({ ...editedContact, nom: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="societe">Société</Label>
                                                        <Input
                                                            id="societe"
                                                            value={editedContact.societe || ''}
                                                            onChange={(e) => setEditedContact({ ...editedContact, societe: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="email">Email</Label>
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            value={editedContact.email || ''}
                                                            onChange={(e) => setEditedContact({ ...editedContact, email: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="telephone">Téléphone</Label>
                                                        <Input
                                                            id="telephone"
                                                            value={editedContact.telephone || ''}
                                                            onChange={(e) => setEditedContact({ ...editedContact, telephone: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="type">Type</Label>
                                                        <select
                                                            id="type"
                                                            className="w-full rounded-md border border-input bg-background px-3 py-2"
                                                            value={editedContact.type || ''}
                                                            onChange={(e) => setEditedContact({ ...editedContact, type: e.target.value })}
                                                        >
                                                            <option value="Client particulier">Client particulier</option>
                                                            <option value="Client pro">Client professionnel</option>
                                                            <option value="Lead">Lead</option>
                                                            <option value="Partenaire">Partenaire</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="statut">Statut</Label>
                                                        <select
                                                            id="statut"
                                                            className="w-full rounded-md border border-input bg-background px-3 py-2"
                                                            value={editedContact.statut || ''}
                                                            onChange={(e) => setEditedContact({ ...editedContact, statut: e.target.value })}
                                                        >
                                                            <option value="actif">Actif</option>
                                                            <option value="prospect">Prospect</option>
                                                            <option value="inactif">Inactif</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label htmlFor="notes">Notes</Label>
                                                    <Textarea
                                                        id="notes"
                                                        value={editedContact.notes || ''}
                                                        onChange={(e) => setEditedContact({ ...editedContact, notes: e.target.value })}
                                                        className="min-h-[120px]"
                                                    />
                                                </div>

                                                <div className="flex justify-end gap-3 pt-4">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => {
                                                            setIsEditing(false);
                                                            setEditedContact(contact || {});
                                                        }}
                                                    >
                                                        Annuler
                                                    </Button>
                                                    <Button
                                                        className="bg-mkb-blue hover:bg-mkb-blue/90"
                                                        onClick={handleSaveChanges}
                                                        disabled={isSaving}
                                                    >
                                                        {isSaving ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Enregistrement...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Enregistrer
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="flex justify-between">
                                                    <h3 className="text-lg font-semibold text-mkb-black">Informations de contact</h3>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setIsEditing(true)}
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Modifier
                                                    </Button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <div>
                                                            <Label className="text-gray-500">Nom complet</Label>
                                                            <p className="font-medium">{contact?.nom}</p>
                                                        </div>

                                                        {contact?.societe && (
                                                            <div>
                                                                <Label className="text-gray-500">Société</Label>
                                                                <p className="font-medium">{contact.societe}</p>
                                                            </div>
                                                        )}

                                                        <div>
                                                            <Label className="text-gray-500">Type</Label>
                                                            <Badge className={getTypeColor(contact?.type || '')}>
                                                                {contact?.type}
                                                            </Badge>
                                                        </div>

                                                        <div>
                                                            <Label className="text-gray-500">Statut</Label>
                                                            <Badge className={getStatusColor(contact?.statut || '')}>
                                                                {contact?.statut ? contact.statut.charAt(0).toUpperCase() + contact.statut.slice(1) : ''}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        {contact?.email && (
                                                            <div>
                                                                <Label className="text-gray-500">Email</Label>
                                                                <div className="flex items-center gap-2">
                                                                    <Mail className="h-4 w-4 text-gray-400" />
                                                                    <a
                                                                        href={`mailto:${contact.email}`}
                                                                        className="font-medium text-mkb-blue hover:underline"
                                                                    >
                                                                        {contact.email}
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {contact?.telephone && (
                                                            <div>
                                                                <Label className="text-gray-500">Téléphone</Label>
                                                                <div className="flex items-center gap-2">
                                                                    <Phone className="h-4 w-4 text-gray-400" />
                                                                    <a
                                                                        href={`tel:${contact.telephone}`}
                                                                        className="font-medium text-mkb-blue hover:underline"
                                                                    >
                                                                        {contact.telephone}
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div>
                                                            <Label className="text-gray-500">Date de création</Label>
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                                <p className="font-medium">
                                                                    {formatDate(contact?.created_at || '')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {contact?.notes && (
                                                    <div className="mt-6">
                                                        <Label className="text-gray-500">Notes</Label>
                                                        <div className="bg-gray-50 p-4 rounded-lg mt-1">
                                                            <p className="text-sm whitespace-pre-line">{contact.notes}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="mt-6">
                                                    <Label className="text-gray-500 mb-2 block">Tags</Label>
                                                    {contactId && (
                                                        <TagManager
                                                            contactId={contactId}
                                                            existingTags={tags}
                                                            onTagsChange={handleTagsChange}
                                                        />
                                                    )}
                                                </div>

                                                <div className="mt-6 pt-6 border-t">
                                                    <h3 className="text-lg font-semibold text-mkb-black mb-4">Actions rapides</h3>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                        {contact?.email && (
                                                            <Button
                                                                variant="outline"
                                                                className="justify-start"
                                                                asChild
                                                            >
                                                                <a href={`mailto:${contact.email}`}>
                                                                    <Mail className="mr-2 h-4 w-4" />
                                                                    Envoyer un email
                                                                </a>
                                                            </Button>
                                                        )}

                                                        {contact?.telephone && (
                                                            <Button
                                                                variant="outline"
                                                                className="justify-start"
                                                                asChild
                                                            >
                                                                <a href={`tel:${contact.telephone}`}>
                                                                    <Phone className="mr-2 h-4 w-4" />
                                                                    Appeler
                                                                </a>
                                                            </Button>
                                                        )}

                                                        <Button
                                                            variant="outline"
                                                            className="justify-start"
                                                            onClick={() => setIsAddingNote(true)}
                                                        >
                                                            <MessageSquare className="mr-2 h-4 w-4" />
                                                            Ajouter une note
                                                        </Button>

                                                        {contact?.statut === 'archivé' ? (
                                                            <Button
                                                                variant="outline"
                                                                className="justify-start border-green-200 text-green-600 hover:bg-green-50"
                                                                onClick={() => setIsArchiveDialogOpen(true)}
                                                            >
                                                                <Archive className="mr-2 h-4 w-4" />
                                                                Désarchiver le contact
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="outline"
                                                                className="justify-start border-red-200 text-red-600 hover:bg-red-50"
                                                                onClick={() => setIsArchiveDialogOpen(true)}
                                                            >
                                                                <Archive className="mr-2 h-4 w-4" />
                                                                Archiver le contact
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="interactions" className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-semibold text-mkb-black">Historique des interactions</h3>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setIsAddingNote(true)}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Ajouter
                                            </Button>
                                        </div>

                                        {isAddingNote ? (
                                            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                                                <h4 className="font-medium text-gray-700">Ajouter une note</h4>

                                                <Textarea
                                                    placeholder="Saisissez votre note ici..."
                                                    value={newNote}
                                                    onChange={(e) => setNewNote(e.target.value)}
                                                    className="min-h-[120px]"
                                                />

                                                <div className="flex justify-end gap-3">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => {
                                                            setIsAddingNote(false);
                                                            setNewNote('');
                                                        }}
                                                    >
                                                        Annuler
                                                    </Button>
                                                    <Button
                                                        className="bg-mkb-blue hover:bg-mkb-blue/90"
                                                        onClick={handleAddNote}
                                                        disabled={isAddingNoteLoading || !newNote.trim()}
                                                    >
                                                        {isAddingNoteLoading ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Enregistrement...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Plus className="mr-2 h-4 w-4" />
                                                                Ajouter
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : null}

                                        {interactions.length === 0 ? (
                                            <div className="text-center py-12">
                                                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                                <h3 className="text-lg font-medium text-gray-700">Aucune interaction</h3>
                                                <p className="text-gray-500 mt-2">Ajoutez des notes, appels ou emails pour suivre vos échanges.</p>
                                                <Button
                                                    className="mt-4 bg-mkb-blue hover:bg-mkb-blue/90"
                                                    onClick={() => setIsAddingNote(true)}
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Ajouter une note
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {interactions.map((interaction, index) => {
                                                    const InteractionIcon = getInteractionIcon(interaction.type);

                                                    return (
                                                        <div key={interaction.id} className="flex gap-4">
                                                            <div className="flex flex-col items-center">
                                                                <div className={`p-2 rounded-full ${interaction.type === 'note' ? 'bg-purple-100' :
                                                                    interaction.type === 'email' ? 'bg-blue-100' :
                                                                        interaction.type === 'call' ? 'bg-green-100' :
                                                                            'bg-gray-100'
                                                                    }`}>
                                                                    <InteractionIcon className={`h-4 w-4 ${getInteractionColor(interaction.type)}`} />
                                                                </div>
                                                                {index < interactions.length - 1 && (
                                                                    <div className="w-px h-full bg-gray-200 my-2"></div>
                                                                )}
                                                            </div>

                                                            <div className="flex-1 pb-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="font-medium text-gray-900">
                                                                        {interaction.type === 'note' ? 'Note' :
                                                                            interaction.type === 'email' ? 'Email' :
                                                                                interaction.type === 'call' ? 'Appel' :
                                                                                    interaction.type === 'meeting' ? 'Rendez-vous' :
                                                                                        'Interaction'}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {formatDate(interaction.date)}
                                                                    </div>
                                                                </div>
                                                                <p className="text-sm text-gray-700 mt-1">
                                                                    {interaction.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="related" className="space-y-6">
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-lg font-semibold text-mkb-black mb-4">Véhicules liés</h3>

                                                {vehicles.length === 0 ? (
                                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                                        <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                                        <h3 className="text-lg font-medium text-gray-700">Aucun véhicule lié</h3>
                                                        <p className="text-gray-500 mt-2">Ce contact n&apos;a pas de véhicule associé.</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {vehicles.map(vehicle => (
                                                            <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                                <div className="flex items-center gap-3">
                                                                    <Car className="h-5 w-5 text-mkb-blue" />
                                                                    <div>
                                                                        <p className="font-medium text-mkb-black">
                                                                            {vehicle.brand} {vehicle.model} ({vehicle.year})
                                                                        </p>
                                                                        <p className="text-xs text-gray-500">
                                                                            Réf: {vehicle.reference}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleVehicleClick(vehicle.id)}
                                                                    title="Voir le véhicule"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-semibold text-mkb-black mb-4">Documents</h3>

                                                {documents.length === 0 ? (
                                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                                        <h3 className="text-lg font-medium text-gray-700">Aucun document</h3>
                                                        <p className="text-gray-500 mt-2">Ce contact n&apos;a pas de document associé.</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {documents.map(document => (
                                                            <div key={document.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                                <div className="flex items-center gap-3">
                                                                    {document.type === 'devis' ? (
                                                                        <FileText className="h-5 w-5 text-mkb-blue" />
                                                                    ) : (
                                                                        <Receipt className="h-5 w-5 text-mkb-yellow" />
                                                                    )}
                                                                    <div>
                                                                        <p className="font-medium text-mkb-black">
                                                                            {document.type === 'devis' ? 'Devis' : 'Facture'} {document.number}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500">
                                                                            {formatDate(document.date)}
                                                                            {' • '}
                                                                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(document.final_price)}
                                                                            {' • '}
                                                                            {document.status === 'sent' ? 'Envoyé' :
                                                                                document.status === 'paid' ? 'Payé' :
                                                                                    document.status === 'created' ? 'Créé' :
                                                                                        document.status}
                                                                        </p>
                                                                        {document.cars_v2 && (
                                                                            <p className="text-xs text-gray-400 mt-1">
                                                                                {document.cars_v2.brands?.name} {document.cars_v2.models?.name} ({document.cars_v2.year}) - {document.cars_v2.reference}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleViewDocument(document.id)}
                                                                        title="Voir le document"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleDownloadDocument(document.id)}
                                                                        title="Télécharger le document"
                                                                    >
                                                                        <Download className="h-4 w-4" />
                                                                    </Button>
                                                                    {contact?.email && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => handleSendDocumentByEmail(document)}
                                                                            disabled={isSendingEmail && sendingDocumentId === document.id}
                                                                            title="Envoyer par email"
                                                                        >
                                                                            {isSendingEmail && sendingDocumentId === document.id ? (
                                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                            ) : (
                                                                                <Send className="h-4 w-4" />
                                                                            )}
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
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

                                {activeTab === 'details' && !isEditing && (
                                    <Button
                                        className="bg-mkb-blue hover:bg-mkb-blue/90 text-white"
                                        onClick={() => setActiveTab('interactions')}
                                    >
                                        Voir les interactions
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>

            {/* Archive Confirmation Dialog */}
            <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {contact?.statut === 'archivé' ? 'Désarchiver le contact' : 'Archiver le contact'}
                        </DialogTitle>
                        <DialogDescription>
                            {contact?.statut === 'archivé'
                                ? 'Êtes-vous sûr de vouloir désarchiver ce contact ? Il sera à nouveau visible dans la liste principale.'
                                : 'Êtes-vous sûr de vouloir archiver ce contact ? Il ne sera plus visible dans la liste principale.'
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={() => setIsArchiveDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button
                            className={contact?.statut === 'archivé'
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }
                            onClick={contact?.statut === 'archivé' ? handleUnarchiveContact : handleArchiveContact}
                            disabled={isArchiving}
                        >
                            {isArchiving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {contact?.statut === 'archivé' ? 'Désarchivage...' : 'Archivage...'}
                                </>
                            ) : (
                                <>
                                    <Archive className="mr-2 h-4 w-4" />
                                    {contact?.statut === 'archivé' ? 'Désarchiver' : 'Archiver'}
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}