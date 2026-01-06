import Link from 'next/link';

export default function PlayerDashboard() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Player Dashboard
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Welcome to your volleyball practice portal. Here you can view available practices for your team and provide feedback after participating.
          </p>
          
          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 max-w-2xl mx-auto">
            {/* Practices Card */}
            <Link
              href="/player/practices"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 group"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">My Practices</h3>
                <p className="text-sm text-gray-600">View available practices and provide feedback</p>
              </div>
            </Link>

            {/* Info Card */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How It Works</h3>
                <p className="text-sm text-gray-600">
                  After each practice, you&apos;ll answer four questions to help your coach understand your experience and improve future sessions.
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-12 bg-gray-50 rounded-lg p-6 max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">View Practices</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Check the practices page to see upcoming and completed practice sessions for your team.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Attend Practice</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Participate in your scheduled volleyball practice session with your team.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Provide Feedback</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Answer four questions about your practice experience to help improve future sessions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}