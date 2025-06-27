'use client';

import { supabase } from '@/lib/supabase';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Building2,
  FileText,
  Loader2,
  Mail,
  Phone,
  Save,
  Tag,
  User,
  Users,
  X
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TagManager } from '@/components/ui/TagManager';
import { Textarea } from '@/components/ui/textarea';

import { contactSchema, type ContactFormData } from '@/lib/schemas/contact';

interface ContactDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ContactDrawer({ open, onOpenChange, onSuccess }: ContactDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactId, setContactId] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      notes: '',
      status: 'actif',
      tags: [],
    },
  });

  const watchType = form.watch('type');
  const isCompanyRequired = watchType === 'Client pro' || watchType === 'Partenaire';

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      // Ajouter la date de création
      const contactData = {
        ...data,
        created_at: new Date().toISOString(),
      };

      // Insérer dans Supabase
      const { data: newContact, error } = await supabase
        .from('contacts')
        .insert([contactData])
        .select('id')
        .single();

      if (error) {
        console.error('Erreur lors de la création du contact:', error);
        throw new Error(`Erreur lors de la création du contact: ${error.message}`);
      }

      // Store the contact ID for tag management
      setContactId(newContact.id);

      // Add tags if any
      if (selectedTags.length > 0) {
        const tagInserts = selectedTags.map(tag => ({
          contact_id: newContact.id,
          tag
        }));

        const { error: tagError } = await supabase
          .from('contact_tags')
          .insert(tagInserts);

        if (tagError) {
          console.error('Erreur lors de l\'ajout des tags:', tagError);
          // Continue anyway, we've already created the contact
        }
      }

      toast.success('Contact créé avec succès !');

      // Réinitialiser le formulaire
      form.reset();
      setSelectedTags([]);

      // Fermer le drawer
      onOpenChange(false);

      // Callback de succès
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags);
    form.setValue('tags', tags);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[85vh] max-h-[85vh] p-0">
        <div className="flex flex-col h-full">
          <DrawerHeader className="border-b pb-4 px-4">
            <DrawerTitle className="text-xl font-bold text-mkb-black flex items-center gap-2">
              <Users className="h-5 w-5 text-mkb-blue" />
              Ajouter un Contact
            </DrawerTitle>
            <DrawerDescription>
              Créer une nouvelle fiche contact dans le carnet d&apos;adresses central
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 py-6">
            <Form form={form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Type de contact */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-mkb-black font-medium">Type de contact *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Client particulier">Client particulier</SelectItem>
                          <SelectItem value="Client pro">Client professionnel</SelectItem>
                          <SelectItem value="Lead">Lead</SelectItem>
                          <SelectItem value="Partenaire">Partenaire</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Nom et coordonnées */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-mkb-black font-medium">Nom complet *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input placeholder="Nom et prénom" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchType && isCompanyRequired && (
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-mkb-black font-medium">Société *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input placeholder="Nom de l'entreprise" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-mkb-black font-medium">Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input placeholder="email@exemple.com" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-mkb-black font-medium">Téléphone</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input placeholder="+33 6 12 34 56 78" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-mkb-black font-medium">Notes</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                          <Textarea
                            placeholder="Informations complémentaires, préférences, historique..."
                            className="pl-10 min-h-[120px]"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Statut et tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-mkb-black font-medium">Statut</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un statut" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="actif">Actif</SelectItem>
                            <SelectItem value="prospect">Prospect</SelectItem>
                            <SelectItem value="inactif">Inactif</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel className="text-mkb-black font-medium">Tags</FormLabel>
                    {contactId ? (
                      <TagManager
                        contactId={contactId}
                        existingTags={selectedTags}
                        onTagsChange={handleTagsChange}
                        className="mt-2"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['chaud', 'froid', 'vip', 'relance', 'b2b', 'apporteur', 'marchand'].map((tag) => (
                          <Badge
                            key={tag}
                            variant={selectedTags.includes(tag) ? "default" : "outline"}
                            className={`cursor-pointer ${selectedTags.includes(tag)
                              ? 'bg-mkb-blue text-white'
                              : 'hover:bg-mkb-blue/10'
                              }`}
                            onClick={() => {
                              const newTags = selectedTags.includes(tag)
                                ? selectedTags.filter(t => t !== tag)
                                : [...selectedTags, tag];

                              setSelectedTags(newTags);
                              form.setValue('tags', newTags);
                            }}
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </Form>
          </div>

          <DrawerFooter className="border-t pt-4 px-4">
            <div className="flex justify-end gap-4">
              <DrawerClose asChild>
                <Button variant="outline">
                  <X className="mr-2 h-4 w-4" />
                  Annuler
                </Button>
              </DrawerClose>

              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="bg-mkb-blue hover:bg-mkb-blue/90 text-white min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Créer le contact
                  </>
                )}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}