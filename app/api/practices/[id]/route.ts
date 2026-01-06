import { NextRequest, NextResponse } from 'next/server';
import { dataAccess } from '@/lib/data-access';
import { Practice, ApiResponse } from '@/lib/types';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/practices/[id] - Get practice by ID
 * Requirements: 4.3 - Make practice available for player selection
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Practice>>> {
  try {
    const { id } = params;
    
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Practice ID is required'
        },
        { status: 400 }
      );
    }

    const practice = await dataAccess.getPracticeById(id.trim());
    
    if (!practice) {
      return NextResponse.json(
        {
          success: false,
          error: 'Practice not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: practice
    });
  } catch (error) {
    console.error('Error fetching practice:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch practice'
      },
      { status: 500 }
    );
  }
}