import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { premium } from '../services/api';

interface Subscription {
  id: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

interface PremiumContextType {
  isPremium: boolean;
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
  upgradeToPremium: (paymentMethodId: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const checkPremiumStatus = async () => {
    if (!user) {
      setIsPremium(false);
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      const status = await premium.getStatus();
      setIsPremium(status.isActive);
      setSubscription(status.subscription);
    } catch (error: any) {
      console.error('Error checking premium status:', error);
      setError(error.response?.data?.message || 'Premium durumu kontrol edilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkPremiumStatus();
  }, [user]);

  const upgradeToPremium = async (paymentMethodId: string) => {
    try {
      setLoading(true);
      setError(null);
      await premium.upgrade(paymentMethodId);
      await checkPremiumStatus();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Premium üyeliğe geçiş yapılırken bir hata oluştu');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      await premium.cancel();
      await checkPremiumStatus();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Abonelik iptal edilirken bir hata oluştu');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isPremium,
    subscription,
    loading,
    error,
    upgradeToPremium,
    cancelSubscription,
  };

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
}

export default PremiumContext; 