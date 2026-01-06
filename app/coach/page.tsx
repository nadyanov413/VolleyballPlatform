import Link from 'next/link';

export default function CoachDashboard() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Coach Dashboard
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Welcome to the volleyball club management system. Use the navigation above or the quick actions below to manage your teams, players, and practices.
          </p>
          
          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {/* Teams Card */}
            <Link
              href="/coach/teams"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 group"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Teams</h3>
                <p className="text-sm text-gray-600">Create and organize your volleyball teams</p>
              </div>
            </Link>

            {/* Players Card */}
            <Link
              href="/coach/players"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 group"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Players</h3>
                <p className="text-sm text-gray-600">Register players and assign them to teams</p>
              </div>
            </Link>

            {/* Practices Card */}
            <Link
              href="/coach/practices"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 group"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Schedule Practices</h3>
                <p className="text-sm text-gray-600">Create and manage practice sessions</p>
              </div>
            </Link>

            {/* Summaries Card */}
            <Link
              href="/coach/summaries"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 group"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">View Summaries</h3>
                <p className="text-sm text-gray-600">Review AI-generated practice summaries</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}