import { NextRequest, NextResponse } from 'next/server';
import { dataAccess } from '@/lib/data-access';
import { PracticeResponse, SubmitResponsesRequest, ApiResponse, PracticeResponsesResponse } from '@/lib/types';
import { randomUUID } from 'crypto';

/**
 * GET /api/practices/[id]/responses - Get all responses for a specific practice
 * Requirements: 9.3 - Store responses associated with practice and player
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<PracticeResponsesResponse>>> {
  try {
    const practiceId = params.id;
    
    // Validate practice ID
    if (!practiceId || typeof practiceId !== 'string' || practiceId.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Practice ID is required'
        },
        { status: 400 }
      );
    }
    
    // Verify that the practice exists
    const practice = await dataAccess.getPracticeById(practiceId);
    if (!practice) {
      return NextResponse.json(
        {
          success: false,
          error: 'Practice not found'
        },
        { status: 404 }
      );
    }
    
    // Get all responses for this practice
    const responses = await dataAccess.getResponsesByPractice(practiceId);
    
    return NextResponse.json({
      success: true,
      data: {
        practice,
        responses
      }
    });
  } catch (error) {
    console.error('Error fetching practice responses:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch practice responses'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/practices/[id]/responses - Submit responses for a specific practice
 * Requirements: 9.3 - Store responses associated with practice and player
 * Requirements: 9.4 - Prevent duplicate submissions from same player for same practice
 * Requirements: 9.5 - Confirm successful submission to player
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<PracticeResponse>>> {
  try {
    const practiceId = params.id;
    const body: SubmitResponsesRequest = await request.json();
    
    // Validate practice ID
    if (!practiceId || typeof practiceId !== 'string' || practiceId.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Practice ID is required'
        },
        { status: 400 }
      );
    }
    
    // Validate required fields in request body
    if (!body.playerId || typeof body.playerId !== 'string' || body.playerId.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Player ID is required and must be a non-empty string'
        },
        { status: 400 }
      );
    }
    
    if (!body.responses || !Array.isArray(body.responses) || body.responses.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Responses array is required and must not be empty'
        },
        { status: 400 }
      );
    }
    
    // Validate each response in the array
    for (const response of body.responses) {
      if (!response.questionId || typeof response.questionId !== 'string' || response.questionId.trim() === '') {
        return NextResponse.json(
          {
            success: false,
            error: 'Each response must have a valid questionId'
          },
          { status: 400 }
        );
      }
      
      if (!response.answer || typeof response.answer !== 'string' || response.answer.trim() === '') {
        return NextResponse.json(
          {
            success: false,
            error: 'Each response must have a non-empty answer'
          },
          { status: 400 }
        );
      }
    }
    
    // Verify that the practice exists
    const practice = await dataAccess.getPracticeById(practiceId);
    if (!practice) {
      return NextResponse.json(
        {
          success: false,
          error: 'Practice not found'
        },
        { status: 404 }
      );
    }
    
    // Verify that the player exists
    const player = await dataAccess.getPlayerById(body.playerId.trim());
    if (!player) {
      return NextResponse.json(
        {
          success: false,
          error: 'Player not found'
        },
        { status: 404 }
      );
    }
    
    // Verify that the player belongs to the same team as the practice
    if (player.teamId !== practice.teamId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Player is not registered for the team associated with this practice'
        },
        { status: 403 }
      );
    }
    
    // Check for duplicate submission (Requirements: 9.4)
    const existingResponse = await dataAccess.getResponseByPlayerAndPractice(
      body.playerId.trim(),
      practiceId
    );
    
    if (existingResponse) {
      return NextResponse.json(
        {
          success: false,
          error: 'Player has already submitted responses for this practice'
        },
        { status: 409 }
      );
    }
    
    // Get practice questions to validate response structure
    const practiceQuestions = await dataAccess.getPracticeQuestions();
    const questionIds = new Set(practiceQuestions.map(q => q.id));
    
    // Validate that all provided question IDs exist
    for (const response of body.responses) {
      if (!questionIds.has(response.questionId)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid question ID: ${response.questionId}`
          },
          { status: 400 }
        );
      }
    }
    
    // Create new practice response
    const newResponse: PracticeResponse = {
      id: randomUUID(),
      practiceId: practiceId,
      playerId: body.playerId.trim(),
      responses: body.responses.map(r => ({
        questionId: r.questionId.trim(),
        answer: r.answer.trim()
      })),
      submittedAt: new Date().toISOString()
    };
    
    // Store the response
    const createdResponse = await dataAccess.createPracticeResponse(newResponse);
    
    return NextResponse.json({
      success: true,
      data: createdResponse
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting practice response:', error);
    
    // Handle specific error cases
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Response with this ID already exists'
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit practice response'
      },
      { status: 500 }
    );
  }
}