'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import {
    Building2,
    Eye,
    Filter,
    Mail,
    MoreHorizontal,
    Phone,
    Search,
    Star,
    Tag,
    User,
    UserPlus,
    Users
} from 'lucide-react';
import { useState } from 'react';

const contactsMetrics = [
    {
        title: 'Contacts Total',
        value: '1,247',
        change: '+89',
        icon: Users,
        color: 'text-green-600',
    },
    {
        title: 'Particuliers',
        value: '892',
        change: '+67',
        icon: User,
        color: 'text-mkb-blue',
    },
    {
        title: 'Professionnels',
        value: '355',
        change: '+22',
        icon: Building2,
        color: 'text-purple-600',
    },
    {
        title: 'Prospects Chauds',
        value: '156',
        change: '+34',
        icon: Star,
        color: 'text-mkb-yellow',
    },
];

const contactsData = [
    {
        id: 'CT-2024-001',
        name: 'Marie Dubois',
        email: 'marie.dubois@email.com',
        phone: '+33 6 12 34 56 78',
        type: 'particulier',
        status: 'client',
        company: null,
        tags: ['chaud', 'vip'],
        lastContact: '2024-03-15',
        assignedTo: 'Jean Martin',
        vehiclesLinked: 2,
        source: 'Site web'
    },
    {
        id: 'CT-2024-002',
        name: 'Pierre Durand',
        email: 'p.durand@entreprise.com',
        phone: '+33 1 23 45 67 89',
        type: 'professionnel',
        status: 'prospect',
        company: 'Durand Auto',
        tags: ['marchand', 'b2b'],
        lastContact: '2024-03-14',
        assignedTo: 'Sophie Laurent',
        vehiclesLinked: 0,
        source: 'Recommandation'
    },
    {
        id: 'CT-2024-003',
        name: 'Claire Moreau',
        email: 'claire.moreau@gmail.com',
        phone: '+33 7 89 12 34 56',
        type: 'particulier',
        status: 'prospect',
        company: null,
        tags: ['froid', 'relance'],
        lastContact: '2024-03-10',
        assignedTo: 'Thomas Leclerc',
        vehiclesLinked: 1,
        source: 'Facebook'
    },
    {
        id: 'CT-2024-004',
        name: 'Alexandre Dubois',
        email: 'a.dubois@partenaire.fr',
        phone: '+33 6 98 76 54 32',
        type: 'professionnel',
        status: 'partenaire',
        company: 'Partenaire Motors',
        tags: ['apporteur', 'vip'],
        lastContact: '2024-03-13',
        assignedTo: 'Marie-Claire Fontaine',
        vehiclesLinked: 5,
        source: 'Réseau'
    },
];

