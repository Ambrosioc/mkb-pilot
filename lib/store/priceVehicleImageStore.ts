import { create } from 'zustand';

export interface PriceVehicleImage {
  id: string;
  file: File;
  preview: string;
  order: number;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
  url?: string;
}

interface PriceVehicleImageState {
  images: PriceVehicleImage[];
  
  // Image actions
  addImages: (files: File[]) => void;
  removeImage: (id: string) => void;
  clearImages: () => void;
  reorderImages: (startIndex: number, endIndex: number) => void;
  setImageUploading: (id: string, uploading: boolean) => void;
  setImageUploaded: (id: string, uploaded: boolean, url?: string) => void;
  setImageError: (id: string, error: string) => void;
  
  // Reset
  reset: () => void;
}

export const usePriceVehicleImageStore = create<PriceVehicleImageState>((set) => ({
  // Initial state
  images: [],
  
  // Image management
  addImages: (files) => set((state) => {
    const newImages: PriceVehicleImage[] = Array.from(files).map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      order: state.images.length + index,
      uploading: false,
      uploaded: false
    }));
    
    return { images: [...state.images, ...newImages] };
  }),
  
  removeImage: (id) => set((state) => {
    // Release object URL to prevent memory leaks
    const imageToRemove = state.images.find(img => img.id === id);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    
    // Remove image and reorder remaining images
    const filteredImages = state.images.filter(img => img.id !== id);
    const reorderedImages = filteredImages.map((img, index) => ({
      ...img,
      order: index
    }));
    
    return { images: reorderedImages };
  }),
  
  clearImages: () => set((state) => {
    // Release all object URLs
    state.images.forEach(img => URL.revokeObjectURL(img.preview));
    return { images: [] };
  }),
  
  reorderImages: (startIndex, endIndex) => set((state) => {
    const result = Array.from(state.images);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    // Update order property
    const reorderedImages = result.map((img, index) => ({
      ...img,
      order: index
    }));
    
    return { images: reorderedImages };
  }),
  
  setImageUploading: (id, uploading) => set((state) => ({
    images: state.images.map(img => 
      img.id === id ? { ...img, uploading } : img
    )
  })),
  
  setImageUploaded: (id, uploaded, url) => set((state) => ({
    images: state.images.map(img => 
      img.id === id ? { ...img, uploaded, uploading: false, url } : img
    )
  })),
  
  setImageError: (id, error) => set((state) => ({
    images: state.images.map(img => 
      img.id === id ? { ...img, error, uploading: false } : img
    )
  })),
  
  // Reset the entire store
  reset: () => set((state) => {
    // Release all object URLs
    state.images.forEach(img => URL.revokeObjectURL(img.preview));
    
    return {
      images: []
    };
  })
})); 