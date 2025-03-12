<script setup>
import { ref, computed, watch } from 'vue';
import { useDraftStore } from '../stores/draftStore';

// Props for this component
const props = defineProps({
  initialPlayers: {
    type: Array,
    default: () => []
  },
  onClose: {
    type: Function,
    required: true
  }
});

// Access the store
const draftStore = useDraftStore();

// State management
const selectedPlayers = ref(props.initialPlayers || []);
const searchQuery = ref('');
const searchResults = ref([]);
const showSearch = ref(false);
const activeTab = ref('batting'); // 'batting' or 'pitching'

// Watch for initial players
watch(() => props.initialPlayers, (newVal) => {
  if (newVal && newVal.length) {
    selectedPlayers.value = newVal;
  }
}, { immediate: true });

// Computed properties for player types
const hasBatters = computed(() => {
  return selectedPlayers.value.some(player => 
    player.type === 'batter' || player.isTwoWayPlayer
  );
});

const hasPitchers = computed(() => {
  return selectedPlayers.value.some(player => 
    player.type === 'pitcher' || player.isTwoWayPlayer
  );
});

// Get stats categories based on active tab
const statsCategories = computed(() => {
  if (activeTab.value === 'batting') {
    return [
      'AVG', 'OBP', 'SLG', 'HR', 'R', 'RBI', 'SB', 'BB', 
      'PA', 'AB', 'H', '2B', '3B', 'SO'
    ];
  } else {
    return [
      'ERA', 'WHIP', 'W', 'SV', 'SO', 'IP', 'BB/9', 'K/9',
      'HR/9', 'G', 'GS', 'FIP'
    ];
  }
});

// Format a stat value appropriately
function formatStatValue(player, stat) {
  if (!player) return '-';
  
  // Get the value based on player type and stat
  let value;
  
  if (activeTab.value === 'batting') {
    // For batting stats
    if (player.type === 'batter' || player.isTwoWayPlayer) {
      value = player.stats[stat] || player.allStats?.[stat];
    } else {
      return '-'; // Pitcher without batting stats
    }
  } else {
    // For pitching stats
    if (player.type === 'pitcher') {
      value = player.stats[stat] || player.allStats?.[stat];
    } else if (player.isTwoWayPlayer && player.pitchingStats) {
      value = player.pitchingStats[stat];
    } else {
      return '-'; // Batter without pitching stats
    }
  }
  
  // Format based on stat type
  if (value === undefined || value === null) return '-';
  
  // Use appropriate decimal places for different stat types
  if (['AVG', 'OBP', 'SLG', 'OPS', 'ERA', 'WHIP', 'BB/9', 'K/9', 'HR/9', 'FIP'].includes(stat)) {
    return typeof value === 'number' ? value.toFixed(3) : value;
  }
  
  // Integer stats
  return typeof value === 'number' ? Math.round(value) : value;
}

// Search players
function searchPlayers() {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }
  
  const query = searchQuery.value.toLowerCase();
  const results = draftStore.availablePlayers
    .filter(player => player.name.toLowerCase().includes(query))
    .slice(0, 10); // Limit to top 10 results
  
  searchResults.value = results;
}

// Add player to comparison
function addPlayer(player) {
  // Don't add if already in comparison
  if (selectedPlayers.value.some(p => p.id === player.id)) {
    return;
  }
  
  selectedPlayers.value.push(player);
  searchQuery.value = '';
  searchResults.value = [];
  showSearch.value = false;
}

// Remove player from comparison
function removePlayer(index) {
  selectedPlayers.value.splice(index, 1);
}

// Clear all players
function clearPlayers() {
  selectedPlayers.value = [];
}

