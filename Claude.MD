# Fantasy Baseball Draft App - Claude Notes

## Project Commands

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Update player data from CSV files
npm run update-players
```

## Project Structure

The app follows the Vue 3 + Vite project structure with the following organization:

- `/src`: Main source code
  - `/components`: Vue components (DraftBoard, PlayerList, TeamRoster)
  - `/stores`: Pinia state management
  - `/services`: Data services
  - `/assets`: Static assets
- `/data`: Player projection data CSV files
- `/scripts`: Data processing scripts

## Key Features

1. Player Database & Tracking
2. Draft Board Visualization
3. Strategic Metrics Display
4. Position Tracking & Recommendations
5. Draft Pick Marking

## Styling Guidelines

- Using Tailwind CSS for all styling
- Responsive design with mobile-first approach
- Color scheme:
  - Primary: Blue (#3B82F6)
  - Success: Green (#10B981)
  - Warning: Yellow (#F59E0B)
  - Danger: Red (#EF4444)
  - Neutral: Gray (#6B7280)

## Upcoming Tasks

1. Create a settings panel for league configuration
2. Add player trend indicators
3. Implement value-based drafting metrics
4. Add stat category balance visualization
5. Create draft recap and export functionality