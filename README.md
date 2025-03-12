# Fantasy Baseball Draft Tool

A web-based draft tool for fantasy baseball featuring player projections, draft tracking, and team analysis.

## Features

- **Player Database**: Comprehensive MLB player database with projections from FanGraphs
- **Draft Board**: Visual draft board with real-time tracking of all team picks
- **Player Search & Filtering**: Find players by name, position, team, status, and sort by various metrics
- **Player Details**: Detailed player statistics and information in a modal view
- **Player Comparison**: Side-by-side comparison of up to 5 players with stat highlighting
- **Team Roster Management**: Track your drafted players and manage roster positions
- **Statistical Projections**: Team stat projections based on your selections
- **Position Scarcity Analysis**: Visual indicators for position depth and scarcity
- **Draft Recommendations**: AI-powered recommendations based on team needs and position scarcity
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Getting Started

### Prerequisites

- Node.js 16+ and npm installed

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm run dev
   ```

### Data Preparation

The application uses FanGraphs projection data which has been preprocessed and stored in the `data` directory. You can also include roster information with positions and player status from Roster Resource. If you want to update the data:

1. Download new CSV files from FanGraphs for batting and pitching projections
2. Download roster information from Roster Resource
3. Place the CSV files in the `data` directory
4. Run the data merger script:
   ```
   npm run update-players
   ```

## Usage Guide

### Draft Setup

1. Click "Settings" on the Draft Board to configure your draft:
   - Set the number of teams (8-16)
   - Set the number of rounds (10-30)
   - Set your draft position (1-N)
   - Click "Save Settings"

2. You can rename teams by clicking on their names in the draft board header row.

### During the Draft

1. When it's your turn to pick, you'll see recommended players highlighted in the player list
2. Draft a player by clicking the "Draft" button next to their name
3. To mark other teams' picks, use the "Draft to..." dropdown and select the appropriate team
4. If a mistake is made, use the "Undo Last Pick" button on the draft board

### Player Analysis

1. Click on a player's name to view detailed statistics and information
2. Use the comparison tool to compare multiple players:
   - Click the "+" button in the Compare column to add a player to your comparison list
   - Click "Compare" in the blue bar at the top when ready to compare
   - In the comparison view, stats are color-coded to show which player is best in each category
   - You can toggle between batting and pitching stats when comparing two-way players

### Team Management

1. View your team roster in the Team Roster panel
2. Move players between positions by clicking the "Move" button next to a player
3. Monitor your team's projected statistics at the bottom of the roster panel
4. Position scarcity indicators help identify positions becoming thin

## Advanced Features

### Player Status Filtering

Players are color-coded based on their projected Opening Day status:
- Green: Lineup Regular
- Blue: Platoon
- Yellow: Bench
- Red: Injured
- Gray: Minors

You can filter players by status using the status dropdown filter.

### Two-Way Players

Players who both hit and pitch (like Shohei Ohtani) are marked as "2-Way" players and have both batting and pitching statistics available in the player details view.

## Technical Details

The application is built with:

- Vue.js 3 and Composition API
- Pinia for state management
- TailwindCSS for styling
- Vite as the build tool
- FanGraphs projection data
- Roster Resource player status data

All data is stored client-side in the browser's localStorage, so your draft state will persist between sessions on the same device.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- FanGraphs for the projection data
- Roster Resource for player position and status data
- The Vue.js and Tailwind CSS teams for their excellent frameworks
