import { NextRequest, NextResponse } from 'next/server';
import { dataAccess } from '@/lib/data-access';
import { Team, CreateTeamRequest, ApiResponse } from '@/lib/types';
import { randomUUID } from 'crypto';

/**
 * GET /api/teams - List all teams
 * Requirements: 2.2 - Allow coaches to view all teams they have created
 */
export async function GET(): Promise<NextResponse<ApiResponse<Team[]>>> {
  try {
    const teams = await dataAccess.getTeams();
    
    return NextResponse.json({
      success: true,
      data: teams
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch teams'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/teams - Create new team
 * Requirements: 2.1 - Store team information and make it available for player registration
 * Requirements: 2.3 - Assign a unique identifier to the team
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Team>>> {
  try {
    const body: CreateTeamRequest = await request.json();
    
    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Team name is required and must be a non-empty string'
        },
        { status: 400 }
      );
    }

    // Create new team with unique ID and timestamp
    const newTeam: Team = {
      id: randomUUID(),
      name: body.name.trim(),
      createdAt: new Date().toISOString()
    };

    // Store the team
    const createdTeam = await dataAccess.createTeam(newTeam);
    
    return NextResponse.json({
      success: true,
      data: createdTeam
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    
    // Handle specific error cases
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Team with this ID already exists'
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create team'
      },
      { status: 500 }
    );
  }
}