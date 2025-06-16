'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FileText,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Plus,
  File,
  FileSpreadsheet,
  FileImage,
  Calendar,
  User,
  Tag
} from 'lucide-react';

const documentsData = [
  {
    id: 1,
    name: 'Plan Stratégique 2024-2026',
    type: 'pdf',
    size: '2.4 MB',
    uploadDate: '2024-03-10',
    uploader: 'Alexandre Dubois',
    category: 'Stratégie',
    tags: ['stratégie', 'planning', '2024', 'objectifs'],
    description: 'Plan stratégique triennal avec objectifs et roadmap détaillée',
    lastModified: '2024-03-12',
    version: '1.2',
    confidential: true,
    downloads: 15
  },
  {
    id: 2,
    name: 'Budget Prévisionnel Q2 2024',
    type: 'xlsx',
    size: '1.8 MB',
    uploadDate: '2024-03-12',
    uploader: 'Marie-Claire Fontaine',
    category: 'Finance',
    tags: ['budget', 'Q2', 'prévisions', 'finance'],
    description: 'Prévisions budgétaires détaillées pour le deuxième trimestre',
    lastModified: '2024-03-14',
    version: '2.1',
    confidential: true,
    downloads: 8
  },
  {
    id: 3,
    name: 'Roadmap Technique 2024',
    type: 'pdf',
    size: '3.1 MB',
    uploadDate: '2024-03-08',
    uploader: 'Thomas Leclerc',
    category: 'Technique',
    tags: ['roadmap', 'technique', 'développement', '2024'],
    description: 'Feuille de route technique avec priorités et échéances',
    lastModified: '2024-03-11',
    version: '1.5',
    confidential: false,
    downloads: 22
  },
  {
    id: 4,
    name: 'Analyse Marché Angola',
    type: 'pptx',
    size: '5.2 MB',
    uploadDate: '2024-03-05',
    uploader: 'Isabelle Moreau',
    category: 'Commercial',
    tags: ['angola', 'marché', 'analyse', 'expansion'],
    description: 'Étude de marché complète pour l\'expansion en Angola',
    lastModified: '2024-03-07',
    version: '1.0',
    confidential: true,
    downloads: 12
  },
  {
    id: 5,
    name: 'Grille Évaluation Performance',
    type: 'xlsx',
    size: '890 KB',
    uploadDate: '2024-03-01',
    uploader: 'Marie-Claire Fontaine',
    category: 'RH',
    tags: ['évaluation', 'performance', 'RH', 'grille'],
    description: 'Grille standardisée pour l\'évaluation des performances',
    lastModified: '2024-03-03',
    version: '3.0',
    confidential: false,
    downloads: 35
  },
  {
    id: 6,
    name: 'Procédures Sécurité IT',
    type: 'pdf',
    size: '1.5 MB',
    uploadDate: '2024-02-28',
    uploader: 'Thomas Leclerc',
    category: 'Sécurité',
    tags: ['sécurité', 'IT', 'procédures', 'audit'],
    description: 'Manuel des procédures de sécurité informatique',
    lastModified: '2024-03-02',
    version: '2.3',
    confidential: true,
    downloads: 18
  }
];

const categories = ['Tous', 'Stratégie', 'Finance', 'Technique', 'Commercial', 'RH', 'Sécurité'];

const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf': return File;
    case 'xlsx': case 'xls': return FileSpreadsheet;
    case 'pptx': case 'ppt': return FileImage;
    default: return FileText;
  }
};

