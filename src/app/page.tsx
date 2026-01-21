export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          KDP Coloring Pages AI
        </h1>
        <p className="text-gray-600 mb-8">
          Generate Amazon KDP-compliant coloring pages with AI
        </p>
        <a
          href="/results"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
        >
          View Jobs
        </a>
      </div>
    </div>
  );
}
