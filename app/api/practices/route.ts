import { NextRequest, NextResponse } from 'next/server';
import { dataAccess } from '@/lib/data-access';
import { Practice, CreatePracticeRequest, ApiResponse } from '@/lib/types';
import { randomUUID } from 'crypto';

/**
 * GET /api/practices - List practices with optional team filtering
 * Requirements: 4.1 - Associate practice with specific team
 * Requirements: 4.3 - Make practice available for player selection
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Practice[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    
    let practices: Practice[];
    
    if (teamId) {
      // Filter practices by team ID
      practices = await dataAccess.getPracticesByTeam(teamId);
    } else {
      // Get all practices
      practices = await dataAccess.getPractices();
    }
    
    return NextResponse.json({
      success: true,
      data: practices
    });
  } catch (error) {
    console.error('Error fetching practices:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch practices'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/practices - Create new practice
 * Requirements: 4.1 - Associate practice with specific team
 * Requirements: 4.2 - Store practice event details including date, time, and team association
 * Requirements: 4.3 - Make practice available for player selection
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Practice>>> {
  try {
    const body: CreatePracticeRequest = await request.json();
    
    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Practice name is required and must be a non-empty string'
        },
        { status: 400 }
      );
    }

    if (!body.teamId || typeof body.teamId !== 'string' || body.teamId.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Team ID is required and must be a non-empty string'
        },
        { status: 400 }
      );
    }

    if (!body.date || typeof body.date !== 'string' || body.date.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Practice date is required and must be a non-empty string'
        },
        { status: 400 }
      );
    }

    if (!body.time || typeof body.time !== 'string' || body.time.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Practice time is required and must be a non-empty string'
        },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.date.trim())) {
      return NextResponse.json(
        {
          success: false,
          error: 'Date must be in YYYY-MM-DD format'
        },
        { status: 400 }
      );
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(body.time.trim())) {
      return NextResponse.json(
        {
          success: false,
          error: 'Time must be in HH:MM format (24-hour)'
        },
        { status: 400 }
      );
    }

    // Verify that the team exists
    const team = await dataAccess.getTeamById(body.teamId.trim());
    if (!team) {
      return NextResponse.json(
        {
          success: false,
          error: 'Team not found'
        },
        { status: 404 }
      );
    }

    // Create new practice with unique ID and timestamp
    const newPractice: Practice = {
      id: randomUUID(),
      teamId: body.teamId.trim(),
      name: body.name.trim(),
      date: body.date.trim(),
      time: body.time.trim(),
      createdAt: new Date().toISOString()
    };

    // Store the practice
    const createdPractice = await dataAccess.createPractice(newPractice);
    
    return NextResponse.json({
      success: true,
      data: createdPractice
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating practice:', error);
    
    // Handle specific error cases
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Practice with this ID already exists'
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create practice'
      },
      { status: 500 }
    );
  }
}