import React from 'react';
import { Shield } from 'lucide-react';
import Footer from '@/components/Footer';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: `We collect information you provide directly to us, such as when you create an account, make a booking, or contact support. This includes your name, email address, phone number, payment details (processed securely by our payment provider), and any photos or documents you upload. We also collect information automatically when you use our services, including log data, device information, IP address, and cookies.`,
  },
  {
    title: '2. How We Use Your Information',
    body: `We use the information we collect to provide, maintain, and improve our services; process bookings and payments; communicate with you about your account and trips; send promotional offers (which you may opt out of at any time); comply with legal obligations; and detect, prevent, and address fraud or safety issues.`,
  },
  {
    title: '3. Sharing Your Information',
    body: `We do not sell your personal information. We may share your information with other Arvana Rentals users as necessary to complete a booking (e.g., sharing your name and rating with a vehicle owner). We also share data with service providers who assist us in operating our platform, subject to strict confidentiality agreements. We may disclose information if required by law or to protect the rights and safety of Arvana Rentals and its users.`,
  },
  {
    title: '4. Cookies & Tracking Technologies',
    body: `We use cookies and similar tracking technologies to enhance your experience, remember your preferences, and analyze site traffic. You can control cookies through your browser settings, though disabling them may affect some functionality. We use analytics tools to understand how our services are used and to improve them over time.`,
  },
  {
    title: '5. Data Retention',
    body: `We retain your personal information for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time by contacting us. We may retain certain information for legal or regulatory purposes after account deletion.`,
  },
  {
    title: '6. Your Rights',
    body: `Depending on your location, you may have rights to access, correct, or delete your personal data; object to or restrict certain processing; and data portability. To exercise any of these rights, please contact us at privacy@arvanarentals.com. We will respond to your request within 30 days.`,
  },
  {
    title: '7. Security',
    body: `We implement industry-standard security measures including encryption in transit and at rest, access controls, and regular security audits. However, no method of transmission over the internet is 100% secure. We encourage you to use a strong, unique password and enable two-factor authentication on your account.`,
  },
  {
    title: '8. Children\'s Privacy',
    body: `Arvana Rentals is not intended for use by anyone under the age of 18. We do not knowingly collect personal information from minors. If we become aware that we have collected data from a child without parental consent, we will delete that information promptly.`,
  },
  {
    title: '9. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. We will notify you of material changes by email or by posting a prominent notice on our website. Your continued use of our services after changes take effect constitutes acceptance of the revised policy.`,
  },
  {
    title: '10. Contact Us',
    body: `If you have questions or concerns about this Privacy Policy, please contact our Privacy Team at privacy@arvanarentals.com or write to us at Arvana Rentals, Inc., 1234 Market Street, Suite 800, San Francisco, CA 94103.`,
  },
];

const Privacy: React.FC = () => (
  <div className="min-h-screen bg-background">
    {/* Hero */}
    <section className="pt-32 pb-16 bg-charcoal-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gold-gradient flex items-center justify-center mx-auto mb-6">
          <Shield className="w-7 h-7 text-charcoal-900" />
        </div>
        <h1 className="display-xl font-serif text-white mb-4">Privacy Policy</h1>
        <p className="text-white/50">Last updated: January 1, 2025</p>
      </div>
    </section>

    {/* Content */}
    <section className="py-20 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="prose prose-sm max-w-none">
          <p className="text-muted-foreground text-base leading-relaxed mb-10">
            At Arvana Rentals, we take your privacy seriously. This Privacy Policy explains how Arvana Rentals, Inc. ("Arvana Rentals", "we", "us", or "our") collects, uses, and shares information about you when you use our website, mobile application, and services (collectively, the "Services"). By using our Services, you agree to the collection and use of information in accordance with this policy.
          </p>
          {SECTIONS.map(({ title, body }) => (
            <div key={title} className="mb-8">
              <h2 className="text-lg font-bold text-foreground mb-3">{title}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default Privacy;
