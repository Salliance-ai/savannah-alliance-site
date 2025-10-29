import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Bell, User, Settings } from 'lucide-react';

const Navbar = () => {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40"
    >
      <div className="flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Brain className="h-8 w-8 text-primary-600" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-empathy-500 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">
                EIME™
              </h1>
              <p className="text-xs text-gray-500 -mt-1">
                Emotionally Intelligent Marketing Engine
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-lg mx-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users, insights, or campaigns..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Trust Score Indicator */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-trust-50 rounded-full">
            <div className="h-2 w-2 bg-trust-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-trust-700">
              Platform Trust: 87%
            </span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="h-6 w-6" />
            <span className="notification-dot" />
          </button>

          {/* Settings */}
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Settings className="h-6 w-6" />
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">Dr. Sarah Chen</p>
              <p className="text-xs text-gray-500">Emotional Intelligence Specialist</p>
            </div>
            <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors">
              <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-empathy-500 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-trust-500 rounded-full" />
            <span>1,247 Active Users</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-empathy-500 rounded-full" />
            <span>94% Emotional Resonance</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-primary-500 rounded-full" />
            <span>+12% Trust Velocity</span>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;