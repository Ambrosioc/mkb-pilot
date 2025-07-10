'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Role, roleService } from '@/lib/services/roleService';
import { Edit, Loader2, Plus, Shield, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface RoleManagerProps {
    onRolesUpdated: () => void;
}

export function RoleManager({ onRolesUpdated }: RoleManagerProps) {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [saving, setSaving] = useState(false);

    // État pour le formulaire de création/édition
    const [formData, setFormData] = useState({
        nom: '',
        niveau: 5,
        description: ''
    });

    // Charger les rôles
    const loadRoles = async () => {
        try {
            setLoading(true);
            const rolesData = await roleService.fetchRoles();
            setRoles(rolesData);
        } catch (error) {
            console.error('Erreur lors du chargement des rôles:', error);
            toast.error('Erreur lors du chargement des rôles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRoles();
    }, []);

    // Ouvrir le dialogue de création
    const handleCreateRole = () => {
        setFormData({ nom: '', niveau: 5, description: '' });
        setIsCreateDialogOpen(true);
    };

    // Ouvrir le dialogue d'édition
    const handleEditRole = (role: Role) => {
        setSelectedRole(role);
        setFormData({
            nom: role.nom,
            niveau: role.niveau,
            description: role.description || ''
        });
        setIsEditDialogOpen(true);
    };

    // Sauvegarder (création ou édition)
    const handleSave = async () => {
        if (!formData.nom.trim()) {
            toast.error('Le nom du rôle est obligatoire');
            return;
        }

        try {
            setSaving(true);

            if (selectedRole) {
                // Édition
                await roleService.updateRole(selectedRole.id, formData);
                toast.success('Rôle mis à jour avec succès');
                setIsEditDialogOpen(false);
            } else {
                // Création
                await roleService.createRole(formData);
                toast.success('Rôle créé avec succès');
                setIsCreateDialogOpen(false);
            }

            setSelectedRole(null);
            loadRoles();
            onRolesUpdated();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            toast.error(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    // Supprimer un rôle
    const handleDeleteRole = async (role: Role) => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer le rôle '${role.nom}' ?`)) {
            return;
        }

        try {
            await roleService.deleteRole(role.id);
            toast.success('Rôle supprimé avec succès');
            loadRoles();
            onRolesUpdated();
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression');
        }
    };

    // Obtenir la couleur du niveau
    const getLevelColor = (niveau: number) => {
        if (niveau <= 2) return 'bg-red-100 text-red-800';
        if (niveau <= 3) return 'bg-orange-100 text-orange-800';
        if (niveau <= 4) return 'bg-blue-100 text-blue-800';
        return 'bg-green-100 text-green-800';
    };

    // Obtenir le nom du niveau
    const getLevelName = (niveau: number) => {
        if (niveau === 1) return 'CEO';
        if (niveau === 2) return 'G4';
        if (niveau === 3) return 'Responsable';
        if (niveau === 4) return 'Collaborateur confirmé';
        return 'Collaborateur simple';
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Gestion des Rôles
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
                        <Shield className="h-5 w-5" />
                        Gestion des Rôles ({roles.length})
                    </CardTitle>
                    <Button size="sm" className="bg-mkb-blue hover:bg-mkb-blue/90" onClick={handleCreateRole}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nouveau Rôle
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {roles.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Aucun rôle défini</p>
                        <p className="text-sm">Cliquez sur "Nouveau Rôle" pour commencer</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {roles.map((role) => (
                            <div
                                key={role.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-mkb-blue/10 flex items-center justify-center">
                                        <Shield className="h-4 w-4 text-mkb-blue" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-mkb-black">{role.nom}</div>
                                        <div className="text-sm text-gray-600">{role.description}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge className={getLevelColor(role.niveau)}>
                                                {getLevelName(role.niveau)} (N{role.niveau})
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditRole(role)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteRole(role)}
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
                        <DialogTitle>Créer un Nouveau Rôle</DialogTitle>
                        <DialogDescription>
                            Définir un nouveau rôle avec ses permissions
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Nom du rôle *</Label>
                            <Input
                                placeholder="Ex: Responsable SAV"
                                value={formData.nom}
                                onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label>Niveau *</Label>
                            <Select
                                value={formData.niveau.toString()}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, niveau: parseInt(value) }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un niveau" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 - CEO</SelectItem>
                                    <SelectItem value="2">2 - G4</SelectItem>
                                    <SelectItem value="3">3 - Responsable</SelectItem>
                                    <SelectItem value="4">4 - Collaborateur confirmé</SelectItem>
                                    <SelectItem value="5">5 - Collaborateur simple</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Textarea
                                placeholder="Description du rôle et responsabilités"
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
                                    'Créer le rôle'
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
                        <DialogTitle>Modifier le Rôle</DialogTitle>
                        <DialogDescription>
                            Modifier les informations du rôle
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Nom du rôle *</Label>
                            <Input
                                placeholder="Ex: Responsable SAV"
                                value={formData.nom}
                                onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label>Niveau *</Label>
                            <Select
                                value={formData.niveau.toString()}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, niveau: parseInt(value) }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un niveau" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 - CEO</SelectItem>
                                    <SelectItem value="2">2 - G4</SelectItem>
                                    <SelectItem value="3">3 - Responsable</SelectItem>
                                    <SelectItem value="4">4 - Collaborateur confirmé</SelectItem>
                                    <SelectItem value="5">5 - Collaborateur simple</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Textarea
                                placeholder="Description du rôle et responsabilités"
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