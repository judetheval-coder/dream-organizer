'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        capture_pageview: true,
        capture_pageleave: true,
        autocapture: true,
        persistence: 'localStorage',
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            // Disable in development
            posthog.opt_out_capturing()
          }
        },
      })
    }
  }, [])

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>
  }

  return <PHProvider client={posthog}>{children}</PHProvider>
}

// Analytics helper functions
export const analytics = {
  identify: (userId: string, traits?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.identify(userId, traits)
    }
  },

  track: (event: string, properties?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.capture(event, properties)
    }
  },

  // Pre-defined events
  events: {
    dreamCreated: (props: { style: string; mood: string; panelCount: number }) => {
      analytics.track('dream_created', props)
    },
    panelGenerated: (props: { style: string; sceneNumber: number }) => {
      analytics.track('panel_generated', props)
    },
    subscriptionUpgraded: (props: { plan: string; price: number }) => {
      analytics.track('subscription_upgraded', props)
    },
    subscriptionCanceled: (props: { plan: string }) => {
      analytics.track('subscription_canceled', props)
    },
    signUp: () => {
      analytics.track('sign_up')
    },
    signIn: () => {
      analytics.track('sign_in')
    },
  },
}
