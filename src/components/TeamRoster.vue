<script setup>
import { ref, computed, onMounted } from 'vue';
import { useDraftStore } from '../stores/draftStore';

// Access the store
const draftStore = useDraftStore();

// Position move UI state
const movingPlayer = ref(null);
const targetPosition = ref(null);
const showPositionMove = ref(false);

// Position list for batters and pitchers
const batterPositions = ['C', '1B', '2B', '3B', 'SS', 'OF', 'UTIL', 'BN'];
const pitcherPositions = ['SP', 'RP', 'BN'];

// Open position move dialog
function startMovePlayer(player) {
  movingPlayer.value = player;
  targetPosition.value = player.position;
  showPositionMove.value = true;
}

// Move player to a different position
function movePlayer() {
  if (movingPlayer.value && targetPosition.value) {
    draftStore.movePlayerPosition(movingPlayer.value.playerId, targetPosition.value);
    showPositionMove.value = false;
    movingPlayer.value = null;
  }
}

// Get valid positions for a player
function getValidPositionsForPlayer(player) {
  // The player object in our roster has a playerData property with the original player info
  const playerData = player.playerData;
  
  // Get default positions from the player (could be array or single string)
  const defaultPositions = playerData.positions || [playerData.position];
  
  // Always allow moving to bench
  if (!defaultPositions.includes('BN')) {
    defaultPositions.push('BN');
  }
  
  // Special case for UTIL, which any batter can fill
  if (playerData.type === 'batter' && !defaultPositions.includes('UTIL')) {
    defaultPositions.push('UTIL');
  }
  
  return defaultPositions;
}

// Check if a position can be shown for this player
function isValidPosition(player, position) {
  return getValidPositionsForPlayer(player).includes(position);
}
</script>

