'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings,
  Globe,
  Palette,
  Bell,
  Upload,
  Download,
  Link,
  Save,
  RefreshCw,
  Shield,
  Database,
  Mail,
  Smartphone,
  Monitor,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const systemSettings = {
  general: {
    siteName: 'MKB Pilot Dashboard',
    language: 'fr',
    timezone: 'Europe/Paris',
    dateFormat: 'DD/MM/YYYY',
    currency: 'EUR'
  },
  theme: {
    primaryColor: '#2bbbdc',
    secondaryColor: '#fcbe15',
    darkMode: false,
    compactMode: false,
    animations: true
  },
  notifications: {
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true,
    weeklyReports: true,
    securityAlerts: true,
    systemMaintenance: true
  },
  security: {
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5,
    ipWhitelist: true
  },
  integrations: [
    {
      name: 'Google Sheets',
      status: 'connected',
      lastSync: '2024-03-15 14:30',
      description: 'Export automatique des données'
    },
    {
      name: 'Zapier',
      status: 'connected',
      lastSync: '2024-03-15 12:15',
      description: 'Automatisation des workflows'
    },
    {
      name: 'Slack',
      status: 'disconnected',
      lastSync: 'Jamais',
      description: 'Notifications équipe'
    },
    {
      name: 'Microsoft Teams',
      status: 'pending',
      lastSync: 'Configuration en cours',
      description: 'Collaboration équipe'
    },
    {
      name: 'Supabase',
      status: 'connected',
      lastSync: '2024-03-15 15:00',
      description: 'Base de données principale'
    }
  ]
};

const backupSettings = [
  {
    type: 'Données utilisateurs',
    frequency: 'Quotidienne',
    lastBackup: '2024-03-15 02:00',
    size: '2.4 GB',
    status: 'success'
  },
  {
    type: 'Configuration système',
    frequency: 'Hebdomadaire',
    lastBackup: '2024-03-10 03:00',
    size: '45 MB',
    status: 'success'
  },
  {
    type: 'Logs d\'activité',
    frequency: 'Mensuelle',
    lastBackup: '2024-03-01 04:00',
    size: '890 MB',
    status: 'warning'
  }
];

