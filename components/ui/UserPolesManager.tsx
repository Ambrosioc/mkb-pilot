'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { poleService } from '@/lib/services/poleService';
import { User } from '@/lib/services/userService';
import { Building2, Loader2, Plus, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UserPolesManagerProps {
    user: User;
    onPolesUpdated: () => void;
}

export function UserPolesManager({ user, onPolesUpdated }: UserPolesManagerProps) {
    const [availablePoles, setAvailablePoles] = useState<any[]>([]);
    const [userPoles, setUserPoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [selectedPoleId, setSelectedPoleId] = useState<string>('');
    const [poleToRemove, setPoleToRemove] = useState<{ id: number; name: string } | null>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const [polesData, userPolesData] = await Promise.all([
                poleService.fetchPoles(),
                poleService.fetchUserPoles(user.id)
            ]);

            setAvailablePoles(polesData);
            setUserPoles(userPolesData);
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            toast.error('Erreur lors du chargement des pôles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user.id]);

    // Assigner un pôle
    const handleAssignPole = async () => {
        if (!selectedPoleId) {
            toast.error('Veuillez sélectionner un pôle');
            return;
        }

        try {
            setAssigning(true);
            const adminName = 'Administrateur'; // Vous pouvez récupérer le nom de l'admin connecté ici
            await poleService.assignPoleToUser(
                user.id,
                parseInt(selectedPoleId),
                adminName
            );

            toast.success('Pôle assigné avec succès');
            setIsAssignDialogOpen(false);
            setSelectedPoleId('');
            loadData(); // Recharger les données
            onPolesUpdated(); // Notifier le parent
        } catch (error) {
            console.error('Erreur lors de l\'assignation:', error);
            toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'assignation du pôle');
        } finally {
            setAssigning(false);
        }
    };

    // Retirer un pôle
    const handleRemovePole = async () => {
        if (!poleToRemove) return;

        try {
            const adminName = 'Administrateur'; // Vous pouvez récupérer le nom de l'admin connecté ici
            await poleService.removePoleFromUser(user.id, poleToRemove.id, adminName);
            toast.success(`Accès au pôle &quot;${poleToRemove.name}&quot; retiré avec succès`);
            setPoleToRemove(null);
            loadData(); // Recharger les données
            onPolesUpdated(); // Notifier le parent
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            toast.error('Erreur lors de la suppression de l\'accès');
        }
    };

    // Ouvrir le dialogue de confirmation de suppression
    const openRemoveDialog = (poleId: number, poleName: string) => {
        setPoleToRemove({ id: poleId, name: poleName });
    };

    // Filtrer les pôles disponibles (exclure ceux déjà assignés)
    const availablePolesForAssignment = availablePoles.filter(
        pole => !userPoles.some(userPole => userPole.pole_id === pole.id)
    );

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Pôles assignés
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
                        Pôles assignés ({userPoles.length})
                    </CardTitle>
                    <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-mkb-blue hover:bg-mkb-blue/90">
                                <Plus className="h-4 w-4 mr-2" />
                                Assigner un pôle
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Assigner un pôle à {user.prenom} {user.nom}</DialogTitle>
                                <DialogDescription>
                                    Sélectionnez un pôle à assigner à cet utilisateur
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Pôle</label>
                                    <Select value={selectedPoleId} onValueChange={setSelectedPoleId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner un pôle" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availablePolesForAssignment.map((pole) => (
                                                <SelectItem key={pole.id} value={pole.id.toString()}>
                                                    {pole.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                                        Annuler
                                    </Button>
                                    <Button
                                        className="bg-mkb-blue hover:bg-mkb-blue/90"
                                        onClick={handleAssignPole}
                                        disabled={assigning || !selectedPoleId}
                                    >
                                        {assigning ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Assignation...
                                            </>
                                        ) : (
                                            'Assigner'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {userPoles.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Aucun pôle assigné</p>
                        <p className="text-sm">Cliquez sur "Assigner un pôle" pour commencer</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {userPoles.map((userPole) => (
                            <div
                                key={userPole.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-mkb-blue/10 flex items-center justify-center">
                                        <Building2 className="h-4 w-4 text-mkb-blue" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-mkb-black">{userPole.pole_name}</div>
                                        <div className="text-sm text-gray-600">{userPole.pole_description}</div>
                                        <div className="text-xs text-gray-400">
                                            Assigné le {new Date(userPole.created_at).toLocaleDateString('fr-FR')}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-green-100 text-green-800">
                                        Accès accordé
                                    </Badge>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openRemoveDialog(userPole.pole_id, userPole.pole_name)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Retirer l'accès au pôle</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Êtes-vous sûr de vouloir retirer l&apos;accès au pôle &quot;{userPole.pole_name}&quot; de {user.prenom} {user.nom} ?
                                                    <br />
                                                    <br />
                                                    Cette action ne peut pas être annulée.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={handleRemovePole}
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    Retirer l'accès
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 