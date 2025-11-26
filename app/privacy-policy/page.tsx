export default function PrivacyPolicy() {
  return (
    <main className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our service.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Information We Collect</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>Email address and authentication data (via Clerk)</li>
        <li>Dream and comic content you submit</li>
        <li>Payment information (via Stripe, never stored on our servers)</li>
        <li>Usage analytics (for improving the service)</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">How We Use Information</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>To provide and improve our service</li>
        <li>To process payments and manage subscriptions</li>
        <li>To communicate with you about your account</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">Your Rights</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>You can request deletion of your data at any time</li>
        <li>Contact us for any privacy-related questions</li>
      </ul>
      <p className="mt-8">Contact: support@lucidlaboratories.net</p>
    </main>
  );
}
