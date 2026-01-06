import { NextResponse } from 'next/server';
import { PracticeQuestion, ApiResponse } from '@/lib/types';
import fs from 'fs/promises';
import path from 'path';

/**
 * GET /api/practice-questions - Get all practice questions
 * Requirements: 5.1 - Store four practice questions in local configuration file
 * Requirements: 5.2 - Use same four questions for all practice events
 * Requirements: 5.3 - Retrieve questions from local storage
 */
export async function GET(): Promise<NextResponse<ApiResponse<PracticeQuestion[]>>> {
  try {
    const questionsPath = path.join(process.cwd(), 'data', 'practice-questions.json');
    const questionsData = await fs.readFile(questionsPath, 'utf-8');
    const questions: PracticeQuestion[] = JSON.parse(questionsData);
    
    // Sort questions by order to ensure consistent display
    const sortedQuestions = questions.sort((a, b) => a.order - b.order);
    
    return NextResponse.json({
      success: true,
      data: sortedQuestions
    });
  } catch (error) {
    console.error('Error fetching practice questions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch practice questions'
      },
      { status: 500 }
    );
  }
}