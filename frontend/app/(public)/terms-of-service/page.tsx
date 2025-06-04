import { Shield, Calendar, FileText, Mail, MapPin, Scale } from 'lucide-react';

const TermsOfServicePage = () => {
    const lang = "en";
    const effectiveDate = "2025-Jun-04";
    const lastUpdated = "2025-Jun-04";

    const enTermsOfServiceContent = (
        <div className="p-8 font-regular-eng w-full lg:w-[80%] mx-auto text-text-main">
            {/* Hero Section */}
            <div className="text-center mb-16">
                <h1 className="text-5xl font-bold mb-6 text-primary">Terms of Service</h1>
                <div className="flex items-center justify-center gap-4 text-gray-500">
                    <Calendar className="w-5 h-5" />
                    <p className="text-sm italic"><span className="font-bold">Effective date:</span> {effectiveDate}</p>
                    <span className="hidden md:inline">|</span>
                    <Calendar className="w-5 h-5" />
                    <p className="text-sm italic"><span className="font-bold">Last updated:</span> {lastUpdated}</p>
                </div>
            </div>

            {/* Introduction */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 mb-16">
                <div className="flex items-center gap-4 mb-6">
                    <Scale className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">Introduction</h2>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">
                    Welcome to <span className="font-bold text-primary">QueueHub</span> ("QueueHub", "we", "our", or "us"). These Terms of Service ("Terms") govern your access to and use of the QueueHub platform, including our website, mobile apps, APIs, and related services ("Services").
                    <br />
                    By using QueueHub, you agree to these Terms. If you do not agree, do not use our Services.
                </p>
            </div>

            {/* Eligibility */}
            <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                    <FileText className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">1. Eligibility</h2>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-700">To use QueueHub, you must be at least 13 years old (or the age of digital consent in your jurisdiction) and capable of entering into a binding legal agreement. Merchant users must be authorized representatives of a business or entity.</p>
                </div>
            </div>

            {/* Account Registration */}
            <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                    <FileText className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">2. Account Registration</h2>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-lg text-gray-700 mb-4">You are responsible for:</p>
                    <ul className="list-disc ml-6 space-y-2 text-gray-700">
                        <li>Providing accurate and up-to-date information during registration</li>
                        <li>Keeping your login credentials secure</li>
                        <li>All activity that occurs under your account</li>
                    </ul>
                    <p className="mt-4 text-gray-700">We reserve the right to suspend or terminate your account if any information is inaccurate, misleading, or violates these Terms.</p>
                </div>
            </div>

            {/* Use of the Service */}
            <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                    <FileText className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">3. Use of the Service</h2>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-lg text-gray-700 mb-4">You agree not to:</p>
                    <ul className="list-disc ml-6 space-y-2 text-gray-700">
                        <li>Use the Service for any unlawful, fraudulent, or abusive purpose</li>
                        <li>Access or tamper with non-public areas of QueueHub</li>
                        <li>Reverse-engineer or copy any part of the platform without permission</li>
                        <li>Spam, harass, or abuse other users or merchants</li>
                    </ul>
                    <p className="mt-4 text-gray-700">We reserve the right to monitor and restrict access to the Services at our discretion.</p>
                </div>
            </div>

            {/* Merchants and Subscriptions */}
            <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                    <FileText className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">4. Merchants and Subscriptions</h2>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-lg text-gray-700 mb-4">If you are a merchant:</p>
                    <ul className="list-disc ml-6 space-y-2 text-gray-700">
                        <li>You are responsible for maintaining accurate queue and service data</li>
                        <li>Subscription plans and billing are handled via third-party payment processors</li>
                        <li>By enabling auto-renewal, you authorize recurring charges until you cancel</li>
                        <li>You may cancel at any time, but fees already paid are non-refundable</li>
                    </ul>
                </div>
            </div>

            {/* Customers and Queue Participation */}
            <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                    <FileText className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">5. Customers and Queue Participation</h2>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-lg text-gray-700 mb-4">As a customer using QueueHub:</p>
                    <ul className="list-disc ml-6 space-y-2 text-gray-700">
                        <li>You may join, leave, or monitor queues through our mobile app or website</li>
                        <li>Notifications and estimated wait times are provided for convenience but are not guaranteed</li>
                        <li>You are expected to behave respectfully and in accordance with venue policies</li>
                    </ul>
                </div>
            </div>

            {/* Intellectual Property */}
            <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                    <FileText className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">6. Intellectual Property</h2>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-700">All content, trademarks, and code on QueueHub are owned or licensed by us. You may not copy, distribute, or create derivative works without express permission.</p>
                </div>
            </div>

            {/* Privacy */}
            <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                    <Shield className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">7. Privacy</h2>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-700">Your use of QueueHub is subject to our Privacy Policy which describes how we handle your personal data. By using the Service, you consent to our data practices.</p>
                </div>
            </div>

            {/* Service Availability */}
            <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                    <FileText className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">8. Service Availability</h2>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-lg text-gray-700 mb-4">We strive to maintain a reliable and secure platform, but:</p>
                    <ul className="list-disc ml-6 space-y-2 text-gray-700">
                        <li>We do not guarantee uptime, availability, or the accuracy of wait times</li>
                        <li>Service may be interrupted for maintenance, updates, or unforeseen issues</li>
                        <li>We are not liable for any losses resulting from temporary downtime or data issues</li>
                    </ul>
                </div>
            </div>

            {/* Termination */}
            <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                    <FileText className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">9. Termination</h2>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-lg text-gray-700 mb-4">We may suspend or terminate your account at any time:</p>
                    <ul className="list-disc ml-6 space-y-2 text-gray-700">
                        <li>If you violate these Terms</li>
                        <li>If required by law or to protect users or our platform</li>
                    </ul>
                    <p className="mt-4 text-gray-700">You may terminate your account at any time by contacting support.</p>
                </div>
            </div>

            {/* Disclaimers */}
            <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                    <FileText className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">10. Disclaimers</h2>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <ul className="list-disc ml-6 space-y-2 text-gray-700">
                        <li>QueueHub is provided "as is" and "as available"</li>
                        <li>We make no warranties, express or implied, about the Service</li>
                        <li>We are not liable for indirect, incidental, or consequential damages</li>
                    </ul>
                </div>
            </div>

            {/* Limitation of Liability */}
            <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                    <FileText className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">11. Limitation of Liability</h2>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-700">To the fullest extent permitted by law, our total liability to you for any claim arising out of or relating to these Terms or the Services is limited to the amount you paid to us (if any) in the past 12 months.</p>
                </div>
            </div>

            {/* Changes to These Terms */}
            <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                    <FileText className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">12. Changes to These Terms</h2>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-700">We may update these Terms from time to time. If changes are material, we'll notify you via the platform or email. Continued use of the Service means you accept the updated Terms.</p>
                </div>
            </div>

            {/* Governing Law */}
            <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                    <Scale className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">13. Governing Law</h2>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-700">These Terms are governed by and construed in accordance with the laws of [Insert Jurisdiction, e.g., England and Wales or Hong Kong]. Any disputes shall be resolved in the courts of that jurisdiction.</p>
                </div>
            </div>

            {/* Contact Us */}
            <div className="text-center bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-12">
                <h2 className="text-3xl font-bold text-primary mb-6">14. Contact Us</h2>
                <p className="text-lg text-gray-700 mb-6">For questions or issues regarding these Terms, contact us:</p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-lg">
                    <a href="mailto:legal@queuehub.app" className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        legal@queuehub.app
                    </a>
                    <span className="hidden md:inline">|</span>
                    <p className="text-gray-700 flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        [Insert Registered Business Address]
                    </p>
                </div>
            </div>
        </div>
    );

    return enTermsOfServiceContent;
};

export default TermsOfServicePage;