export default function ParametresPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(systemSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    // Ici on sauvegarderait les paramètres
    console.log('Sauvegarde des paramètres:', settings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setSettings(systemSettings);
    setHasChanges(false);
  };

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
          <Settings className="h-8 w-8 text-mkb-blue" />
          <div>
            <h1 className="text-3xl font-bold text-mkb-black">
              Paramètres Généraux
            </h1>
            <p className="text-gray-600">
              Configuration du dashboard et intégrations
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Badge className="bg-orange-100 text-orange-800">
              Modifications non sauvegardées
            </Badge>
          )}
          <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
          <Button onClick={handleSave} className="bg-mkb-blue hover:bg-mkb-blue/90">
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </motion.div>

      {/* Settings Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="theme">Thème</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="integrations">Intégrations</TabsTrigger>
            <TabsTrigger value="backup">Sauvegarde</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-mkb-black flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Paramètres Généraux
                </CardTitle>
                <CardDescription>
                  Configuration de base du système
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Nom du site</Label>
                    <Input 
                      value={settings.general.siteName}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          general: { ...prev.general, siteName: e.target.value }
                        }));
                        setHasChanges(true);
                      }}
                    />
                  </div>
                  <div>
                    <Label>Langue</Label>
                    <Select value={settings.general.language}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Fuseau horaire</Label>
                    <Select value={settings.general.timezone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                        <SelectItem value="Europe/London">Europe/London</SelectItem>
                        <SelectItem value="America/New_York">America/New_York</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Format de date</Label>
                    <Select value={settings.general.dateFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Logo de l'entreprise</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="w-16 h-16 bg-mkb-blue rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      MKB
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Changer le logo
                      </Button>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Réinitialiser
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="theme" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-mkb-black flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Personnalisation du Thème
                </CardTitle>
                <CardDescription>
                  Couleurs et apparence du dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Couleur principale</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <div 
                        className="w-10 h-10 rounded-lg border"
                        style={{ backgroundColor: settings.theme.primaryColor }}
                      ></div>
                      <Input 
                        value={settings.theme.primaryColor}
                        onChange={(e) => {
                          setSettings(prev => ({
                            ...prev,
                            theme: { ...prev.theme, primaryColor: e.target.value }
                          }));
                          setHasChanges(true);
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Couleur secondaire</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <div 
                        className="w-10 h-10 rounded-lg border"
                        style={{ backgroundColor: settings.theme.secondaryColor }}
                      ></div>
                      <Input 
                        value={settings.theme.secondaryColor}
                        onChange={(e) => {
                          setSettings(prev => ({
                            ...prev,
                            theme: { ...prev.theme, secondaryColor: e.target.value }
                          }));
                          setHasChanges(true);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Mode sombre</Label>
                      <p className="text-sm text-gray-500">Activer le thème sombre</p>
                    </div>
                    <Switch 
                      checked={settings.theme.darkMode}
                      onCheckedChange={(checked) => {
                        setSettings(prev => ({
                          ...prev,
                          theme: { ...prev.theme, darkMode: checked }
                        }));
                        setHasChanges(true);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Mode compact</Label>
                      <p className="text-sm text-gray-500">Interface plus dense</p>
                    </div>
                    <Switch 
                      checked={settings.theme.compactMode}
                      onCheckedChange={(checked) => {
                        setSettings(prev => ({
                          ...prev,
                          theme: { ...prev.theme, compactMode: checked }
                        }));
                        setHasChanges(true);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Animations</Label>
                      <p className="text-sm text-gray-500">Activer les transitions animées</p>
                    </div>
                    <Switch 
                      checked={settings.theme.animations}
                      onCheckedChange={(checked) => {
                        setSettings(prev => ({
                          ...prev,
                          theme: { ...prev.theme, animations: checked }
                        }));
                        setHasChanges(true);
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-mkb-black flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Paramètres de Notification
                </CardTitle>
                <CardDescription>
                  Gérer les alertes et notifications système
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-600" />
                      <div>
                        <Label>Alertes par email</Label>
                        <p className="text-sm text-gray-500">Recevoir les notifications importantes par email</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.notifications.emailAlerts}
                      onCheckedChange={(checked) => {
                        setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, emailAlerts: checked }
                        }));
                        setHasChanges(true);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-gray-600" />
                      <div>
                        <Label>Alertes SMS</Label>
                        <p className="text-sm text-gray-500">Notifications urgentes par SMS</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.notifications.smsAlerts}
                      onCheckedChange={(checked) => {
                        setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, smsAlerts: checked }
                        }));
                        setHasChanges(true);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Monitor className="h-5 w-5 text-gray-600" />
                      <div>
                        <Label>Notifications push</Label>
                        <p className="text-sm text-gray-500">Notifications dans le navigateur</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.notifications.pushNotifications}
                      onCheckedChange={(checked) => {
                        setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, pushNotifications: checked }
                        }));
                        setHasChanges(true);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-gray-600" />
                      <div>
                        <Label>Alertes de sécurité</Label>
                        <p className="text-sm text-gray-500">Notifications pour les événements de sécurité</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.notifications.securityAlerts}
                      onCheckedChange={(checked) => {
                        setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, securityAlerts: checked }
                        }));
                        setHasChanges(true);
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-mkb-black flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Paramètres de Sécurité
                </CardTitle>
                <CardDescription>
                  Configuration de la sécurité système
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Timeout de session (minutes)</Label>
                    <Input 
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                        }));
                        setHasChanges(true);
                      }}
                    />
                  </div>
                  <div>
                    <Label>Expiration mot de passe (jours)</Label>
                    <Input 
                      type="number"
                      value={settings.security.passwordExpiry}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          security: { ...prev.security, passwordExpiry: parseInt(e.target.value) }
                        }));
                        setHasChanges(true);
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Authentification à deux facteurs</Label>
                      <p className="text-sm text-gray-500">Obligatoire pour tous les membres G4</p>
                    </div>
                    <Switch 
                      checked={settings.security.twoFactorAuth}
                      onCheckedChange={(checked) => {
                        setSettings(prev => ({
                          ...prev,
                          security: { ...prev.security, twoFactorAuth: checked }
                        }));
                        setHasChanges(true);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Liste blanche IP</Label>
                      <p className="text-sm text-gray-500">Restreindre l'accès aux IP autorisées</p>
                    </div>
                    <Switch 
                      checked={settings.security.ipWhitelist}
                      onCheckedChange={(checked) => {
                        setSettings(prev => ({
                          ...prev,
                          security: { ...prev.security, ipWhitelist: checked }
                        }));
                        setHasChanges(true);
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-mkb-black flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Intégrations Externes
                </CardTitle>
                <CardDescription>
                  Connecter des services tiers au dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {settings.integrations.map((integration, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          integration.status === 'connected' ? 'bg-green-500' :
                          integration.status === 'pending' ? 'bg-yellow-500' :
                          'bg-gray-400'
                        }`}></div>
                        <div>
                          <h3 className="font-medium text-mkb-black">{integration.name}</h3>
                          <p className="text-sm text-gray-500">{integration.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <Badge className={
                            integration.status === 'connected' ? 'bg-green-100 text-green-800' :
                            integration.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {integration.status === 'connected' ? 'Connecté' :
                             integration.status === 'pending' ? 'En cours' :
                             'Déconnecté'}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            Dernière sync: {integration.lastSync}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          {integration.status === 'connected' ? 'Configurer' : 'Connecter'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-mkb-black flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Sauvegarde et Restauration
                </CardTitle>
                <CardDescription>
                  Gestion des sauvegardes automatiques
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {backupSettings.map((backup, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          backup.status === 'success' ? 'bg-green-100' :
                          backup.status === 'warning' ? 'bg-yellow-100' :
                          'bg-red-100'
                        }`}>
                          {backup.status === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-mkb-black">{backup.type}</h3>
                          <p className="text-sm text-gray-500">
                            {backup.frequency} • Taille: {backup.size}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {backup.lastBackup}
                          </p>
                          <Badge className={
                            backup.status === 'success' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {backup.status === 'success' ? 'OK' : 'Attention'}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm">
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-mkb-blue/5 rounded-lg border border-mkb-blue/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-4 w-4 text-mkb-blue" />
                    <span className="font-medium text-mkb-blue">Sauvegarde Manuelle</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Créer une sauvegarde complète du système maintenant
                  </p>
                  <Button className="bg-mkb-blue hover:bg-mkb-blue/90">
                    <Download className="h-4 w-4 mr-2" />
                    Créer une Sauvegarde
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Footer */}
      <motion.div
        className="text-center py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <p className="text-sm text-gray-500">
          Paramètres Généraux - <span className="text-mkb-blue font-semibold">#mkbpilot</span>
        </p>
      </motion.div>
    </div>
  );
}