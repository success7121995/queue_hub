import { Shield, Calendar, FileText, Mail, MapPin } from 'lucide-react';

const PrivacyPolicyPage = () => {
    const lang = "en";
    const effectiveDate = "2025-Jun-04";
    const lastUpdated = "2025-Jun-04";
    
    
    const enPrivacyPolicyContent = (
        <div className="p-8 font-regular-eng w-full lg:w-[80%] mx-auto text-text-main">
            {/* Hero Section */}
            <div className="text-center mb-16">
                <h1 className="text-5xl font-bold mb-6 text-primary">Privacy Policy</h1>
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
                    <Shield className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">Introduction</h2>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">
                    Welcome to <span className="font-bold text-primary">QueueHub</span> ("we," "our," "us"). Your privacy is critically important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform and services through our website and mobile applications.
                    <br />
                    By using <span className="font-bold text-primary">QueueHub</span>, you agree to the terms outlined in this policy. If you do not agree, please discontinue use of our services.
                </p>
            </div>

            {/* Information We Collect */}
            <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                    <FileText className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">1. Information We Collect</h2>
                </div>
                <p className="text-lg text-gray-700 mb-8">We collect the following types of data:</p>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-primary mb-4">1.1 Personal Information</h3>
                        <ul className="list-disc ml-6 space-y-2 text-gray-700">
                            <li>Full name, email address, phone number</li>
                            <li>Business name (for merchant users)</li>
                            <li>Login credentials (hashed)</li>
                            <li>Language and timezone preferences</li>
                            <li>Device identifiers and IP address</li>
                        </ul>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-primary mb-4">1.2 Queue and Usage Data</h3>
                        <ul className="list-disc ml-6 space-y-2 text-gray-700">
                            <li>Queue entries and wait time data</li>
                            <li>User interactions (check-in, cancel, complete)</li>
                            <li>Location data (if permission granted)</li>
                            <li>Analytics logs and activity data</li>
                        </ul>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-primary mb-4">1.3 Payment Data</h3>
                        <ul className="list-disc ml-6 space-y-2 text-gray-700">
                            <li>Card token (via third-party processor)</li>
                            <li>Billing details (if applicable)</li>
                            <li>Subscription status and renewal preferences</li>
                        </ul>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-primary mb-4">1.4 Authentication and OAuth</h3>
                        <ul className="list-disc ml-6 space-y-2 text-gray-700">
                            <li>OAuth provider data (e.g., Google, Apple)</li>
                            <li>Associated email and profile info</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* How We Use Your Data */}
            <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                    <FileText className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">2. How We Use Your Data</h2>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-lg text-gray-700 mb-4">We use your data for the following purposes:</p>
                    <ul className="list-disc ml-6 space-y-2 text-gray-700">
                        <li>To provide, manage, and improve our services</li>
                        <li>To create and manage accounts</li>
                        <li>To process queue registrations and notify users</li>
                        <li>To manage merchant dashboards and analytics</li>
                        <li>To personalize user experiences (e.g., language, timezones)</li>
                        <li>To send system notifications and updates</li>
                        <li>To process payments and manage subscriptions</li>
                        <li>To comply with legal obligations</li>
                    </ul>
                </div>
            </div>

            {/* Sharing Your Information */}
            <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                    <FileText className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">3. Sharing Your Information</h2>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-lg text-gray-700 mb-4">We do not sell your data. However, we may share your data with:</p>
                    <ul className="list-disc ml-6 space-y-2 text-gray-700">
                        <li>Third-party service providers (e.g., Stripe, OAuth providers)</li>
                        <li>Hosting and analytics services (e.g., Vercel, Render, Neon)</li>
                        <li>Legal authorities if required by law</li>
                        <li>Business partners or affiliates, only where necessary for service delivery</li>
                    </ul>
                    <p className="mt-4 text-gray-700">Each vendor is contractually required to handle your data according to applicable privacy laws.</p>
                </div>
            </div>

            {/* Data Retention */}
            <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                    <FileText className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">4. Data Retention</h2>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-lg text-gray-700 mb-4">We retain personal data as long as:</p>
                    <ul className="list-disc ml-6 space-y-2 text-gray-700">
                        <li>Your account is active</li>
                        <li>It's required to provide services</li>
                        <li>It's needed to comply with legal obligations</li>
                    </ul>
                    <p className="mt-4 text-gray-700">You may request deletion of your data via our support team. However, some transactional records (e.g., invoices, logs) may be retained for auditing purposes.</p>
                </div>
            </div>

            {/* Your Rights */}
            <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                    <FileText className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">5. Your Rights</h2>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-lg text-gray-700 mb-4">Depending on your jurisdiction (e.g., EU, UK, HK), you may have the following rights:</p>
                    <ul className="list-disc ml-6 space-y-2 text-gray-700">
                        <li>Access and correct your data</li>
                        <li>Request data deletion</li>
                        <li>Object to or restrict processing</li>
                        <li>Port your data</li>
                        <li>Withdraw consent (where applicable)</li>
                    </ul>
                    <p className="mt-4 text-gray-700">To exercise these rights, contact: privacy@queuehub.app</p>
                </div>
            </div>

            {/* Security Measures */}
            <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                    <Shield className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">6. Security Measures</h2>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-lg text-gray-700 mb-4">We implement technical and organizational security measures including:</p>
                    <ul className="list-disc ml-6 space-y-2 text-gray-700">
                        <li>HTTPS encryption</li>
                        <li>Secure password hashing (e.g., bcrypt or Argon2)</li>
                        <li>Role-based access controls</li>
                        <li>Activity and audit logs</li>
                        <li>Data isolation per user/merchant</li>
                    </ul>
                    <p className="mt-4 text-gray-700">No system is 100% secure, but we strive to protect your information at all levels.</p>
                </div>
            </div>

            {/* International Data Transfers */}
            <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                    <FileText className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">7. International Data Transfers</h2>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-700">Your data may be stored or processed in countries outside your jurisdiction (e.g., US, EU, Hong Kong). We ensure appropriate safeguards, such as Standard Contractual Clauses (SCCs) or equivalents, to protect data transfers.</p>
                </div>
            </div>

            {/* Children's Privacy */}
            <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                    <FileText className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">8. Children's Privacy</h2>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-700">QueueHub is not intended for children under 13 (or under 16 in the EU). We do not knowingly collect data from minors. If we learn that we have collected personal data from a child, we will take steps to delete such information.</p>
                </div>
            </div>

            {/* Cookies and Tracking */}
            <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                    <FileText className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">9. Cookies and Tracking</h2>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-lg text-gray-700 mb-4">We may use cookies or similar technologies for:</p>
                    <ul className="list-disc ml-6 space-y-2 text-gray-700">
                        <li>User authentication</li>
                        <li>Queue status syncing</li>
                        <li>Analytics (e.g., page usage, heatmaps)</li>
                    </ul>
                    <p className="mt-4 text-gray-700">You may control cookie preferences via your browser settings.</p>
                </div>
            </div>

            {/* Changes to This Privacy Policy */}
            <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                    <FileText className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">10. Changes to This Privacy Policy</h2>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-700">We may update this policy from time to time. When we do, we'll revise the "Last Updated" date. You are responsible for reviewing any updates. Continued use means you accept the new terms.</p>
                </div>
            </div>

            {/* Contact Us */}
            <div className="text-center bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-12">
                <h2 className="text-3xl font-bold text-primary mb-6">11. Contact Us</h2>
                <p className="text-lg text-gray-700 mb-6">If you have questions or concerns about this Privacy Policy, contact us at:</p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-lg">
                    <a href="mailto:privacy@queuehub.app" className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        privacy@queuehub.app
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

    return enPrivacyPolicyContent;
};

export default PrivacyPolicyPage;