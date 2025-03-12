<script setup>
import { ref, computed, onMounted } from "vue";
import { useDraftStore } from "../stores/draftStore";
import PlayerDetails from "./PlayerDetails.vue";
import PlayerComparison from "./PlayerComparison.vue";

// Access the store
const draftStore = useDraftStore();

// Local component state
const searchQuery = ref("");
const positionFilter = ref("All");
const sortBy = ref("adp");
const sortOrder = ref("asc");
const statusFilter = ref("All");
const selectedPlayer = ref(null);
const showComparison = ref(false);
const playersToCompare = ref([]);
const selectedForComparison = ref(new Set());

// Initialize store on component mount
onMounted(() => {
  if (draftStore.players.length === 0) {
    draftStore.initialize();
  }
  
  // Load saved draft state if available
  draftStore.loadDraftState();
});

// List of available statuses
const availableStatuses = computed(() => {
  const statuses = new Set();
  draftStore.availablePlayers.forEach(player => {
    if (player.rosterStatus) {
      statuses.add(player.rosterStatus);
    }
  });
  return ["All", ...Array.from(statuses).sort()];
});

// Computed values based on store and local state
const availablePositions = computed(() => {
  const positions = new Set();
  draftStore.availablePlayers.forEach(player => {
    if (player.positions) {
      player.positions.forEach(pos => positions.add(pos));
    } else if (player.position) {
      positions.add(player.position);
    }
  });
  return ["All", ...Array.from(positions).sort()];
});

const filteredPlayers = computed(() => {
  // First filter by search term
  let result = draftStore.availablePlayers.filter((player) =>
    player.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
  
  // Then filter by position if not "All"
  if (positionFilter.value !== "All") {
    result = result.filter(player => {
      if (player.positions && player.positions.includes(positionFilter.value)) {
        return true;
      }
      return player.position === positionFilter.value;
    });
  }
  
  // Filter by status if not "All"
  if (statusFilter.value !== "All") {
    result = result.filter(player => player.rosterStatus === statusFilter.value);
  }
  
  // Then sort
  result.sort((a, b) => {
    let aValue = a[sortBy.value];
    let bValue = b[sortBy.value];
    
    // Handle nullish values
    if (aValue === null || aValue === undefined) aValue = 0;
    if (bValue === null || bValue === undefined) bValue = 0;
    
    // For numbers
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder.value === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // For strings
    aValue = String(aValue).toLowerCase();
    bValue = String(bValue).toLowerCase();
    return sortOrder.value === 'asc' 
      ? aValue.localeCompare(bValue) 
      : bValue.localeCompare(aValue);
  });
  
  return result;
});

// This section is no longer needed since we replaced recommendations with top available players
// const showRecommendations = computed(() => {
//   return draftStore.isYourTurn;
// });

// Comparison section properties
const hasSelectedPlayers = computed(() => {
  return selectedForComparison.value.size > 0;
});

// Get top available pitchers and batters by ADP
const topAvailablePitchers = computed(() => {
  return draftStore.availablePlayers
    .filter(player => player.position === 'SP' || player.position === 'RP' || 
            (player.positions && (player.positions.includes('SP') || player.positions.includes('RP'))))
    .sort((a, b) => a.adp - b.adp)
    .slice(0, 4);
});

const topAvailableBatters = computed(() => {
  return draftStore.availablePlayers
    .filter(player => player.position !== 'SP' && player.position !== 'RP' &&
            (!player.positions || (!player.positions.includes('SP') && !player.positions.includes('RP'))))
    .sort((a, b) => a.adp - b.adp)
    .slice(0, 4);
});

// Component methods
function toggleSort(field) {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = field;
    sortOrder.value = 'asc';
  }
}

function draftPlayer(player) {
  draftStore.draftPlayer(player);
  
  // Remove from comparison if selected
  if (selectedForComparison.value.has(player.id)) {
    toggleCompareSelection(player);
  }
}

function markPlayerAsDrafted(player, teamIndex) {
  draftStore.draftPlayer(player, teamIndex);
  
  // Remove from comparison if selected
  if (selectedForComparison.value.has(player.id)) {
    toggleCompareSelection(player);
  }
}

