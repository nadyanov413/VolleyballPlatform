'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Practice, Player, PracticeQuestion, ApiResponse, SubmitResponsesRequest } from '@/lib/types';

interface PracticeResponsePageProps {
  params: {
    id: string;
  };
}

export default function PracticeResponsePage({ params }: PracticeResponsePageProps) {
  const router = useRouter();
  const [practice, setPractice] = useState<Practice | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [responses, setResponses] = useState<{ [questionId: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // For demo purposes, we'll simulate a logged-in player
  const DEMO_PLAYER_ID = 'demo-player-001';

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get practice details
        const practiceResponse = await fetch(`/api/practices/${params.id}`);
        const practiceData: ApiResponse<Practice> = await practiceResponse.json();
        
        if (!practiceData.success || !practiceData.data) {
          throw new Error('Practice not found');
        }

        setPractice(practiceData.data);

        // Get or find demo player
        const playersResponse = await fetch('/api/players');
        const playersData: ApiResponse<Player[]> = await playersResponse.json();
        
        if (!playersData.success || !playersData.data) {
          throw new Error('Failed to fetch players');
        }

        let demoPlayer = playersData.data.find(p => p.id === DEMO_PLAYER_ID);
        
        // If demo player doesn't exist, use the first player from the practice's team
        if (!demoPlayer && practiceData.data) {
          demoPlayer = playersData.data.find(p => p.teamId === practiceData.data!.teamId);
        }

        if (!demoPlayer) {
          throw new Error('No player found for this team');
        }

        // Verify player belongs to the practice's team (access control)
        if (practiceData.data && demoPlayer.teamId !== practiceData.data.teamId) {
          throw new Error('You do not have access to this practice');
        }

        setPlayer(demoPlayer);

        // Check if player has already submitted responses
        const existingResponsesResponse = await fetch(`/api/practices/${params.id}/responses`);
        const existingResponsesData = await existingResponsesResponse.json();
        
        if (existingResponsesData.success && existingResponsesData.data?.responses) {
          const playerResponse = existingResponsesData.data.responses.find(
            (response: { playerId: string }) => response.playerId === demoPlayer.id
          );
          
          if (playerResponse) {
            setSubmitted(true);
            setLoading(false);
            return;
          }
        }

        // Load practice questions
        const questionsResponse = await fetch('/api/practice-questions');
        const questionsData: ApiResponse<PracticeQuestion[]> = await questionsResponse.json();

        if (questionsData.success && questionsData.data) {
          const sortedQuestions = questionsData.data.sort((a, b) => a.order - b.order);
          setQuestions(sortedQuestions);
          
          // Initialize empty responses
          const initialResponses: { [questionId: string]: string } = {};
          sortedQuestions.forEach(question => {
            initialResponses[question.id] = '';
          });
          setResponses(initialResponses);
        } else {
          console.error('Failed to load practice questions:', questionsData);
          throw new Error(questionsData.error || 'Failed to load practice questions');
        }

      } catch (err) {
        console.error('Error loading practice data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load practice data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.id]);

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!player || !practice) {
      setError('Missing player or practice information');
      return;
    }

    // Validate that all questions have responses
    const emptyResponses = questions.filter(question => 
      !responses[question.id] || responses[question.id].trim() === ''
    );

    if (emptyResponses.length > 0) {
      setError('Please answer all questions before submitting');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const submitData: SubmitResponsesRequest = {
        practiceId: practice.id,
        playerId: player.id,
        responses: questions.map(question => ({
          questionId: question.id,
          answer: responses[question.id].trim()
        }))
      };

      const response = await fetch(`/api/practices/${practice.id}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit responses');
      }

      setSubmitted(true);
      
      // Redirect to practices page after a short delay
      setTimeout(() => {
        router.push('/player/practices');
      }, 3000);

    } catch (err) {
      console.error('Error submitting responses:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit responses');
    } finally {
      setSubmitting(false);
    }
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
              <div className="mt-4">
                <button
                  onClick={() => router.push('/player/practices')}
                  className="text-sm bg-red-100 text-red-800 px-3 py-2 rounded-md hover:bg-red-200"
                >
                  Back to Practices
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="max-w-2xl mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-lg font-medium text-green-900 mb-2">
              Thank you for your feedback!
            </h2>
            <p className="text-sm text-green-700 mb-4">
              Your responses have been submitted successfully. Your coach will use this feedback to improve future practice sessions.
            </p>
            <p className="text-xs text-green-600">
              Redirecting you back to practices in a few seconds...
            </p>
            <div className="mt-4">
              <button
                onClick={() => router.push('/player/practices')}
                className="text-sm bg-green-100 text-green-800 px-4 py-2 rounded-md hover:bg-green-200"
              >
                Back to Practices
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/player/practices')}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Practices
          </button>
          
          {practice && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Practice Feedback: {practice.name}
              </h1>
              <p className="text-sm text-gray-600">
                {formatDate(practice.date)} at {formatTime(practice.time)}
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Practice Feedback</h3>
              <p className="mt-1 text-sm text-blue-700">
                Please answer all four questions about your practice experience. Your feedback helps your coach understand what&apos;s working well and what can be improved.
              </p>
            </div>
          </div>
        </div>

        {/* Response Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {questions.map((question, index) => (
            <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <label className="block">
                <div className="flex items-start mb-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 font-semibold text-sm">{index + 1}</span>
                  </span>
                  <h3 className="text-lg font-medium text-gray-900 leading-tight">
                    {question.question}
                  </h3>
                </div>
                <textarea
                  value={responses[question.id] || ''}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Please provide your detailed response..."
                  required
                />
              </label>
            </div>
          ))}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/player/practices')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Feedback'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}