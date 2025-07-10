'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Pole, poleService } from '@/lib/services/poleService';
import { Building2, Edit, Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PoleManagerProps {
    onPolesUpdated: () => void;
}

export interface CreatePoleData {
    name: string;
    description?: string;
}

export interface UpdatePoleData {
    name?: string;
    description?: string;
}

export const poleManagerService = {
    // Créer un nouveau pôle
    async createPole(poleData: CreatePoleData): Promise<Pole> {
        try {
            const { data, error } = await poleService.supabase
                .from('poles')
                .insert({
                    name: poleData.name,
                    description: poleData.description || null
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erreur lors de la création du pôle:', error);
            throw error;
        }
    },

    // Mettre à jour un pôle
    async updatePole(id: number, poleData: UpdatePoleData): Promise<Pole> {
        try {
            const { data, error } = await poleService.supabase
                .from('poles')
                .update({
                    name: poleData.name,
                    description: poleData.description,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erreur lors de la mise à jour du pôle:', error);
            throw error;
        }
    },

    // Supprimer un pôle
    async deletePole(id: number): Promise<void> {
        try {
            // Vérifier s'il y a des utilisateurs affectés à ce pôle
            const { data: usersWithPole, error: checkError } = await poleService.supabase
                .from('user_poles')
                .select('id')
                .eq('pole_id', id);

            if (checkError) throw checkError;

            if (usersWithPole && usersWithPole.length > 0) {
                throw new Error(`Impossible de supprimer ce pôle car ${usersWithPole.length} utilisateur(s) y sont affectés`);
            }

            const { error } = await poleService.supabase
                .from('poles')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Erreur lors de la suppression du pôle:', error);
            throw error;
        }
    },

    // Vérifier si un nom de pôle existe déjà
    async checkPoleNameExists(name: string, excludeId?: number): Promise<boolean> {
        try {
            let query = poleService.supabase
                .from('poles')
                .select('id')
                .eq('name', name);

            if (excludeId) {
                query = query.neq('id', excludeId);
            }

            const { data, error } = await query;

            if (error) throw error;
            return (data || []).length > 0;
        } catch (error) {
            console.error('Erreur lors de la vérification du nom de pôle:', error);
            throw error;
        }
    }
};

export function PoleManager({ onPolesUpdated }: PoleManagerProps) {
    const [poles, setPoles] = useState<Pole[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedPole, setSelectedPole] = useState<Pole | null>(null);
    const [saving, setSaving] = useState(false);

    // État pour le formulaire de création/édition
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    // Charger les pôles
    const loadPoles = async () => {
        try {
            setLoading(true);
            const polesData = await poleService.fetchPoles();
            setPoles(polesData);
        } catch (error) {
            console.error('Erreur lors du chargement des pôles:', error);
            toast.error('Erreur lors du chargement des pôles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPoles();
    }, []);

    // Ouvrir le dialogue de création
    const handleCreatePole = () => {
        setFormData({ name: '', description: '' });
        setIsCreateDialogOpen(true);
    };

    // Ouvrir le dialogue d'édition
    const handleEditPole = (pole: Pole) => {
        setSelectedPole(pole);
        setFormData({
            name: pole.name,
            description: pole.description || ''
        });
        setIsEditDialogOpen(true);
    };

    // Sauvegarder (création ou édition)
    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error('Le nom du pôle est obligatoire');
            return;
        }

        try {
            setSaving(true);

            if (selectedPole) {
                // Édition
                await poleManagerService.updatePole(selectedPole.id, formData);
                toast.success('Pôle mis à jour avec succès');
                setIsEditDialogOpen(false);
            } else {
                // Création
                await poleManagerService.createPole(formData);
                toast.success('Pôle créé avec succès');
                setIsCreateDialogOpen(false);
            }

            setSelectedPole(null);
            loadPoles();
            onPolesUpdated();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            toast.error(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    // Supprimer un pôle
    const handleDeletePole = async (pole: Pole) => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer le pôle '${pole.name}' ?`)) {
            return;
        }

        try {
            await poleManagerService.deletePole(pole.id);
            toast.success('Pôle supprimé avec succès');
            loadPoles();
            onPolesUpdated();
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression');
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Gestion des Pôles
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-mkb-blue" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Gestion des Pôles ({poles.length})
                    </CardTitle>
                    <Button size="sm" className="bg-mkb-blue hover:bg-mkb-blue/90" onClick={handleCreatePole}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nouveau Pôle
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {poles.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Aucun pôle défini</p>
                        <p className="text-sm">Cliquez sur "Nouveau Pôle" pour commencer</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {poles.map((pole) => (
                            <div
                                key={pole.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-mkb-blue/10 flex items-center justify-center">
                                        <Building2 className="h-4 w-4 text-mkb-blue" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-mkb-black">{pole.name}</div>
                                        <div className="text-sm text-gray-600">{pole.description}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge className="bg-blue-100 text-blue-800">
                                                Pôle métier
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditPole(pole)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeletePole(pole)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

            {/* Dialogue de création */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Créer un Nouveau Pôle</DialogTitle>
                        <DialogDescription>
                            Définir un nouveau pôle métier
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Nom du pôle *</Label>
                            <Input
                                placeholder="Ex: Service Client"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Textarea
                                placeholder="Description du pôle et responsabilités"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Annuler
                            </Button>
                            <Button
                                className="bg-mkb-blue hover:bg-mkb-blue/90"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Création...
                                    </>
                                ) : (
                                    'Créer le pôle'
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialogue d'édition */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier le Pôle</DialogTitle>
                        <DialogDescription>
                            Modifier les informations du pôle
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Nom du pôle *</Label>
                            <Input
                                placeholder="Ex: Service Client"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Textarea
                                placeholder="Description du pôle et responsabilités"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Annuler
                            </Button>
                            <Button
                                className="bg-mkb-blue hover:bg-mkb-blue/90"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Sauvegarde...
                                    </>
                                ) : (
                                    'Sauvegarder'
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
} 