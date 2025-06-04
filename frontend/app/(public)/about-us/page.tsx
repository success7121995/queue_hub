import { Rocket, Puzzle, RefreshCw, Lightbulb, Shield, Globe, ExternalLink, Mail } from 'lucide-react';

const AboutUsPage = () => {
    const lang = "en";

    const enAboutUsContent = (
        <div className="p-8 font-regular-eng w-full lg:w-[80%] mx-auto my-16 text-text-main">
            {/* Hero Section */}
            <div className="text-center mb-16">
                <h1 className="text-5xl font-bold mb-6 text-primary">About QueueHub</h1>
                <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                    QueueHub is a next-generation real-time queue management platform designed to eliminate waiting chaos and enhance service experiences — for both businesses and their customers.
                </p>
            </div>

            {/* Mission Section */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 mb-16">
                <div className="flex items-center gap-4 mb-6">
                    <Rocket className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">Our Mission</h2>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">
                    To redefine how people wait. We help businesses streamline walk-ins, bookings, and customer flow with smart, data-driven tools — while giving customers the freedom to join queues remotely, track progress in real time, and reclaim their time.
                </p>
            </div>

            {/* What We Do Section */}
            <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                    <Puzzle className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">What We Do</h2>
                </div>
                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                    QueueHub empowers service providers — from salons and clinics to restaurants and government offices — with a digital queueing solution that's fast, intuitive, and adaptable.
                </p>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        "Create and manage multiple queues with customizable settings",
                        "Let customers join queues via mobile or web in just a few taps",
                        "Get real-time analytics on wait times, no-shows, and service efficiency",
                        "Automate queue notifications and reduce staff workload",
                        "Maintain brand loyalty with smooth, wait-less experiences"
                    ].map((feature, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <p className="text-gray-700">{feature}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Who It's For Section */}
            <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                    <RefreshCw className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">Who It's For</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-2xl font-bold text-primary mb-4">Businesses & Merchants</h3>
                        <p className="text-gray-700">
                            You run the show. QueueHub lets you manage customer flow, reduce bottlenecks, and boost operational efficiency with real-time dashboards and multi-role staff access.
                        </p>
                    </div>
                    
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-2xl font-bold text-primary mb-4">Customers & Guests</h3>
                        <p className="text-gray-700">
                            Say goodbye to standing in line. With QueueHub, you can join a queue from anywhere, get live updates, and walk in just in time.
                        </p>
                    </div>
                </div>
            </div>

            {/* Why QueueHub Section */}
            <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                    <Lightbulb className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">Why QueueHub?</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                    {[
                        {
                            title: "Real-Time Sync",
                            description: "Built on modern web sockets, your queues stay updated across all platforms — instantly."
                        },
                        {
                            title: "Smart Notifications",
                            description: "Automated reminders and alerts keep everyone on the same page."
                        },
                        {
                            title: "AI-Powered Insights",
                            description: "Coming soon: predicted wait times, smart scheduling suggestions, and dynamic resource allocation."
                        },
                        {
                            title: "Multilingual & Inclusive",
                            description: "Supports English, Traditional/Simplified Chinese, and more, so you serve more people better."
                        }
                    ].map((feature, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-primary mb-3">{feature.title}</h3>
                            <p className="text-gray-700">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Privacy & Trust Section */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 mb-16">
                <div className="flex items-center gap-4 mb-6">
                    <Shield className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">Privacy & Trust First</h2>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">
                    Data protection isn't an afterthought. QueueHub is built with modern security standards and GDPR principles. We don't sell user data — ever.
                </p>
            </div>

            {/* Vision Section */}
            <div className="mb-16">
                <div className="flex items-center gap-4 mb-6">
                    <Globe className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-bold text-primary">Our Vision</h2>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">
                    QueueHub isn't just a queue system. It's a customer experience layer for the physical world — bridging digital convenience with real-world needs.
                </p>
            </div>

            {/* CTA Section */}
            <div className="text-center bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-12">
                <h2 className="text-3xl font-bold text-primary mb-6">Ready to transform your service experience?</h2>
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-lg">
                    <a href="https://queuehub.app" className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2">
                        <ExternalLink className="w-5 h-5" />
                        Visit us at queuehub.app
                    </a>
                    <span className="hidden md:inline">|</span>
                    <a href="mailto:hello@queuehub.app" className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Contact: hello@queuehub.app
                    </a>
                </div>
            </div>
        </div>
    );

    return enAboutUsContent;
};

export default AboutUsPage;
