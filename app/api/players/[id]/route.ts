import { NextRequest, NextResponse } from 'next/server';
import { dataAccess } from '@/lib/data-access';
import { Player, ApiResponse } from '@/lib/types';

/**
 * GET /api/players/[id] - Get player details by ID
 * Requirements: 3.1 - Retrieve player record information
 * Requirements: 3.3 - Access player information for team practices
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<Player>>> {
  try {
    const { id } = params;
    
    // Validate ID parameter
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Player ID is required'
        },
        { status: 400 }
      );
    }

    // Find the player by ID
    const player = await dataAccess.getPlayerById(id);
    
    if (!player) {
      return NextResponse.json(
        {
          success: false,
          error: 'Player not found'
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: player
    });
  } catch (error) {
    console.error('Error fetching player:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch player'
      },
      { status: 500 }
    );
  }
}