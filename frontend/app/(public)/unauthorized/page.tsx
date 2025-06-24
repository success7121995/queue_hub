"use client";

import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

const UnauthorizedPage = () => {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
				<div className="mb-6">
					<div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
						<Shield className="w-8 h-8 text-red-600" />
					</div>
					<h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
					<p className="text-gray-600 mb-6">
						You don't have permission to access this page. Please contact your administrator if you believe this is an error.
					</p>
				</div>
				
				<div className="space-y-4">
					<Link
						href="/login"
						className="inline-flex items-center justify-center w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
					>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Login
					</Link>
					
					<Link
						href="/"
						className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
					>
						Go to Homepage
					</Link>
				</div>
			</div>
		</div>
	);
};

export default UnauthorizedPage; 