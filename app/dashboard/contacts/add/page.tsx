'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Users,
  Save,
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  User,
  FileText,
  Tag,
  Loader2
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

import { contactSchema, type ContactFormData } from '@/lib/schemas/contact';

export default function AddContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      type: undefined,
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

      toast.success('Contact créé avec succès !');
      
      // Rediriger vers la liste des contacts
      router.push('/dashboard/contacts');
      
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
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
              Ajouter un Contact
            </h1>
            <p className="text-gray-600">
              Créer une nouvelle fiche contact dans le carnet d'adresses central
            </p>
          </div>
        </div>
        <Link href="/dashboard/contacts">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste
          </Button>
        </Link>
      </motion.div>

      {/* Formulaire */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <User className="h-5 w-5 text-mkb-blue" />
              Informations du Contact
            </CardTitle>
            <CardDescription>
              Renseignez les informations du nouveau contact
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
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
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['chaud', 'froid', 'vip', 'relance'].map((tag) => (
                        <Badge 
                          key={tag}
                          variant="outline" 
                          className="cursor-pointer hover:bg-mkb-blue/10"
                          onClick={() => {
                            const currentTags = form.getValues('tags') || [];
                            if (currentTags.includes(tag)) {
                              form.setValue('tags', currentTags.filter(t => t !== tag));
                            } else {
                              form.setValue('tags', [...currentTags, tag]);
                            }
                          }}
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/dashboard/contacts')}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </Button>
                  
                  <Button
                    type="submit"
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
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}