const getFileColor = (type: string) => {
  switch (type) {
    case 'pdf': return 'text-red-600 bg-red-100';
    case 'xlsx': case 'xls': return 'text-green-600 bg-green-100';
    case 'pptx': case 'ppt': return 'text-orange-600 bg-orange-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Stratégie': return 'bg-purple-100 text-purple-800';
    case 'Finance': return 'bg-green-100 text-green-800';
    case 'Technique': return 'bg-blue-100 text-blue-800';
    case 'Commercial': return 'bg-orange-100 text-orange-800';
    case 'RH': return 'bg-pink-100 text-pink-800';
    case 'Sécurité': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tous');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedDoc, setSelectedDoc] = useState<number | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const filteredDocuments = documentsData.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'Tous' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'date': return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      case 'size': return parseFloat(b.size) - parseFloat(a.size);
      case 'downloads': return b.downloads - a.downloads;
      default: return 0;
    }
  });

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
          <FileText className="h-8 w-8 text-mkb-blue" />
          <div>
            <h1 className="text-3xl font-bold text-mkb-black">
              Documents Stratégiques
            </h1>
            <p className="text-gray-600">
              Plans d'action, grilles de suivi et documents de référence
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-mkb-blue hover:bg-mkb-blue/90">
                <Upload className="h-4 w-4 mr-2" />
                Uploader Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Uploader un Nouveau Document</DialogTitle>
                <DialogDescription>
                  Ajouter un document stratégique à la bibliothèque
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Glissez-déposez votre fichier ici</p>
                  <p className="text-sm text-gray-500 mb-4">ou cliquez pour sélectionner</p>
                  <Button variant="outline">Choisir un fichier</Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Catégorie</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.slice(1).map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Confidentialité</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Niveau de confidentialité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="internal">Interne</SelectItem>
                        <SelectItem value="confidential">Confidentiel</SelectItem>
                        <SelectItem value="restricted">Restreint G4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input placeholder="Description du document..." />
                </div>
                <div>
                  <label className="text-sm font-medium">Tags (séparés par des virgules)</label>
                  <Input placeholder="stratégie, planning, 2024..." />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button className="bg-mkb-blue hover:bg-mkb-blue/90">
                    Uploader
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher documents, tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="name">Nom</SelectItem>
                  <SelectItem value="size">Taille</SelectItem>
                  <SelectItem value="downloads">Téléchargements</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={categoryFilter === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter(cat)}
                  className={categoryFilter === cat ? "bg-mkb-blue hover:bg-mkb-blue/90" : ""}
                >
                  {cat}
                  {cat !== 'Tous' && (
                    <Badge variant="secondary" className="ml-2">
                      {documentsData.filter(doc => doc.category === cat).length}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Documents Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedDocuments.map((doc, index) => {
            const FileIcon = getFileIcon(doc.type);
            
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getFileColor(doc.type)}`}>
                          <FileIcon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-mkb-black group-hover:text-mkb-blue transition-colors line-clamp-2">
                            {doc.name}
                          </h3>
                          <p className="text-sm text-gray-500">v{doc.version}</p>
                        </div>
                      </div>
                      {doc.confidential && (
                        <Badge variant="destructive" className="text-xs">
                          Confidentiel
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600 line-clamp-2">{doc.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {doc.uploader}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {doc.uploadDate}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge className={getCategoryColor(doc.category)} variant="secondary">
                        {doc.category}
                      </Badge>
                      <span className="text-xs text-gray-500">{doc.size}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span key={tagIndex} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                      {doc.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{doc.tags.length - 3}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Download className="h-3 w-3" />
                        {doc.downloads} téléchargements
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black">Statistiques de la Bibliothèque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-mkb-blue/5 rounded-lg">
                <div className="text-2xl font-bold text-mkb-blue">{documentsData.length}</div>
                <div className="text-sm text-gray-700">Documents Total</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {documentsData.filter(doc => doc.confidential).length}
                </div>
                <div className="text-sm text-green-700">Confidentiels</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {documentsData.reduce((acc, doc) => acc + doc.downloads, 0)}
                </div>
                <div className="text-sm text-orange-700">Téléchargements</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{categories.length - 1}</div>
                <div className="text-sm text-purple-700">Catégories</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer */}
      <motion.div
        className="text-center py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <p className="text-sm text-gray-500">
          Documents Stratégiques - <span className="text-mkb-blue font-semibold">#mkbpilot</span>
        </p>
      </motion.div>
    </div>
  );
}