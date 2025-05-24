'use client';

import { useEffect, useState, use } from 'react';
import { notFound } from 'next/navigation';

type FeatureContentItem =
	| { type: "paragraph"; text: string }
	| { type: "list"; items: string[] }
	| { type: "subtitle"; text: string };

interface FeatureContent {
	title: string;
	content: FeatureContentItem[];
}

interface FeaturePageProps {
	params: Promise<{ slug: string }>;
}

/**********    Render with bold    **********/
const renderWithBold = (text: string) => {
	// Split by ** and alternate between normal and bold
	const parts = text.split(/(\*\*[^*]+\*\*)/g);
	return parts.map((part, i) =>
		part.startsWith('**') && part.endsWith('**')
			? <strong key={i}>{part.slice(2, -2)}</strong>
			: <span key={i}>{part}</span>
	);
}

const FeaturePage = ({ params }: FeaturePageProps) => {
	const { slug } = use(params);

	const allowedSlugs = [
		"real-time-updates",
		"smart-notification-system",
		"multi-role-access-and-permission-control",
		"analytics-and-feedback-integration",
		"mobile-and-cross-device-access",
		"2fa-and-secure-login",
	];

	/**********    Check if the slug is allowed    **********/
	if (!allowedSlugs.includes(slug)) {
		notFound();
	}

	const featureContent: Record<string, FeatureContent> = {
		"real-time-updates": {
			title: "Real-time Updates",
			content: [
				{ type: "paragraph", text: "**Instant visibility. Seamless control. QueueHub empowers your business with real-time queue management that minimizes customer wait times and maximizes staff efficiency.**" },

				{ type: "paragraph", text: "In today's fast-paced service environments, customers no longer tolerate long lines or disorganized experiences. With QueueHub's real-time queue management system, you get a powerful, web-based dashboard that reflects every change in your queue — live and instantaneously." },

				{ type: "paragraph", text: "Unlike traditional queue systems that rely on ticket machines or manual spreadsheets, QueueHub leverages WebSockets to push real-time updates directly to the interface. You'll never need to refresh or guess — it's all live. Every second counts, and in high-demand environments like clinics, retail service counters, government service points, or restaurants, this live data flow makes a measurable difference." },

				{ type: "paragraph", text: "From the merchant's side, the web dashboard is your mission control. You can view all queues associated with your branches, monitor their length, estimated waiting times, and customer status at a glance. The UI is intuitive, with filters and tags to help segment and prioritize customer types — for example, those with appointments, VIPs, or walk-ins." },

				{ type: "paragraph", text: "With this centralised command, your staff can make fast, informed decisions to keep the service flow moving smoothly." },
				
				{ type: "paragraph", text: "Real-time also means adaptability. If one branch is overwhelmed, staff can quickly direct overflow to another location if available. If someone misses their turn, the system automatically reorders them and alerts the next eligible customer. This automation reduces the burden on frontline staff, who no longer need to manually call names or manage paper tickets." },

				{ type: "paragraph", text: "It also leads to a calmer, more professional in-store atmosphere, where customers feel that things are fair and efficient." },

				{ type: "paragraph", text: "One of the most powerful aspects of QueueHub's real-time system is its synchronization across users and devices. Multiple staff can log in simultaneously, from different counters or offices, and all will see the same up-to-date view. This is especially helpful in environments where roles are distributed — e.g., a receptionist handles check-ins while another staff member manages fulfilment. Everyone stays on the same page, literally." },
				
				{ type: "paragraph", text: "Real-time queue status is also surfaced to customers. Through the mobile app, they can monitor their position in line, get notified when their turn is near, and estimate how long they'll need to wait. This transparency reduces anxiety and prevents physical crowding at your premises. Happy, informed customers tend to be more patient — and more likely to return." },
				
				{ type: "paragraph", text: "From a scalability perspective, QueueHub's real-time backend is designed to perform under load. Whether you're managing a single shop or a multi-branch operation, the infrastructure supports thousands of concurrent queue events without latency. The system is fault-tolerant, and critical actions are logged for audit and analytics." },
				
				{ type: "paragraph", text: "To sum up, QueueHub doesn't just help you manage queues — it transforms them into strategic assets. Real-time visibility means you can react faster, serve smarter, and build trust with every customer interaction. For merchants, this isn't just about operational convenience — it's about delivering a modern, competitive experience that keeps you one step ahead in a service-driven world." }
			],
		},
		"smart-notification-system": {
			title: "Smart Notification System",
			content: [
				{ type: "paragraph", text: "**Proactive communication that reduces no-shows, improves punctuality, and keeps your customers — and your staff — perfectly in sync.**" },
				
				{ type: "paragraph", text: "QueueHub's Smart Notification System is more than just a tool for sending alerts — it's a fully integrated communications engine designed to streamline the service flow between your business and your customers. At its core, it helps you stay in control of customer engagement throughout the queuing experience by automatically delivering timely, contextual updates to the right people at the right time." },
				
				{ type: "paragraph", text: "For merchants, one of the most frustrating problems is customer no-shows or late arrivals, especially during high-demand hours. With QueueHub, those frustrations are drastically reduced. As soon as a customer joins the queue — whether from home, on the go, or physically at your location — they receive automatic confirmation via push notification. From that point forward, QueueHub keeps them updated with dynamic messages about their estimated wait time, queue position, and next steps. These notifications adapt in real-time as the queue shifts, eliminating confusion and reducing the risk of customers missing their turn." },
				
				{ type: "paragraph", text: "From the web dashboard, merchants have full control over how and when these notifications are sent. Want to notify a customer 5 minutes before their turn? Done. Need to nudge those who are taking too long to respond? QueueHub has configurable reminder intervals. You can even set up fallback notifications — for example, alert the next customer in line automatically if the current one doesn't show up within a grace period. All of this happens automatically, reducing the workload on your staff and minimizing manual intervention." },
				
				{ type: "paragraph", text: "Notifications are intelligent, too. They're not one-size-fits-all; instead, they are triggered based on queue conditions, user behaviors, and service policies that you configure. For instance, if your location handles both appointment-based and walk-in traffic, QueueHub can send different messages to each group. You can also segment notifications by service type, duration, or customer tags, offering a tailored experience without complicating your team's workflow." },
				
				{ type: "paragraph", text: "For customers, the result is a frictionless experience. They know when to show up, where to go, and how long they'll wait — all without needing to ask. This kind of proactive communication builds trust and reduces the psychological burden of \"what's going on?\" that often leads to dissatisfaction or drop-offs. A customer who knows they'll be served in 15 minutes is far less likely to walk away than one who's left guessing." },
				
				{ type: "paragraph", text: "For multi-location businesses, QueueHub's notification system ensures consistency across all branches. Each branch manager or service team can adjust their notification timing and tone to fit local conditions, yet still benefit from centralized oversight. If you run a chain of clinics or stores, this means brand-consistent communication at scale, with flexibility for each unit to fine-tune based on its unique customer base." },
				
				{ type: "paragraph", text: "Technically, QueueHub supports push notifications through its mobile app, and future updates may include support for email and SMS (depending on your business needs and compliance requirements). Notifications are logged and timestamped, making them traceable — especially useful when disputes arise over missed turns or claimed service delays." },
				
				{ type: "paragraph", text: "All this is built with scalability and privacy in mind. Notification preferences are opt-in by default and compliant with modern data protection laws (e.g., GDPR). You can even encourage customers to set notification preferences — like enabling reminders, marketing messages, or multilingual alerts — giving them more control while improving their satisfaction and return rates." },
				
				{ type: "paragraph", text: "In short, QueueHub's Smart Notification System helps you deliver better service without lifting a finger. Customers stay informed, queues move smoothly, and your staff can focus on delivering value rather than calling names or chasing people down. It's automation with a human touch — and it's a small change that leads to a big improvement in the customer experience." }
			],
		},
		"multi-role-access-and-permission-control": {
			title: "Multi-role Access and Permission Control",
			content: [
				{ type: "paragraph", text: "**Delegate tasks with precision. Manage access with confidence.**" },
				
				{ type: "paragraph", text: "QueueHub's **Multi-Role Access** and **Permission Control** system is built for modern businesses that rely on teams — not individuals — to run daily operations." },

				{ type: "paragraph", text: "At the foundation is the **User-Merchant relationship model**, which supports assigning multiple users to one or more merchants, each with a distinct role: Owner, Manager, or Frontline. Each role comes with predefined permissions that control what the user can view, modify, or manage — from queue operations to analytics dashboards to customer records." },

				{ type: "list", items: [
					"**Owners** hold the highest level of control. Typically the business founder or general manager, this role can manage all aspects of the merchant's QueueHub presence: adding/removing team members, updating business hours, creating queues, viewing analytics, and controlling payment or notification settings.",

					"**Managers** have operational authority. They can monitor queues, manage staff schedules, analyze reports, and moderate customer reviews — but they can't alter core business settings or access financial information unless explicitly granted.",

					"**Frontline staff** — the boots-on-the-ground team members — can check in customers, advance the queue, leave internal notes, or mark entries as completed. Their view is streamlined to avoid unnecessary distractions or risky access.",
				] },

				{ type: "paragraph", text: "This tiered structure gives you total flexibility. Have a temp worker managing a seasonal pop-up queue? Assign them a temporary Frontline role. Want to give your assistant manager more visibility into daily performance without exposing sensitive business data? The Manager role fits. Need to revoke access for a former employee? Done in one click — with a full audit trail." },

				{ type: "paragraph", text: "QueueHub also supports **multi-merchant management**, meaning a single user can be part of multiple businesses with different roles in each. For example, someone could be a Manager for Merchant A while serving as an Owner for Merchant B. This makes QueueHub ideal for consultants, franchise managers, or anyone involved in operations across multiple locations or brands." },

				{ type: "paragraph", text: "All user activities are logged through an **Admin Action Log**, giving you visibility into who did what and when — essential for accountability, especially in environments with high staff turnover or sensitive data (e.g., healthcare, finance)." },

				{ type: "paragraph", text: "The permission model is also **future-proof**. While default roles cover most needs, custom permission sets will be supported in upcoming versions. This will allow you to define granular controls such as \"can export analytics but not view customer emails\" or \"can edit queues but not delete entries,\" giving you enterprise-level security without the enterprise-level complexity." },
				
				{ type: "paragraph", text: "From a UI/UX perspective, each user only sees what's relevant to their role. Frontline staff won't be overwhelmed by charts and configurations they don't need. Managers get tools that help them optimize. Owners stay in control without micro-managing everything. This focused experience boosts productivity, reduces onboarding time, and minimizes mistakes caused by access confusion." },

				{ type: "paragraph", text: "In short, QueueHub's multi-role system protects your operations from the inside out. It empowers your team, maintains your business integrity, and lets you scale with confidence — no matter how complex your organizational structure becomes." }
				
			],
		},
		"analytics-and-feedback-integration": {
			title: "Analytics & Feedback Integration",
			content: [
				{ type: "paragraph", text: "**See the full picture. Know what's working. Spot what's broken. QueueHub turns your daily operations into data-driven decisions with built-in analytics and structured customer feedback tools.**" },

				{ type: "paragraph", text: "In a fast-paced service environment, gut instinct isn't enough. You need real-time visibility into how your queues perform, how customers behave, and where your team can improve. QueueHub's Analytics and Feedback Integration feature equips you with actionable insights — not just raw data — so you can make informed business decisions that directly improve customer satisfaction and operational efficiency." },

				{ type: "subtitle", text: "Here's what you can expect:" },

				{ type: "list", items: [
					"**Live Queue Monitoring:** Instantly track queue status across all your locations. See average wait times, peak traffic hours, queue abandonment rates, and more. These metrics help you adjust staffing, optimize service flows, and predict demand.",

					"**Performance Dashboards:** QueueHub compiles key metrics into clean, visual dashboards. From daily performance summaries to monthly trends, you get clarity without needing a data analyst. Quickly identify bottlenecks, top-performing staff, or high-volume time slots that require attention.",

					"**Review System with Merchant Response:** After each completed queue entry, customers are invited to leave feedback — a simple star rating and an optional comment. These reviews are tied directly to specific service sessions and staff, offering granular insights. As a merchant, you can respond to reviews publicly, address concerns, or thank loyal customers, building transparency and trust.",

					"**nternal Tagging for Queue Entries:** Your staff can tag queue entries with internal labels like “no-show,” “VIP,” or “issue resolved.” This creates a layer of qualitative data you can track over time. Want to measure how many “issue resolved” cases were later followed by positive reviews? You can.",

					"**Staff-Level Reporting:** Track individual staff performance based on speed, volume handled, and customer feedback. Use this data for internal evaluations, incentives, or scheduling. It's a practical way to recognize top performers and identify who might need support or training.",

					"**Audit and Action Logs:** Every action in the system — from advancing a queue to editing merchant settings — is logged with a timestamp and user ID. This provides an extra layer of accountability and allows you to investigate anomalies or disputes without second-guessing who did what."
				] },


				{ type: "paragraph", text: "All this data is presented through the merchant web dashboard, accessible securely from any device with internet access. Whether you're in the office or managing operations remotely, your analytics are always up-to-date, reflecting the true state of your service in real time." },

				{ type: "paragraph", text: "In future updates, QueueHub plans to support exportable reports, benchmark comparisons, and AI-powered suggestions, like \“Queue A is consistently overloaded on Fridays at 6 PM — consider opening Queue B during that time.\”" },

				{ type: "paragraph", text: "But even today, with out-of-the-box tools, QueueHub turns every queue entry into an opportunity to learn. You're not just moving people through a line; you're building a continuous feedback loop that makes your business smarter over time." },

				{ type: "paragraph", text: "In short, Analytics and Feedback Integration helps you close the gap between action and improvement. It's your lens into the customer experience — and your lever for meaningful change." }
			],
		},
		"mobile-and-cross-device-access": {
		title: "Mobile & Cross-Device Access",
		content: [
			{
			type: "paragraph",
			text: "**Serve customers anytime, anywhere — and manage operations from wherever business takes you. QueueHub is built for mobility, flexibility, and real-time responsiveness across devices.**"
			},
			{
			type: "paragraph",
			text: "But let's be clear: QueueHub is built on a **role-aware system**, and each experience is purposefully tailored. While customers use the mobile app to browse merchants, join queues, and receive notifications, all merchant and admin actions take place through our web-based dashboard, optimized for both desktop and mobile browsers. This ensures clarity, control, and performance where it matters most."
			},
			{
			type: "subtitle",
			text: "Key benefits of this flexible, cross-device architecture:"
			},
			{
			type: "list",
			items: [
				"**Customer-Facing Mobile App (iOS & Android):** Customers can search for nearby businesses, check queue status in real time, and join a queue with a single tap. No calls, no guesswork. The app supports push notifications, estimated wait times, queue number updates, and even real-time reminders — all designed to streamline customer flow before they even reach your premises.",
				
				"**Merchant & Admin Web Dashboard:** Every merchant-facing action — managing queues, reviewing analytics, responding to feedback, editing business info — happens through the web interface. It's responsive, intuitive, and secure. Whether you're on a 24” desktop in the office or a tablet during off-hours, the interface adapts to fit your screen and workflow.",

				"**Access from Any Device, Simultaneously:** You and your team aren't tied to one terminal. Want your front desk to handle queues, while management reviews analytics remotely? No problem. QueueHub supports simultaneous logins across multiple devices and user roles, without compromising speed or security.",

				"**Optimized for Touch & Mobile Browsers:** The merchant dashboard was designed with real-world use in mind. Whether you're using Safari on an iPad or Chrome on your phone, controls like advancing queue entries, replying to feedback, or toggling queue status are touch-friendly and snappy — perfect for busy hands in fast-paced environments.",

				"**Real-Time Updates Without Refreshing:** Thanks to Socket.IO integration, all queue data is synced across devices instantly. If one staff member updates a queue, another sees it live — whether they're on mobile, desktop, or tablet. This means fewer errors, less miscommunication, and a smoother customer experience.",

				"**No App Install Required for Staff:** Your staff doesn't need to download a separate app or go through device provisioning. As long as they have a browser and credentials, they're in. This minimizes training and onboarding friction, especially for part-time or temporary staff."
			]
			},
			{
			type: "paragraph",
			text: "**QueueHub's design philosophy is simple: separate the tools based on purpose and audience, but unify the experience through speed and accessibility.** Customers get the simplicity of a native app; merchants get the power of a full-featured web platform."
			},
			{
			type: "paragraph",
			text: "And because we understand that real-world business doesn't always happen behind a desk, we've ensured that every mission-critical merchant function works smoothly on the go. That means no more waiting until you're back at the office to respond to a queue surge or customer complaint."
			},
			{
			type: "paragraph", text: "**In short, QueueHub gives you the freedom to run your business your way — no matter what screen you're on.**"
			}
		]
		},
		"2fa-and-secure-login": {
			title: "2FA & Secure Login",
			content: [
				{
				type: "paragraph", text: "**Security isn't optional — it's foundational.** QueueHub protects your business, your customers, and your team with enterprise-grade security measures, starting with secure login and two-factor authentication (2FA)."
				},
				
				{ type: "paragraph", text: "Digital queues are real-time, sensitive, and role-driven. That means the stakes are high: unauthorized access could disrupt customer flow, expose private data, or let someone impersonate staff. We've built QueueHub with proactive security mechanisms that scale with your business — without slowing you down." },
				{ type: "subtitle", text: "Here's how we keep your operations safe and seamless:" },

				{ type: "list", items: [
					"**Two-Factor Authentication (2FA):** All merchants and admins are required to enable 2FA. During login, users must confirm their identity using a second factor — typically a one-time code via an authenticator app or email. This drastically reduces the risk of account hijacking, especially in shared or high-turnover environments.",
					
					"**Role-Specific Access Control:** Through our robust user-merchant-role architecture, QueueHub ensures that every user can only access what they're authorized to. Whether it's an owner with full permissions, a manager with queue oversight, or a frontline staffer with limited scope, access is finely tuned by role — and fully auditable.",
					
					"**Secure OAuth Login with Trusted Providers:** We support OAuth authentication (e.g., Google, Microsoft) to allow staff to log in using credentials they already manage securely. This reduces password reuse, minimizes credential fatigue, and integrates cleanly with enterprise identity management systems.",
					
					"**Automatic Session Timeout & Device Tracking:** To prevent unauthorized lingering sessions, QueueHub automatically times out idle sessions. Admins can also monitor active devices per account and revoke access remotely — a vital feature if a device is lost, compromised, or if staff turnover occurs.",
					
					"**Encrypted Communication & Storage:** All data transmitted between the browser, backend, and mobile app is encrypted via HTTPS. Sensitive information (like login credentials, personal data, and logs) is stored securely using industry best practices. No shortcuts.",
					
					"**Audit Logging & Alerts for Suspicious Activity:** Admins can review a full audit trail of logins, role changes, and critical actions (like queue deletions or system setting updates). This transparency helps detect unusual patterns and provides accountability across your organization."
				]
				},
				{
				type: "paragraph", text: "**At QueueHub, security isn't a checkbox — it's part of the platform's DNA.** From login to logout, every interaction is authenticated, verified, and monitored. And because we know you're busy running a business, we've made it frictionless: strong security with minimal hassle."
				},
				{
				type: "paragraph", text: "With 2FA and intelligent access control in place, you can confidently delegate queue management, grant access to new staff, or scale across multiple locations — knowing that your system is locked down where it counts."
			}
		]
		}

	};

	return (
		<div className="p-8 font-regular-eng max-w-4xl lg:ml-[70px]">
			<h1 className="text-2xl font-bold mb-4 text-primary">{featureContent[slug].title}</h1>

			{featureContent[slug].content.map((item, index) => {

				// Subtitle
				if (item.type === "subtitle") {
					return <h2 key={index} className="text-lg mb-4 font-bold text-text-main">{item.text}</h2>;
				}
				
				// List
				if (item.type === "list") {
					return (
						<ul key={index} className="list-disc pl-10 space-y-4 my-4 text-text-main">
							{item.items.map((li, i) => <li key={i}>{renderWithBold(li)}</li>)}
						</ul>
					);
				}

				// Default: paragraph with inline bold
				return <p key={index} className="mb-4 text-text-main">{renderWithBold(item.text)}</p>;
			})}
		</div>
	);
};

export default FeaturePage;