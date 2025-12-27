export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    limits: {
      dreamsPerMonth: 5,
      panelsPerDream: 4,
      maxStorageMB: 50,
    },
    features: [
      '5 dreams per month',
      'Basic AI generation',
      '50MB storage',
      'Standard quality images'
    ]
  },
  pro: {
    name: 'Pro',
    price: 9.99,
    limits: {
      dreamsPerMonth: 50,
      panelsPerDream: 6,
      maxStorageMB: 500,
    },
    features: [
      '50 dreams per month',
      'Advanced AI generation',
      '500MB storage',
      'HD quality images',
      'Priority support'
    ]
  },
  premium: {
    name: 'Premium',
    price: 19.99,
    limits: {
      dreamsPerMonth: -1, // unlimited
      panelsPerDream: 8,
      maxStorageMB: 2000,
    },
    features: [
      'Unlimited dreams',
      'Premium AI models',
      '2GB storage',
      '4K quality images',
      'Custom styles',
      'API access',
      'Priority support'
    ]
  }
}

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS

export function canCreateDream(tier: SubscriptionTier, currentCount: number, isAdmin?: boolean): boolean {
  // Admins have no limits
  if (isAdmin) return true
  const limit = SUBSCRIPTION_TIERS[tier].limits.dreamsPerMonth
  if (limit === -1) return true
  return currentCount < limit
}

export function getTierName(tier: SubscriptionTier): string {
  return SUBSCRIPTION_TIERS[tier].name
}

export function getTierFeatures(tier: SubscriptionTier): string[] {
  return SUBSCRIPTION_TIERS[tier].features
}

export function getTierLimits(tier: SubscriptionTier) {
  return SUBSCRIPTION_TIERS[tier].limits
}
