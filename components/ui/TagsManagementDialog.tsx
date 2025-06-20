'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { Check, Edit, Loader2, Search, Tag, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface TagsManagementDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onTagsUpdated?: () => void;
}

interface TagData {
    tag: string;
    count: number;
    color: string;
}

const TAG_COLORS = [
    '#2bbbdc', // MKB Blue
    '#fcbe15', // MKB Yellow
    '#1d1d1d', // MKB Black
    '#10b981', // Green
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#f97316', // Orange
    '#06b6d4', // Cyan
];

export function TagsManagementDialog({ open, onOpenChange, onTagsUpdated }: TagsManagementDialogProps) {
    const [tags, setTags] = useState<TagData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingTag, setEditingTag] = useState<TagData | null>(null);
    const [newTagName, setNewTagName] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (open) {
            fetchAllTags();
        }
    }, [open]);

    const fetchAllTags = async () => {
        setLoading(true);
        try {
            // Get all tags with counts
            const { data, error } = await supabase
                .from('contact_tags')
                .select('tag')
                .order('tag');

            if (error) throw error;

            // Count occurrences of each tag
            const tagCounts: Record<string, number> = {};
            const tagColors: Record<string, string> = {};

            data.forEach(item => {
                if (tagCounts[item.tag]) {
                    tagCounts[item.tag]++;
                } else {
                    tagCounts[item.tag] = 1;
                    // Assign a consistent color based on the tag name
                    const colorIndex = item.tag.charCodeAt(0) % TAG_COLORS.length;
                    tagColors[item.tag] = TAG_COLORS[colorIndex];
                }
            });

            // Convert to array of TagData objects
            const tagData = Object.keys(tagCounts).map(tag => ({
                tag,
                count: tagCounts[tag],
                color: tagColors[tag]
            }));

            setTags(tagData);
        } catch (error) {
            console.error('Error fetching tags:', error);
            toast.error('Erreur lors du chargement des tags');
        } finally {
            setLoading(false);
        }
    };

    const handleEditTag = (tag: TagData) => {
        setEditingTag(tag);
        setNewTagName(tag.tag);
        setSelectedColor(tag.color);
    };

    const handleSaveTagEdit = async () => {
        if (!editingTag || !newTagName.trim()) return;

        setIsProcessing(true);

        try {
            // In a real app, we would update all occurrences of this tag
            // For this demo, we'll simulate the update with a timeout
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update local state
            const updatedTags = tags.map(tag =>
                tag.tag === editingTag.tag
                    ? { ...tag, tag: newTagName, color: selectedColor }
                    : tag
            );

            setTags(updatedTags);
            setEditingTag(null);
            setNewTagName('');
            setSelectedColor('');

            toast.success('Tag mis à jour avec succès');

            if (onTagsUpdated) {
                onTagsUpdated();
            }
        } catch (error) {
            console.error('Error updating tag:', error);
            toast.error('Erreur lors de la mise à jour du tag');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteTag = async (tagToDelete: string) => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer le tag "${tagToDelete}" de tous les contacts ?`)) {
            return;
        }

        setIsProcessing(true);

        try {
            // Delete all occurrences of this tag
            const { error } = await supabase
                .from('contact_tags')
                .delete()
                .eq('tag', tagToDelete);

            if (error) throw error;

            // Update local state
            setTags(tags.filter(tag => tag.tag !== tagToDelete));

            toast.success('Tag supprimé avec succès');

            if (onTagsUpdated) {
                onTagsUpdated();
            }
        } catch (error) {
            console.error('Error deleting tag:', error);
            toast.error('Erreur lors de la suppression du tag');
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredTags = tags.filter(tag =>
        tag.tag.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        Gestion des Tags
                    </DialogTitle>
                    <DialogDescription>
                        Gérez tous les tags utilisés dans votre base de contacts
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Rechercher un tag..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Tags List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 text-mkb-blue animate-spin" />
                        </div>
                    ) : filteredTags.length === 0 ? (
                        <div className="text-center py-12">
                            <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-700">Aucun tag trouvé</h3>
                            <p className="text-gray-500 mt-2">
                                {searchTerm ? 'Modifiez votre recherche ou créez un nouveau tag.' : 'Commencez par ajouter des tags à vos contacts.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredTags.map((tag) => (
                                <div
                                    key={tag.tag}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    {editingTag?.tag === tag.tag ? (
                                        <div className="flex-1 flex items-center gap-3">
                                            <div className="flex-1">
                                                <Input
                                                    value={newTagName}
                                                    onChange={(e) => setNewTagName(e.target.value)}
                                                    className="mb-2"
                                                />
                                                <div className="flex flex-wrap gap-2">
                                                    {TAG_COLORS.map((color) => (
                                                        <button
                                                            key={color}
                                                            className={`w-6 h-6 rounded-full transition-all ${selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                                                                }`}
                                                            style={{ backgroundColor: color }}
                                                            onClick={() => setSelectedColor(color)}
                                                            type="button"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setEditingTag(null)}
                                                    disabled={isProcessing}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-mkb-blue hover:bg-mkb-blue/90"
                                                    onClick={handleSaveTagEdit}
                                                    disabled={isProcessing || !newTagName.trim()}
                                                >
                                                    {isProcessing ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Check className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <Badge
                                                    className="px-2 py-1 text-white"
                                                    style={{ backgroundColor: tag.color }}
                                                >
                                                    <Tag className="h-3 w-3 mr-1" />
                                                    {tag.tag}
                                                </Badge>
                                                <span className="text-sm text-gray-500">
                                                    {tag.count} contact{tag.count > 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleEditTag(tag)}
                                                    disabled={isProcessing}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-500 hover:text-red-700"
                                                    onClick={() => handleDeleteTag(tag.tag)}
                                                    disabled={isProcessing}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Fermer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}