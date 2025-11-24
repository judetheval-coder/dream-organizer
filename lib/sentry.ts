import * as SentryNode from '@sentry/node'
import * as SentryReact from '@sentry/react'

let nodeInitialized = false
let browserInitialized = false

function initNode() {
  if (nodeInitialized || typeof window !== 'undefined') return
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return

  SentryNode.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  })
  nodeInitialized = true
}

function initBrowser() {
  if (browserInitialized || typeof window === 'undefined') return
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return

  SentryReact.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  })
  browserInitialized = true
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  const normalizedError = error instanceof Error ? error : new Error('Unknown error')
  if (typeof window === 'undefined') {
    initNode()
    if (!nodeInitialized) return
    SentryNode.captureException(normalizedError, { extra: context })
  } else {
    initBrowser()
    if (!browserInitialized) return
    SentryReact.captureException(normalizedError, { extra: context })
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (typeof window === 'undefined') {
    initNode()
    if (!nodeInitialized) return
    SentryNode.captureMessage(message, level)
  } else {
    initBrowser()
    if (!browserInitialized) return
    SentryReact.captureMessage(message, level)
  }
}

export function withSentry<T extends (...args: unknown[]) => unknown>(handler: T): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    try {
      return handler(...args) as ReturnType<T>
    } catch (error) {
      captureException(error)
      throw error
    }
  }) as T
}
