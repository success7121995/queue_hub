"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiService = void 0;
const generative_ai_1 = require("@google/generative-ai");
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
exports.geminiService = {
    async determineTicketPriority(subject, description) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const prompt = `
                You are a support ticket priority analyzer for QueueHub — a real-time queue management system used by both customers and merchants. Based on the ticket's subject and description, determine its priority level.
                
                Priority levels:
                - URGENT: Severe customer-facing issues (e.g., queue cannot be joined, app crash on startup), billing errors affecting live transactions, or major system outages.
                - HIGH: Critical merchant issues, security concerns, or failures that impact many users or block normal operations (e.g., dashboard not loading, check-in feature broken).
                - MEDIUM: Standard support requests, UX bugs, performance degradation, or feature malfunctions that do not stop usage entirely.
                - LOW: Non-urgent inquiries, minor bugs, feature suggestions, or cosmetic issues.
                
                Ticket Context:
                - The platform involves mobile app users (customers), merchant dashboard users, real-time notifications, and billing systems.
                - Merchants depend on QueueHub for live queue management, while customers use the app to join and monitor queues.
                - Queuing issues, dashboard functionality, app interface bugs, and billing problems may significantly affect user experience or business operations.
                
                Ticket Subject: "${subject}"
                Ticket Description: "${description}"
                
                Analyze the urgency and business impact of the issue. Return ONLY one of these exact words: URGENT, HIGH, MEDIUM, or LOW.
                
                Factors to consider:
                - Severity of the issue
                - Number of affected users (customers or merchants)
                - Direct impact on queuing or transactions
                - Time sensitivity (e.g., real-time events)
                - Security or data integrity concerns
            `;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const priorityText = response.text().trim().toUpperCase();
            if (!['URGENT', 'HIGH', 'MEDIUM', 'LOW'].includes(priorityText)) {
                console.warn(`Gemini returned invalid priority: ${priorityText}, defaulting to MEDIUM`);
                return 'MEDIUM';
            }
            return priorityText;
        }
        catch (error) {
            console.error('Error calling Gemini API for ticket priority:', error);
            return 'MEDIUM';
        }
    }
};
