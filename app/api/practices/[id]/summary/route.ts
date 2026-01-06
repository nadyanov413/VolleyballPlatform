import { NextRequest, NextResponse } from 'next/server';
import { dataAccess } from '@/lib/data-access';
import { bedrockSummaryService } from '@/lib/bedrock-client';
import { ApiResponse, PracticeSummaryResponse } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const practiceId = params.id;

    // Validate that the practice exists
    const practice = await dataAccess.getPracticeById(practiceId);
    if (!practice) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Practice not found',
        },
        { status: 404 }
      );
    }

    // Check if a summary already exists
    const existingSummary = await dataAccess.getSummaryByPractice(practiceId);
    
    if (existingSummary) {
      // Return existing summary
      return NextResponse.json<ApiResponse<PracticeSummaryResponse>>(
        {
          success: true,
          data: existingSummary,
        },
        { status: 200 }
      );
    }

    // No existing summary, generate a new one
    const responses = await dataAccess.getResponsesByPractice(practiceId);
    
    // Generate summary using Bedrock
    const newSummary = await bedrockSummaryService.generatePracticeSummary(
      practiceId,
      responses
    );

    // Store the generated summary
    await dataAccess.createPracticeSummary(newSummary);

    return NextResponse.json<ApiResponse<PracticeSummaryResponse>>(
      {
        success: true,
        data: newSummary,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/practices/[id]/summary:', error);
    
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const practiceId = params.id;

    // Validate that the practice exists
    const practice = await dataAccess.getPracticeById(practiceId);
    if (!practice) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Practice not found',
        },
        { status: 404 }
      );
    }

    // Get all responses for this practice
    const responses = await dataAccess.getResponsesByPractice(practiceId);
    
    // Generate new summary using Bedrock
    const newSummary = await bedrockSummaryService.generatePracticeSummary(
      practiceId,
      responses
    );

    // Check if summary already exists and update it, or create new one
    const existingSummary = await dataAccess.getSummaryByPractice(practiceId);
    
    let savedSummary;
    if (existingSummary) {
      // Update existing summary
      savedSummary = await dataAccess.updatePracticeSummary(practiceId, {
        summary: newSummary.summary,
        generatedAt: newSummary.generatedAt,
      });
    } else {
      // Create new summary
      savedSummary = await dataAccess.createPracticeSummary(newSummary);
    }

    return NextResponse.json<ApiResponse<PracticeSummaryResponse>>(
      {
        success: true,
        data: savedSummary,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/practices/[id]/summary:', error);
    
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}