function showPlayerDetails(player) {
  selectedPlayer.value = player;
}

function closePlayerDetails() {
  selectedPlayer.value = null;
}

// Player comparison methods
function toggleCompareSelection(player) {
  if (selectedForComparison.value.has(player.id)) {
    selectedForComparison.value.delete(player.id);
    playersToCompare.value = playersToCompare.value.filter(p => p.id !== player.id);
  } else {
    // Limit to 5 players for comparison
    if (selectedForComparison.value.size >= 5) {
      alert("You can compare up to 5 players at a time");
      return;
    }
    selectedForComparison.value.add(player.id);
    playersToCompare.value.push(player);
  }
}

function openComparisonTool() {
  if (playersToCompare.value.length < 2) {
    alert("Please select at least 2 players to compare");
    return;
  }
  
  showComparison.value = true;
}

function closeComparisonTool() {
  showComparison.value = false;
}

function clearComparisonSelections() {
  selectedForComparison.value.clear();
  playersToCompare.value = [];
}

// Get color class for player status
function getStatusColorClass(status) {
  if (!status) return '';
  
  if (status.includes('Lineup Regular')) return 'text-green-600';
  if (status.includes('Platoon')) return 'text-blue-600';
  if (status.includes('Bench')) return 'text-yellow-600';
  if (status.includes('Injured')) return 'text-red-600';
  if (status.includes('Minors')) return 'text-gray-600';
  
  return '';
}
</script>

