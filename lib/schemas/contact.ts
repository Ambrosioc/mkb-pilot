import { z } from 'zod';

export const contactSchema = z.object({
  type: z.enum(['Client particulier', 'Client pro', 'Lead', 'Partenaire'], {
    required_error: 'Veuillez sélectionner un type de contact',
  }),
  name: z.string().min(1, 'Le nom est obligatoire'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  company: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  status: z.enum(['actif', 'inactif', 'prospect']).default('actif'),
  tags: z.array(z.string()).optional().default([]),
});

export type ContactFormData = z.infer<typeof contactSchema>;