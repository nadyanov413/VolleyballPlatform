'use client';

import { useState, useEffect } from 'react';
import { Practice, Team, PracticeSummary, ApiResponse } from '@/lib/types';

export default function SummariesPage() {
  const [practices, setPractices] = useState<Practice[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [summaries, setSummaries] = useState<{ [practiceId: string]: PracticeSummary }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('');
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      await fetchTeams();
      await fetchPractices();
    };
    fetchData();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      const data: ApiResponse<Team[]> = await response.json();
      
      if (data.success && data.data) {
        setTeams(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    }
  };

  const fetchPractices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/practices');
      const data: ApiResponse<Practice[]> = await response.json();
      
      if (data.success && data.data) {
        setPractices(data.data);
        // Fetch summaries for all practices
        await fetchAllSummaries(data.data);
      } else {
        setError(data.error || 'Failed to fetch practices');
      }
    } catch (err) {
      console.error('Failed to fetch practices:', err);
      setError('Failed to fetch practices');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSummaries = async (practiceList: Practice[]) => {
    const summaryPromises = practiceList.map(async (practice) => {
      try {
        const response = await fetch(`/api/practices/${practice.id}/summary`);
        const data: ApiResponse<PracticeSummary> = await response.json();
        
        if (data.success && data.data) {
          return { practiceId: practice.id, summary: data.data };
        }
      } catch (err) {
        console.error(`Failed to fetch summary for practice ${practice.id}:`, err);
      }
      return null;
    });

    const results = await Promise.all(summaryPromises);
    const summaryMap: { [practiceId: string]: PracticeSummary } = {};
    
    results.forEach((result) => {
      if (result) {
        summaryMap[result.practiceId] = result.summary;
      }
    });

    setSummaries(summaryMap);
  };

  const handleGenerateSummary = async (practiceId: string) => {
    try {
      setGeneratingFor(practiceId);
      setError(null);

      const response = await fetch(`/api/practices/${practiceId}/summary`, {
        method: 'POST',
      });

      const data: ApiResponse<PracticeSummary> = await response.json();
      
      if (data.success && data.data) {
        setSummaries(prev => ({
          ...prev,
          [practiceId]: data.data!
        }));
      } else {
        setError(data.error || 'Failed to generate summary');
      }
    } catch (err) {
      console.error('Failed to generate summary:', err);
      setError('Failed to generate summary');
    } finally {
      setGeneratingFor(null);
    }
  };

  // Filter practices by selected team
  const filteredPractices = selectedTeamFilter 
    ? practices.filter(practice => practice.teamId === selectedTeamFilter)
    : practices;

  // Get team name by ID
  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  // Sort practices by date and time (most recent first)
  const sortedPractices = [...filteredPractices].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Practice Summaries</h1>
          <p className="mt-2 text-sm text-gray-700">
            View AI-generated summaries of player responses from practice sessions.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                type="button"
                onClick={() => setError(null)}
                className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team Filter */}
      <div className="mt-6">
        <label htmlFor="teamFilter" className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Team
        </label>
        <select
          id="teamFilter"
          value={selectedTeamFilter}
          onChange={(e) => setSelectedTeamFilter(e.target.value)}
          className="block w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="">All Teams</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      {/* Practices and Summaries List */}
      <div className="mt-8">
        {sortedPractices.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {selectedTeamFilter ? 'No practices for selected team' : 'No practices found'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedTeamFilter 
                ? 'Try selecting a different team.' 
                : 'Create some practices first to generate summaries.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedPractices.map((practice) => {
              const summary = summaries[practice.id];
              const isGenerating = generatingFor === practice.id;
              
              return (
                <div key={practice.id} className="bg-white shadow rounded-lg overflow-hidden">
                  {/* Practice Header */}
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{practice.name}</h3>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span>{new Date(practice.date).toLocaleDateString()} at {practice.time}</span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getTeamName(practice.teamId)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {summary && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Summary Available
                          </span>
                        )}
                        <button
                          onClick={() => handleGenerateSummary(practice.id)}
                          disabled={isGenerating}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isGenerating ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Generating...
                            </>
                          ) : (
                            summary ? 'Regenerate Summary' : 'Generate Summary'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Summary Content */}
                  <div className="px-6 py-4">
                    {summary ? (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-900">AI-Generated Summary</h4>
                          <span className="text-xs text-gray-500">
                            Generated: {new Date(summary.generatedAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="prose prose-sm max-w-none">
                          <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
                            {summary.summary}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">
                          No summary available yet. Click &quot;Generate Summary&quot; to create one.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}