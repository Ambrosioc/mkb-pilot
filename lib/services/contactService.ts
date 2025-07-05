import { FetchOptions } from '@/hooks/useDataFetching';
import { supabase } from '@/lib/supabase';

export interface Contact {
  id: string;
  nom: string;
  email: string | null;
  telephone: string | null;
  societe: string | null;
  type: string;
  statut: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ContactFilters {
  search?: string;
  type?: string;
  statut?: string;
  tag?: string;
  societe?: string;
}

export const contactService = {
  async fetchContacts(options: FetchOptions): Promise<{ data: Contact[]; totalItems: number }> {
    const { page = 1, filters = {}, sortBy = 'created_at', sortOrder = 'desc' } = options;
    const itemsPerPage = 10;
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    // Si on filtre par tag, on doit d'abord récupérer les IDs des contacts avec ce tag
    let contactIds: string[] | null = null;
    if (filters.tag && filters.tag !== 'all') {
      const { data: tagData, error: tagError } = await supabase
        .from('contact_tags')
        .select('contact_id')
        .eq('tag', filters.tag);

      if (tagError) {
        console.error('Erreur lors de la récupération des contacts par tag:', tagError);
        return { data: [], totalItems: 0 };
      }

      contactIds = tagData.map(t => t.contact_id);
      if (contactIds.length === 0) {
        return { data: [], totalItems: 0 };
      }
    }

    // Construire la requête de base
    let query = supabase
      .from('contacts')
      .select('*', { count: 'exact' });

    // Appliquer les filtres
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      query = query.or(`nom.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,societe.ilike.%${searchTerm}%`);
    }

    if (filters.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }

    if (filters.statut && filters.statut !== 'all') {
      query = query.eq('statut', filters.statut);
    }

    if (filters.societe && filters.societe !== 'all') {
      query = query.eq('societe', filters.societe);
    }

    // Appliquer le filtre par tag si nécessaire
    if (contactIds) {
      query = query.in('id', contactIds);
    }

    // Appliquer le tri et la pagination
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Erreur lors de la récupération des contacts: ${error.message}`);
    }

    // Récupérer les tags pour chaque contact
    const contactsWithTags = await Promise.all(
      (data || []).map(async (contact) => {
        const { data: tagsData, error: tagsError } = await supabase
          .from('contact_tags')
          .select('tag')
          .eq('contact_id', contact.id);

        if (tagsError) {
          console.error('Erreur lors de la récupération des tags:', tagsError);
          return { ...contact, tags: [] };
        }

        return { ...contact, tags: tagsData.map(t => t.tag) };
      })
    );

    return {
      data: contactsWithTags,
      totalItems: count || 0,
    };
  },

  async fetchContactStats() {
    try {
      // Récupérer tous les contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*');

      if (contactsError) throw contactsError;

      // Récupérer les tags pour tous les contacts
      const contactsWithTags = await Promise.all(
        contactsData.map(async (contact) => {
          const { data: tagsData, error: tagsError } = await supabase
            .from('contact_tags')
            .select('tag')
            .eq('contact_id', contact.id);

          if (tagsError) {
            return { ...contact, tags: [] };
          }

          return { ...contact, tags: tagsData.map(t => t.tag) };
        })
      );

      const total = contactsWithTags.length;
      const particuliers = contactsWithTags.filter(c => c.type === 'Client particulier').length;
      const professionnels = contactsWithTags.filter(c => c.type === 'Client pro' || c.type === 'Partenaire').length;
      const prospects = contactsWithTags.filter(c => c.tags.includes('chaud')).length;

      return {
        total,
        particuliers,
        professionnels,
        prospects,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  },

  async getAvailableTags(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('contact_tags')
        .select('tag')
        .order('tag');

      if (error) throw error;

      const uniqueTags = Array.from(new Set(data.map(t => t.tag)));
      return uniqueTags;
    } catch (error) {
      console.error('Erreur lors de la récupération des tags:', error);
      return [];
    }
  },

  async getAvailableCompanies(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('societe')
        .not('societe', 'is', null);

      if (error) throw error;

      const companies = Array.from(new Set(data.map(item => item.societe).filter(Boolean)));
      return companies.sort();
    } catch (error) {
      console.error('Erreur lors de la récupération des entreprises:', error);
      return [];
    }
  },

  async getAvailableTypes(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('type')
        .not('type', 'is', null);

      if (error) throw error;

      const types = Array.from(new Set(data.map(item => item.type).filter(Boolean)));
      return types.sort();
    } catch (error) {
      console.error('Erreur lors de la récupération des types:', error);
      return [];
    }
  },

  async getAvailableStatuses(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('statut')
        .not('statut', 'is', null);

      if (error) throw error;

      const statuses = Array.from(new Set(data.map(item => item.statut).filter(Boolean)));
      return statuses.sort();
    } catch (error) {
      console.error('Erreur lors de la récupération des statuts:', error);
      return [];
    }
  },
}; 