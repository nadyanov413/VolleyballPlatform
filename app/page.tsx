import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Volleyball Club Management
          </h1>
          <p className="text-gray-600">
            Choose your role to access the system
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/coach"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center group"
          >
            <div className="text-center">
              <div className="text-lg mb-1">👨‍🏫 Coach Access</div>
              <div className="text-sm opacity-90">
                Manage teams, players, and practices
              </div>
            </div>
          </Link>

          <Link
            href="/player"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center group"
          >
            <div className="text-center">
              <div className="text-lg mb-1">🏐 Player Access</div>
              <div className="text-sm opacity-90">
                View practices and submit responses
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Select your role to get started with the volleyball club management system</p>
        </div>
      </div>
    </div>
  );
}
