import { defineStore } from 'pinia';
import { DataService } from '../services/DataService';

export const useDraftStore = defineStore('draft', {
  state: () => ({
    // League settings
    totalTeams: 12,
    draftRounds: 23,
    yourTeamPosition: 3,
    
    // Team names and preferences
    teamNames: Array(12).fill('').map((_, i) => i === 2 ? 'Mets Fan' : i === 3 ? 'Padres Fan' : `Team ${i + 1}`),
    favoriteTeam: 'mets', // 'mets' or 'padres'
    
    // Draft celebration state
    showCelebration: false,
    celebrationPlayer: null,
    
    // Roster configuration
    rosterConfig: {
      C: 1,   // 1 catcher
      "1B": 1, // 1 first baseman
      "2B": 1, // 1 second baseman
      "3B": 1, // 1 third baseman
      SS: 1,   // 1 shortstop
      OF: 3,   // 3 outfielders
      UTIL: 1, // 1 utility player
      SP: 5,   // 5 starting pitchers
      RP: 3,   // 3 relief pitchers
      BN: 6,   // 6 bench spots
    },
    
    // Draft state
    players: [],
    draftedPlayers: [], // Array of {player, pickNumber, teamIndex}
    currentPick: 1,
    
    // Your team roster - by position
    yourRoster: [],
  }),
  
  getters: {
    availablePlayers: (state) => {
      const draftedIds = state.draftedPlayers.map(pick => pick.player.id);
      return state.players.filter(player => !draftedIds.includes(player.id));
    },
    
    currentRound: (state) => {
      return Math.floor((state.currentPick - 1) / state.totalTeams) + 1;
    },
    
    currentPickInRound: (state) => {
      const pickInRound = (state.currentPick - 1) % state.totalTeams + 1;
      // Reverse for even rounds (snake draft)
      return state.currentRound % 2 === 0
        ? state.totalTeams - pickInRound + 1
        : pickInRound;
    },
    
    currentTeamTurn: (state) => {
      return state.currentPickInRound - 1;
    },
    
    isYourTurn: (state) => {
      return state.currentTeamTurn === state.yourTeamPosition - 1;
    },
    
    draftBoard: (state) => {
      const board = [];
      
      for (let round = 1; round <= state.draftRounds; round++) {
        const roundPicks = Array(state.totalTeams).fill(null);
        board.push(roundPicks);
      }
      
      // Populate with drafted players
      state.draftedPlayers.forEach(pick => {
        const round = Math.floor((pick.pickNumber - 1) / state.totalTeams);
        let pickInRound = (pick.pickNumber - 1) % state.totalTeams;
        
        // Reverse for even rounds (snake draft)
        if ((round + 1) % 2 === 0) {
          pickInRound = state.totalTeams - pickInRound - 1;
        }
        
        board[round][pickInRound] = pick;
      });
      
      return board;
    },
    
    teamDrafts: (state) => {
      const teamDrafts = Array(state.totalTeams).fill(null).map(() => []);
      
      state.draftedPlayers.forEach(pick => {
        teamDrafts[pick.teamIndex].push(pick.player);
      });
      
      return teamDrafts;
    },
    
    yourTeam: (state) => {
      return state.draftedPlayers
        .filter(pick => pick.teamIndex === state.yourTeamPosition - 1)
        .map(pick => pick.player);
    },
    
    // Team theme colors
    themeColors: (state) => {
      if (state.favoriteTeam === 'mets') {
        return {
          primary: '#FF5910', // Mets Orange
          secondary: '#002D72', // Mets Blue
          tertiary: '#ffffff', // White
          bgPrimary: 'bg-[#FF5910]',
          bgSecondary: 'bg-[#002D72]',
          textPrimary: 'text-[#FF5910]',
          textSecondary: 'text-[#002D72]',
          borderPrimary: 'border-[#FF5910]',
          borderSecondary: 'border-[#002D72]',
        };
      } else {
        return {
          primary: '#2F241D', // Padres Brown
          secondary: '#FFC425', // Padres Gold
          tertiary: '#ffffff', // White
          bgPrimary: 'bg-[#2F241D]',
          bgSecondary: 'bg-[#FFC425]',
          textPrimary: 'text-[#2F241D]',
          textSecondary: 'text-[#FFC425]',
          borderPrimary: 'border-[#2F241D]',
          borderSecondary: 'border-[#FFC425]',
        };
      }
    },
    
    // Team logo
    teamLogo: (state) => {
      return state.favoriteTeam === 'mets'
        ? new URL('../assets/images/mets/mets_logo.png', import.meta.url).href
        : new URL('../assets/images/padres/sd_image.png', import.meta.url).href;
    },
    
    // Roster analysis
    filledPositions: (state) => {
      const filled = {};
      
      // Initialize with zeros
      Object.keys(state.rosterConfig).forEach(pos => {
        filled[pos] = 0;
      });
      
      // Count filled spots
      state.yourRoster.forEach(player => {
        if (filled[player.position] !== undefined) {
          filled[player.position]++;
        }
      });
      
      return filled;
    },
    
    availableSlots: (state) => {
      const available = {};
      
      Object.keys(state.rosterConfig).forEach(pos => {
        available[pos] = state.rosterConfig[pos] - (state.filledPositions[pos] || 0);
      });
      
      return available;
    },
    
    totalRosterSpots: (state) => {
      return Object.values(state.rosterConfig).reduce((sum, count) => sum + count, 0);
    },
    
    filledRosterSpots: (state) => {
      return state.yourRoster.length;
    },
    
    // Projected team statistics
    statTotals: (state) => {
      const totals = {
        HR: 0,
        R: 0,
        RBI: 0,
        SB: 0,
        AVG: 0,
        W: 0,
        SV: 0,
        ERA: 0,
        WHIP: 0,
        SO: 0
      };
      
      let battingPlayers = 0;
      let pitchingPlayers = 0;
      
      state.yourRoster.forEach(player => {
        const stats = player.playerData.stats;
        
        if (player.playerData.type === 'batter') {
          battingPlayers++;
          totals.HR += stats.HR || 0;
          totals.R += stats.R || 0;
          totals.RBI += stats.RBI || 0;
          totals.SB += stats.SB || 0;
          totals.AVG += stats.AVG || 0;
        } else if (player.playerData.type === 'pitcher') {
          pitchingPlayers++;
          totals.W += stats.W || 0;
          totals.SV += stats.SV || 0;
          totals.SO += stats.SO || 0;
          totals.ERA += stats.ERA || 0;
          totals.WHIP += stats.WHIP || 0;
        }
      });
      
      // Calculate averages for rate stats
      if (battingPlayers > 0) {
        totals.AVG = totals.AVG / battingPlayers;
      }
      
      if (pitchingPlayers > 0) {
        totals.ERA = totals.ERA / pitchingPlayers;
        totals.WHIP = totals.WHIP / pitchingPlayers;
      }
      
      return totals;
    },
    
    // Position scarcity
    positionScarcity: (state) => {
      // Get all available players by position
      const positionCounts = {};
      const tierCounts = {1: {}, 2: {}, 3: {}};
      
      state.availablePlayers.forEach(player => {
        const position = player.position;
        const tier = player.tier;
        
        // Count by position
        positionCounts[position] = (positionCounts[position] || 0) + 1;
        
        // Count by position and tier
        if (tier <= 3) {
          tierCounts[tier][position] = (tierCounts[tier][position] || 0) + 1;
        }
      });
      
      // Calculate scarcity score
      const scarcityScore = {};
      
      Object.keys(positionCounts).forEach(pos => {
        const totalAvailable = positionCounts[pos] || 0;
        const tier1Available = tierCounts[1][pos] || 0;
        const tier2Available = tierCounts[2][pos] || 0;
        
        // Scarcity algorithm - higher score means more scarce
        scarcityScore[pos] = 10 - (tier1Available * 3 + tier2Available * 1);
        
        // Ensure score is in range 1-10
        if (scarcityScore[pos] < 1) scarcityScore[pos] = 1;
        if (scarcityScore[pos] > 10) scarcityScore[pos] = 10;
      });
      
      return {
        counts: positionCounts,
        tierCounts,
        scarcityScore
      };
    },
    
    // Draft recommendations based on team needs and scarcity
    draftRecommendations: (state) => {
      if (state.availablePlayers.length === 0) return [];
      
      const needsScore = {};
      const filledPos = state.filledPositions;
      const config = state.rosterConfig;
      
      // Calculate needs score by position
      Object.keys(config).forEach(pos => {
        if (pos === 'BN') return; // Skip bench
        
        const filled = filledPos[pos] || 0;
        const total = config[pos] || 0;
        
        // Score is higher if we need more of this position
        needsScore[pos] = (total - filled) / total * 10;
        
        // Ensure score is in range 1-10
        if (needsScore[pos] < 1) needsScore[pos] = 1;
        if (needsScore[pos] > 10) needsScore[pos] = 10;
      });
      
      // Bonus for favorite MLB team
      const favoriteMLB = state.favoriteTeam === 'mets' ? 'NYM' : 'SDP';
      
      // Combine needs and scarcity to rank players
      return state.availablePlayers
        .map(player => {
          const pos = player.position;
          const need = needsScore[pos] || 5; // Default to middle if unknown position
          const scarcity = state.positionScarcity.scarcityScore[pos] || 5;
          
          // Bonus for favorite team player
          const teamBonus = player.team === favoriteMLB ? 1.2 : 1;
          
          // Overall score combines projected points, position need, and scarcity
          // Normalize projected points to 0-10 scale
          const pointsNormalized = player.projectedPoints / 100; // Adjust scaling as needed
          
          // Weighted scoring - can adjust weights based on preferences
          const overallScore = (
            (pointsNormalized * 0.5) + // 50% for player quality
            (need * 0.3) +             // 30% for team needs
            (scarcity * 0.2)           // 20% for position scarcity
          ) * teamBonus;               // Bonus for favorite MLB team
          
          return {
            player,
            need,
            scarcity,
            overallScore,
            isFavoriteTeam: player.team === favoriteMLB
          };
        })
        .sort((a, b) => b.overallScore - a.overallScore)
        .slice(0, 10); // Top 10 recommendations
    }
  },
  
  actions: {
    // Initialize store with player data
    initialize() {
      this.players = DataService.getAllPlayers();
    },
    
    // Draft a player
    draftPlayer(player, teamIndex = null) {
      // Use the current team turn if no team specified
      const team = teamIndex !== null ? teamIndex : this.currentTeamTurn;
      
      // Add to drafted players
      this.draftedPlayers.push({
        player,
        pickNumber: this.currentPick,
        teamIndex: team
      });
      
      // If it's your team, also add to your roster
      if (team === this.yourTeamPosition - 1) {
        this.addToYourRoster(player);
        
        // Show celebration overlay for your picks
        this.celebrationPlayer = player;
        this.showCelebration = true;
      }
      
      // Advance to next pick
      this.currentPick++;
      
      // Save draft state to localStorage
      this.saveDraftState();
    },
    
    // Hide celebration overlay
    closeCelebration() {
      this.showCelebration = false;
      this.celebrationPlayer = null;
    },
    
    // Toggle favorite team (mets/padres)
    toggleFavoriteTeam() {
      this.favoriteTeam = this.favoriteTeam === 'mets' ? 'padres' : 'mets';
      this.saveDraftState();
    },
    
    // Set favorite team directly
    setFavoriteTeam(team) {
      if (team === 'mets' || team === 'padres') {
        this.favoriteTeam = team;
        this.saveDraftState();
      }
    },
    
    // Add player to your roster at a specific position
    addToYourRoster(player, position = null) {
      // If position not specified, try to find best position
      if (!position) {
        // Default to player's primary position if available
        position = player.position;
        
        // Check if the position is already filled to capacity
        if (
          this.filledPositions[position] >= this.rosterConfig[position] ||
          !this.rosterConfig[position]
        ) {
          // Try other valid positions
          if (player.positions && Array.isArray(player.positions)) {
            for (const pos of player.positions) {
              if (
                this.filledPositions[pos] < this.rosterConfig[pos] &&
                this.rosterConfig[pos]
              ) {
                position = pos;
                break;
              }
            }
          }
          
          // If still no position or full, put on bench
          if (
            !position ||
            this.filledPositions[position] >= this.rosterConfig[position]
          ) {
            position = 'BN';
          }
        }
      }
      
      // Add to roster
      this.yourRoster.push({
        playerId: player.id,
        position: position,
        playerData: player
      });
    },
    
    // Undo the last draft pick
    undoLastPick() {
      if (this.draftedPlayers.length === 0) return;
      
      const lastPick = this.draftedPlayers.pop();
      this.currentPick--;
      
      // If it was your pick, also remove from roster
      if (lastPick.teamIndex === this.yourTeamPosition - 1) {
        const index = this.yourRoster.findIndex(p => p.playerId === lastPick.player.id);
        if (index >= 0) {
          this.yourRoster.splice(index, 1);
        }
      }
      
      this.saveDraftState();
    },
    
    // Move a player to a different position on your roster
    movePlayerPosition(playerId, newPosition) {
      const playerIndex = this.yourRoster.findIndex(p => p.playerId === playerId);
      
      if (playerIndex >= 0) {
        // Make sure the position is valid for this player
        const player = this.yourRoster[playerIndex].playerData;
        const validPositions = player.positions || [player.position];
        
        if (newPosition === 'BN' || validPositions.includes(newPosition)) {
          this.yourRoster[playerIndex].position = newPosition;
          this.saveDraftState();
        }
      }
    },
    
    // Change draft settings
    updateDraftSettings(settings) {
      if (settings.totalTeams) this.totalTeams = settings.totalTeams;
      if (settings.draftRounds) this.draftRounds = settings.draftRounds;
      if (settings.yourTeamPosition) this.yourTeamPosition = settings.yourTeamPosition;
      if (settings.favoriteTeam) this.favoriteTeam = settings.favoriteTeam;
      
      this.saveDraftState();
    },
    
    // Update team names
    updateTeamName(index, name) {
      if (index >= 0 && index < this.teamNames.length) {
        this.teamNames[index] = name;
        this.saveDraftState();
      }
    },
    
    // Reset draft
    resetDraft() {
      this.draftedPlayers = [];
      this.yourRoster = [];
      this.currentPick = 1;
      this.showCelebration = false;
      this.celebrationPlayer = null;
      localStorage.removeItem('draftState');
    },
    
    // Save draft state to localStorage
    saveDraftState() {
      const state = {
        draftedPlayers: this.draftedPlayers,
        yourRoster: this.yourRoster,
        currentPick: this.currentPick,
        teamNames: this.teamNames,
        totalTeams: this.totalTeams,
        draftRounds: this.draftRounds,
        yourTeamPosition: this.yourTeamPosition,
        favoriteTeam: this.favoriteTeam
      };
      
      localStorage.setItem('draftState', JSON.stringify(state));
    },
    
    // Load draft state from localStorage
    loadDraftState() {
      const savedState = localStorage.getItem('draftState');
      
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          
          if (state.draftedPlayers) this.draftedPlayers = state.draftedPlayers;
          if (state.yourRoster) this.yourRoster = state.yourRoster;
          if (state.currentPick) this.currentPick = state.currentPick;
          if (state.teamNames) this.teamNames = state.teamNames;
          if (state.totalTeams) this.totalTeams = state.totalTeams;
          if (state.draftRounds) this.draftRounds = state.draftRounds;
          if (state.yourTeamPosition) this.yourTeamPosition = state.yourTeamPosition;
          if (state.favoriteTeam) this.favoriteTeam = state.favoriteTeam;
        } catch (error) {
          console.error('Error loading draft state:', error);
        }
      }
    }
  }
});