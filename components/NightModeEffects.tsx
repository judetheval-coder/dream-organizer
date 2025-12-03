"use client"

/**
 * NightModeEffects - Immersive atmospheric effects for the dreamlike experience
 *
 * Renders floating orbs, ambient glows, shooting stars, and twinkling stars
 * that create a soft, dreamy night sky atmosphere throughout the app.
 */
export default function NightModeEffects() {
    return (
        <div className="night-mode-container" aria-hidden="true">
            {/* Ambient glow layers - soft pulsing background lights */}
            <div className="ambient-glow ambient-glow-purple" />
            <div className="ambient-glow ambient-glow-cyan" />
            <div className="ambient-glow ambient-glow-pink" />

            {/* Floating dream orbs - gentle drifting particles */}
            <div className="dream-orb dream-orb-1" />
            <div className="dream-orb dream-orb-2" />
            <div className="dream-orb dream-orb-3" />
            <div className="dream-orb dream-orb-4" />
            <div className="dream-orb dream-orb-5" />

            {/* Twinkling stars - subtle sparkles in the background */}
            <div className="twinkle-star" />
            <div className="twinkle-star" />
            <div className="twinkle-star" />
            <div className="twinkle-star" />
            <div className="twinkle-star" />
            <div className="twinkle-star" />
            <div className="twinkle-star" />
            <div className="twinkle-star" />
            <div className="twinkle-star" />
            <div className="twinkle-star" />
        </div>
    )
}