<template>
  <div class="player-list">
    <h2 class="text-2xl font-bold mb-4">Available Players</h2>
    
    <!-- Search and filters -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search players..."
        class="p-2 border rounded"
      />
      <select 
        v-model="positionFilter" 
        class="p-2 border rounded"
      >
        <option 
          v-for="position in availablePositions" 
          :key="position" 
          :value="position"
        >
          {{ position }}
        </option>
      </select>
      <select 
        v-model="statusFilter" 
        class="p-2 border rounded"
      >
        <option 
          v-for="status in availableStatuses" 
          :key="status" 
          :value="status"
        >
          {{ status }}
        </option>
      </select>
    </div>
    
    <!-- Comparison selection bar -->
    <div 
      v-if="hasSelectedPlayers"
      class="sticky top-0 z-10 rounded mb-4 p-2 flex items-center justify-between"
      :class="$parent.theme === 'mets' ? 'bg-mets-blue/10 border border-mets-blue/30' : 'bg-padres-brown/10 border border-padres-brown/30'"
    >
      <div class="flex items-center">
        <span class="mr-2 font-medium" :class="$parent.theme === 'mets' ? 'text-mets-blue' : 'text-padres-brown'">
          {{ selectedForComparison.size }} players selected
        </span>
        <div class="flex gap-1 overflow-x-auto max-w-md">
          <div 
            v-for="player in playersToCompare"
            :key="`compare-${player.id}`"
            class="px-2 py-1 rounded text-xs whitespace-nowrap"
            :class="$parent.theme === 'mets' ? 'bg-mets-blue/20 text-mets-blue' : 'bg-padres-brown/20 text-padres-brown'"
          >
            {{ player.name }}
          </div>
        </div>
      </div>
      <div class="flex gap-2">
        <button 
          @click="openComparisonTool" 
          class="px-3 py-1 text-sm text-white rounded"
          :class="$parent.theme === 'mets' ? 'bg-mets-blue hover:bg-mets-blue/90' : 'bg-padres-brown hover:bg-padres-brown/90'"
        >
          Compare
        </button>
        <button 
          @click="clearComparisonSelections" 
          class="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
        >
          Clear
        </button>
      </div>
    </div>
    
    <!-- Top Available Players Section -->
    <div class="mb-4">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Top Batters -->
        <div>
          <h3 class="font-bold mb-2" :class="$parent.theme === 'mets' ? 'text-mets-orange' : 'text-padres-gold'">
            Top Available Batters
          </h3>
          <div class="grid grid-cols-1 gap-2">
            <div 
              v-for="player in topAvailableBatters" 
              :key="`batter-${player.id}`"
              class="p-2 border rounded flex justify-between items-center"
              :class="$parent.theme === 'mets' ? 'bg-mets-light border-mets-blue/30' : 'bg-padres-light border-padres-brown/30'"
            >
              <div class="flex-grow">
                <div 
                  class="font-medium cursor-pointer"
                  :class="$parent.theme === 'mets' ? 'hover:text-mets-blue' : 'hover:text-padres-brown'"
                  @click="showPlayerDetails(player)"
                >
                  {{ player.name }}
                </div>
                <div class="text-xs">
                  {{ player.team }} - {{ player.position }} | 
                  ADP: {{ player.adp.toFixed(1) }} | 
                  Proj: {{ Math.round(player.projectedPoints) }}
                  <span 
                    v-if="player.rosterStatus" 
                    class="ml-1 italic"
                    :class="getStatusColorClass(player.rosterStatus)"
                  >
                    ({{ player.rosterStatus }})
                  </span>
                </div>
              </div>
              <div class="flex gap-1">
                <button 
                  @click="toggleCompareSelection(player)" 
                  class="px-2 py-1 text-xs border rounded hover:bg-gray-100"
                  :class="selectedForComparison.has(player.id) ? 
                    ($parent.theme === 'mets' ? 'bg-mets-blue/20 border-mets-blue/30' : 'bg-padres-brown/20 border-padres-brown/30') : ''"
                >
                  {{ selectedForComparison.has(player.id) ? 'Selected' : 'Compare' }}
                </button>
                <button 
                  @click="draftPlayer(player)" 
                  class="px-3 py-1 text-white rounded"
                  :class="$parent.theme === 'mets' ? 'bg-mets-orange hover:bg-mets-orange/90' : 'bg-padres-gold hover:bg-padres-gold/90'"
                >
                  Draft
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Top Pitchers -->
        <div>
          <h3 class="font-bold mb-2" :class="$parent.theme === 'mets' ? 'text-mets-orange' : 'text-padres-gold'">
            Top Available Pitchers
          </h3>
          <div class="grid grid-cols-1 gap-2">
            <div 
              v-for="player in topAvailablePitchers" 
              :key="`pitcher-${player.id}`"
              class="p-2 border rounded flex justify-between items-center"
              :class="$parent.theme === 'mets' ? 'bg-mets-light border-mets-blue/30' : 'bg-padres-light border-padres-brown/30'"
            >
              <div class="flex-grow">
                <div 
                  class="font-medium cursor-pointer"
                  :class="$parent.theme === 'mets' ? 'hover:text-mets-blue' : 'hover:text-padres-brown'"
                  @click="showPlayerDetails(player)"
                >
                  {{ player.name }}
                </div>
                <div class="text-xs">
                  {{ player.team }} - {{ player.position }} | 
                  ADP: {{ player.adp.toFixed(1) }} | 
                  Proj: {{ Math.round(player.projectedPoints) }}
                  <span 
                    v-if="player.rosterStatus" 
                    class="ml-1 italic"
                    :class="getStatusColorClass(player.rosterStatus)"
                  >
                    ({{ player.rosterStatus }})
                  </span>
                </div>
              </div>
              <div class="flex gap-1">
                <button 
                  @click="toggleCompareSelection(player)" 
                  class="px-2 py-1 text-xs border rounded hover:bg-gray-100"
                  :class="selectedForComparison.has(player.id) ? 
                    ($parent.theme === 'mets' ? 'bg-mets-blue/20 border-mets-blue/30' : 'bg-padres-brown/20 border-padres-brown/30') : ''"
                >
                  {{ selectedForComparison.has(player.id) ? 'Selected' : 'Compare' }}
                </button>
                <button 
                  @click="draftPlayer(player)" 
                  class="px-3 py-1 text-white rounded"
                  :class="$parent.theme === 'mets' ? 'bg-mets-orange hover:bg-mets-orange/90' : 'bg-padres-gold hover:bg-padres-gold/90'"
                >
                  Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Quick Compare Button -->
      <div class="mt-3 text-center">
        <button 
          @click="() => { 
            clearComparisonSelections(); 
            [...topAvailableBatters, ...topAvailablePitchers].slice(0, 5).forEach(player => toggleCompareSelection(player));
            openComparisonTool();
          }" 
          class="px-4 py-2 text-white rounded font-medium"
          :class="$parent.theme === 'mets' ? 'bg-mets-blue hover:bg-mets-blue/90' : 'bg-padres-brown hover:bg-padres-brown/90'"
        >
          Quick Compare Top 5 Available Players
        </button>
      </div>
    </div>
    
    <!-- Table header -->
    <div class="grid grid-cols-8 gap-2 font-bold py-2 border-b mb-2">
      <div 
        class="cursor-pointer" 
        @click="toggleSort('name')"
      >
        Player {{ sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
      </div>
      <div>Team</div>
      <div>Position</div>
      <div>Status</div>
      <div 
        class="cursor-pointer" 
        @click="toggleSort('adp')"
      >
        ADP {{ sortBy === 'adp' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
      </div>
      <div 
        class="cursor-pointer" 
        @click="toggleSort('projectedPoints')"
      >
        Proj {{ sortBy === 'projectedPoints' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
      </div>
      <div class="text-center">Compare</div>
      <div></div>
    </div>
    
    <!-- Player list -->
    <div class="space-y-1 max-h-[500px] overflow-y-auto">
      <div
        v-for="player in filteredPlayers"
        :key="player.id"
        class="grid grid-cols-8 gap-2 p-2 border rounded hover:bg-gray-50"
        :class="{'bg-green-50': player.tier <= 2}"
      >
        <div 
          class="font-medium cursor-pointer hover:text-blue-600"
          @click="showPlayerDetails(player)"
        >
          {{ player.name }}
          <span v-if="player.isTwoWayPlayer" class="text-xs text-purple-600 ml-1">(2-Way)</span>
        </div>
        <div>{{ player.team }}</div>
        <div>{{ player.position }}</div>
        <div :class="getStatusColorClass(player.rosterStatus)">
          {{ player.rosterStatus || '-' }}
        </div>
        <div>{{ player.adp.toFixed(1) }}</div>
        <div>{{ Math.round(player.projectedPoints) }}</div>
        <div class="text-center">
          <button 
            @click="toggleCompareSelection(player)" 
            class="px-2 py-1 text-xs border rounded hover:bg-gray-100 w-full"
            :class="selectedForComparison.has(player.id) ? 
              ($parent.theme === 'mets' ? 'bg-mets-blue/20 border-mets-blue/30 text-mets-blue' : 'bg-padres-brown/20 border-padres-brown/30 text-padres-brown') 
              : ''"
          >
            {{ selectedForComparison.has(player.id) ? '✓' : '+' }}
          </button>
        </div>
        <div class="flex gap-1">
          <!-- Draft button - shown prominently when it's your turn -->
          <button 
            v-if="draftStore.isYourTurn"
            @click="draftPlayer(player)" 
            class="px-2 py-1 text-white text-xs rounded"
            :class="$parent.theme === 'mets' ? 'bg-mets-orange hover:bg-mets-orange/90' : 'bg-padres-gold hover:bg-padres-gold/90'"
          >
            Draft
          </button>
          
          <!-- Dropdown for drafting to any team (available always) -->
          <select
            @change="markPlayerAsDrafted(player, $event.target.value); $event.target.value = ''"
            class="px-1 py-0.5 text-xs border rounded"
            :class="$parent.theme === 'mets' ? 'border-mets-blue/30' : 'border-padres-brown/30'"
          >
            <option value="">Draft to...</option>
            <option 
              v-for="(teamName, index) in draftStore.teamNames" 
              :key="`team-${index}`" 
              :value="index"
            >
              {{ teamName }}
            </option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- Player Details Modal -->
    <PlayerDetails 
      v-if="selectedPlayer" 
      :player="selectedPlayer" 
      :onClose="closePlayerDetails" 
    />
    
    <!-- Player Comparison Modal -->
    <PlayerComparison
      v-if="showComparison"
      :initialPlayers="playersToCompare"
      :onClose="closeComparisonTool"
    />
  </div>
</template>
