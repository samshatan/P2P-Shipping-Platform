import React from 'react';

export function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6 text-left selection:bg-brand-primary/30">
      <h1 className="text-5xl font-black mb-4 tracking-tight">Terms of <span className="text-brand-primary">Service</span></h1>
      <p className="text-text-muted font-medium mb-12">Last Updated: April 2026</p>
      
      <div className="space-y-12 text-lg text-text-muted font-medium leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-text-main">1. Acceptance of Terms</h2>
          <p>
            By accessing and using ShipEasy, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-text-main">2. Service Description</h2>
          <p>
            ShipEasy is a logistics aggregator. We provide a platform for users to compare rates and book shipments with third-party courier partners. We do not personally handle, transport, or store your packages.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-text-main">3. User Responsibilities</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You must provide accurate shipment details (weight, dimensions, addresses).</li>
            <li>You are responsible for proper packaging of items.</li>
            <li>Prohibited items (explosives, illegal substances, etc.) must not be shipped.</li>
            <li>For international shipping, you agree to comply with all destination country customs laws.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-text-main">4. Payments & Refunds</h2>
          <p>
            Payments are collected at the time of booking. Refunds are subject to the specific courier partner's policy. ShipEasy acts as a facilitator and will assist in processing legitimate refund requests.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-text-main">5. Limitation of Liability</h2>
          <p>
            ShipEasy is not liable for loss, damage, or delay caused by courier partners. Our liability is limited to the service fee charged by ShipEasy for the specific booking.
          </p>
        </section>
      </div>
    </div>
  );
}
