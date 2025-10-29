import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface ClinicSettings {
  timezone: string;
  businessHours: {
    [key: string]: {
      start: string;
      end: string;
      closed: boolean;
    };
  };
  appointmentDuration: number;
  bufferTime: number;
  autoConfirmAppointments: boolean;
  allowOnlineBooking: boolean;
}

interface SubscriptionInfo {
  tier: 'starter' | 'practice' | 'enterprise';
  status: 'active' | 'suspended' | 'cancelled' | 'trial';
  maxProviders: number;
  maxPatients: number;
  features: Array<{
    name: string;
    enabled: boolean;
    limit?: number;
  }>;
}

interface UsageStats {
  currentProviders: number;
  currentPatients: number;
  monthlyAppointments: number;
  storageUsed: number;
  apiCalls: number;
}

interface Clinic {
  id: string;
  name: string;
  settings: ClinicSettings;
  subscription: SubscriptionInfo;
  usage: UsageStats;
  integrations: {
    epic: { enabled: boolean };
    ghl: { enabled: boolean };
    stripe: { enabled: boolean };
    quickbooks: { enabled: boolean };
  };
}

interface ClinicContextType {
  clinic: Clinic | null;
  loading: boolean;
  refreshClinic: () => Promise<void>;
  updateSettings: (settings: Partial<ClinicSettings>) => Promise<void>;
  hasFeature: (featureName: string) => boolean;
  isWithinLimits: (limitType: string) => boolean;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};

interface ClinicProviderProps {
  children: ReactNode;
}

export const ClinicProvider: React.FC<ClinicProviderProps> = ({ children }) => {
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchClinic = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`/api/clinics/${user.clinicId}`);
      setClinic(response.data);
    } catch (error) {
      console.error('Failed to fetch clinic data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinic();
  }, [user]);

  const refreshClinic = async () => {
    await fetchClinic();
  };

  const updateSettings = async (settings: Partial<ClinicSettings>) => {
    try {
      const response = await axios.put(`/api/clinics/${user?.clinicId}/settings`, settings);
      setClinic(prev => prev ? { ...prev, settings: { ...prev.settings, ...settings } } : null);
      return response.data;
    } catch (error) {
      console.error('Failed to update clinic settings:', error);
      throw error;
    }
  };

  const hasFeature = (featureName: string): boolean => {
    if (!clinic) return false;
    
    const feature = clinic.subscription.features.find(f => f.name === featureName);
    return feature ? feature.enabled : false;
  };

  const isWithinLimits = (limitType: string): boolean => {
    if (!clinic) return false;
    
    const { usage, subscription } = clinic;
    
    switch (limitType) {
      case 'providers':
        return usage.currentProviders < subscription.maxProviders;
      case 'patients':
        return usage.currentPatients < subscription.maxPatients;
      default:
        return true;
    }
  };

  const value: ClinicContextType = {
    clinic,
    loading,
    refreshClinic,
    updateSettings,
    hasFeature,
    isWithinLimits,
  };

  return (
    <ClinicContext.Provider value={value}>
      {children}
    </ClinicContext.Provider>
  );
};