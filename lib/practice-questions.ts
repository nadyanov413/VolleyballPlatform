import { PracticeQuestion } from './types';
import { dataAccess } from './data-access';

/**
 * Load practice questions from the configuration file
 */
export async function loadPracticeQuestions(): Promise<PracticeQuestion[]> {
  try {
    const questions = await dataAccess.getPracticeQuestions();
    
    // Ensure questions are sorted by order
    return questions.sort((a, b) => a.order - b.order);
  } catch (error) {
    throw new Error(`Failed to load practice questions: ${(error as Error).message}`);
  }
}

/**
 * Get a specific practice question by ID
 */
export async function getPracticeQuestionById(id: string): Promise<PracticeQuestion | null> {
  try {
    const questions = await loadPracticeQuestions();
    return questions.find(q => q.id === id) || null;
  } catch (error) {
    throw new Error(`Failed to get practice question by ID: ${(error as Error).message}`);
  }
}

/**
 * Validate that all required practice questions exist
 */
export async function validatePracticeQuestions(): Promise<boolean> {
  try {
    const questions = await loadPracticeQuestions();
    
    // Check that we have exactly 4 questions
    if (questions.length !== 4) {
      return false;
    }
    
    // Check that questions have orders 1, 2, 3, 4
    const expectedOrders = [1, 2, 3, 4];
    const actualOrders = questions.map(q => q.order).sort();
    
    return JSON.stringify(expectedOrders) === JSON.stringify(actualOrders);
  } catch {
    return false;
  }
}

/**
 * Get the default practice questions for any practice
 */
export async function getDefaultPracticeQuestions(): Promise<PracticeQuestion[]> {
  return loadPracticeQuestions();
}