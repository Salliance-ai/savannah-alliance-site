import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Heart,
  Brain,
  Users,
  BarChart3,
  Stethoscope,
  Settings,
  PlayCircle,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      description: 'Overview & insights'
    },
    {
      name: 'Trust Dashboard',
      href: '/trust-dashboard',
      icon: Shield,
      description: 'Trust metrics & KPIs'
    },
    {
      name: 'Emotion Analytics',
      href: '/emotion-analytics',
      icon: Heart,
      description: 'Emotional intelligence data'
    },
    {
      name: 'Therapist Framework',
      href: '/therapist-framework',
      icon: Stethoscope,
      description: 'Empathetic AI responses'
    },
    {
      name: 'User Profiles',
      href: '/user-profiles',
      icon: Users,
      description: 'Individual emotional profiles'
    },
    {
      name: 'Demo',
      href: '/demo',
      icon: PlayCircle,
      description: 'Interactive EIME™ demo'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      description: 'Platform configuration'
    }
  ];

  const quickActions = [
    {
      name: 'Analyze Text',
      icon: Brain,
      color: 'bg-primary-500',
      action: () => console.log('Analyze text')
    },
    {
      name: 'Trust Report',
      icon: TrendingUp,
      color: 'bg-trust-500',
      action: () => console.log('Generate trust report')
    },
    {
      name: 'AI Response',
      icon: Zap,
      color: 'bg-empathy-500',
      action: () => console.log('Generate AI response')
    }
  ];

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-30 pt-20"
    >
      <div className="flex flex-col h-full">
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Navigation
            </h2>
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`sidebar-link ${
                    isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Quick Actions */}
        <div className="px-4 py-6 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={action.action}
                className="w-full flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className={`p-2 rounded-lg ${action.color} text-white mr-3`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-gray-700">{action.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Trust Score Widget */}
        <div className="px-4 pb-6">
          <div className="bg-gradient-to-br from-trust-50 to-primary-50 rounded-xl p-4 border border-trust-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-trust-700">Platform Trust</span>
              <Shield className="h-4 w-4 text-trust-500" />
            </div>
            <div className="flex items-end space-x-2">
              <span className="text-2xl font-bold text-trust-600">87%</span>
              <span className="text-xs text-trust-500 mb-1">+5% this week</span>
            </div>
            <div className="mt-2">
              <div className="progress-bar">
                <div 
                  className="progress-fill progress-trust" 
                  style={{ width: '87%' }}
                />
              </div>
            </div>
            <p className="text-xs text-trust-600 mt-2">
              Excellent emotional alignment
            </p>
          </div>
        </div>

        {/* Emotional Health Indicator */}
        <div className="px-4 pb-6">
          <div className="bg-gradient-to-br from-empathy-50 to-purple-50 rounded-xl p-4 border border-empathy-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-empathy-700">Emotional Health</span>
              <Heart className="h-4 w-4 text-empathy-500" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Joy</span>
                <span className="font-medium text-yellow-600">78%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trust</span>
                <span className="font-medium text-trust-600">85%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fear</span>
                <span className="font-medium text-red-600">12%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Anger</span>
                <span className="font-medium text-red-600">8%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-400">
              EIME™ Platform v1.0
            </p>
            <p className="text-xs text-gray-400">
              Powered by Emotional Intelligence
            </p>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;