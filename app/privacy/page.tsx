import { colors, gradients } from '@/lib/design'
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy - The Dream Machine',
  description: 'Privacy policy for The Dream Machine - dream journaling and visualization platform',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-20 px-6" style={{ background: gradients.page }}>
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity"
          style={{ color: colors.cyan }}
        >
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-8" style={{ color: colors.textPrimary }}>
          Privacy Policy
        </h1>

        <div className="prose prose-invert max-w-none space-y-6" style={{ color: colors.textSecondary }}>
          <p className="text-sm" style={{ color: colors.textMuted }}>
            Last updated: November 24, 2025
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
              1. Introduction
            </h2>
            <p>
              The Dream Machine (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy and is committed to protecting 
              your personal data. This privacy policy explains how we collect, use, and safeguard your 
              information when you use our dream journaling and AI comic generation service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
              2. Information We Collect
            </h2>
            <h3 className="text-xl font-medium" style={{ color: colors.textPrimary }}>
              2.1 Account Information
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email address</li>
              <li>Name (optional)</li>
              <li>Profile picture (optional)</li>
              <li>Authentication data via Clerk</li>
            </ul>

            <h3 className="text-xl font-medium" style={{ color: colors.textPrimary }}>
              2.2 Dream Content
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Dream text and descriptions you submit</li>
              <li>AI-generated comic panel images</li>
              <li>Style and mood preferences</li>
              <li>Timestamps and metadata</li>
            </ul>

            <h3 className="text-xl font-medium" style={{ color: colors.textPrimary }}>
              2.3 Usage Data
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Features you use and interactions</li>
              <li>Device and browser information</li>
              <li>IP address and location data</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
              3. How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain our service</li>
              <li>To generate AI comic panels from your dream descriptions</li>
              <li>To process payments and manage subscriptions</li>
              <li>To send service-related communications</li>
              <li>To improve our AI models and user experience</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
              4. Data Storage and Security
            </h2>
            <p>
              Your data is stored securely using Supabase (PostgreSQL database) with row-level security 
              policies ensuring you can only access your own data. Images are stored in Supabase Storage 
              with appropriate access controls.
            </p>
            <p>
              We use industry-standard encryption (TLS/SSL) for data in transit and at rest.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
              5. Third-Party Services
            </h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Clerk</strong> - Authentication and user management</li>
              <li><strong>Supabase</strong> - Database and file storage</li>
              <li><strong>OpenAI</strong> - AI image generation (DALL-E)</li>
              <li><strong>Stripe</strong> - Payment processing</li>
              <li><strong>Vercel</strong> - Hosting and deployment</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
              6. Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and all associated data</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
              7. Data Retention
            </h2>
            <p>
              We retain your data for as long as your account is active. When you delete your account, 
              we will delete all your dreams, panels, and personal information within 30 days.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
              8. Cookies
            </h2>
            <p>
              We use essential cookies for authentication and session management. We may also use 
              analytics cookies to understand how our service is used. You can control cookie 
              preferences through your browser settings.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
              9. Children&apos;s Privacy
            </h2>
            <p>
              Our service is not intended for children under 13. We do not knowingly collect 
              information from children under 13.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
              10. Changes to This Policy
            </h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any 
              significant changes via email or through the service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
              11. Contact Us
            </h2>
            <p>
              If you have any questions about this privacy policy, please contact us at:
            </p>
            <p style={{ color: colors.cyan }}>
              support@dreamorganizer.app
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