const getTypeColor = (type: string) => {
    switch (type) {
        case 'particulier': return 'bg-blue-100 text-blue-800';
        case 'professionnel': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'client': return 'bg-green-100 text-green-800';
        case 'prospect': return 'bg-orange-100 text-orange-800';
        case 'partenaire': return 'bg-mkb-blue/10 text-mkb-blue';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getTagColor = (tag: string) => {
    switch (tag) {
        case 'chaud': return 'bg-red-100 text-red-800';
        case 'froid': return 'bg-blue-100 text-blue-800';
        case 'vip': return 'bg-yellow-100 text-yellow-800';
        case 'marchand': return 'bg-purple-100 text-purple-800';
        case 'b2b': return 'bg-indigo-100 text-indigo-800';
        case 'apporteur': return 'bg-green-100 text-green-800';
        case 'relance': return 'bg-orange-100 text-orange-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export default function ContactsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedContact, setSelectedContact] = useState<string | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const filteredContacts = contactsData.filter(contact => {
        const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = typeFilter === 'all' || contact.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
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
                    <Users className="h-8 w-8 text-mkb-blue" />
                    <div>
                        <h1 className="text-3xl font-bold text-mkb-black">
                            📇 Contacts Central
                        </h1>
                        <p className="text-gray-600">
                            Gestion centralisée de tous les contacts MKB
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-mkb-blue hover:bg-mkb-blue/90">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Nouveau Contact
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Créer un Nouveau Contact</DialogTitle>
                                <DialogDescription>
                                    Ajouter un contact au carnet d'adresses central
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600">
                                    Fonctionnalité en cours de développement...
                                </p>
                                <Button onClick={() => setIsCreateDialogOpen(false)}>
                                    Fermer
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </motion.div>

            {/* Metrics */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                {contactsMetrics.map((metric) => {
                    const Icon = metric.icon;
                    return (
                        <Card key={metric.title} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    {metric.title}
                                </CardTitle>
                                <Icon className={`h-4 w-4 ${metric.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-mkb-black">{metric.value}</div>
                                <p className="text-xs text-green-600">
                                    {metric.change} vs mois précédent
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Rechercher par nom, email, société..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les types</SelectItem>
                                    <SelectItem value="particulier">Particulier</SelectItem>
                                    <SelectItem value="professionnel">Professionnel</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les statuts</SelectItem>
                                    <SelectItem value="client">Client</SelectItem>
                                    <SelectItem value="prospect">Prospect</SelectItem>
                                    <SelectItem value="partenaire">Partenaire</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm">
                                <Filter className="h-4 w-4 mr-2" />
                                Plus de filtres
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Contacts Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="text-mkb-black">
                            Carnet de Contacts ({filteredContacts.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Coordonnées</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Type</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Statut</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Tags</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Assigné à</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredContacts.map((contact, index) => (
                                        <motion.tr
                                            key={contact.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                            className="border-b hover:bg-gray-50"
                                        >
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-mkb-blue rounded-full flex items-center justify-center text-white font-medium">
                                                        {contact.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-mkb-black">{contact.name}</div>
                                                        {contact.company && (
                                                            <div className="text-sm text-gray-500">{contact.company}</div>
                                                        )}
                                                        <div className="text-xs text-gray-400">
                                                            {contact.vehiclesLinked} véhicule(s) lié(s)
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Mail className="h-3 w-3 text-gray-400" />
                                                        <span>{contact.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Phone className="h-3 w-3 text-gray-400" />
                                                        <span>{contact.phone}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <Badge className={getTypeColor(contact.type)}>
                                                    {contact.type === 'particulier' ? 'Particulier' : 'Professionnel'}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <Badge className={getStatusColor(contact.status)}>
                                                    {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {contact.tags.map((tag, tagIndex) => (
                                                        <Badge key={tagIndex} variant="secondary" className={`text-xs ${getTagColor(tag)}`}>
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm">{contact.assignedTo}</span>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Dernier contact: {contact.lastContact}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button variant="ghost" size="sm" title="Voir détails">
                                                        <Eye className="h-3 w-3" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" title="Appeler">
                                                        <Phone className="h-3 w-3" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" title="Envoyer email">
                                                        <Mail className="h-3 w-3" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" title="Plus d'actions">
                                                        <MoreHorizontal className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="text-mkb-black">Actions Rapides</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Button className="bg-mkb-blue hover:bg-mkb-blue/90 text-white">
                                <UserPlus className="mr-2 h-4 w-4" />
                                Nouveau Contact
                            </Button>
                            <Button variant="outline" className="border-mkb-yellow text-mkb-yellow hover:bg-mkb-yellow hover:text-white">
                                <Phone className="mr-2 h-4 w-4" />
                                Campagne d'Appels
                            </Button>
                            <Button variant="outline" className="border-gray-300">
                                <Mail className="mr-2 h-4 w-4" />
                                Email Groupé
                            </Button>
                            <Button variant="outline" className="border-gray-300">
                                <Tag className="mr-2 h-4 w-4" />
                                Gestion Tags
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Footer */}
            <motion.div
                className="text-center py-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
            >
                <p className="text-sm text-gray-500">
                    📇 Contacts Central - <span className="text-mkb-blue font-semibold">#mkbpilot</span>
                </p>
            </motion.div>
        </div>
    );
}