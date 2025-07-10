'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPolesManager } from '@/components/ui/UserPolesManager';
import { UpdateUserData, User, userService } from '@/lib/services/userService';
import { Calendar, Edit, Loader2, Save, User as UserIcon, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UserDetailDialogProps {
    user: User | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUserUpdated: () => void;
}

const getRoleColor = (roleName: string) => {
    if (['CEO'].includes(roleName)) return 'bg-red-100 text-red-800';
    if (['G4'].includes(roleName)) return 'bg-orange-100 text-orange-800';
    if (roleName.includes('Responsable')) return 'bg-blue-100 text-blue-800';
    if (roleName.includes('Collaborateur')) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
};

export function UserDetailDialog({ user, open, onOpenChange, onUserUpdated }: UserDetailDialogProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [roles, setRoles] = useState<any[]>([]);
    const [formData, setFormData] = useState<UpdateUserData>({
        prenom: '',
        nom: '',
        email: '',
        telephone: '',
        role_id: undefined
    });

    // Charger les rôles disponibles
    useEffect(() => {
        const loadRoles = async () => {
            try {
                const rolesData = await userService.getAvailableRoles();
                setRoles(rolesData);
            } catch (error) {
                console.error('Erreur lors du chargement des rôles:', error);
            }
        };
        loadRoles();
    }, []);

    // Mettre à jour le formulaire quand l'utilisateur change
    useEffect(() => {
        if (user) {
            setFormData({
                prenom: user.prenom,
                nom: user.nom,
                email: user.email,
                telephone: user.telephone || '',
                role_id: user.role?.id
            });
            setIsEditing(false);
        }
    }, [user]);

    const handleSave = async () => {
        if (!user) return;

        try {
            setSaving(true);
            await userService.updateUser(user.id, formData);
            toast.success('Utilisateur mis à jour avec succès');
            setIsEditing(false);
            onUserUpdated();
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            toast.error('Erreur lors de la mise à jour de l\'utilisateur');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (user) {
            setFormData({
                prenom: user.prenom,
                nom: user.nom,
                email: user.email,
                telephone: user.telephone || '',
                role_id: user.role?.id
            });
        }
        setIsEditing(false);
    };

    // Callback quand les pôles sont mis à jour
    const handlePolesUpdated = () => {
        onUserUpdated();
    };

    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserIcon className="h-5 w-5" />
                        {isEditing ? 'Modifier l\'utilisateur' : 'Détails de l\'utilisateur'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Modifiez les informations de l\'utilisateur'
                            : 'Informations détaillées de l\'utilisateur'
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* En-tête avec avatar et statut */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 rounded-full bg-mkb-blue/10 flex items-center justify-center">
                            <span className="text-mkb-blue font-bold text-xl">
                                {user.prenom.charAt(0)}{user.nom.charAt(0)}
                            </span>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-mkb-black">
                                {user.prenom} {user.nom}
                            </h3>
                            <p className="text-gray-600">{user.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge className={user.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                    {user.actif ? 'Actif' : 'Inactif'}
                                </Badge>
                                {user.role && (
                                    <Badge className={getRoleColor(user.role.nom)}>
                                        {user.role.nom} (Niveau {user.role.niveau})
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {!isEditing && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Modifier
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Informations de base */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Prénom</Label>
                            {isEditing ? (
                                <Input
                                    value={formData.prenom}
                                    onChange={(e) => setFormData(prev => ({ ...prev, prenom: e.target.value }))}
                                    placeholder="Prénom"
                                />
                            ) : (
                                <div className="p-2 bg-gray-50 rounded border text-mkb-black">
                                    {user.prenom}
                                </div>
                            )}
                        </div>
                        <div>
                            <Label>Nom</Label>
                            {isEditing ? (
                                <Input
                                    value={formData.nom}
                                    onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                                    placeholder="Nom"
                                />
                            ) : (
                                <div className="p-2 bg-gray-50 rounded border text-mkb-black">
                                    {user.nom}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <Label>Email</Label>
                        {isEditing ? (
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="email@mkb.com"
                            />
                        ) : (
                            <div className="p-2 bg-gray-50 rounded border text-mkb-black">
                                {user.email}
                            </div>
                        )}
                    </div>

                    <div>
                        <Label>Téléphone</Label>
                        {isEditing ? (
                            <Input
                                value={formData.telephone}
                                onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
                                placeholder="+33 1 23 45 67 89"
                            />
                        ) : (
                            <div className="p-2 bg-gray-50 rounded border text-mkb-black">
                                {user.telephone || 'Non renseigné'}
                            </div>
                        )}
                    </div>

                    <div>
                        <Label>Rôle</Label>
                        {isEditing ? (
                            <Select
                                value={formData.role_id?.toString() || ''}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, role_id: parseInt(value) }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un rôle" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.id.toString()}>
                                            {role.nom} (Niveau {role.niveau})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="p-2 bg-gray-50 rounded border">
                                {user.role ? (
                                    <Badge className={getRoleColor(user.role.nom)}>
                                        {user.role.nom} (Niveau {user.role.niveau})
                                    </Badge>
                                ) : (
                                    <span className="text-gray-500">Aucun rôle assigné</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Gestion des pôles */}
                    {!isEditing && (
                        <UserPolesManager
                            user={user}
                            onPolesUpdated={handlePolesUpdated}
                        />
                    )}

                    {/* Informations système */}
                    <div className="border-t pt-4">
                        <h4 className="font-medium text-mkb-black mb-3">Informations système</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <Label className="text-gray-600">Date de création</Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span className="text-mkb-black">
                                        {new Date(user.date_creation).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <Label className="text-gray-600">Dernière connexion</Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span className="text-mkb-black">
                                        {user.last_login
                                            ? new Date(user.last_login).toLocaleDateString('fr-FR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })
                                            : 'Jamais connecté'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    {isEditing && (
                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button variant="outline" onClick={handleCancel}>
                                <X className="h-4 w-4 mr-2" />
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
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Sauvegarder
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
} 