<template>
  <div class="team-roster">
    <h2 class="text-2xl font-bold mb-4">My Team</h2>
    
    <!-- Position Move Dialog -->
    <div v-if="showPositionMove" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
      <div class="bg-white p-4 rounded shadow-lg max-w-md w-full">
        <h3 class="font-bold mb-4">Move Player Position</h3>
        <div class="mb-4">
          <div class="font-medium">{{ movingPlayer?.playerData.name }}</div>
          <div class="text-sm text-gray-600">
            {{ movingPlayer?.playerData.team }} | Current: {{ movingPlayer?.position }}
          </div>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">New Position</label>
          <select 
            v-model="targetPosition" 
            class="w-full p-2 border rounded"
          >
            <option 
              v-for="pos in getValidPositionsForPlayer(movingPlayer)" 
              :key="pos" 
              :value="pos"
            >
              {{ pos }}
            </option>
          </select>
        </div>
        
        <div class="flex justify-end gap-2">
          <button 
            @click="showPositionMove = false" 
            class="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button 
            @click="movePlayer" 
            class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Move
          </button>
        </div>
      </div>
    </div>
    
    <!-- Roster progress -->
    <div class="mb-4 p-3 bg-gray-50 rounded">
      <div class="flex justify-between mb-1">
        <span class="font-medium">Roster</span>
        <span>{{ draftStore.filledRosterSpots }} / {{ draftStore.totalRosterSpots }}</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          class="bg-blue-600 h-2.5 rounded-full" 
          :style="{width: `${(draftStore.filledRosterSpots / draftStore.totalRosterSpots) * 100}%`}"
        ></div>
      </div>
    </div>
    
    <!-- Roster positions -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <h3 class="font-bold mb-2">Batters</h3>
        <div 
          v-for="position in ['C', '1B', '2B', '3B', 'SS', 'OF', 'UTIL']" 
          :key="position"
          class="mb-2"
        >
          <div class="flex justify-between text-sm font-medium mb-1">
            <span>{{ position }}</span>
            <span>{{ draftStore.filledPositions[position] || 0 }} / {{ draftStore.rosterConfig[position] }}</span>
          </div>
          
          <!-- For each filled spot in this position -->
          <template v-if="draftStore.filledPositions[position] > 0">
            <div 
              v-for="player in draftStore.yourRoster.filter(p => p.position === position)"
              :key="player.playerId"
              class="p-2 bg-white border rounded mb-1 flex justify-between items-center"
              :class="{'bg-green-50': player.playerData.tier <= 2}"
            >
              <div>
                <div class="font-medium">{{ player.playerData.name }}</div>
                <div class="text-xs text-gray-600">
                  {{ player.playerData.team }} | ADP: {{ player.playerData.adp.toFixed(1) }}
                </div>
              </div>
              <button 
                @click="startMovePlayer(player)" 
                class="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
              >
                Move
              </button>
            </div>
          </template>
          
          <!-- Empty spots -->
          <template v-for="i in draftStore.availableSlots[position]" :key="`empty-${position}-${i}`">
            <div class="p-2 border border-dashed rounded mb-1 text-center text-gray-400">
              Empty {{ position }} Slot
            </div>
          </template>
        </div>
      </div>
      
      <div>
        <h3 class="font-bold mb-2">Pitchers</h3>
        <div 
          v-for="position in ['SP', 'RP']" 
          :key="position"
          class="mb-2"
        >
          <div class="flex justify-between text-sm font-medium mb-1">
            <span>{{ position }}</span>
            <span>{{ draftStore.filledPositions[position] || 0 }} / {{ draftStore.rosterConfig[position] }}</span>
          </div>
          
          <!-- For each filled spot in this position -->
          <template v-if="draftStore.filledPositions[position] > 0">
            <div 
              v-for="player in draftStore.yourRoster.filter(p => p.position === position)"
              :key="player.playerId"
              class="p-2 bg-white border rounded mb-1 flex justify-between items-center"
              :class="{'bg-green-50': player.playerData.tier <= 2}"
            >
              <div>
                <div class="font-medium">{{ player.playerData.name }}</div>
                <div class="text-xs text-gray-600">
                  {{ player.playerData.team }} | ADP: {{ player.playerData.adp.toFixed(1) }}
                </div>
              </div>
              <button 
                @click="startMovePlayer(player)" 
                class="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
              >
                Move
              </button>
            </div>
          </template>
          
          <!-- Empty spots -->
          <template v-for="i in draftStore.availableSlots[position]" :key="`empty-${position}-${i}`">
            <div class="p-2 border border-dashed rounded mb-1 text-center text-gray-400">
              Empty {{ position }} Slot
            </div>
          </template>
        </div>
        
        <h3 class="font-bold mb-2 mt-4">Bench</h3>
        <div class="mb-2">
          <div class="flex justify-between text-sm font-medium mb-1">
            <span>BN</span>
            <span>{{ draftStore.filledPositions['BN'] || 0 }} / {{ draftStore.rosterConfig['BN'] }}</span>
          </div>
          
          <!-- For each filled bench spot -->
          <template v-if="draftStore.filledPositions['BN'] > 0">
            <div 
              v-for="player in draftStore.yourRoster.filter(p => p.position === 'BN')"
              :key="player.playerId"
              class="p-2 bg-white border rounded mb-1 flex justify-between items-center"
              :class="{'bg-green-50': player.playerData.tier <= 2}"
            >
              <div>
                <div class="font-medium">{{ player.playerData.name }}</div>
                <div class="text-xs text-gray-600">
                  {{ player.playerData.team }} - {{ player.playerData.position }} | 
                  ADP: {{ player.playerData.adp.toFixed(1) }}
                </div>
              </div>
              <button 
                @click="startMovePlayer(player)" 
                class="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
              >
                Move
              </button>
            </div>
          </template>
          
          <!-- Empty bench spots -->
          <template v-for="i in draftStore.availableSlots['BN']" :key="`empty-BN-${i}`">
            <div class="p-2 border border-dashed rounded mb-1 text-center text-gray-400">
              Empty Bench Slot
            </div>
          </template>
        </div>
      </div>
    </div>
    
    <!-- Projected Stats -->
    <div>
      <h3 class="font-bold mb-2">Projected Totals</h3>
      <div class="grid grid-cols-5 gap-2">
        <div class="p-2 bg-gray-50 rounded text-center">
          <div class="text-sm font-medium">HR</div>
          <div class="text-lg">{{ Math.round(draftStore.statTotals.HR) }}</div>
        </div>
        <div class="p-2 bg-gray-50 rounded text-center">
          <div class="text-sm font-medium">R</div>
          <div class="text-lg">{{ Math.round(draftStore.statTotals.R) }}</div>
        </div>
        <div class="p-2 bg-gray-50 rounded text-center">
          <div class="text-sm font-medium">RBI</div>
          <div class="text-lg">{{ Math.round(draftStore.statTotals.RBI) }}</div>
        </div>
        <div class="p-2 bg-gray-50 rounded text-center">
          <div class="text-sm font-medium">SB</div>
          <div class="text-lg">{{ Math.round(draftStore.statTotals.SB) }}</div>
        </div>
        <div class="p-2 bg-gray-50 rounded text-center">
          <div class="text-sm font-medium">AVG</div>
          <div class="text-lg">{{ draftStore.statTotals.AVG.toFixed(3) }}</div>
        </div>
        <div class="p-2 bg-gray-50 rounded text-center">
          <div class="text-sm font-medium">W</div>
          <div class="text-lg">{{ Math.round(draftStore.statTotals.W) }}</div>
        </div>
        <div class="p-2 bg-gray-50 rounded text-center">
          <div class="text-sm font-medium">SV</div>
          <div class="text-lg">{{ Math.round(draftStore.statTotals.SV) }}</div>
        </div>
        <div class="p-2 bg-gray-50 rounded text-center">
          <div class="text-sm font-medium">SO</div>
          <div class="text-lg">{{ Math.round(draftStore.statTotals.SO) }}</div>
        </div>
        <div class="p-2 bg-gray-50 rounded text-center">
          <div class="text-sm font-medium">ERA</div>
          <div class="text-lg">{{ draftStore.statTotals.ERA.toFixed(2) }}</div>
        </div>
        <div class="p-2 bg-gray-50 rounded text-center">
          <div class="text-sm font-medium">WHIP</div>
          <div class="text-lg">{{ draftStore.statTotals.WHIP.toFixed(2) }}</div>
        </div>
      </div>
    </div>
    
    <!-- Position Scarcity -->
    <div class="mt-6">
      <h3 class="font-bold mb-2">Position Scarcity</h3>
      <div class="grid grid-cols-10 gap-1">
        <div 
          v-for="(pos, index) in Object.keys(draftStore.positionScarcity.counts).sort()" 
          :key="`scarcity-${index}`"
          class="p-2 rounded text-center"
          :class="{
            'bg-red-100': draftStore.positionScarcity.scarcityScore[pos] > 7,
            'bg-yellow-100': draftStore.positionScarcity.scarcityScore[pos] > 4 && draftStore.positionScarcity.scarcityScore[pos] <= 7,
            'bg-green-100': draftStore.positionScarcity.scarcityScore[pos] <= 4
          }"
        >
          <div class="text-xs font-medium">{{ pos }}</div>
          <div class="text-sm">{{ draftStore.positionScarcity.counts[pos] }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
