'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ 
        margin: 0, 
        background: '#0a0118', 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '400px' }}>
          <div style={{ fontSize: '80px', marginBottom: '1rem' }}>😵</div>
          <h1 style={{ 
            color: '#f8fafc', 
            fontSize: '1.5rem', 
            marginBottom: '0.5rem',
            fontWeight: 'bold'
          }}>
            Something went very wrong
          </h1>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
            We encountered a critical error. Please try refreshing the page.
          </p>
          <button
            onClick={reset}
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  )
}
