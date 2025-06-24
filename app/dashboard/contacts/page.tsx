'use client';

import { ContactDrawer } from '@/components/forms/ContactDrawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ContactDetailDrawer } from '@/components/ui/ContactDetailDrawer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TagsManagementDialog } from '@/components/ui/TagsManagementDialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import {
  Archive,
  Building2,
  Eye,
  Loader2,
  Mail,
  MoreHorizontal,
  Phone,
  Search,
  Send,
  Star,
  Tag,
  User,
  UserPlus,
  Users,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  type: string;
  status: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface ContactMetric {
  title: string;
  value: string;
  change: string;
  icon: typeof Users;
  color: string;
}

const contactsMetrics: ContactMetric[] = [
  {
    title: 'Contacts Total',
    value: '1,247',
    change: '+89',
    icon: Users,
    color: 'text-green-600',
  },
  {
    title: 'Particuliers',
    value: '892',
    change: '+67',
    icon: User,
    color: 'text-mkb-blue',
  },
  {
    title: 'Professionnels',
    value: '355',
    change: '+22',
    icon: Building2,
    color: 'text-purple-600',
  },
  {
    title: 'Prospects Chauds',
    value: '156',
    change: '+34',
    icon: Star,
    color: 'text-mkb-yellow',
  },
];

