import { NextRequest, NextResponse } from 'next/server';
import { dataAccess } from '@/lib/data-access';
import { Team, ApiResponse } from '@/lib/types';

/**
 * GET /api/teams/[id] - Get team details by ID
 * Requirements: 2.2 - Allow coaches to view team information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<Team>>> {
  try {
    const { id } = params;
    
    // Validate ID parameter
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Team ID is required'
        },
        { status: 400 }
      );
    }

    // Find the team by ID
    const team = await dataAccess.getTeamById(id);
    
    if (!team) {
      return NextResponse.json(
        {
          success: false,
          error: 'Team not found'
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch team'
      },
      { status: 500 }
    );
  }
}