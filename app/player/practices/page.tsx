'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Practice, Player, Team, PracticeResponse, ApiResponse } from '@/lib/types';

export default function PlayerPracticesPage() {
  const [practices, setPractices] = useState<Practice[]>([]);
  const [player, setPlayer] = useState<Player | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [responses, setResponses] = useState<PracticeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For demo purposes, we'll simulate a logged-in player
  // In a real app, this would come from authentication
  const DEMO_PLAYER_ID = 'demo-player-001';

  useEffect(() => {
    loadPlayerData();
  }, []);

  const loadPlayerData = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get or create a demo player
      const playersResponse = await fetch('/api/players');
      const playersData: ApiResponse<Player[]> = await playersResponse.json();
      
      if (!playersData.success || !playersData.data) {
        throw new Error('Failed to fetch players');
      }

      let demoPlayer = playersData.data.find(p => p.id === DEMO_PLAYER_ID);
      
      // If demo player doesn't exist, we'll use the first available player
      // or show a message to create one
      if (!demoPlayer && playersData.data.length > 0) {
        demoPlayer = playersData.data[0];
      }

      if (!demoPlayer) {
        setError('No players found. Please ask your coach to register you first.');
        setLoading(false);
        return;
      }

      setPlayer(demoPlayer);

      // Get the player's team
      const teamResponse = await fetch(`/api/teams/${demoPlayer.teamId}`);
      const teamData: ApiResponse<Team> = await teamResponse.json();
      
      if (teamData.success && teamData.data) {
        setTeam(teamData.data);
      }

      // Get practices for the player's team
      const practicesResponse = await fetch(`/api/practices?teamId=${demoPlayer.teamId}`);
      const practicesData: ApiResponse<Practice[]> = await practicesResponse.json();
      
      if (practicesData.success && practicesData.data) {
        setPractices(practicesData.data);
      }

      // Get existing responses for this player
      const responsesPromises = practicesData.data?.map(async (practice) => {
        const responseResponse = await fetch(`/api/practices/${practice.id}/responses`);
        const responseData = await responseResponse.json();
        return responseData.success ? responseData.data?.responses || [] : [];
      }) || [];

      const allResponses = await Promise.all(responsesPromises);
      const flatResponses = allResponses.flat().filter(response => 
        response.playerId === demoPlayer.id
      );
      setResponses(flatResponses);

    } catch (err) {
      console.error('Error loading player data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const hasSubmittedResponse = (practiceId: string) => {
    return responses.some(response => response.practiceId === practiceId);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isPastPractice = (dateStr: string, timeStr: string) => {
    const practiceDateTime = new Date(`${dateStr}T${timeStr}`);
    return practiceDateTime < new Date();
  };

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Practices</h1>
        {player && team && (
          <p className="mt-1 text-sm text-gray-600">
            Welcome, {player.name}! Here are the practices for {team.name}.
          </p>
        )}
      </div>

      {practices.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No practices scheduled</h3>
          <p className="mt-1 text-sm text-gray-500">
            Your coach hasn&apos;t scheduled any practices yet. Check back later!
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {practices.map((practice) => {
            const hasResponse = hasSubmittedResponse(practice.id);
            const isPast = isPastPractice(practice.date, practice.time);
            
            return (
              <div
                key={practice.id}
                className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden"
              >
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {practice.name}
                      </h3>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(practice.date)} at {formatTime(practice.time)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {hasResponse && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Completed
                        </span>
                      )}
                      
                      {isPast && !hasResponse && (
                        <Link
                          href={`/player/practices/${practice.id}/respond`}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Provide Feedback
                        </Link>
                      )}
                      
                      {!isPast && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Upcoming
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {isPast && !hasResponse && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            This practice has ended. Please provide your feedback to help improve future sessions.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}