// Get background color based on stat value ranking
function getStatBackgroundColor(playerIndex, stat) {
  if (selectedPlayers.value.length < 2) return '';
  
  // Get values for this stat from all players
  const values = selectedPlayers.value.map(player => {
    let value;
    if (activeTab.value === 'batting') {
      value = player.type === 'batter' || player.isTwoWayPlayer
        ? (player.stats?.[stat] || player.allStats?.[stat])
        : null;
    } else {
      if (player.type === 'pitcher') {
        value = player.stats?.[stat] || player.allStats?.[stat];
      } else if (player.isTwoWayPlayer && player.pitchingStats) {
        value = player.pitchingStats[stat];
      } else {
        value = null;
      }
    }
    return typeof value === 'number' ? value : null;
  });
  
  // Get value for current player
  const currentValue = values[playerIndex];
  if (currentValue === null) return '';
  
  // Filter out null values
  const validValues = values.filter(v => v !== null);
  if (validValues.length < 2) return '';
  
  // Determine if higher is better for this stat
  const isHigherBetter = !['ERA', 'WHIP', 'HR/9'].includes(stat);
  
  // Sort values
  const sortedValues = [...validValues].sort((a, b) => 
    isHigherBetter ? b - a : a - b
  );
  
  // Find rank of current value
  const rank = sortedValues.indexOf(currentValue);
  
  // Color based on rank
  if (rank === 0) return 'bg-green-100'; // Best
  if (rank === 1 && validValues.length > 2) return 'bg-green-50'; // 2nd best
  if (rank === validValues.length - 1) return 'bg-red-100'; // Worst
  
  return '';
}
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
        <h2 class="text-2xl font-bold">Player Comparison</h2>
        <div class="flex gap-2">
          <button 
            v-if="!showSearch"
            @click="showSearch = true" 
            class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Player
          </button>
          <button 
            v-if="selectedPlayers.length > 0"
            @click="clearPlayers" 
            class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Clear All
          </button>
          <button 
            @click="onClose" 
            class="p-2 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Player search area (shown when adding players) -->
      <div v-if="showSearch" class="p-4 border-b">
        <div class="flex gap-2 mb-4">
          <input
            v-model="searchQuery"
            @input="searchPlayers"
            type="text"
            placeholder="Search for players to compare..."
            class="flex-grow p-2 border rounded"
          />
          <button 
            @click="showSearch = false" 
            class="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
        
        <!-- Search results -->
        <div v-if="searchResults.length > 0" class="space-y-1 max-h-60 overflow-y-auto">
          <div 
            v-for="player in searchResults" 
            :key="player.id"
            class="flex justify-between items-center p-2 border rounded hover:bg-gray-50 cursor-pointer"
            @click="addPlayer(player)"
          >
            <div>
              <div class="font-medium">{{ player.name }}</div>
              <div class="text-xs text-gray-600">
                {{ player.team }} | {{ player.position }} | 
                ADP: {{ player.adp.toFixed(1) }}
              </div>
            </div>
            <button 
              class="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add
            </button>
          </div>
        </div>
        <div v-else-if="searchQuery" class="text-center text-gray-500 py-4">
          No players found matching "{{ searchQuery }}"
        </div>
      </div>
      
      <!-- Content area -->
      <div class="overflow-y-auto flex-grow">
        <!-- No players selected message -->
        <div v-if="selectedPlayers.length === 0" class="p-8 text-center text-gray-500">
          <p class="mb-4">No players selected for comparison.</p>
          <button 
            @click="showSearch = true" 
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Players
          </button>
        </div>
        
        <!-- Player comparison view -->
        <div v-else>
          <!-- Stat type tabs -->
          <div class="flex border-b">
            <button 
              :class="[
                'px-4 py-2 font-medium',
                activeTab === 'batting' 
                  ? 'border-b-2 border-blue-500 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              ]"
              @click="activeTab = 'batting'"
              :disabled="!hasBatters"
            >
              Batting Stats
            </button>
            <button 
              :class="[
                'px-4 py-2 font-medium',
                activeTab === 'pitching' 
                  ? 'border-b-2 border-blue-500 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              ]"
              @click="activeTab = 'pitching'"
              :disabled="!hasPitchers"
            >
              Pitching Stats
            </button>
          </div>
          
          <!-- Player cards -->
          <div class="flex overflow-x-auto p-4">
            <!-- Player columns -->
            <div 
              v-for="(player, index) in selectedPlayers" 
              :key="player.id" 
              class="flex-shrink-0 w-60 border rounded mr-4 overflow-hidden"
            >
              <!-- Player header -->
              <div class="bg-gray-100 p-3 flex flex-col relative">
                <button 
                  @click="removePlayer(index)" 
                  class="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200"
                  aria-label="Remove player"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <div class="font-bold">{{ player.name }}</div>
                <div class="text-sm text-gray-600">
                  {{ player.team }} | {{ player.position }}
                  <span v-if="player.isTwoWayPlayer" class="text-xs text-purple-600 ml-1">(2-Way)</span>
                </div>
                <div class="text-sm mt-1">
                  <span class="font-medium">ADP:</span> {{ player.adp.toFixed(1) }}
                </div>
                <div class="text-sm">
                  <span class="font-medium">Tier:</span> {{ player.tier }}
                </div>
              </div>
              
              <!-- Player stats -->
              <div>
                <div 
                  v-for="(stat, statIndex) in statsCategories" 
                  :key="`${player.id}-${stat}`"
                  :class="[
                    'py-2 px-3 flex justify-between',
                    statIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50',
                    getStatBackgroundColor(index, stat)
                  ]"
                >
                  <span class="text-sm font-medium">{{ stat }}</span>
                  <span class="text-sm">{{ formatStatValue(player, stat) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer buttons -->
      <div class="border-t p-4 flex justify-end">
        <button 
          @click="onClose" 
          class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>