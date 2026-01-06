'use client';

import { useState, useEffect } from 'react';
import { Practice, Team, CreatePracticeRequest, ApiResponse } from '@/lib/types';

export default function PracticesPage() {
  const [practices, setPractices] = useState<Practice[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('');
  
  // Form state
  const [newPracticeName, setNewPracticeName] = useState('');
  const [newPracticeDate, setNewPracticeDate] = useState('');
  const [newPracticeTime, setNewPracticeTime] = useState('');
  const [newPracticeTeamId, setNewPracticeTeamId] = useState('');

  // Fetch data on component mount
  useEffect(() => {
    fetchTeams();
    fetchPractices();
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

  const handleCreatePractice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPracticeName.trim() || !newPracticeDate || !newPracticeTime || !newPracticeTeamId) {
      setError('All fields are required');
      return;
    }

    try {
      setCreateLoading(true);
      setError(null);
      
      const createRequest: CreatePracticeRequest = {
        name: newPracticeName.trim(),
        date: newPracticeDate,
        time: newPracticeTime,
        teamId: newPracticeTeamId
      };

      const response = await fetch('/api/practices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createRequest),
      });

      const data: ApiResponse<Practice> = await response.json();
      
      if (data.success && data.data) {
        setPractices([...practices, data.data]);
        setNewPracticeName('');
        setNewPracticeDate('');
        setNewPracticeTime('');
        setNewPracticeTeamId('');
        setShowCreateForm(false);
      } else {
        setError(data.error || 'Failed to create practice');
      }
    } catch (err) {
      console.error('Failed to create practice:', err);
      setError('Failed to create practice');
    } finally {
      setCreateLoading(false);
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
          <h1 className="text-2xl font-semibold text-gray-900">Practices</h1>
          <p className="mt-2 text-sm text-gray-700">
            Schedule and manage practice sessions for your teams.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create Practice
          </button>
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

      {/* Create Practice Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create Practice Session</h3>
              <form onSubmit={handleCreatePractice}>
                <div className="mb-4">
                  <label htmlFor="practiceName" className="block text-sm font-medium text-gray-700 mb-2">
                    Practice Name
                  </label>
                  <input
                    type="text"
                    id="practiceName"
                    value={newPracticeName}
                    onChange={(e) => setNewPracticeName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Morning Practice, Skills Training"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="practiceTeam" className="block text-sm font-medium text-gray-700 mb-2">
                    Team
                  </label>
                  <select
                    id="practiceTeam"
                    value={newPracticeTeamId}
                    onChange={(e) => setNewPracticeTeamId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a team</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="practiceDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Date (past or future dates allowed)
                  </label>
                  <input
                    type="date"
                    id="practiceDate"
                    value={newPracticeDate}
                    onChange={(e) => setNewPracticeDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="practiceTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    id="practiceTime"
                    value={newPracticeTime}
                    onChange={(e) => setNewPracticeTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewPracticeName('');
                      setNewPracticeDate('');
                      setNewPracticeTime('');
                      setNewPracticeTeamId('');
                      setError(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createLoading ? 'Scheduling...' : 'Schedule Practice'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Practices List */}
      <div className="mt-8">
        {sortedPractices.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {selectedTeamFilter ? 'No practices for selected team' : 'No practices scheduled'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedTeamFilter 
                ? 'Try selecting a different team or schedule a new practice.' 
                : 'Get started by scheduling your first practice session.'
              }
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Schedule Practice
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {sortedPractices.map((practice) => {
                const practiceDateTime = new Date(`${practice.date}T${practice.time}`);
                const isUpcoming = practiceDateTime > new Date();
                
                return (
                  <li key={practice.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              isUpcoming ? 'bg-purple-100' : 'bg-gray-100'
                            }`}>
                              <svg className={`h-6 w-6 ${
                                isUpcoming ? 'text-purple-600' : 'text-gray-600'
                              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{practice.name}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(practice.date).toLocaleDateString()} at {practice.time}
                            </div>
                            <div className="text-sm text-gray-500">
                              Created: {new Date(practice.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getTeamName(practice.teamId)}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isUpcoming 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {isUpcoming ? 'Upcoming' : 'Completed'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}