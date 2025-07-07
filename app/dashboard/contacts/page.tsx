'use client';

import { withPoleAccess } from '@/components/auth/withPoleAccess';
import { ContactDrawer } from '@/components/forms/ContactDrawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ContactDetailDrawer } from '@/components/ui/ContactDetailDrawer';
import { DataFilters, FilterConfig } from '@/components/ui/DataFilters';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Pagination } from '@/components/ui/pagination';
import { TagsManagementDialog } from '@/components/ui/TagsManagementDialog';
import { Textarea } from '@/components/ui/textarea';
import { VehicleDetailDrawer } from '@/components/ui/VehicleDetailDrawer';
import { useSearchableDataFetching } from '@/hooks/useDataFetching';
import { usePoleAccess } from '@/hooks/usePoleAccess';
import { Contact, contactService } from '@/lib/services/contactService';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import {
  Building2,
  Eye,
  Mail,
  Send,
  Star,
  Tag,
  User,
  UserPlus,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

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

function ContactsPageContent() {
  const { canWrite, canManage } = usePoleAccess('Commercial');
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [isContactDrawerOpen, setIsContactDrawerOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isTagsManagementOpen, setIsTagsManagementOpen] = useState(false);
  const [isGroupEmailOpen, setIsGroupEmailOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [isVehicleDetailOpen, setIsVehicleDetailOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [groupEmailData, setGroupEmailData] = useState({
    subject: '',
    message: ''
  });
  const [isSendingGroupEmail, setIsSendingGroupEmail] = useState(false);
  const [metrics, setMetrics] = useState<ContactMetric[]>(contactsMetrics);
  const [availableCompanies, setAvailableCompanies] = useState<string[]>([]);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);

  // Configuration de la pagination et du cache
  const paginationConfig = {
    itemsPerPage: 10,
    cacheKey: 'contacts',
    cacheExpiryMinutes: 5,
  };

  // Hook de récupération des données avec recherche
  const {
    data: contacts,
    loading,
    error,
    totalItems,
    searchTerm,
    setSearchTerm,
    refetch,
    filters,
    updateFilters,
    clearFilters,
  } = useSearchableDataFetching<Contact>(
    contactService.fetchContacts,
    paginationConfig,
    { type: 'all', statut: 'actif', tag: 'all', societe: 'all' }
  );

  // Charger les données initiales
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Charger les statistiques
      const stats = await contactService.fetchContactStats();
      updateMetrics(stats);

      // Charger les options de filtres
      const [tags, companies, types, statuses] = await Promise.all([
        contactService.getAvailableTags(),
        contactService.getAvailableCompanies(),
        contactService.getAvailableTypes(),
        contactService.getAvailableStatuses(),
      ]);

      setAvailableTags(tags);
      setAvailableCompanies(companies);
      setAvailableTypes(types);
      setAvailableStatuses(statuses);
    } catch (error) {
      console.error('Erreur lors du chargement des données initiales:', error);
    }
  };

  const updateMetrics = (stats: any) => {
    const [totalMetric, particuliersMetric, professionnelsMetric, prospectsMetric] = contactsMetrics;
    setMetrics([
      { ...totalMetric, value: stats.total.toString() } as ContactMetric,
      { ...particuliersMetric, value: stats.particuliers.toString() } as ContactMetric,
      { ...professionnelsMetric, value: stats.professionnels.toString() } as ContactMetric,
      { ...prospectsMetric, value: stats.prospects.toString() } as ContactMetric,
    ]);
  };

  // Configuration des filtres
  const filterConfigs: FilterConfig[] = [
    {
      key: 'type',
      type: 'select',
      label: 'Type',
      placeholder: 'Filtrer par type',
      options: availableTypes.map(type => ({ value: type, label: type })),
      defaultValue: 'all',
    },
    {
      key: 'statut',
      type: 'select',
      label: 'Statut',
      placeholder: 'Filtrer par statut',
      options: [
        { value: 'actif', label: 'Actif' },
        { value: 'inactif', label: 'Inactif' },
        { value: 'prospect', label: 'Prospect' },
        { value: 'archivé', label: 'Archivé' }
      ],
      defaultValue: 'actif',
    },
    {
      key: 'tag',
      type: 'select',
      label: 'Tag',
      placeholder: 'Filtrer par tag',
      options: availableTags.map(tag => ({ value: tag, label: tag })),
      defaultValue: 'all',
    },
    {
      key: 'societe',
      type: 'select',
      label: 'Entreprise',
      placeholder: 'Filtrer par entreprise',
      options: availableCompanies.map(company => ({ value: company, label: company })),
      defaultValue: 'all',
    },
  ];

  // Gestion des filtres
  const handleFilterChange = (key: string, value: any) => {
    updateFilters(key, value);
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  const handleRefresh = () => {
    refetch();
    fetchInitialData();
  };

  // Gestion des événements
  const handleContactAdded = () => {
    refetch();
    fetchInitialData();
    toast.success('Contact ajouté avec succès !');
  };

  const handleContactUpdated = () => {
    refetch();
    fetchInitialData();
    toast.success('Contact mis à jour avec succès !');
  };

  const handleViewContact = (contactId: string) => {
    setSelectedContact(contactId);
    setIsDetailDrawerOpen(true);
  };

  const handleVehicleClick = (vehicleId: string) => {
    setSelectedVehicle(vehicleId);
    setIsVehicleDetailOpen(true);
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
      setSelectedContacts(contacts.map(contact => contact.id));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleSendGroupEmail = async () => {
    if (!groupEmailData.subject || !groupEmailData.message) {
      toast.error('Veuillez remplir le sujet et le message');
      return;
    }

    if (selectedContacts.length === 0) {
      toast.error('Veuillez sélectionner au moins un contact');
      return;
    }

    setIsSendingGroupEmail(true);
    try {
      // Récupérer les contacts sélectionnés avec leurs emails
      const selectedContactsData = contacts.filter(contact =>
        selectedContacts.includes(contact.id) && contact.email
      );

      if (selectedContactsData.length === 0) {
        toast.error('Aucun contact sélectionné n\'a d\'adresse email valide');
        return;
      }

      // Récupérer le token d'authentification
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Erreur d\'authentification');
        return;
      }

      // Envoyer les emails un par un avec délai
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < selectedContactsData.length; i++) {
        const contact = selectedContactsData[i];

        try {
          // Vérifier que la session est toujours valide
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (!currentSession?.access_token) {
            throw new Error('Session expirée');
          }

          const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentSession.access_token}`,
            },
            body: JSON.stringify({
              to: [{ Email: contact.email, Name: contact.nom }],
              subject: groupEmailData.subject,
              htmlContent: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>${groupEmailData.subject}</title>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; }
                    .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>MKB Automobile</h1>
                    </div>
                    <div class="content">
                      <p>Bonjour ${contact.nom},</p>
                      <div style="white-space: pre-line;">${groupEmailData.message}</div>
                      <p>Cordialement,<br>L'équipe MKB Automobile</p>
                    </div>
                    <div class="footer">
                      <p>© ${new Date().getFullYear()} MKB Automobile. Tous droits réservés.</p>
                      <p>Cet email a été envoyé à ${contact.email}</p>
                    </div>
                  </div>
                </body>
                </html>
              `,
              textContent: `Bonjour ${contact.nom},\n\n${groupEmailData.message}\n\nCordialement,\nL'équipe MKB Automobile`
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const result = await response.json();

          if (result.success) {
            successCount++;
          } else {
            errorCount++;
            const errorMsg = `Erreur envoi email à ${contact.email}: ${result.error || 'Erreur inconnue'}`;
            errors.push(errorMsg);
            console.error(errorMsg);
          }
        } catch (error) {
          errorCount++;
          const errorMsg = `Erreur envoi email à ${contact.email}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }

        // Délai entre les envois pour éviter le rate limiting (sauf pour le dernier)
        if (i < selectedContactsData.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Afficher le résultat
      if (successCount > 0) {
        toast.success(`${successCount} email(s) envoyé(s) avec succès${errorCount > 0 ? `, ${errorCount} échec(s)` : ''}`);
      } else {
        toast.error('Aucun email n\'a pu être envoyé');
      }

      setIsGroupEmailOpen(false);
      setGroupEmailData({ subject: '', message: '' });
      setSelectedContacts([]);
      setSelectAll(false);
    } catch (error) {
      console.error('Erreur lors de l\'envoi des emails groupés:', error);
      toast.error('Erreur lors de l\'envoi des emails');
    } finally {
      setIsSendingGroupEmail(false);
    }
  };

  // Utilitaires d'affichage
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Client particulier': return 'bg-blue-100 text-blue-800';
      case 'Client pro': return 'bg-purple-100 text-purple-800';
      case 'Partenaire': return 'bg-green-100 text-green-800';
      case 'Prospect': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'actif': return 'bg-green-100 text-green-800';
      case 'inactif': return 'bg-red-100 text-red-800';
      case 'prospect': return 'bg-yellow-100 text-yellow-800';
      case 'archivé': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTagColor = (tag: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-red-100 text-red-800',
      'bg-indigo-100 text-indigo-800',
    ];
    const index = tag.charCodeAt(0) % colors.length;
    return colors[index];
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
              👥 Contacts
            </h1>
            <p className="text-gray-600">
              Gestion centralisée de tous les contacts MKB
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {canWrite && (
            <Button
              variant="outline"
              onClick={() => setIsTagsManagementOpen(true)}
              className="gap-2"
            >
              <Tag className="h-4 w-4" />
              Gérer les Tags
            </Button>
          )}
          {canWrite && (
            <Button
              className="bg-mkb-blue hover:bg-mkb-blue/90"
              onClick={() => setIsContactDrawerOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Ajouter Contact
            </Button>
          )}
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
            <DataFilters
              filters={filterConfigs}
              values={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              onRefresh={handleRefresh}
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Rechercher par nom, email, entreprise..."
              loading={loading}
            />
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
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-mkb-black">
                Contacts ({totalItems})
              </CardTitle>
              {selectedContacts.length > 0 && canWrite && (
                <Button
                  variant="outline"
                  onClick={() => setIsGroupEmailOpen(true)}
                  className="gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email Groupé ({selectedContacts.length})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mkb-blue"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-red-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700">Erreur de chargement</h3>
                <p className="text-gray-500 mt-2">{error}</p>
                <Button
                  className="mt-4 bg-mkb-blue hover:bg-mkb-blue/90"
                  onClick={handleRefresh}
                >
                  Réessayer
                </Button>
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700">Aucun contact trouvé</h3>
                <p className="text-gray-500 mt-2">Modifiez vos filtres ou ajoutez un nouveau contact.</p>
                {canWrite && (
                  <Button
                    className="mt-4 bg-mkb-blue hover:bg-mkb-blue/90"
                    onClick={() => setIsContactDrawerOpen(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Ajouter un contact
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">
                          {canWrite && (
                            <Checkbox
                              checked={selectAll}
                              onCheckedChange={handleSelectAll}
                            />
                          )}
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Tags</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.map((contact, index) => (
                        <motion.tr
                          key={contact.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            {canWrite && (
                              <Checkbox
                                checked={selectedContacts.includes(contact.id)}
                                onCheckedChange={(checked) =>
                                  handleSelectContact(contact.id, checked as boolean)
                                }
                              />
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <User className="h-5 w-5 text-mkb-blue" />
                              <div>
                                <div className="font-medium text-mkb-black">
                                  {contact.nom}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {contact.email}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {contact.telephone} • {contact.societe}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getTypeColor(contact.type)}>
                              {contact.type}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(contact.statut)}>
                              {contact.statut}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {contact.tags.slice(0, 3).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className={`text-xs ${getTagColor(tag)}`}
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {contact.tags.length > 3 && (
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
                              {canWrite && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Envoyer email"
                                  onClick={() => {
                                    setSelectedContacts([contact.id]);
                                    setIsGroupEmailOpen(true);
                                  }}
                                >
                                  <Mail className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalItems > paginationConfig.itemsPerPage && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={1}
                      totalPages={Math.ceil(totalItems / paginationConfig.itemsPerPage)}
                      onPageChange={(page) => {
                        // Pour l'instant, on utilise une pagination simple
                        // TODO: Implémenter la pagination avec le hook
                      }}
                      hasNextPage={1 < Math.ceil(totalItems / paginationConfig.itemsPerPage)}
                      hasPrevPage={false}
                      totalItems={totalItems}
                      itemsPerPage={paginationConfig.itemsPerPage}
                    />
                  </div>
                )}
              </>
            )}
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
          👥 Contacts - <span className="text-mkb-blue font-semibold">#mkbpilot</span>
        </p>
      </motion.div>

      {/* Contact Drawer */}
      {isContactDrawerOpen && (
        <ContactDrawer
          open={isContactDrawerOpen}
          onOpenChange={setIsContactDrawerOpen}
          onSuccess={handleContactAdded}
        />
      )}

      {/* Contact Detail Drawer */}
      {isDetailDrawerOpen && selectedContact && (
        <ContactDetailDrawer
          open={isDetailDrawerOpen}
          onOpenChange={setIsDetailDrawerOpen}
          contactId={selectedContact}
          onContactUpdated={handleContactUpdated}
          onVehicleClick={handleVehicleClick}
        />
      )}

      {/* Tags Management Dialog */}
      {isTagsManagementOpen && (
        <TagsManagementDialog
          open={isTagsManagementOpen}
          onOpenChange={setIsTagsManagementOpen}
          onTagsUpdated={handleRefresh}
        />
      )}

      {/* Group Email Dialog */}
      <Dialog open={isGroupEmailOpen} onOpenChange={setIsGroupEmailOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Email Groupé</DialogTitle>
            <DialogDescription>
              Envoyer un email à {selectedContacts.length} contact(s) sélectionné(s)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Sujet</Label>
              <input
                id="subject"
                type="text"
                value={groupEmailData.subject}
                onChange={(e) => setGroupEmailData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full p-2 border rounded-md"
                placeholder="Sujet de l'email"
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={groupEmailData.message}
                onChange={(e) => setGroupEmailData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Contenu de l'email"
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsGroupEmailOpen(false)}
              disabled={isSendingGroupEmail}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSendGroupEmail}
              disabled={isSendingGroupEmail}
              className="gap-2"
            >
              {isSendingGroupEmail ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Envoyer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vehicle Detail Drawer */}
      {isVehicleDetailOpen && selectedVehicle && (
        <VehicleDetailDrawer
          open={isVehicleDetailOpen}
          onOpenChange={setIsVehicleDetailOpen}
          vehicleId={selectedVehicle}
        />
      )}
    </div>
  );
}

export default withPoleAccess(ContactsPageContent, {
  poleName: 'Commercial',
  requiredAccess: 'read'
});