'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { 
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Phone,
  Mail,
  Building2,
  User,
  Calendar,
  MessageSquare,
  Tag,
  Star,
  Clock,
  MoreHorizontal,
  UserPlus,
  Archive,
  Trash2,
  Save,
  X,
  FileText,
  Car,
  History,
  CheckCircle,
  Loader2,
  Send
} from 'lucide-react';
import { ContactDrawer } from '@/components/forms/ContactDrawer';

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  type: string;
  status: string;
  tags: string[];
  notes: string | null;
  created_at: string;
  updated_at?: string;
}

interface Interaction {
  id: string;
  contact_id: string;
  type: string;
  date: string;
  description: string;
  user: string;
}

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  status: string;
}

interface Document {
  id: string;
  type: string;
  date: string;
  status: string;
  amount: number;
}

const contactsMetrics = [
  {
    title: 'Contacts Total',
    value: '0',
    change: '+0',
    icon: Users,
    color: 'text-green-600',
  },
  {
    title: 'Particuliers',
    value: '0',
    change: '+0',
    icon: User,
    color: 'text-mkb-blue',
  },
  {
    title: 'Professionnels',
    value: '0',
    change: '+0',
    icon: Building2,
    color: 'text-purple-600',
  },
  {
    title: 'Prospects Chauds',
    value: '0',
    change: '+0',
    icon: Star,
    color: 'text-mkb-yellow',
  },
];

