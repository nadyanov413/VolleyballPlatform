# Volleyball Club Management System

A Next.js 14 web application for managing volleyball clubs with separate interfaces for coaches and players.

## Features

- **Coach Interface**: Manage teams, register players, create practices, view AI-generated summaries
- **Player Interface**: Select practices, answer questions, submit responses
- **AI Integration**: AWS Bedrock Nova model for practice summaries
- **Data Persistence**: Local JSON file storage

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure AWS Bedrock credentials in `.env.local`:
   ```
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key_here
   AWS_SECRET_ACCESS_KEY=your_secret_key_here
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/app/coach/` - Coach interface pages
- `/app/player/` - Player interface pages  
- `/app/api/` - API routes
- `/data/` - JSON data files
- `/lib/` - Shared utilities and types

## Technology Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- AWS SDK v3 (Bedrock Runtime)
- Fast-check (Property-based testing)