<script setup>
import { ref, computed, watch } from 'vue';

// Props for this component
const props = defineProps({
  player: {
    type: Object,
    required: true
  },
  onClose: {
    type: Function,
    required: true
  }
});

// For expanded sections
const expandedSections = ref({
  batting: true,
  pitching: false,
  advanced: false,
  projections: true
});

// Toggle section expansion
function toggleSection(section) {
  expandedSections.value[section] = !expandedSections.value[section];
}

// Handle player type for display
const isBatter = computed(() => props.player.type === 'batter');
const isPitcher = computed(() => props.player.type === 'pitcher');
const isTwoWayPlayer = computed(() => props.player.isTwoWayPlayer);

// Format a numeric value with decimal places
function formatValue(value, decimals = 0) {
  if (value === undefined || value === null) return '-';
  if (typeof value === 'number') {
    return value.toFixed(decimals);
  }
  return value;
}

// Get all stats for display
const allBattingStats = computed(() => {
  if (!props.player.allStats) return {};
  return props.player.allStats;
});

const allPitchingStats = computed(() => {
  if (!props.player.pitchingStats) return {};
  if (props.player.type === 'pitcher') return props.player.allStats;
  return {};
});

// Get the categories to display in each section
const battingCategories = computed(() => {
  return {
    standard: ['PA', 'AB', 'H', '2B', '3B', 'HR', 'R', 'RBI', 'SB', 'CS', 'BB', 'SO', 'AVG', 'OBP', 'SLG', 'OPS'],
    advanced: ['ISO', 'BABIP', 'wOBA', 'wRC+', 'WAR', 'BsR']
  };
});

const pitchingCategories = computed(() => {
  return {
    standard: ['W', 'L', 'ERA', 'G', 'GS', 'SV', 'IP', 'H', 'ER', 'HR', 'BB', 'SO', 'WHIP', 'K/9', 'BB/9'],
    advanced: ['FIP', 'xFIP', 'K%', 'BB%', 'BABIP', 'LOB%', 'WAR']
  };
});

