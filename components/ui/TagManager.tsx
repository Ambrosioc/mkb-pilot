'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/lib/supabase';
import { Check, Loader2, Plus, Tag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface TagManagerProps {
    contactId: string;
    existingTags?: string[];
    onTagsChange?: (tags: string[]) => void;
    className?: string;
}

interface TagOption {
    label: string;
    color: string;
    count: number;
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

export function TagManager({ contactId, existingTags = [], onTagsChange, className }: TagManagerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [newTag, setNewTag] = useState('');
    const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);
    const [allTags, setAllTags] = useState<TagOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentTags, setCurrentTags] = useState<string[]>(existingTags);

    // Fetch all existing tags from the database
    useEffect(() => {
        fetchAllTags();
    }, []);

    // Update current tags when existingTags prop changes
    useEffect(() => {
        setCurrentTags(existingTags);
    }, [existingTags]);

    const fetchAllTags = async () => {
        try {
            const { data, error } = await supabase
                .from('contact_tags')
                .select('tag')
                .order('tag');

            if (error) throw error;

            // Count occurrences of each tag
            const tagCounts: Record<string, number> = {};
            const tagColors: Record<string, string> = {};

            data.forEach(item => {
                if (!item.tag) return; // Skip if tag is undefined

                const tag = item.tag as string;
                if (tagCounts[tag]) {
                    tagCounts[tag]++;
                } else {
                    tagCounts[tag] = 1;
                    // Assign a consistent color based on the tag name
                    const colorIndex = tag.charCodeAt(0) % TAG_COLORS.length;
                    const selectedColor = TAG_COLORS[colorIndex]!;
                    tagColors[tag] = selectedColor;
                }
            });

            // Convert to array of TagOption objects with guaranteed values
            const tagOptions: TagOption[] = Object.keys(tagCounts).map(tag => {
                const count = tagCounts[tag]!;
                const color = tagColors[tag]!;

                return {
                    label: tag,
                    count,
                    color
                };
            });

            setAllTags(tagOptions);
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    const addTag = async () => {
        if (!newTag.trim()) return;

        setIsLoading(true);

        try {
            // Check if tag already exists for this contact
            if (currentTags.includes(newTag.trim())) {
                toast.error('Ce tag existe déjà pour ce contact');
                return;
            }

            // Add tag to contact_tags table
            const { error } = await supabase
                .from('contact_tags')
                .insert({
                    contact_id: contactId,
                    tag: newTag.trim()
                });

            if (error) throw error;

            // Update local state
            const updatedTags = [...currentTags, newTag.trim()];
            setCurrentTags(updatedTags);

            // Notify parent component
            if (onTagsChange) {
                onTagsChange(updatedTags);
            }

            // Reset form
            setNewTag('');
            setIsOpen(false);

            // Refresh all tags
            fetchAllTags();

            toast.success('Tag ajouté avec succès');
        } catch (error) {
            console.error('Error adding tag:', error);
            toast.error('Erreur lors de l\'ajout du tag');
        } finally {
            setIsLoading(false);
        }
    };

    const removeTag = async (tagToRemove: string) => {
        setIsLoading(true);

        try {
            // Remove tag from contact_tags table
            const { error } = await supabase
                .from('contact_tags')
                .delete()
                .eq('contact_id', contactId)
                .eq('tag', tagToRemove);

            if (error) throw error;

            // Update local state
            const updatedTags = currentTags.filter(tag => tag !== tagToRemove);
            setCurrentTags(updatedTags);

            // Notify parent component
            if (onTagsChange) {
                onTagsChange(updatedTags);
            }

            toast.success('Tag supprimé avec succès');
        } catch (error) {
            console.error('Error removing tag:', error);
            toast.error('Erreur lors de la suppression du tag');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTagSelect = (tag: string) => {
        setNewTag(tag);
        // Find the color for this tag
        const tagOption = allTags.find(t => t.label === tag);
        if (tagOption) {
            setSelectedColor(tagOption.color);
        }
    };

    // Get tag color based on tag name
    const getTagColor = (tag: string) => {
        const tagOption = allTags.find(t => t.label === tag);
        return tagOption?.color || TAG_COLORS[0];
    };

    return (
        <div className={className}>
            <div className="flex flex-wrap gap-2 mb-2">
                {currentTags.map((tag) => (
                    <Badge
                        key={tag}
                        className="flex items-center gap-1 px-2 py-1 text-white"
                        style={{ backgroundColor: getTagColor(tag) }}
                    >
                        <Tag className="h-3 w-3" />
                        {tag}
                        <button
                            className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                            onClick={() => removeTag(tag)}
                            disabled={isLoading}
                        >
                            <X className="h-2 w-2" />
                        </button>
                    </Badge>
                ))}

                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs border-dashed"
                        >
                            <Plus className="h-3 w-3 mr-1" />
                            Ajouter un tag
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="tag">Nom du tag</Label>
                                <div className="flex mt-1.5">
                                    <Input
                                        id="tag"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        placeholder="Entrez un nom de tag"
                                        className="rounded-r-none"
                                    />
                                    <Button
                                        className="rounded-l-none"
                                        onClick={addTag}
                                        disabled={!newTag.trim() || isLoading}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Check className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <Label>Couleur</Label>
                                <div className="flex flex-wrap gap-2 mt-1.5">
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

                            {allTags.length > 0 && (
                                <div>
                                    <Label>Tags suggérés</Label>
                                    <div className="flex flex-wrap gap-2 mt-1.5">
                                        {allTags
                                            .filter(tag => !currentTags.includes(tag.label))
                                            .sort((a, b) => b.count - a.count)
                                            .slice(0, 8)
                                            .map((tag) => (
                                                <Badge
                                                    key={tag.label}
                                                    className="cursor-pointer px-2 py-1 text-white"
                                                    style={{ backgroundColor: tag.color }}
                                                    onClick={() => handleTagSelect(tag.label)}
                                                >
                                                    {tag.label} ({tag.count})
                                                </Badge>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}