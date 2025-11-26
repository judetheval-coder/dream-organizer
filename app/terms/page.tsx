import { colors, gradients } from '@/lib/design'
import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service - The Dream Machine',
  description: 'Terms of service for The Dream Machine - AI-powered dream journaling platform',
}

export default function TermsPage() {
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
          Terms of Service
        </h1>

        <div className="prose prose-invert max-w-none space-y-6" style={{ color: colors.textSecondary }}>
          <p className="text-sm" style={{ color: colors.textMuted }}>
            Last updated: November 24, 2025
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using The Dream Machine (&quot;the Service&quot;), you agree to be bound by these 
              Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
              2. Description of Service
            </h2>
            <p>
              The Dream Machine is an AI-powered dream journaling platform that allows users to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Record and store dream descriptions</li>
              <li>Generate AI-powered comic panel artwork from dreams</li>
              <li>Analyze dream patterns and themes</li>
              <li>Export and share dream content</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
              3. User Accounts
            </h2>
            <p>
              You must create an account to use the Service. You are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete information</li>
              <li>Notifying us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
              4. Subscription and Payments
            </h2>
            <h3 className="text-xl font-medium" style={{ color: colors.textPrimary }}>
              4.1 Free Tier
            </h3>
            <p>
              The free tier includes limited access to features as described on our pricing page.
            </p>
            
            <h3 className="text-xl font-medium" style={{ color: colors.textPrimary }}>
              4.2 Paid Subscriptions
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Subscriptions are billed monthly or annually</li>
              <li>Payment is processed through Stripe</li>
              <li>Subscriptions auto-renew unless cancelled</li>
              <li>You may cancel at any time; access continues until the end of the billing period</li>
            </ul>

            <h3 className="text-xl font-medium" style={{ color: colors.textPrimary }}>
              4.3 Refunds
            </h3>
            <p>
              We offer a 7-day money-back guarantee for new paid subscriptions. Contact support 
              within 7 days of your first payment for a full refund.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
              5. User Content
            </h2>
            <h3 className="text-xl font-medium" style={{ color: colors.textPrimary }}>
              5.1 Ownership
            </h3>
            <p>
              You retain ownership of the dream text and descriptions you submit. AI-generated 
              images are created for your personal use under a non-exclusive license.
            </p>

            <h3 className="text-xl font-medium" style={{ color: colors.textPrimary }}>
              5.2 Content Guidelines
            </h3>
            <p>You agree not to submit content that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Is illegal, harmful, or violates others&apos; rights</li>
              <li>Contains explicit sexual or violent content</li>
              <li>Promotes discrimination or hate speech</li>
              <li>Infringes on intellectual property rights</li>
              <li>Contains malware or harmful code</li>
            </ul>

            <h3 className="text-xl font-medium" style={{ color: colors.textPrimary }}>
              5.3 AI Generation Limitations
            </h3>
            <p>
              Our AI system may refuse to generate images for content that violates OpenAI&apos;s 
              usage policies. We are not responsible for any limitations imposed by third-party 
              AI providers.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
              6. Prohibited Uses
            </h2>
            <p>You may not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service for any illegal purpose</li>
              <li>Attempt to bypass rate limits or security measures</li>
              <li>Reverse engineer or copy the Service</li>
              <li>Use automated systems to access the Service excessively</li>
              <li>Impersonate others or misrepresent your affiliation</li>
              <li>Sell or resell access to the Service</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
              7. Intellectual Property
            </h2>
            <p>
              The Service, including its design, code, and branding, is owned by The Dream Machine 
              and protected by intellectual property laws. You may not copy, modify, or distribute 
              our proprietary materials without permission.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
              8. Disclaimers
            </h2>
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Uninterrupted or error-free operation</li>
              <li>Accuracy of AI-generated content</li>
              <li>Compatibility with your devices or software</li>
              <li>That the Service will meet your specific needs</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
              9. Limitation of Liability
            </h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE DREAM MACHINE SHALL NOT BE LIABLE FOR 
              ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOSS OF 
              DATA, PROFITS, OR GOODWILL.
            </p>
            <p>
              Our total liability shall not exceed the amount you paid us in the 12 months 
              preceding the claim.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
              10. Termination
            </h2>
            <p>
              We may suspend or terminate your access to the Service at any time for violation 
              of these terms or for any other reason at our discretion. Upon termination, your 
              right to use the Service ceases immediately.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
              11. Changes to Terms
            </h2>
            <p>
              We may modify these terms at any time. We will notify you of significant changes 
              via email or through the Service. Continued use after changes constitutes acceptance 
              of the new terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
              12. Governing Law
            </h2>
            <p>
              These terms are governed by the laws of the United States. Any disputes shall be 
              resolved in the courts of [Your Jurisdiction].
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
              13. Contact
            </h2>
            <p>
              For questions about these terms, contact us at:
            </p>
              <p style={{ color: colors.cyan }}>
                support@lucidlaboratories.net
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
