import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { uploadMultipleImages } from '@/lib/uploadImage';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Loader2, Trash2, Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

interface ImageUploaderProps {
    vehicleRef: string;
    vehicleId: string;
    onImagesUploaded?: (urls: string[]) => void;
    maxFiles?: number;
    className?: string;
}

export function ImageUploader({
    vehicleRef,
    vehicleId,
    onImagesUploaded,
    maxFiles = 10,
    className
}: ImageUploaderProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Dropzone configuration
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        },
        maxFiles,
        disabled: isUploading,
        onDrop: (acceptedFiles) => {
            // Check if adding these files would exceed the limit
            if (selectedFiles.length + acceptedFiles.length > maxFiles) {
                toast.error(`Vous ne pouvez pas télécharger plus de ${maxFiles} images`);
                return;
            }

            // Convert FileList to array and add to selectedFiles
            const newFiles = Array.from(acceptedFiles);
            setSelectedFiles(prev => [...prev, ...newFiles]);

            // Create previews for the new files
            newFiles.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setPreviews(prev => [...prev, e.target?.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    });

    const removeFile = useCallback((index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleUpload = useCallback(async () => {
        if (selectedFiles.length === 0) {
            toast.error('Veuillez sélectionner au moins une image');
            return;
        }

        if (!vehicleRef || !vehicleId) {
            toast.error('Référence ou ID du véhicule manquant');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            // Rename files according to their order
            const renamedFiles = selectedFiles.map((file, index) => {
                const fileExtension = file.name.split('.').pop();
                const newFileName = `image-${index + 1}.${fileExtension}`;
                return new File([file], newFileName, { type: file.type });
            });

            // Simulate progress updates
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    const newProgress = prev + 10;
                    return newProgress > 90 ? 90 : newProgress;
                });
            }, 500);

            // Upload all images
            const result = await uploadMultipleImages(renamedFiles, vehicleRef, Number(vehicleId));

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (result.success) {
                toast.success(`${result.filePaths.length} image(s) téléchargée(s) avec succès`);

                // Call the callback with the uploaded file paths
                if (onImagesUploaded) {
                    onImagesUploaded(result.filePaths);
                }

                // Clear the selected files and previews
                setSelectedFiles([]);
                setPreviews([]);
            } else {
                toast.error(`Erreur lors du téléchargement: ${result.errors.join(', ')}`);
            }
        } catch (error) {
            console.error('Error uploading images:', error);
            toast.error('Une erreur est survenue lors du téléchargement');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    }, [selectedFiles, vehicleRef, vehicleId, onImagesUploaded]);

    // Handle drag end for reordering images
    const onDragEnd = useCallback((result: any) => {
        if (!result.destination) return;

        const items = Array.from(selectedFiles);
        const previewItems = Array.from(previews);

        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const [reorderedPreview] = previewItems.splice(result.source.index, 1);
        previewItems.splice(result.destination.index, 0, reorderedPreview);

        setSelectedFiles(items);
        setPreviews(previewItems);
    }, [selectedFiles, previews]);

    return (
        <div className={className}>
            <Card className="border-dashed">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {/* File Input */}
                        <div
                            {...getRootProps()}
                            className={`flex justify-center border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragActive ? 'border-mkb-blue bg-mkb-blue/5' : 'border-gray-300 hover:bg-gray-100'
                                }`}
                        >
                            <div className="flex flex-col items-center justify-center w-full h-32 py-6">
                                <input {...getInputProps()} />
                                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
                                </p>
                                <p className="text-xs text-gray-500">
                                    PNG, JPG ou WEBP (Max. {maxFiles} fichiers)
                                </p>
                            </div>
                        </div>

                        {/* Selected Files Preview */}
                        {previews.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium">Images sélectionnées ({previews.length}/{maxFiles})</h3>

                                <DragDropContext onDragEnd={onDragEnd}>
                                    <Droppable droppableId="images" direction="horizontal">
                                        {(provided) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                                            >
                                                {previews.map((preview, index) => (
                                                    <Draggable
                                                        key={`image-${index}`}
                                                        draggableId={`image-${index}`}
                                                        index={index}
                                                        isDragDisabled={isUploading}
                                                    >
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className="relative group"
                                                            >
                                                                <div className="relative border rounded-md overflow-hidden aspect-video bg-gray-100">
                                                                    <img
                                                                        src={preview}
                                                                        alt={`Preview ${index + 1}`}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeFile(index)}
                                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        disabled={isUploading}
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </button>
                                                                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                                                        image-{index + 1}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            </div>
                        )}

                        {/* Upload Progress */}
                        {isUploading && uploadProgress > 0 && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span>Téléchargement en cours...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-mkb-blue h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2">
                            {selectedFiles.length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedFiles([]);
                                        setPreviews([]);
                                    }}
                                    disabled={isUploading}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Tout supprimer
                                </Button>
                            )}
                            <Button
                                onClick={handleUpload}
                                disabled={selectedFiles.length === 0 || isUploading}
                                size="sm"
                                className="bg-mkb-blue hover:bg-mkb-blue/90"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Téléchargement...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Télécharger {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}