export default function ContactsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [isContactDrawerOpen, setIsContactDrawerOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isTagsManagementOpen, setIsTagsManagementOpen] = useState(false);
  const [isGroupEmailOpen, setIsGroupEmailOpen] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [groupEmailData, setGroupEmailData] = useState({
    subject: '',
    message: ''
  });
  const [isSendingGroupEmail, setIsSendingGroupEmail] = useState(false);
  const [metrics, setMetrics] = useState<ContactMetric[]>(contactsMetrics);

  useEffect(() => {
    fetchContacts();
    fetchAvailableTags();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      // Destructurer les métriques pour éviter les erreurs TypeScript
      const [totalMetric, particuliersMetric, professionnelsMetric, prospectsMetric] = contactsMetrics;

      // Fetch contacts from Supabase
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch tags for each contact
      const contactsWithTags = await Promise.all(
        data.map(async (contact) => {
          const { data: tagsData, error: tagsError } = await supabase
            .from('contact_tags')
            .select('tag')
            .eq('contact_id', contact.id);

          if (tagsError) {
            console.error('Error fetching tags for contact:', tagsError);
            return { ...contact, tags: [] };
          }

          return { ...contact, tags: tagsData.map(t => t.tag) };
        })
      );

      setContacts(contactsWithTags);

      // Update metrics
      const total = contactsWithTags.length;
      const particuliers = contactsWithTags.filter(c => c.type === 'Client particulier').length;
      const professionnels = contactsWithTags.filter(c => c.type === 'Client pro' || c.type === 'Partenaire').length;
      const prospects = contactsWithTags.filter(c => c.tags.includes('chaud')).length;

      setMetrics([
        { ...totalMetric, value: total.toString() } as ContactMetric,
        { ...particuliersMetric, value: particuliers.toString() } as ContactMetric,
        { ...professionnelsMetric, value: professionnels.toString() } as ContactMetric,
        { ...prospectsMetric, value: prospects.toString() } as ContactMetric,
      ]);

    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Erreur lors du chargement des contacts');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTags = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_tags')
        .select('tag')
        .order('tag');

      if (error) throw error;

      // Get unique tags
      const uniqueTags = Array.from(new Set(data.map(t => t.tag)));
      setAvailableTags(uniqueTags);

    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleContactAdded = () => {
    fetchContacts();
    toast.success('Contact ajouté avec succès !');
  };

  const handleContactUpdated = () => {
    fetchContacts();
    fetchAvailableTags();
  };

  const handleViewContact = (contactId: string) => {
    setSelectedContact(contactId);
    setIsDetailDrawerOpen(true);
  };

  const handleSelectContact = (contactId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedContacts(prev => [...prev, contactId]);
    } else {
      setSelectedContacts(prev => prev.filter(id => id !== contactId));
    }
  };

  const handleSelectAll = (isChecked: boolean) => {
    setSelectAll(isChecked);
    if (isChecked) {
      setSelectedContacts(filteredContacts.map(contact => contact.id));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleSendGroupEmail = async () => {
    if (selectedContacts.length === 0) {
      toast.error('Veuillez sélectionner au moins un contact');
      return;
    }

    if (!groupEmailData.subject || !groupEmailData.message) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsSendingGroupEmail(true);

    try {
      // Get selected contacts with email
      const selectedContactsWithEmail = contacts.filter(
        contact => selectedContacts.includes(contact.id) && contact.email
      );

      if (selectedContactsWithEmail.length === 0) {
        toast.error('Aucun des contacts sélectionnés n\'a d\'adresse email');
        return;
      }

      // In a real app, here we would call an API endpoint to send the emails
      // For this demo, we'll simulate sending with a timeout
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Add interaction records for each contact
      await Promise.all(
        selectedContactsWithEmail.map(contact =>
          supabase
            .from('contact_interactions')
            .insert({
              contact_id: contact.id,
              type: 'email',
              date: new Date().toISOString().split('T')[0],
              description: `Email groupé envoyé: ${groupEmailData.subject}`
            })
        )
      );

      toast.success(`Email envoyé à ${selectedContactsWithEmail.length} contact(s)`);
      setIsGroupEmailOpen(false);
      setGroupEmailData({ subject: '', message: '' });
      setSelectedContacts([]);
      setSelectAll(false);

    } catch (error) {
      console.error('Error sending group email:', error);
      toast.error('Erreur lors de l\'envoi des emails');
    } finally {
      setIsSendingGroupEmail(false);
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
      case 'archivé': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTagColor = (tag: string) => {
    // Generate a consistent color based on the tag name
    const colorIndex = tag.charCodeAt(0) % TAG_COLORS.length;
    return TAG_COLORS[colorIndex];
  };

  const TAG_COLORS = [
    'bg-mkb-blue text-white',
    'bg-mkb-yellow text-black',
    'bg-green-500 text-white',
    'bg-purple-500 text-white',
    'bg-red-500 text-white',
    'bg-orange-500 text-white',
    'bg-blue-500 text-white',
    'bg-indigo-500 text-white',
  ];

  // Apply filters
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || contact.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
    const matchesTag = tagFilter === 'all' || (contact.tags && contact.tags.includes(tagFilter));

    return matchesSearch && matchesType && matchesStatus && matchesTag;
  });

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
            <div className="flex flex-wrap items-center gap-4">
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
              {availableTags.length > 0 && (
                <Select value={tagFilter} onValueChange={setTagFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les tags</SelectItem>
                    {availableTags.map(tag => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTagsManagementOpen(true)}
              >
                <Tag className="h-4 w-4 mr-2" />
                Gérer les tags
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bulk Actions */}
      {selectedContacts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-mkb-blue/20 bg-mkb-blue/5">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className="bg-mkb-blue text-white">
                    {selectedContacts.length} sélectionné(s)
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {selectedContacts.length === 1
                      ? '1 contact sélectionné'
                      : `${selectedContacts.length} contacts sélectionnés`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsGroupEmailOpen(true)}
                    disabled={selectedContacts.length === 0}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email groupé
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    disabled={selectedContacts.length === 0}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archiver
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedContacts([]);
                      setSelectAll(false);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Contacts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black">
              Carnet de Contacts ({filteredContacts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-mkb-blue animate-spin" />
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
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 w-10">
                        <Checkbox
                          checked={selectAll}
                          onCheckedChange={handleSelectAll}
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
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <Checkbox
                            checked={selectedContacts.includes(contact.id)}
                            onCheckedChange={(checked) => handleSelectContact(contact.id, !!checked)}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => handleViewContact(contact.id)}
                          >
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
                                <a
                                  href={`mailto:${contact.email}`}
                                  className="hover:text-mkb-blue hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {contact.email}
                                </a>
                              </div>
                            )}
                            {contact.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <a
                                  href={`tel:${contact.phone}`}
                                  className="hover:text-mkb-blue hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {contact.phone}
                                </a>
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
                            {contact.tags && contact.tags.length > 0 ? (
                              contact.tags.slice(0, 3).map((tag, tagIndex) => (
                                <Badge
                                  key={tagIndex}
                                  variant="secondary"
                                  className={`text-xs ${getTagColor(tag)}`}
                                >
                                  {tag}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400">Aucun tag</span>
                            )}
                            {contact.tags && contact.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{contact.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Voir détails"
                              onClick={() => handleViewContact(contact.id)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            {contact.phone && (
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Appeler"
                                asChild
                              >
                                <a href={`tel:${contact.phone}`}>
                                  <Phone className="h-3 w-3" />
                                </a>
                              </Button>
                            )}
                            {contact.email && (
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Envoyer email"
                                asChild
                              >
                                <a href={`mailto:${contact.email}`}>
                                  <Mail className="h-3 w-3" />
                                </a>
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" title="Plus d'actions">
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
                  if (selectedContacts.length === 0) {
                    toast.error('Veuillez sélectionner au moins un contact');
                  } else {
                    setIsGroupEmailOpen(true);
                  }
                }}
              >
                <Phone className="mr-2 h-4 w-4" />
                Campagne d'Appels
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedContacts.length === 0) {
                    toast.error('Veuillez sélectionner au moins un contact');
                  } else {
                    setIsGroupEmailOpen(true);
                  }
                }}
              >
                <Mail className="mr-2 h-4 w-4" />
                Email Groupé
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsTagsManagementOpen(true)}
              >
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
      <ContactDetailDrawer
        open={isDetailDrawerOpen}
        onOpenChange={setIsDetailDrawerOpen}
        contactId={selectedContact || ''}
        onContactUpdated={handleContactUpdated}
      />

      {/* Tags Management Dialog */}
      <TagsManagementDialog
        open={isTagsManagementOpen}
        onOpenChange={setIsTagsManagementOpen}
        onTagsUpdated={handleContactUpdated}
      />

      {/* Group Email Dialog */}
      <Dialog open={isGroupEmailOpen} onOpenChange={setIsGroupEmailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Envoyer un email groupé</DialogTitle>
            <DialogDescription>
              Envoyez un email à {selectedContacts.length} contact(s) sélectionné(s)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Destinataires</h3>
              <div className="flex flex-wrap gap-2">
                {selectedContacts.map(id => {
                  const contact = contacts.find(c => c.id === id);
                  if (!contact) return null;

                  return (
                    <Badge key={id} className="bg-blue-100 text-blue-800">
                      {contact.name} {contact.email ? `(${contact.email})` : '(pas d\'email)'}
                    </Badge>
                  );
                })}
              </div>
              {selectedContacts.some(id => !contacts.find(c => c.id === id)?.email) && (
                <p className="text-xs text-red-600 mt-2">
                  Attention: certains contacts sélectionnés n'ont pas d'adresse email.
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email-subject">Sujet</Label>
              <Input
                id="email-subject"
                placeholder="Sujet de l'email"
                value={groupEmailData.subject}
                onChange={(e) => setGroupEmailData({ ...groupEmailData, subject: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="email-message">Message</Label>
              <Textarea
                id="email-message"
                placeholder="Contenu de l'email..."
                className="min-h-[200px]"
                value={groupEmailData.message}
                onChange={(e) => setGroupEmailData({ ...groupEmailData, message: e.target.value })}
              />
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
              <p className="font-medium mb-1">Placeholders disponibles:</p>
              <ul className="space-y-1">
                <li><code>&#123;&#123; nom &#125;&#125;</code> - Nom du contact</li>
                <li><code>&#123;&#123; email &#125;&#125;</code> - Email du contact</li>
                <li><code>&#123;&#123; societe &#125;&#125;</code> - Nom de la société (si disponible)</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsGroupEmailOpen(false)}
            >
              Annuler
            </Button>
            <Button
              className="bg-mkb-blue hover:bg-mkb-blue/90"
              onClick={handleSendGroupEmail}
              disabled={isSendingGroupEmail}
            >
              {isSendingGroupEmail ? (
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}