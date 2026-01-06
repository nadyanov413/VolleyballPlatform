import { NextRequest, NextResponse } from 'next/server';
import { dataAccess } from '@/lib/data-access';
import { Player, CreatePlayerRequest, ApiResponse } from '@/lib/types';
import { randomUUID } from 'crypto';

/**
 * GET /api/players - List players with optional team filtering
 * Requirements: 3.1 - Create player record associated with team
 * Requirements: 3.3 - Make players eligible to participate in team practices
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Player[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    
    let players: Player[];
    
    if (teamId) {
      // Filter players by team ID
      players = await dataAccess.getPlayersByTeam(teamId);
    } else {
      // Get all players
      players = await dataAccess.getPlayers();
    }
    
    return NextResponse.json({
      success: true,
      data: players
    });
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch players'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/players - Register new player
 * Requirements: 3.1 - Create player record associated with team
 * Requirements: 3.2 - Prevent duplicate player registrations within same team
 * Requirements: 3.3 - Make players eligible to participate in team practices
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Player>>> {
  try {
    const body: CreatePlayerRequest = await request.json();
    
    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Player name is required and must be a non-empty string'
        },
        { status: 400 }
      );
    }

    if (!body.email || typeof body.email !== 'string' || body.email.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Player email is required and must be a non-empty string'
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

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email.trim())) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format'
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

    // Check for duplicate registration (same email within the same team)
    const existingPlayers = await dataAccess.getPlayersByTeam(body.teamId.trim());
    const duplicatePlayer = existingPlayers.find(player => 
      player.email.toLowerCase() === body.email.trim().toLowerCase()
    );
    
    if (duplicatePlayer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Player with this email is already registered to this team'
        },
        { status: 409 }
      );
    }

    // Create new player with unique ID and timestamp
    const newPlayer: Player = {
      id: randomUUID(),
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      teamId: body.teamId.trim(),
      registeredAt: new Date().toISOString()
    };

    // Store the player
    const createdPlayer = await dataAccess.createPlayer(newPlayer);
    
    return NextResponse.json({
      success: true,
      data: createdPlayer
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating player:', error);
    
    // Handle specific error cases
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Player with this ID already exists'
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to register player'
      },
      { status: 500 }
    );
  }
}