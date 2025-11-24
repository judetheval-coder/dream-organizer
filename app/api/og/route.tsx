import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0118 0%, #1a0a2e 50%, #0a0118 100%)',
          position: 'relative',
        }}
      >
        {/* Background decorations */}
        <div
          style={{
            position: 'absolute',
            top: '50px',
            left: '100px',
            fontSize: '80px',
            opacity: 0.3,
          }}
        >
          🌙
        </div>
        <div
          style={{
            position: 'absolute',
            top: '80px',
            right: '150px',
            fontSize: '60px',
            opacity: 0.3,
          }}
        >
          ✨
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '100px',
            left: '200px',
            fontSize: '70px',
            opacity: 0.3,
          }}
        >
          💭
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            right: '180px',
            fontSize: '50px',
            opacity: 0.3,
          }}
        >
          🎨
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            zIndex: 10,
          }}
        >
          {/* Logo/Icon */}
          <div
            style={{
              fontSize: '100px',
              marginBottom: '20px',
            }}
          >
            🌙
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4, #ec4899)',
              backgroundClip: 'text',
              color: 'transparent',
              margin: 0,
              marginBottom: '20px',
            }}
          >
            Dream Organizer
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '32px',
              color: '#94a3b8',
              margin: 0,
              maxWidth: '800px',
            }}
          >
            Turn Your Dreams Into Beautiful Comics
          </p>

          {/* Feature badges */}
          <div
            style={{
              display: 'flex',
              gap: '20px',
              marginTop: '40px',
            }}
          >
            <div
              style={{
                background: 'rgba(124, 58, 237, 0.3)',
                border: '1px solid rgba(124, 58, 237, 0.5)',
                borderRadius: '20px',
                padding: '10px 24px',
                color: '#c4b5fd',
                fontSize: '20px',
              }}
            >
              AI-Powered
            </div>
            <div
              style={{
                background: 'rgba(6, 182, 212, 0.3)',
                border: '1px solid rgba(6, 182, 212, 0.5)',
                borderRadius: '20px',
                padding: '10px 24px',
                color: '#67e8f9',
                fontSize: '20px',
              }}
            >
              Comic Generation
            </div>
            <div
              style={{
                background: 'rgba(236, 72, 153, 0.3)',
                border: '1px solid rgba(236, 72, 153, 0.5)',
                borderRadius: '20px',
                padding: '10px 24px',
                color: '#f9a8d4',
                fontSize: '20px',
              }}
            >
              Dream Journal
            </div>
          </div>
        </div>

        {/* Bottom gradient overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '100px',
            background: 'linear-gradient(to top, rgba(10, 1, 24, 0.8), transparent)',
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
