import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { PracticeResponse, PracticeSummary } from './types';

export class BedrockSummaryService {
  private client: BedrockRuntimeClient;
  private modelId = 'amazon.nova-micro-v1:0'; // Using Nova Micro model

  constructor() {
    // Use default credential chain which includes:
    // 1. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
    // 2. AWS CLI credentials (~/.aws/credentials)
    // 3. IAM roles (if running on EC2)
    // 4. Other AWS credential sources
    this.client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1',
      // Remove explicit credentials to use default credential chain
    });
  }

  async generatePracticeSummary(
    practiceId: string,
    responses: PracticeResponse[]
  ): Promise<PracticeSummary> {
    try {
      if (responses.length === 0) {
        return {
          practiceId,
          summary: 'No responses were submitted for this practice session.',
          generatedAt: new Date().toISOString(),
        };
      }

      // Prepare the prompt with all responses
      const prompt = this.buildSummaryPrompt(responses);

      // Prepare the request payload for Nova model
      const requestBody = {
        messages: [
          {
            role: 'user',
            content: [
              {
                text: prompt,
              },
            ],
          },
        ],
        inferenceConfig: {
          maxTokens: 1000,
          temperature: 0.3,
          topP: 0.9,
        },
      };

      const command = new InvokeModelCommand({
        modelId: this.modelId,
        body: JSON.stringify(requestBody),
        contentType: 'application/json',
        accept: 'application/json',
      });

      const response = await this.client.send(command);
      
      if (!response.body) {
        throw new Error('No response body received from Bedrock');
      }

      // Parse the response
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      const summary = responseBody.output?.message?.content?.[0]?.text || 'Unable to generate summary';

      return {
        practiceId,
        summary: summary.trim(),
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating practice summary:', error);
      
      // Return a fallback summary with error information
      return {
        practiceId,
        summary: `Error generating AI summary: ${error instanceof Error ? error.message : 'Unknown error'}. Manual review of responses may be needed.`,
        generatedAt: new Date().toISOString(),
      };
    }
  }

  private buildSummaryPrompt(responses: PracticeResponse[]): string {
    const prompt = `
You are analyzing volleyball practice feedback from players. Please provide a concise summary of the key themes, insights, and areas for improvement based on the following player responses.

Practice Responses:
${responses.map((response, index) => {
  return `
Player ${index + 1} Responses:
${response.responses.map(r => `- ${r.answer}`).join('\n')}
`;
}).join('\n')}

Please provide a summary that includes:
1. Overall performance themes
2. Common challenges mentioned
3. Skills that players focused on
4. Areas for improvement in future practices
5. Any notable individual insights

Keep the summary concise but informative, focusing on actionable insights for the coach.
`;

    return prompt.trim();
  }

  // Method to test the connection (useful for debugging)
  async testConnection(): Promise<boolean> {
    try {
      // Simple test with minimal request
      const testRequestBody = {
        messages: [
          {
            role: 'user',
            content: [
              {
                text: 'Hello, this is a connection test. Please respond with "Connection successful".',
              },
            ],
          },
        ],
        inferenceConfig: {
          maxTokens: 50,
          temperature: 0.1,
        },
      };

      const command = new InvokeModelCommand({
        modelId: this.modelId,
        body: JSON.stringify(testRequestBody),
        contentType: 'application/json',
        accept: 'application/json',
      });

      const response = await this.client.send(command);
      return !!response.body;
    } catch (error) {
      console.error('Bedrock connection test failed:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const bedrockSummaryService = new BedrockSummaryService();