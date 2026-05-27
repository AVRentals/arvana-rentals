import React from 'react';
import { FileText } from 'lucide-react';
import Footer from '@/components/Footer';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing or using Arvana Rentals's website, mobile application, or services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our Services. We reserve the right to update these Terms at any time, and your continued use of the Services constitutes acceptance of any changes.`,
  },
  {
    title: '2. Eligibility',
    body: `You must be at least 18 years old and hold a valid driver's license to rent a vehicle through Arvana Rentals. By using our Services, you represent that you meet these requirements. We reserve the right to verify your identity and driving record at any time.`,
  },
  {
    title: '3. Account Registration',
    body: `You must create an account to book a vehicle. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Notify us immediately of any unauthorized use. Arvana Rentals is not liable for losses resulting from unauthorized account access.`,
  },
  {
    title: '4. Booking & Payments',
    body: `When you book a vehicle, you agree to pay all fees displayed at checkout, including the daily rate, service fee, and any applicable taxes. All payments are processed securely through our payment provider. By completing a booking, you authorize Arvana Rentals to charge your payment method for the total amount. Prices are in USD unless otherwise stated.`,
  },
  {
    title: '5. Cancellation Policy',
    body: `Free cancellation is available up to 24 hours before the scheduled pickup time. Cancellations made less than 24 hours in advance may incur a fee equal to one day's rental rate. No-shows are non-refundable. Some vehicles may have stricter cancellation policies, which will be clearly stated on the vehicle listing.`,
  },
  {
    title: '6. Vehicle Use',
    body: `You agree to use the rented vehicle in a lawful manner and in compliance with all applicable traffic laws. You may not use the vehicle for commercial purposes (e.g., rideshare or delivery), outside the approved geographic area, off-road, or in any race or competition. Smoking in vehicles is prohibited. You are responsible for any traffic violations or fines incurred during your rental period.`,
  },
  {
    title: '7. Insurance & Liability',
    body: `Every Arvana Rentals trip includes $1,000,000 in third-party liability coverage. This coverage is secondary to any personal auto insurance you may carry. You are responsible for any damage to the vehicle during your rental that is not covered by our protection plan. We offer optional additional protection plans at checkout.`,
  },
  {
    title: '8. Prohibited Conduct',
    body: `You agree not to: (a) use the Services for any illegal purpose; (b) provide false information; (c) attempt to circumvent our verification processes; (d) harass or harm other users; (e) damage, tamper with, or remove any part of a vehicle; (f) access our systems in unauthorized ways; or (g) violate any applicable laws or regulations. Violation may result in account suspension.`,
  },
  {
    title: '9. Dispute Resolution',
    body: `Any dispute arising from these Terms or your use of the Services will be resolved through binding arbitration, except for claims that may be brought in small claims court. You waive your right to participate in a class action lawsuit. These Terms are governed by the laws of the State of Florida, without regard to conflict of law principles.`,
  },
  {
    title: '10. Limitation of Liability',
    body: `To the maximum extent permitted by law, Arvana Rentals shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Services. Our total liability to you for any claims shall not exceed the amount you paid to Arvana Rentals in the 12 months preceding the claim.`,
  },
  {
    title: '11. Contact',
    body: `If you have any questions about these Terms of Service, please contact us at legal@arvanarentals.com or at Arvana Rentals, Inc., 1200 Brickell Avenue, Suite 500, Miami, FL 33131.`,
  },
];

const Terms: React.FC = () => (
  <div className="min-h-screen bg-background">
    {/* Hero */}
    <section className="pt-32 pb-16 bg-charcoal-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gold-gradient flex items-center justify-center mx-auto mb-6">
          <FileText className="w-7 h-7 text-charcoal-900" />
        </div>
        <h1 className="display-xl font-serif text-white mb-4">Terms of Service</h1>
        <p className="text-white/50">Last updated: January 1, 2025</p>
      </div>
    </section>

    {/* Content */}
    <section className="py-20 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-muted-foreground text-base leading-relaxed mb-10">
          Welcome to Arvana Rentals. Please read these Terms of Service carefully before using our platform. These terms constitute a legally binding agreement between you and Arvana Rentals, Inc.
        </p>
        {SECTIONS.map(({ title, body }) => (
          <div key={title} className="mb-8">
            <h2 className="text-lg font-bold text-foreground mb-3">{title}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </section>

    <Footer />
  </div>
);

export default Terms;
