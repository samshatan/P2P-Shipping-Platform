import React from 'react';

export function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6 text-left selection:bg-brand-primary/30">
      <h1 className="text-5xl font-black mb-4 tracking-tight">Privacy <span className="text-brand-primary">Policy</span></h1>
      <p className="text-text-muted font-medium mb-12">Last Updated: April 2026</p>
      
      <div className="space-y-12 text-lg text-text-muted font-medium leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-text-main">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as your name, email, phone number, and shipping/billing addresses. We also collect shipment details and transaction history.
          </p>
        </section>

        <section className="section space-y-4">
          <h2 className="text-2xl font-black text-text-main">2. How We Use Your Data</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Process your shipment bookings.</li>
            <li>Send tracking updates and notifications.</li>
            <li>Verify your identity via OTP.</li>
            <li>Improve our platform and services.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-text-main">3. Data Sharing</h2>
          <p>
            We share your information with third-party courier partners (e.g., Delhivery, Shiprocket) only to the extent necessary to fulfill your shipping requests. We do not sell your personal data to advertisers.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-text-main">4. Security</h2>
          <p>
            We implement industry-standard security measures to protect your data, including SSL encryption and secure database protocols.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-text-main">5. Cookies</h2>
          <p>
            We use cookies to maintain your session and remember your preferences (like dark mode). You can disable cookies in your browser settings, though some features may not function correctly.
          </p>
        </section>
      </div>
    </div>
  );
}
