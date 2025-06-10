import Link from "next/link";

export default function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center h-screen font-regular-eng">
			<h1 className="text-4xl font-bold text-primary mb-4">404 - Page Not Found</h1>
			<p className="text-base text-text-main mb-3">The page you are looking for does not exist.</p>
			<Link href="/" className="bg-primary text-text-light px-4 py-2 rounded-md hover:bg-primary-hover font-semibold">Go back to the home page</Link>
		</div>
	);
}