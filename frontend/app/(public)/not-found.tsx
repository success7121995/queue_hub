import { notFound } from 'next/navigation';

export default function NotFoundPage() {
    return (
        <div className="text-center p-10 font-regular-eng">
          <h1 className="text-2xl font-bold text-orange-600">Page Not Found</h1>
          <p>This public page does not exist.</p>
        </div>
    );
}
