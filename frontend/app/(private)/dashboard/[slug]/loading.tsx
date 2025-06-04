export default function Loading() {
  return (
    // <div className="p-8 text-center text-lg text-gray-500">Loading merchant dashboard...</div>

    <div className="flex flex-col items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-lg text-gray-500">Loading merchant dashboard...</p>
    </div>
  );
} 