const getTypeColor = (type: string) => {
  switch (type) {
    case 'Client particulier': return 'bg-blue-100 text-blue-800';
    case 'Client pro': return 'bg-purple-100 text-purple-800';
    case 'Lead': return 'bg-orange-100 text-orange-800';
    case 'Partenaire': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'actif': return 'bg-green-100 text-green-800';
    case 'prospect': return 'bg-orange-100 text-orange-800';
    case 'inactif': return 'bg-gray-100 text-gray-800';
    case 'archivé': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getTagColor = (tag: string) => {
  switch (tag) {
    case 'chaud': return 'bg-red-100 text-red-800';
    case 'froid': return 'bg-blue-100 text-blue-800';
    case 'vip': return 'bg-yellow-100 text-yellow-800';
    case 'marchand': return 'bg-purple-100 text-purple-800';
    case 'b2b': return 'bg-indigo-100 text-indigo-800';
    case 'apporteur': return 'bg-green-100 text-green-800';
    case 'relance': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function ContactsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isContactDrawerOpen, setIsContactDrawerOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContact, setEditedContact] = useState<Contact | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailData, setEmailData] = useState({ subject: '', message: '' });
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isGroupEmailModalOpen, setIsGroupEmailModalOpen] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([
    'chaud', 'froid', 'vip', 'relance', 'b2b', 'apporteur', 'marchand'
  ]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [metrics, setMetrics] = useState(contactsMetrics);
  const [isLoading, setIsLoading] = useState(true);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter out archived contacts by default
      const activeContacts = data.filter(contact => contact.status !== 'archivé');
      setContacts(activeContacts);

      // Update metrics
      updateMetrics(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Erreur lors du chargement des contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const updateMetrics = (data: Contact[]) => {
    const total = data.filter(c => c.status !== 'archivé').length;
    const particuliers = data.filter(c => c.type === 'Client particulier' && c.status !== 'archivé').length;
    const professionnels = data.filter(c => c.type === 'Client pro' && c.status !== 'archivé').length;
    const chauds = data.filter(c => c.tags?.includes('chaud') && c.status !== 'archivé').length;

    setMetrics([
      { ...metrics[0], value: total.toString() },
      { ...metrics[1], value: particuliers.toString() },
      { ...metrics[2], value: professionnels.toString() },
      { ...metrics[3], value: chauds.toString() },
    ]);
  };

  const fetchContactDetails = async (contactId: string) => {
    try {
      // Fetch contact
      const { data: contactData, error: contactError } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', contactId)
        .single();

      if (contactError) throw contactError;
      setSelectedContact(contactData);
      setEditedContact(contactData);

      // Fetch mock interactions
      // In a real app, you would fetch from a real table
      const mockInteractions: Interaction[] = [
        {
          id: '1',
          contact_id: contactId,
          type: 'email',
          date: '2024-03-15',
          description: 'Email de suivi envoyé',
          user: 'Jean Martin'
        },
        {
          id: '2',
          contact_id: contactId,
          type: 'call',
          date: '2024-03-10',
          description: 'Appel pour discuter des options de véhicules',
          user: 'Sophie Laurent'
        },
        {
          id: '3',
          contact_id: contactId,
          type: 'meeting',
          date: '2024-03-05',
          description: 'Rendez-vous en concession',
          user: 'Pierre Durand'
        }
      ];
      setInteractions(mockInteractions);

      // Fetch mock vehicles
      const mockVehicles: Vehicle[] = [
        {
          id: '1',
          brand: 'Peugeot',
          model: '308',
          year: 2023,
          status: 'vendu'
        },
        {
          id: '2',
          brand: 'Renault',
          model: 'Clio',
          year: 2022,
          status: 'intéressé'
        }
      ];
      setVehicles(mockVehicles);

      // Fetch mock documents
      const mockDocuments: Document[] = [
        {
          id: '1',
          type: 'devis',
          date: '2024-03-12',
          status: 'envoyé',
          amount: 18500
        },
        {
          id: '2',
          type: 'facture',
          date: '2024-03-15',
          status: 'payé',
          amount: 18500
        }
      ];
      setDocuments(mockDocuments);

    } catch (error) {
      console.error('Error fetching contact details:', error);
      toast.error('Erreur lors du chargement des détails du contact');
    }
  };

  const handleContactClick = (contact: Contact) => {
    fetchContactDetails(contact.id);
    setIsDetailDrawerOpen(true);
    setIsEditMode(false);
    setActiveTab('info');
  };

  const handleSaveContact = async () => {
    if (!editedContact) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .update({
          name: editedContact.name,
          email: editedContact.email,
          phone: editedContact.phone,
          company: editedContact.company,
          notes: editedContact.notes,
          tags: editedContact.tags,
          status: editedContact.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', editedContact.id);

      if (error) throw error;

      toast.success('Contact mis à jour avec succès');
      setSelectedContact(editedContact);
      setIsEditMode(false);
      fetchContacts(); // Refresh the list
    } catch (error) {
      console.error('Error updating contact:', error);
      toast.error('Erreur lors de la mise à jour du contact');
    }
  };

  const handleArchiveContact = async () => {
    if (!selectedContact) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .update({
          status: 'archivé',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedContact.id);

      if (error) throw error;

      toast.success('Contact archivé avec succès');
      setIsDetailDrawerOpen(false);
      fetchContacts(); // Refresh the list
    } catch (error) {
      console.error('Error archiving contact:', error);
      toast.error('Erreur lors de l\'archivage du contact');
    }
  };

  const handleAddTag = () => {
    if (!newTag.trim() || !editedContact) return;

    // Add to available tags if it's a new tag
    if (!availableTags.includes(newTag)) {
      setAvailableTags([...availableTags, newTag]);
    }

    // Add to contact tags if not already there
    if (!editedContact.tags.includes(newTag)) {
      const updatedTags = [...editedContact.tags, newTag];
      setEditedContact({ ...editedContact, tags: updatedTags });
    }

    setNewTag('');
    setIsAddingTag(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!editedContact) return;
    const updatedTags = editedContact.tags.filter(tag => tag !== tagToRemove);
    setEditedContact({ ...editedContact, tags: updatedTags });
  };

  const handleSendEmail = async () => {
    if (!selectedContact || !selectedContact.email) {
      toast.error('Ce contact n\'a pas d\'adresse email');
      return;
    }

    if (!emailData.subject || !emailData.message) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsSendingEmail(true);

    try {
      // In a real app, you would call an API endpoint to send the email
      // For this demo, we'll simulate sending with a timeout
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Log the interaction
      const interactionData = {
        contact_id: selectedContact.id,
        type: 'email',
        date: new Date().toISOString().split('T')[0],
        description: `Email envoyé: ${emailData.subject}`,
        user: 'Utilisateur actuel' // In a real app, this would be the logged-in user
      };

      // In a real app, you would save this to the database
      console.log('Email sent:', {
        to: selectedContact.email,
        subject: emailData.subject,
        message: emailData.message
      });
      console.log('Interaction logged:', interactionData);

      // Add to interactions list for UI
      setInteractions([
        {
          id: Date.now().toString(),
          ...interactionData
        },
        ...interactions
      ]);

      toast.success('Email envoyé avec succès');
      setIsEmailModalOpen(false);
      setEmailData({ subject: '', message: '' });
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Erreur lors de l\'envoi de l\'email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSendGroupEmail = async () => {
    if (selectedContacts.length === 0) {
      toast.error('Veuillez sélectionner au moins un contact');
      return;
    }

    if (!emailData.subject || !emailData.message) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsSendingEmail(true);

    try {
      // Get selected contacts with email
      const selectedContactsData = contacts.filter(
        contact => selectedContacts.includes(contact.id) && contact.email
      );

      if (selectedContactsData.length === 0) {
        throw new Error('Aucun des contacts sélectionnés n\'a d\'adresse email');
      }

      // In a real app, you would call an API endpoint to send the emails
      // For this demo, we'll simulate sending with a timeout
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Group email sent:', {
        to: selectedContactsData.map(c => c.email),
        subject: emailData.subject,
        message: emailData.message
      });

      toast.success(`Email envoyé à ${selectedContactsData.length} contacts`);
      setIsGroupEmailModalOpen(false);
      setEmailData({ subject: '', message: '' });
      setSelectedContacts([]);
      setSelectAllChecked(false);
    } catch (error) {
      console.error('Error sending group email:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'envoi des emails');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSelectAllContacts = (checked: boolean) => {
    setSelectAllChecked(checked);
    if (checked) {
      setSelectedContacts(filteredContacts.map(contact => contact.id));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleSelectContact = (contactId: string, checked: boolean) => {
    if (checked) {
      setSelectedContacts([...selectedContacts, contactId]);
    } else {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId));
      setSelectAllChecked(false);
    }
  };

  const handleContactAdded = () => {
    fetchContacts();
    toast.success('Contact ajouté avec succès !');
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || contact.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4 text-blue-500" />;
      case 'call': return <Phone className="h-4 w-4 text-green-500" />;
      case 'meeting': return <Calendar className="h-4 w-4 text-purple-500" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-mkb-blue" />
          <div>
            <h1 className="text-3xl font-bold text-mkb-black">
              📇 Contacts Central
            </h1>
            <p className="text-gray-600">
              Gestion centralisée de tous les contacts MKB
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            className="bg-mkb-blue hover:bg-mkb-blue/90"
            onClick={() => setIsContactDrawerOpen(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Nouveau Contact
          </Button>
        </div>
      </motion.div>

      {/* Metrics */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {metric.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-mkb-black">{metric.value}</div>
                <p className="text-xs text-green-600">
                  {metric.change} vs mois précédent
                </p>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par nom, email, société..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="Client particulier">Particulier</SelectItem>
                  <SelectItem value="Client pro">Professionnel</SelectItem>
                  <SelectItem value="Lead">Lead</SelectItem>
                  <SelectItem value="Partenaire">Partenaire</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="inactif">Inactif</SelectItem>
                  <SelectItem value="archivé">Archivé</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Plus de filtres
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contacts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-mkb-black">
              Carnet de Contacts ({filteredContacts.length})
            </CardTitle>
            {selectedContacts.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''} sélectionné{selectedContacts.length > 1 ? 's' : ''}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setEmailData({ subject: '', message: '' });
                    setIsGroupEmailModalOpen(true);
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email groupé
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mkb-blue"></div>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700">Aucun contact trouvé</h3>
                <p className="text-gray-500 mt-2">Modifiez vos filtres ou ajoutez un nouveau contact.</p>
                <Button 
                  className="mt-4 bg-mkb-blue hover:bg-mkb-blue/90"
                  onClick={() => setIsContactDrawerOpen(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Ajouter un contact
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-semibold text-gray-700 w-8">
                        <Checkbox 
                          checked={selectAllChecked} 
                          onCheckedChange={handleSelectAllContacts}
                          aria-label="Sélectionner tous les contacts"
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Coordonnées</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Type</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Statut</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Tags</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((contact, index) => (
                      <motion.tr
                        key={contact.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleContactClick(contact)}
                      >
                        <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
                          <Checkbox 
                            checked={selectedContacts.includes(contact.id)}
                            onCheckedChange={(checked) => handleSelectContact(contact.id, checked === true)}
                            aria-label={`Sélectionner ${contact.name}`}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-mkb-blue rounded-full flex items-center justify-center text-white font-medium">
                              {contact.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="font-medium text-mkb-black">{contact.name}</div>
                              {contact.company && (
                                <div className="text-sm text-gray-500">{contact.company}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            {contact.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-3 w-3 text-gray-400" />
                                <span>{contact.email}</span>
                              </div>
                            )}
                            {contact.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <span>{contact.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={getTypeColor(contact.type)}>
                            {contact.type === 'Client particulier' ? 'Particulier' : 
                             contact.type === 'Client pro' ? 'Professionnel' : 
                             contact.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={getStatusColor(contact.status)}>
                            {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {contact.tags && contact.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="secondary" className={`text-xs ${getTagColor(tag)}`}>
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Voir détails"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleContactClick(contact);
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Appeler"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (contact.phone) {
                                  window.location.href = `tel:${contact.phone}`;
                                } else {
                                  toast.error('Ce contact n\'a pas de numéro de téléphone');
                                }
                              }}
                            >
                              <Phone className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Envoyer email"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (contact.email) {
                                  setSelectedContact(contact);
                                  setEmailData({ subject: '', message: '' });
                                  setIsEmailModalOpen(true);
                                } else {
                                  toast.error('Ce contact n\'a pas d\'adresse email');
                                }
                              }}
                            >
                              <Mail className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Plus d'actions"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black">Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                className="bg-mkb-blue hover:bg-mkb-blue/90 text-white"
                onClick={() => setIsContactDrawerOpen(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Nouveau Contact
              </Button>
              <Button 
                variant="outline" 
                className="border-mkb-yellow text-mkb-yellow hover:bg-mkb-yellow hover:text-white"
                onClick={() => {
                  if (selectedContacts.length > 0) {
                    setEmailData({ subject: '', message: '' });
                    setIsGroupEmailModalOpen(true);
                  } else {
                    toast.error('Veuillez sélectionner au moins un contact');
                  }
                }}
              >
                <Phone className="mr-2 h-4 w-4" />
                Campagne d'Appels
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-300"
                onClick={() => {
                  if (selectedContacts.length > 0) {
                    setEmailData({ subject: '', message: '' });
                    setIsGroupEmailModalOpen(true);
                  } else {
                    toast.error('Veuillez sélectionner au moins un contact');
                  }
                }}
              >
                <Mail className="mr-2 h-4 w-4" />
                Email Groupé
              </Button>
              <Button variant="outline" className="border-gray-300">
                <Tag className="mr-2 h-4 w-4" />
                Gestion Tags
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer */}
      <motion.div
        className="text-center py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <p className="text-sm text-gray-500">
          📇 Contacts Central - <span className="text-mkb-blue font-semibold">#mkbpilot</span>
        </p>
      </motion.div>

      {/* Contact Drawer */}
      <ContactDrawer 
        open={isContactDrawerOpen} 
        onOpenChange={setIsContactDrawerOpen}
        onSuccess={handleContactAdded}
      />

      {/* Contact Detail Drawer */}
      <Drawer open={isDetailDrawerOpen} onOpenChange={setIsDetailDrawerOpen}>
        <DrawerContent className="h-[85vh] max-h-[85vh] p-0">
          <div className="flex flex-col h-full">
            <DrawerHeader className="border-b pb-4 px-4">
              <div className="flex items-center justify-between">
                <DrawerTitle className="text-xl font-bold text-mkb-black flex items-center gap-2">
                  {selectedContact && (
                    <>
                      <div className="w-10 h-10 bg-mkb-blue rounded-full flex items-center justify-center text-white font-medium">
                        {selectedContact.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        {selectedContact.name}
                        {selectedContact.company && (
                          <div className="text-sm font-normal text-gray-500">{selectedContact.company}</div>
                        )}
                      </div>
                    </>
                  )}
                </DrawerTitle>
                <div className="flex items-center gap-2">
                  {selectedContact?.phone && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = `tel:${selectedContact.phone}`}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Appeler
                    </Button>
                  )}
                  {selectedContact?.email && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEmailData({ subject: '', message: '' });
                        setIsEmailModalOpen(true);
                      }}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  )}
                </div>
              </div>
              <DrawerDescription>
                {selectedContact && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getTypeColor(selectedContact.type)}>
                      {selectedContact.type}
                    </Badge>
                    <Badge className={getStatusColor(selectedContact.status)}>
                      {selectedContact.status.charAt(0).toUpperCase() + selectedContact.status.slice(1)}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Ajouté le {new Date(selectedContact.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </DrawerDescription>
            </DrawerHeader>
            
            <div className="flex-1 overflow-y-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-4 pt-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="info">Informations</TabsTrigger>
                    <TabsTrigger value="history">Historique</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="info" className="p-4 space-y-6">
                  {isEditMode ? (
                    // Edit mode
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Nom complet</Label>
                          <Input 
                            id="name" 
                            value={editedContact?.name || ''} 
                            onChange={(e) => setEditedContact(prev => prev ? {...prev, name: e.target.value} : null)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            value={editedContact?.email || ''} 
                            onChange={(e) => setEditedContact(prev => prev ? {...prev, email: e.target.value} : null)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Téléphone</Label>
                          <Input 
                            id="phone" 
                            value={editedContact?.phone || ''} 
                            onChange={(e) => setEditedContact(prev => prev ? {...prev, phone: e.target.value} : null)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="company">Société</Label>
                          <Input 
                            id="company" 
                            value={editedContact?.company || ''} 
                            onChange={(e) => setEditedContact(prev => prev ? {...prev, company: e.target.value} : null)}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="status">Statut</Label>
                        <Select 
                          value={editedContact?.status || 'actif'} 
                          onValueChange={(value) => setEditedContact(prev => prev ? {...prev, status: value} : null)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Statut" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="actif">Actif</SelectItem>
                            <SelectItem value="prospect">Prospect</SelectItem>
                            <SelectItem value="inactif">Inactif</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea 
                          id="notes" 
                          value={editedContact?.notes || ''} 
                          onChange={(e) => setEditedContact(prev => prev ? {...prev, notes: e.target.value} : null)}
                          className="min-h-[100px]"
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Tags</Label>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setIsAddingTag(true)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Ajouter
                          </Button>
                        </div>
                        
                        {isAddingTag ? (
                          <div className="flex items-center gap-2 mb-2">
                            <Input 
                              value={newTag} 
                              onChange={(e) => setNewTag(e.target.value)} 
                              placeholder="Nouveau tag..."
                              className="flex-1"
                            />
                            <Button size="sm" onClick={handleAddTag}>
                              Ajouter
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                setIsAddingTag(false);
                                setNewTag('');
                              }}
                            >
                              Annuler
                            </Button>
                          </div>
                        ) : null}
                        
                        <div className="flex flex-wrap gap-2">
                          {editedContact?.tags && editedContact.tags.map((tag, index) => (
                            <Badge 
                              key={index} 
                              className={`${getTagColor(tag)} flex items-center gap-1`}
                            >
                              {tag}
                              <button 
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-1 hover:bg-red-200 rounded-full p-0.5"
                              >
                                <X className="h-2 w-2" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        
                        {!isAddingTag && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">Tags suggérés :</p>
                            <div className="flex flex-wrap gap-1">
                              {availableTags
                                .filter(tag => !editedContact?.tags.includes(tag))
                                .map((tag, index) => (
                                  <Badge 
                                    key={index} 
                                    variant="outline" 
                                    className="cursor-pointer hover:bg-gray-100"
                                    onClick={() => {
                                      if (editedContact) {
                                        setEditedContact({
                                          ...editedContact,
                                          tags: [...editedContact.tags, tag]
                                        });
                                      }
                                    }}
                                  >
                                    <Plus className="h-2 w-2 mr-1" />
                                    {tag}
                                  </Badge>
                                ))
                              }
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-mkb-black">Informations de contact</h3>
                          
                          <div className="space-y-3">
                            <div>
                              <Label className="text-gray-500">Nom complet</Label>
                              <p className="font-medium">{selectedContact?.name}</p>
                            </div>
                            
                            {selectedContact?.email && (
                              <div>
                                <Label className="text-gray-500">Email</Label>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{selectedContact.email}</p>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 w-6 p-0"
                                    onClick={() => {
                                      setEmailData({ subject: '', message: '' });
                                      setIsEmailModalOpen(true);
                                    }}
                                  >
                                    <Mail className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                            
                            {selectedContact?.phone && (
                              <div>
                                <Label className="text-gray-500">Téléphone</Label>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{selectedContact.phone}</p>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 w-6 p-0"
                                    onClick={() => window.location.href = `tel:${selectedContact.phone}`}
                                  >
                                    <Phone className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                            
                            {selectedContact?.company && (
                              <div>
                                <Label className="text-gray-500">Société</Label>
                                <p className="font-medium">{selectedContact.company}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-mkb-black">Informations supplémentaires</h3>
                          
                          <div className="space-y-3">
                            <div>
                              <Label className="text-gray-500">Type</Label>
                              <div>
                                <Badge className={getTypeColor(selectedContact?.type || '')}>
                                  {selectedContact?.type}
                                </Badge>
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-gray-500">Statut</Label>
                              <div>
                                <Badge className={getStatusColor(selectedContact?.status || '')}>
                                  {selectedContact?.status.charAt(0).toUpperCase() + selectedContact?.status.slice(1)}
                                </Badge>
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-gray-500">Tags</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedContact?.tags && selectedContact.tags.length > 0 ? (
                                  selectedContact.tags.map((tag, index) => (
                                    <Badge key={index} className={getTagColor(tag)}>
                                      {tag}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-sm text-gray-500">Aucun tag</span>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-gray-500">Date d'ajout</Label>
                              <p className="font-medium">
                                {selectedContact && new Date(selectedContact.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {selectedContact?.notes && (
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-mkb-black">Notes</h3>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm whitespace-pre-line">{selectedContact.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="history" className="p-4 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-mkb-black">Historique des interactions</h3>
                    
                    {interactions.length > 0 ? (
                      <div className="space-y-3">
                        {interactions.map((interaction, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="bg-white p-2 rounded-full shadow-sm">
                              {getInteractionIcon(interaction.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-mkb-black">
                                  {interaction.type === 'email' ? 'Email envoyé' :
                                   interaction.type === 'call' ? 'Appel téléphonique' :
                                   interaction.type === 'meeting' ? 'Rendez-vous' : 'Interaction'}
                                </p>
                                <p className="text-xs text-gray-500">{interaction.date}</p>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{interaction.description}</p>
                              <p className="text-xs text-gray-500 mt-1">Par {interaction.user}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <History className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">Aucune interaction enregistrée</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-mkb-black">Véhicules liés</h3>
                    
                    {vehicles.length > 0 ? (
                      <div className="space-y-3">
                        {vehicles.map((vehicle, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="bg-white p-2 rounded-full shadow-sm">
                              <Car className="h-4 w-4 text-mkb-blue" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-mkb-black">
                                  {vehicle.brand} {vehicle.model} ({vehicle.year})
                                </p>
                                <Badge className={
                                  vehicle.status === 'vendu' ? 'bg-green-100 text-green-800' :
                                  vehicle.status === 'intéressé' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }>
                                  {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Car className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">Aucun véhicule lié</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="documents" className="p-4 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-mkb-black">Documents</h3>
                    
                    {documents.length > 0 ? (
                      <div className="space-y-3">
                        {documents.map((document, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="bg-white p-2 rounded-full shadow-sm">
                              {document.type === 'devis' ? (
                                <FileText className="h-4 w-4 text-mkb-blue" />
                              ) : (
                                <Receipt className="h-4 w-4 text-mkb-yellow" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-mkb-black">
                                  {document.type === 'devis' ? 'Devis' : 'Facture'} du {document.date}
                                </p>
                                <Badge className={
                                  document.status === 'envoyé' ? 'bg-blue-100 text-blue-800' :
                                  document.status === 'payé' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                                }>
                                  {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-sm text-gray-600">
                                  Montant: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(document.amount)}
                                </p>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <Download className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <Mail className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">Aucun document</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            <DrawerFooter className="border-t pt-4 px-4 mt-auto">
              <div className="flex justify-between gap-4">
                {isEditMode ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditMode(false);
                        setEditedContact(selectedContact);
                      }}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Annuler
                    </Button>
                    <Button 
                      className="bg-mkb-blue hover:bg-mkb-blue/90 text-white"
                      onClick={handleSaveContact}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={handleArchiveContact}
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Archiver
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <DrawerClose asChild>
                        <Button variant="outline">
                          <X className="mr-2 h-4 w-4" />
                          Fermer
                        </Button>
                      </DrawerClose>
                      <Button 
                        className="bg-mkb-blue hover:bg-mkb-blue/90 text-white"
                        onClick={() => setIsEditMode(true)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Email Modal */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Envoyer un email</DialogTitle>
            <DialogDescription>
              Envoyer un email à {selectedContact?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="email-to">Destinataire</Label>
              <Input id="email-to" value={selectedContact?.email || ''} disabled />
            </div>
            
            <div>
              <Label htmlFor="email-subject">Objet</Label>
              <Input 
                id="email-subject" 
                placeholder="Objet de l'email" 
                value={emailData.subject}
                onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="email-message">Message</Label>
              <Textarea 
                id="email-message" 
                placeholder="Votre message..." 
                className="min-h-[150px]"
                value={emailData.message}
                onChange={(e) => setEmailData({...emailData, message: e.target.value})}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEmailModalOpen(false)}>
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
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Group Email Modal */}
      <Dialog open={isGroupEmailModalOpen} onOpenChange={setIsGroupEmailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Envoyer un email groupé</DialogTitle>
            <DialogDescription>
              Envoyer un email à {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="group-email-to">Destinataires</Label>
              <div className="bg-gray-50 p-2 rounded-md max-h-[100px] overflow-y-auto">
                <div className="flex flex-wrap gap-1">
                  {selectedContacts.map(id => {
                    const contact = contacts.find(c => c.id === id);
                    return contact ? (
                      <Badge key={id} variant="secondary" className="bg-gray-200">
                        {contact.name} {contact.email ? `<${contact.email}>` : '(pas d\'email)'}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {contacts.filter(c => selectedContacts.includes(c.id) && c.email).length} contact(s) avec email
              </p>
            </div>
            
            <div>
              <Label htmlFor="group-email-subject">Objet</Label>
              <Input 
                id="group-email-subject" 
                placeholder="Objet de l'email" 
                value={emailData.subject}
                onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="group-email-message">Message</Label>
              <div className="text-xs text-gray-500 mb-1">
                Vous pouvez utiliser les variables suivantes : <code className="bg-gray-100 px-1 rounded">{'{{nom}}'}</code>
              </div>
              <Textarea 
                id="group-email-message" 
                placeholder="Votre message..." 
                className="min-h-[150px]"
                value={emailData.message}
                onChange={(e) => setEmailData({...emailData, message: e.target.value})}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsGroupEmailModalOpen(false)}>
              Annuler
            </Button>
            <Button 
              className="bg-mkb-blue hover:bg-mkb-blue/90"
              onClick={handleSendGroupEmail}
              disabled={isSendingEmail}
            >
              {isSendingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer à {contacts.filter(c => selectedContacts.includes(c.id) && c.email).length} contact(s)
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}