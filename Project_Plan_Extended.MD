## Added Details

Fantasy Baseball Draft Strategy Tool - Project Plan
Project Overview
This project aims to build a lightweight, strategic draft tool using Vue.js for two co-owners to use during an upcoming fantasy baseball draft (scheduled for March 14, 2025). The tool will focus on providing strategic insights, player tracking, and draft optimization rather than full league management.
Tech Stack

Frontend Framework: Vue.js 3 with Composition API
Build Tool: Vite (for fast development)
CSS Framework: Tailwind CSS (for quick styling)
Data Storage: JSON for player data, localStorage for draft state
Deployment: GitHub Pages or Netlify

Core Features

Player Database & Tracking
Draft Board Visualization
Strategic Metrics Display
Position Tracking & Recommendations
Draft Pick Marking

Sprint Plan (10-day timeline)
Sprint 1: Project Setup & Data Preparation (Days 1-3)

Project initialization (4 points)

Set up Vite project with Vue 3 template
Copynpm create vite@latest fantasy-draft-tool -- --template vue

Install Tailwind CSS
Copynpm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

Configure VS Code with Vue extensions
Set up Git repository

Player database creation (8 points)

Create JSON file with MLB player data

Include names, positions, teams, key stats
Add projected fantasy points based on league scoring
Include ADP (Average Draft Position) data
Add positional rankings

Create data service for accessing player information

Basic Vue components structure (6 points)

Create main App layout
Build initial component hierarchy

DraftBoard.vue
PlayerList.vue
TeamRoster.vue
StrategyPanel.vue

Implement responsive layout with Tailwind CSS
Set up Vue Router (if multiple views needed)

Sprint 2: Draft Board & Player Listing (Days 4-6)

Draft board implementation (10 points)

Create DraftBoard.vue component
Implement reactive grid for team picks
Build team roster display components
Add visual indicators for draft progress

Player search and filtering (6 points)

Create PlayerList.vue component
Implement search functionality with Vue's reactivity
Add filters for position, team, status
Build sorting functionality for multiple metrics

Draft pick tracking (4 points)

Set up Vuex or Pinia for state management
Create actions for marking players as drafted
Implement draft order progression
Add localStorage persistence for draft state

Sprint 3: Strategic Analysis & Metrics (Days 7-9)

Value Over Replacement calculations (8 points)

Create StrategyService.js utility
Implement VOR calculations based on positional replacement levels
Build visualization component for value metrics
Add color-coding for value tiers

Position scarcity analysis (7 points)

Create PositionScarcity.vue component
Implement position depth remaining calculations
Add scarcity indicators and visualizations
Create positional tier tracking

Roster balance tracking (5 points)

Create RosterBalance.vue component
Implement visualization of current roster construction
Add statistical category balance tracking
Build visual indicators for team needs

Sprint 4: Recommendations & Final Polish (Day 10)

Next pick recommendations (8 points)

Create RecommendationEngine.js utility
Implement algorithm for best available players
Add team needs-based recommendations
Build top-5 recommendations display

Statistical projections (6 points)

Create TeamProjections.vue component
Implement team statistical projections
Add comparative analysis to league averages
Build radar chart for category strengths

Final testing and deployment (4 points)

Test all features with mock drafts
Fix any bugs or issues
Deploy to GitHub Pages or Netlify
Verify mobile/tablet responsiveness

Component Structure
Copysrc/
├── assets/
│ └── playerData.json # Player database
├── components/
│ ├── DraftBoard.vue # Visual draft board
│ ├── PlayerList.vue # Searchable player listing
│ ├── PlayerCard.vue # Individual player display
│ ├── TeamRoster.vue # Your team's current roster
│ ├── PositionScarcity.vue # Position scarcity indicators
│ ├── ValueMetrics.vue # Value over replacement displays
│ ├── RosterBalance.vue # Team composition visuals
│ └── Recommendations.vue # Next pick suggestions
├── services/
│ ├── DataService.js # Player data management
│ ├── DraftService.js # Draft state management
│ ├── StrategyService.js # Strategic calculations
│ └── StorageService.js # Local storage handling
├── store/
│ └── index.js # Vuex/Pinia store for app state
├── views/
│ ├── DraftView.vue # Main draft page
│ └── SettingsView.vue # Configuration page
├── App.vue # Root component
└── main.js # App entry point
Strategic Metrics Implementation

