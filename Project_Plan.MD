# Fantasy Baseball Draft Strategy Tool - Project Plan

## Project Overview

This project aims to build a lightweight, strategic draft tool for two co-owners to use during an upcoming fantasy baseball draft (scheduled for March 14, 2025). The tool will focus on providing strategic insights, player tracking, and draft optimization rather than full league management.

## Core Features

1. **Player Database & Tracking**
2. **Draft Board Visualization**
3. **Strategic Metrics Display**
4. **Position Tracking & Recommendations**
5. **Draft Pick Marking**

## Sprint Plan (10-day timeline)

### Sprint 1: Core Setup & Player Database (Days 1-3)

- [ ] **Project initialization (4 points)**
  - [ ] Set up Git repository
  - [ ] Create basic project structure (HTML, CSS, JavaScript)
  - [ ] Set up local development environment
- [ ] **Player database creation (8 points)**
  - [ ] Create CSV or JSON file with MLB player data
    - [ ] Include names, positions, teams, key stats
    - [ ] Add projected fantasy points
    - [ ] Include ADP (Average Draft Position) data
- [ ] **Basic UI layout (6 points)**
  - [ ] Design responsive layout with draft board and controls
  - [ ] Implement navigation between views
  - [ ] Create initial styling

### Sprint 2: Draft Board & Player Tracking (Days 4-6)

- [ ] **Draft board implementation (10 points)**
  - [ ] Create visual draft board to display all teams' picks
  - [ ] Implement player selection interface
  - [ ] Add team roster displays
- [ ] **Player search and filtering (6 points)**
  - [ ] Build search functionality by name, team, position
  - [ ] Implement sorting by various metrics
  - [ ] Add position filters
- [ ] **Draft pick marking (4 points)**
  - [ ] Create mechanism to mark players as drafted
  - [ ] Add visual indicators for drafted players
  - [ ] Implement draft order tracking

### Sprint 3: Strategic Analysis & Metrics (Days 7-9)

- [ ] **WAR/Replacement value calculations (8 points)**
  - [ ] Implement wins above replacement calculations
  - [ ] Create position-specific replacement levels
  - [ ] Build value over replacement visualizations
- [ ] **Position scarcity analysis (7 points)**
  - [ ] Create position depth charts
  - [ ] Implement scarcity indicators by position
  - [ ] Add positional value adjustments
- [ ] **Roster balance tracking (5 points)**
  - [ ] Build roster composition tracker
  - [ ] Create position group balance metrics
  - [ ] Implement visual indicators for team needs

### Sprint 4: Recommendations & Final Polish (Day 10)

- [ ] **Next pick recommendations (8 points)**
  - [ ] Create recommendation algorithm based on team needs
  - [ ] Implement best available player suggestions
  - [ ] Add value-based draft recommendations
- [ ] **Statistical projections (6 points)**
  - [ ] Implement team stat projections based on current roster
  - [ ] Create category strength/weakness analysis
  - [ ] Add comparative team projections
- [ ] **Final testing and refinement (4 points)**
  - [ ] Test all features
  - [ ] Fix any bugs or issues
  - [ ] Optimize performance for draft day

## Technical Implementation

### Frontend

- **HTML/CSS/JavaScript** - Simple stack for quick development
- **Framework options**:
  - Lightweight framework Vue.js
- **Responsive design** for viewing on laptops/tablets during draft

### Data Management

- **Player Data**: JSON or CSV file loaded client-side
- **Draft State**: Stored in localStorage or sessionStorage
- **No backend required**: Everything runs in browser

### Strategic Metrics to Implement

1. **Value Over Replacement (VOR)**
   - Calculate fantasy points above replacement level by position
   - Adjust based on league scoring settings
2. **Position Scarcity Indicators**
   - Track players remaining by position
   - Highlight positions depleting quickly
3. **Team Balance Metrics**
   - Track roster construction across positions
   - Monitor category strengths/weaknesses based on selections
4. **Next Pick Recommendations**
   - Suggest optimal next picks based on:
     - Team needs
     - Available value
     - Position scarcity
     - Projected stats

### Key Views

1. **Draft Board**
   - Visual representation of all teams' picks
   - Highlighting your team's selections
2. **Available Players**
   - Sortable, filterable list of remaining players
   - Key metrics prominently displayed
3. **Team Analysis**
   - Your current roster construction
   - Projected statistical output
   - Position group status
4. **Recommendations Panel**
   - Top suggested picks for next selection
   - Strategic insights (e.g., "Shortstop tier ending soon")

## Story Point Summary

- **Total Story Points**: 76
- **Points per Sprint**: ~19
- **Estimated Project Duration**: 10 days (4 mini-sprints)

## Daily Tasks Breakdown

### Day 1

- Set up project structure and repository
- Begin player database compilation
- Design basic UI wireframes

### Day 2

- Complete player database with basic stats
- Add fantasy projections to player data
- Implement basic UI layout

### Day 3

- Finalize player database with all metrics
- Complete basic UI implementation
- Begin draft board visualization

### Day 4

- Implement core draft board functionality
- Create player search and filtering
- Add basic player cards/display

### Day 5

- Complete draft board implementation
- Enhance player search with advanced filters
- Begin draft pick marking system

### Day 6

- Finalize draft pick tracking
- Implement team roster displays
- Add initial statistical visualizations

### Day 7

- Implement WAR/VOR calculations
- Create replacement level baselines
- Build value visualizations

### Day 8

- Develop position scarcity analysis
- Implement depth charts by position
- Create positional value adjustments

### Day 9

- Build roster balance tracking
- Implement team needs indicators
- Add statistical projections for team

### Day 10

- Create next pick recommendation engine
- Implement final UI refinements
- Test all features and fix any issues

## Testing and Launch

### Testing Approach

- Test with mock draft scenarios
- Verify calculations against sample data
- Ensure UI clarity and responsiveness

### Launch Preparation

- [ ] Verify all features are working
- [ ] Practice using the tool with a mock draft
- [ ] Prepare backup options (spreadsheet) in case of issues
- [ ] Set up screen sharing if co-owner will be remote during draft

## Post-Draft Considerations

- Export final draft results for reference
- Save application state for potential later use
- Document any insights for future drafts
