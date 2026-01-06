import { promises as fs } from 'fs';
import path from 'path';
import { 
  Team, 
  Player, 
  Practice, 
  PracticeQuestion, 
  PracticeResponse, 
  PracticeSummary 
} from './types';

export class DataAccess {
  private dataDir: string;

  constructor(dataDir: string = './data') {
    this.dataDir = dataDir;
  }

  /**
   * Read data from a JSON file
   */
  async readData<T>(filename: string): Promise<T[]> {
    try {
      const filePath = path.join(this.dataDir, filename);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(fileContent) as T[];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // File doesn't exist, return empty array
        return [];
      }
      throw new Error(`Failed to read data from ${filename}: ${(error as Error).message}`);
    }
  }

  /**
   * Write data to a JSON file
   */
  async writeData<T>(filename: string, data: T[]): Promise<void> {
    try {
      const filePath = path.join(this.dataDir, filename);
      
      // Ensure directory exists
      await fs.mkdir(this.dataDir, { recursive: true });
      
      // Write data with proper formatting
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      throw new Error(`Failed to write data to ${filename}: ${(error as Error).message}`);
    }
  }

  /**
   * Find an item by ID
   */
  async findById<T extends { id: string }>(filename: string, id: string): Promise<T | null> {
    try {
      const data = await this.readData<T>(filename);
      return data.find(item => item.id === id) || null;
    } catch (error) {
      throw new Error(`Failed to find item by ID in ${filename}: ${(error as Error).message}`);
    }
  }

  /**
   * Create a new item
   */
  async create<T extends { id: string }>(filename: string, item: T): Promise<T> {
    try {
      const data = await this.readData<T>(filename);
      
      // Check if item with same ID already exists
      if (data.some(existingItem => existingItem.id === item.id)) {
        throw new Error(`Item with ID ${item.id} already exists`);
      }
      
      data.push(item);
      await this.writeData(filename, data);
      return item;
    } catch (error) {
      throw new Error(`Failed to create item in ${filename}: ${(error as Error).message}`);
    }
  }

  /**
   * Update an existing item
   */
  async update<T extends { id: string }>(filename: string, id: string, updates: Partial<T>): Promise<T> {
    try {
      const data = await this.readData<T>(filename);
      const itemIndex = data.findIndex(item => item.id === id);
      
      if (itemIndex === -1) {
        throw new Error(`Item with ID ${id} not found`);
      }
      
      // Merge updates with existing item
      data[itemIndex] = { ...data[itemIndex], ...updates };
      await this.writeData(filename, data);
      return data[itemIndex];
    } catch (error) {
      throw new Error(`Failed to update item in ${filename}: ${(error as Error).message}`);
    }
  }

  /**
   * Delete an item by ID
   */
  async delete(filename: string, id: string): Promise<boolean> {
    try {
      const data = await this.readData<{ id: string }>(filename);
      const initialLength = data.length;
      const filteredData = data.filter(item => item.id !== id);
      
      if (filteredData.length === initialLength) {
        return false; // Item not found
      }
      
      await this.writeData(filename, filteredData);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete item from ${filename}: ${(error as Error).message}`);
    }
  }

  /**
   * Find items by a specific field value
   */
  async findBy<T>(filename: string, field: keyof T, value: unknown): Promise<T[]> {
    try {
      const data = await this.readData<T>(filename);
      return data.filter(item => item[field] === value);
    } catch (error) {
      throw new Error(`Failed to find items by ${String(field)} in ${filename}: ${(error as Error).message}`);
    }
  }

  // Specific methods for each data type
  
  /**
   * Teams operations
   */
  async getTeams(): Promise<Team[]> {
    return this.readData<Team>('teams.json');
  }

  async createTeam(team: Team): Promise<Team> {
    return this.create<Team>('teams.json', team);
  }

  async getTeamById(id: string): Promise<Team | null> {
    return this.findById<Team>('teams.json', id);
  }

  /**
   * Players operations
   */
  async getPlayers(): Promise<Player[]> {
    return this.readData<Player>('players.json');
  }

  async createPlayer(player: Player): Promise<Player> {
    return this.create<Player>('players.json', player);
  }

  async getPlayerById(id: string): Promise<Player | null> {
    return this.findById<Player>('players.json', id);
  }

  async getPlayersByTeam(teamId: string): Promise<Player[]> {
    return this.findBy<Player>('players.json', 'teamId', teamId);
  }

  /**
   * Practices operations
   */
  async getPractices(): Promise<Practice[]> {
    return this.readData<Practice>('practices.json');
  }

  async createPractice(practice: Practice): Promise<Practice> {
    return this.create<Practice>('practices.json', practice);
  }

  async getPracticeById(id: string): Promise<Practice | null> {
    return this.findById<Practice>('practices.json', id);
  }

  async getPracticesByTeam(teamId: string): Promise<Practice[]> {
    return this.findBy<Practice>('practices.json', 'teamId', teamId);
  }

  /**
   * Practice Questions operations
   */
  async getPracticeQuestions(): Promise<PracticeQuestion[]> {
    return this.readData<PracticeQuestion>('practice-questions.json');
  }

  /**
   * Practice Responses operations
   */
  async getPracticeResponses(): Promise<PracticeResponse[]> {
    return this.readData<PracticeResponse>('practice-responses.json');
  }

  async createPracticeResponse(response: PracticeResponse): Promise<PracticeResponse> {
    return this.create<PracticeResponse>('responses.json', response);
  }

  async getResponsesByPractice(practiceId: string): Promise<PracticeResponse[]> {
    return this.findBy<PracticeResponse>('responses.json', 'practiceId', practiceId);
  }

  async getResponseByPlayerAndPractice(playerId: string, practiceId: string): Promise<PracticeResponse | null> {
    const responses = await this.readData<PracticeResponse>('responses.json');
    return responses.find(r => r.playerId === playerId && r.practiceId === practiceId) || null;
  }

  /**
   * Practice Summaries operations
   */
  async getPracticeSummaries(): Promise<PracticeSummary[]> {
    return this.readData<PracticeSummary>('summaries.json');
  }

  async createPracticeSummary(summary: PracticeSummary): Promise<PracticeSummary> {
    try {
      const data = await this.readData<PracticeSummary>('summaries.json');
      
      // Check if summary for this practice already exists
      if (data.some(existingSummary => existingSummary.practiceId === summary.practiceId)) {
        throw new Error(`Summary for practice ${summary.practiceId} already exists`);
      }
      
      data.push(summary);
      await this.writeData('summaries.json', data);
      return summary;
    } catch (error) {
      throw new Error(`Failed to create practice summary: ${(error as Error).message}`);
    }
  }

  async getSummaryByPractice(practiceId: string): Promise<PracticeSummary | null> {
    const summaries = await this.readData<PracticeSummary>('summaries.json');
    return summaries.find(s => s.practiceId === practiceId) || null;
  }

  async updatePracticeSummary(practiceId: string, updates: Partial<PracticeSummary>): Promise<PracticeSummary> {
    try {
      const data = await this.readData<PracticeSummary>('summaries.json');
      const summaryIndex = data.findIndex(summary => summary.practiceId === practiceId);
      
      if (summaryIndex === -1) {
        throw new Error(`Summary for practice ${practiceId} not found`);
      }
      
      // Merge updates with existing summary
      data[summaryIndex] = { ...data[summaryIndex], ...updates };
      await this.writeData('summaries.json', data);
      return data[summaryIndex];
    } catch (error) {
      throw new Error(`Failed to update practice summary: ${(error as Error).message}`);
    }
  }
}

// Export a default instance
export const dataAccess = new DataAccess();