// CSS classes for card background based on player tier
const cardClass = computed(() => {
  const tier = props.player.tier;
  if (tier === 1) return 'bg-amber-50 border-amber-200';
  if (tier === 2) return 'bg-emerald-50 border-emerald-200';
  if (tier <= 4) return 'bg-blue-50 border-blue-200';
  return 'bg-white border-gray-200';
});
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
        <h2 class="text-2xl font-bold">{{ player.name }}</h2>
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
      
      <!-- Player information scrollable area -->
      <div class="overflow-y-auto p-4 flex-grow">
        <!-- Player card -->
        <div :class="['border rounded-lg p-4 mb-6', cardClass]">
          <div class="flex flex-wrap justify-between">
            <div class="mb-4 mr-6">
              <h3 class="text-lg font-bold">{{ player.name }}</h3>
              <div class="text-sm text-gray-600">
                {{ player.team }} | {{ player.position }}
                <span v-if="player.positions && player.positions.length > 1">
                  ({{ player.positions.join(', ') }})
                </span>
              </div>
              <div class="text-sm mt-1">
                <span class="font-medium">Status:</span> {{ player.rosterStatus }}
              </div>
              <div class="text-sm">
                <span class="font-medium">Age:</span> {{ player.age }}
                <span v-if="player.serviceTime" class="ml-2">
                  <span class="font-medium">Service Time:</span> {{ player.serviceTime }}
                </span>
              </div>
            </div>
            
            <div class="flex flex-col items-end mb-4">
              <div class="text-sm">
                <span class="font-medium">ADP:</span> {{ formatValue(player.adp, 1) }}
              </div>
              <div class="text-sm">
                <span class="font-medium">Tier:</span> {{ player.tier }}
              </div>
              <div class="text-sm">
                <span class="font-medium">Projected Points:</span> {{ formatValue(player.projectedPoints, 0) }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Batting Stats Section (shown for batters and two-way players) -->
        <div v-if="isBatter || isTwoWayPlayer" class="mb-6">
          <div 
            class="flex justify-between items-center mb-2 bg-gray-100 p-2 rounded cursor-pointer"
            @click="toggleSection('batting')"
          >
            <h3 class="font-bold">Batting Statistics</h3>
            <span>{{ expandedSections.batting ? '▼' : '▶' }}</span>
          </div>
          
          <div v-if="expandedSections.batting" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th 
                    v-for="(category, index) in battingCategories.standard" 
                    :key="`batting-${index}`"
                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {{ category }}
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr>
                  <td 
                    v-for="(category, index) in battingCategories.standard" 
                    :key="`batting-val-${index}`"
                    class="px-3 py-2 whitespace-nowrap text-sm"
                  >
                    {{ formatValue(
                      allBattingStats[category] || 
                      (player.stats && player.stats[category]), 
                      ['AVG', 'OBP', 'SLG', 'OPS', 'ISO', 'BABIP', 'wOBA'].includes(category) ? 3 : 0
                    ) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Pitching Stats Section (shown for pitchers and two-way players) -->
        <div v-if="isPitcher || isTwoWayPlayer" class="mb-6">
          <div 
            class="flex justify-between items-center mb-2 bg-gray-100 p-2 rounded cursor-pointer"
            @click="toggleSection('pitching')"
          >
            <h3 class="font-bold">Pitching Statistics</h3>
            <span>{{ expandedSections.pitching ? '▼' : '▶' }}</span>
          </div>
          
          <div v-if="expandedSections.pitching" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th 
                    v-for="(category, index) in pitchingCategories.standard" 
                    :key="`pitching-${index}`"
                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {{ category }}
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr>
                  <td 
                    v-for="(category, index) in pitchingCategories.standard" 
                    :key="`pitching-val-${index}`"
                    class="px-3 py-2 whitespace-nowrap text-sm"
                  >
                    {{ formatValue(
                      (isTwoWayPlayer && player.pitchingStats) ? player.pitchingStats[category] : 
                      (allPitchingStats[category] || (player.stats && player.stats[category])), 
                      ['ERA', 'WHIP', 'K/9', 'BB/9', 'FIP', 'xFIP'].includes(category) ? 2 : 0
                    ) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Advanced Statistics Section -->
        <div class="mb-6">
          <div 
            class="flex justify-between items-center mb-2 bg-gray-100 p-2 rounded cursor-pointer"
            @click="toggleSection('advanced')"
          >
            <h3 class="font-bold">Advanced Statistics</h3>
            <span>{{ expandedSections.advanced ? '▼' : '▶' }}</span>
          </div>
          
          <div v-if="expandedSections.advanced">
            <!-- Batters -->
            <div v-if="isBatter || isTwoWayPlayer" class="mb-4 overflow-x-auto">
              <h4 class="font-medium mb-2">Batting Advanced Stats</h4>
              <table class="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th 
                      v-for="(category, index) in battingCategories.advanced" 
                      :key="`batting-adv-${index}`"
                      class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {{ category }}
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr>
                    <td 
                      v-for="(category, index) in battingCategories.advanced" 
                      :key="`batting-adv-val-${index}`"
                      class="px-3 py-2 whitespace-nowrap text-sm"
                    >
                      {{ formatValue(
                        allBattingStats[category] || 
                        (player.stats && player.stats[category]), 
                        ['ISO', 'BABIP', 'wOBA'].includes(category) ? 3 : 
                        ['WAR', 'BsR'].includes(category) ? 1 : 0
                      ) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- Pitchers -->
            <div v-if="isPitcher || isTwoWayPlayer" class="overflow-x-auto">
              <h4 class="font-medium mb-2">Pitching Advanced Stats</h4>
              <table class="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th 
                      v-for="(category, index) in pitchingCategories.advanced" 
                      :key="`pitching-adv-${index}`"
                      class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {{ category }}
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr>
                    <td 
                      v-for="(category, index) in pitchingCategories.advanced" 
                      :key="`pitching-adv-val-${index}`"
                      class="px-3 py-2 whitespace-nowrap text-sm"
                    >
                      {{ formatValue(
                        allPitchingStats[category] || 
                        (player.stats && player.stats[category]), 
                        ['FIP', 'xFIP', 'BABIP', 'LOB%'].includes(category) ? 3 : 
                        ['WAR'].includes(category) ? 1 :
                        ['K%', 'BB%'].includes(category) ? 1 : 0
                      ) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- All Raw Stats (for debugging) -->
        <div v-if="false" class="mb-6">
          <div 
            class="flex justify-between items-center mb-2 bg-gray-100 p-2 rounded cursor-pointer"
            @click="toggleSection('raw')"
          >
            <h3 class="font-bold">Raw Data</h3>
            <span>{{ expandedSections.raw ? '▼' : '▶' }}</span>
          </div>
          
          <div v-if="expandedSections.raw">
            <pre class="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-60">{{ player }}</pre>
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