1. Value Over Replacement (VOR)
   javascriptCopy// In StrategyService.js
   export function calculateVOR(player, replacementLevels) {
   const replacementValue = replacementLevels[player.position];
   return player.projectedPoints - replacementValue;
   }

// Calculate replacement levels
export function calculateReplacementLevels(players, rosterSize) {
const positionCounts = {
'C': rosterSize _ 1, // Adjust these based on your league settings
'1B': rosterSize _ 1,
'2B': rosterSize _ 1,
'SS': rosterSize _ 1,
'3B': rosterSize _ 1,
'OF': rosterSize _ 3,
'P': rosterSize \* 7,
};

// For each position, find the value of the first player outside the drafted range
const replacementLevels = {};

Object.keys(positionCounts).forEach(position => {
const positionPlayers = players
.filter(p => p.position === position)
.sort((a, b) => b.projectedPoints - a.projectedPoints);

    const replacementIndex = positionCounts[position];
    replacementLevels[position] = positionPlayers[replacementIndex]?.projectedPoints || 0;

});

return replacementLevels;
} 2. Position Scarcity Visualization
vueCopy<!-- In PositionScarcity.vue -->
<template>

  <div class="position-scarcity">
    <h3 class="text-lg font-bold mb-2">Position Scarcity</h3>
    <div class="grid grid-cols-7 gap-2">
      <div v-for="(position, index) in positions" :key="index" 
           class="position-block p-2 rounded" 
           :class="scarcityClass(position)">
        <div class="font-bold">{{ position }}</div>
        <div class="text-sm">{{ remainingCount(position) }} left</div>
        <div class="text-xs">Tier 1: {{ tier1Count(position) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const positions = ['C', '1B', '2B', '3B', 'SS', 'OF', 'P'];

const remainingCount = (position) => {
  return store.getters.availablePlayers.filter(p => p.position === position).length;
};

const tier1Count = (position) => {
  return store.getters.availablePlayers
    .filter(p => p.position === position && p.tier === 1).length;
};

const scarcityClass = (position) => {
  const count = remainingCount(position);
  const tier1 = tier1Count(position);
  
  if (tier1 === 0) return 'bg-red-200';
  if (tier1 < 3) return 'bg-yellow-200';
  return 'bg-green-200';
};
</script>

3. Next Pick Recommendation Engine
   javascriptCopy// In RecommendationEngine.js
   export function getRecommendations(availablePlayers, myTeam, replacementLevels) {
   // Calculate positional needs
   const positionCounts = calculatePositionCounts(myTeam);
   const positionNeeds = calculatePositionNeeds(positionCounts);

// Calculate value over replacement for all available players
const playersWithVOR = availablePlayers.map(player => ({
...player,
vor: calculateVOR(player, replacementLevels),
// Add a position need multiplier
needMultiplier: positionNeeds[player.position] || 1
}));

// Sort by adjusted value (VOR _ need multiplier)
return playersWithVOR
.sort((a, b) => (b.vor _ b.needMultiplier) - (a.vor \* a.needMultiplier))
.slice(0, 10); // Return top 10 recommendations
}
Data Management Approach
Player Data Structure
javascriptCopy// Example player object structure
{
"id": 123456,
"name": "Aaron Judge",
"team": "NYY",
"position": "OF",
"positions": ["OF", "DH"], // All eligible positions
"projectedPoints": 580,
"adp": 8.2,
"tier": 1,
"stats": {
"R": 110,
"TB": 320,
"RBI": 115,
"BB": 85,
"K": 180,
"SB": 10
}
}
Draft State Management
javascriptCopy// In store/index.js (using Pinia)
import { defineStore } from 'pinia';

export const useDraftStore = defineStore('draft', {
state: () => ({
players: [], // All players
draftedPlayers: [], // Players already drafted
myTeam: [], // Players on your team
currentPick: 1, // Current pick number
totalTeams: 12, // Number of teams in your league
yourDraftPosition: 3, // Your position in draft order
isSnakeDraft: true // Whether it's a snake draft
}),

getters: {
availablePlayers: (state) => {
const draftedIds = state.draftedPlayers.map(p => p.id);
return state.players.filter(p => !draftedIds.includes(p.id));
},

    isYourPick: (state) => {
      const round = Math.ceil(state.currentPick / state.totalTeams);
      const pickInRound = state.currentPick - ((round - 1) * state.totalTeams);

      // Adjust for snake draft
      const effectivePick = state.isSnakeDraft && round % 2 === 0
        ? state.totalTeams - pickInRound + 1
        : pickInRound;

      return effectivePick === state.yourDraftPosition;
    }

},

actions: {
draftPlayer(playerId, teamIndex) {
const player = this.players.find(p => p.id === playerId);
if (!player) return;

      this.draftedPlayers.push({
        ...player,
        draftedBy: teamIndex,
        pickNumber: this.currentPick
      });

      // If it's your team
      if (teamIndex === this.yourDraftPosition - 1) {
        this.myTeam.push(player);
      }

      this.currentPick++;

      // Save to localStorage
      localStorage.setItem('draftState', JSON.stringify({
        draftedPlayers: this.draftedPlayers,
        myTeam: this.myTeam,
        currentPick: this.currentPick
      }));
    },

    loadDraftState() {
      const savedState = localStorage.getItem('draftState');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        this.draftedPlayers = parsed.draftedPlayers;
        this.myTeam = parsed.myTeam;
        this.currentPick = parsed.currentPick;
      }
    },

    resetDraft() {
      this.draftedPlayers = [];
      this.myTeam = [];
      this.currentPick = 1;
      localStorage.removeItem('draftState');
    }

}
});
Daily Tasks Breakdown
Day 1

Set up Vue project with Vite
Install Tailwind CSS and configure
Create initial project structure
Begin collecting player data sources

Day 2

Complete basic component structure
Set up state management with Pinia
Format player data into JSON structure
Implement basic UI layout

Day 3

Finalize player data import
Complete data service implementation
Build navigation between components
Set up localStorage persistence

Day 4

Implement draft board visualization
Create team roster display
Add basic player card components
Begin player search functionality

Day 5

Complete player search and filtering
Implement sorting capabilities
Add position filters and team filters
Begin draft pick marking system

Day 6

Finalize draft pick tracking
Implement visual draft board
Add roster summaries for all teams
Create draft history tracking

Day 7

Implement VOR calculations
Create position replacement levels
Build value visualization components
Add tier-based coloring system

Day 8

Develop position scarcity visualization
Implement depth charts by position
Create positional tier tracking
Add scarcity indicators

Day 9

Build roster balance visualization
Implement team needs algorithm
Add statistical projections
Create recommendation engine

Day 10

Finalize recommendation display
Implement final UI refinements
Test with mock draft scenarios
Deploy to GitHub Pages or Netlify

Testing and Launch
Testing Approach

Run mock drafts to verify functionality
Test persistence between browser sessions
Verify calculations match expected values
Ensure mobile/tablet responsiveness

Launch Preparation

Deploy to GitHub Pages or Netlify
Verify deployed version works correctly
Run a full mock draft as final test
Prepare backup options (spreadsheet) in case of issues
Set up screen sharing if co-owner will be remote during draft

Post-Draft Considerations

Export final draft results as JSON or CSV
Save key insights from the draft
Document any bugs or feature ideas for future drafts

Next Steps

Set up your development environment with Node.js and npm
Create the Vite project with Vue template
Set up Git repository for version control
Begin collecting and formatting player data
