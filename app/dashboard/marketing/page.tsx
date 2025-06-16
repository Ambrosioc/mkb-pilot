'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Megaphone, 
  Target, 
  MessageSquare, 
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  MousePointer,
  Share2,
  Heart,
  Calendar,
  Zap
} from 'lucide-react';

const marketingMetrics = [
  {
    title: 'Impressions Totales',
    value: '2.4M',
    change: '+32%',
    icon: Eye,
    color: 'text-green-600',
  },
  {
    title: 'Clics Générés',
    value: '45,678',
    change: '+18%',
    icon: MousePointer,
    color: 'text-mkb-blue',
  },
  {
    title: 'Leads Qualifiés',
    value: '1,234',
    change: '+25%',
    icon: Target,
    color: 'text-purple-600',
  },
  {
    title: 'ROI Campagnes',
    value: '340%',
    change: '+45%',
    icon: TrendingUp,
    color: 'text-mkb-yellow',
  },
];

const marketingSections = [
  {
    title: 'Campagnes Meta',
    description: 'Gestion des publicités Facebook et Instagram',
    icon: Target,
    budget: '€15,000',
    performance: 87,
    campaigns: 12,
    status: 'active',
  },
  {
    title: 'Réseaux Sociaux',
    description: 'Animation des communautés et content marketing',
    icon: MessageSquare,
    followers: '23.5K',
    performance: 92,
    posts: 45,
    status: 'active',
  },
  {
    title: 'Stats d\'Acquisition',
    description: 'Analyse des canaux et optimisation conversions',
    icon: BarChart3,
    conversions: '2.1%',
    performance: 78,
    sources: 8,
    status: 'monitoring',
  },
];

const socialMediaStats = [
  { platform: 'Facebook', followers: '12.3K', engagement: '4.2%', color: 'bg-blue-500' },
  { platform: 'Instagram', followers: '8.7K', engagement: '6.8%', color: 'bg-pink-500' },
  { platform: 'LinkedIn', followers: '2.5K', engagement: '3.1%', color: 'bg-blue-700' },
];

export default function MarketingPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3"
      >
        <Megaphone className="h-8 w-8 text-mkb-blue" />
        <div>
          <h1 className="text-3xl font-bold text-mkb-black">
            Pôle Marketing
          </h1>
          <p className="text-gray-600">
            Campagnes publicitaires, réseaux sociaux et acquisition client
          </p>
        </div>
      </motion.div>

      {/* Metrics */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {marketingMetrics.map((metric) => {
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

      {/* Marketing Sections */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {marketingSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-mkb-black flex items-center gap-2">
                    <Icon className="h-5 w-5 text-mkb-blue" />
                    {section.title}
                  </CardTitle>
                  <Badge 
                    variant={section.status === 'active' ? 'default' : 'secondary'}
                    className={section.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                  >
                    {section.status === 'active' ? 'Actif' : 'Suivi'}
                  </Badge>
                </div>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Performance</span>
                    <span className="text-sm font-bold text-mkb-blue">{section.performance}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-mkb-blue h-2 rounded-full transition-all duration-300"
                      style={{ width: `${section.performance}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-mkb-black">
                        {section.budget || section.followers || section.conversions}
                      </div>
                      <div className="text-gray-500">
                        {section.budget ? 'Budget' : section.followers ? 'Followers' : 'Taux Conv.'}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-mkb-black">
                        {section.campaigns || section.posts || section.sources}
                      </div>
                      <div className="text-gray-500">
                        {section.campaigns ? 'Campagnes' : section.posts ? 'Posts' : 'Sources'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Social Media Overview */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Réseaux Sociaux
            </CardTitle>
            <CardDescription>
              Performance des différentes plateformes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {socialMediaStats.map((platform, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 ${platform.color} rounded`}></div>
                    <div>
                      <p className="font-medium text-mkb-black">{platform.platform}</p>
                      <p className="text-xs text-gray-500">{platform.followers} followers</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-mkb-blue">{platform.engagement}</p>
                    <p className="text-xs text-gray-500">engagement</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Campagnes Actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  name: 'Promo Véhicules Été',
                  budget: '€5,000',
                  status: 'active',
                  performance: 92
                },
                {
                  name: 'Remarketing B2B',
                  budget: '€3,500',
                  status: 'active',
                  performance: 78
                },
                {
                  name: 'Acquisition Leads',
                  budget: '€6,500',
                  status: 'paused',
                  performance: 65
                },
                {
                  name: 'Brand Awareness',
                  budget: '€2,000',
                  status: 'active',
                  performance: 88
                }
              ].map((campaign, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-mkb-black">{campaign.name}</p>
                    <p className="text-xs text-gray-500">{campaign.budget}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-mkb-blue">{campaign.performance}%</p>
                    </div>
                    <div className={`h-2 w-2 rounded-full ${
                      campaign.status === 'active' ? 'bg-green-500' :
                      campaign.status === 'paused' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Marketing
            </CardTitle>
            <CardDescription>
              Évolution des métriques clés sur 6 mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-4">
              {[
                { month: 'Jan', impressions: 65, clics: 45, leads: 35 },
                { month: 'Fév', impressions: 72, clics: 52, leads: 42 },
                { month: 'Mar', impressions: 68, clics: 48, leads: 38 },
                { month: 'Avr', impressions: 85, clics: 65, leads: 55 },
                { month: 'Mai', impressions: 92, clics: 72, leads: 62 },
                { month: 'Jun', impressions: 88, clics: 68, leads: 58 },
              ].map((data, index) => (
                <div key={index} className="flex flex-col items-center gap-2 flex-1">
                  <div className="flex items-end gap-1 h-40">
                    <div 
                      className="bg-mkb-blue rounded-t w-3"
                      style={{ height: `${(data.impressions / 100) * 100}%` }}
                      title="Impressions"
                    ></div>
                    <div 
                      className="bg-mkb-yellow rounded-t w-3"
                      style={{ height: `${(data.clics / 100) * 100}%` }}
                      title="Clics"
                    ></div>
                    <div 
                      className="bg-green-500 rounded-t w-3"
                      style={{ height: `${(data.leads / 100) * 100}%` }}
                      title="Leads"
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{data.month}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-mkb-blue rounded-full"></div>
                <span>Impressions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-mkb-yellow rounded-full"></div>
                <span>Clics</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Leads</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black">Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button className="bg-mkb-blue hover:bg-mkb-blue/90 text-white">
                <Target className="mr-2 h-4 w-4" />
                Nouvelle Campagne
              </Button>
              <Button variant="outline" className="border-mkb-yellow text-mkb-yellow hover:bg-mkb-yellow hover:text-white">
                <MessageSquare className="mr-2 h-4 w-4" />
                Programmer Post
              </Button>
              <Button variant="outline" className="border-gray-300">
                <BarChart3 className="mr-2 h-4 w-4" />
                Rapport Mensuel
              </Button>
              <Button variant="outline" className="border-gray-300">
                <Zap className="mr-2 h-4 w-4" />
                Optimiser Budget
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
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <p className="text-sm text-gray-500">
          Pôle Marketing - <span className="text-mkb-blue font-semibold">#mkbpilot</span>
        </p>
      </motion.div>
    </div>
  );
}