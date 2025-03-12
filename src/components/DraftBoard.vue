<script setup>
import { ref, computed, onMounted } from 'vue';
import { useDraftStore } from '../stores/draftStore';

// Access the store
const draftStore = useDraftStore();

// Settings panel
const showSettings = ref(false);
const editedSettings = ref({
  totalTeams: 12,
  draftRounds: 23,
  yourTeamPosition: 3,
});

// Initialize on component mount
onMounted(() => {
  if (draftStore.players.length === 0) {
    draftStore.initialize();
  }
});

// Toggle settings panel
function toggleSettings() {
  showSettings.value = !showSettings.value;
  
  if (showSettings.value) {
    // Initialize edited settings with current values
    editedSettings.value = {
      totalTeams: draftStore.totalTeams,
      draftRounds: draftStore.draftRounds,
      yourTeamPosition: draftStore.yourTeamPosition,
    };
  }
}

// Save settings
function saveSettings() {
  draftStore.updateDraftSettings(editedSettings.value);
  showSettings.value = false;
}

// Edit team name
function editTeamName(index, event) {
  const newName = event.target.innerText.trim();
  if (newName) {
    draftStore.updateTeamName(index, newName);
  }
}

// Undo last pick
function undoLastPick() {
  draftStore.undoLastPick();
}

// Reset draft
function resetDraft() {
  if (confirm("Are you sure you want to reset the draft? This action cannot be undone.")) {
    draftStore.resetDraft();
  }
}
</script>

<template>
  <div class="draft-board">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold">Draft Board</h2>
      <div class="flex gap-2">
        <button 
          @click="toggleSettings" 
          class="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
        >
          Settings
        </button>
        <button 
          @click="resetDraft" 
          class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          Reset Draft
        </button>
      </div>
    </div>
    
    <!-- Settings Panel -->
    <div v-if="showSettings" class="mb-4 p-4 border rounded bg-gray-50">
      <h3 class="font-bold mb-2">Draft Settings</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium mb-1">Teams</label>
          <input
            v-model.number="editedSettings.totalTeams"
            type="number"
            min="8"
            max="16"
            class="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Rounds</label>
          <input
            v-model.number="editedSettings.draftRounds"
            type="number"
            min="10"
            max="30"
            class="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Your Draft Position</label>
          <input
            v-model.number="editedSettings.yourTeamPosition"
            type="number"
            :min="1"
            :max="editedSettings.totalTeams"
            class="w-full p-2 border rounded"
          />
        </div>
      </div>
      <div class="flex justify-end gap-2">
        <button 
          @click="showSettings = false" 
          class="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
        <button 
          @click="saveSettings" 
          class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save Settings
        </button>
      </div>
    </div>
    
    <!-- Current Pick Info -->
    <div class="mb-4 flex items-center justify-between">
      <div class="current-pick">
        <span class="font-bold">Round {{ draftStore.currentRound }}</span>
        <span class="mx-2">|</span>
        <span>Pick {{ draftStore.currentPick }} ({{ draftStore.teamNames[draftStore.currentTeamTurn] }})</span>
        <span v-if="draftStore.isYourTurn" class="ml-2 text-green-600 font-bold">
          YOUR PICK
        </span>
      </div>
      
      <div>
        <button 
          @click="undoLastPick" 
          class="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          :disabled="draftStore.draftedPlayers.length === 0"
        >
          Undo Last Pick
        </button>
      </div>
    </div>
    
    <!-- Draft board grid -->
    <div class="overflow-x-auto">
      <table class="min-w-full border">
        <thead>
          <tr class="bg-gray-100">
            <th class="w-16 border p-2">Round</th>
            <th 
              v-for="(teamName, index) in draftStore.teamNames.slice(0, draftStore.totalTeams)" 
              :key="`header-${index}`"
              class="border p-2 min-w-[120px]"
              :class="{'bg-blue-100': index + 1 === draftStore.yourTeamPosition}"
            >
              <span 
                contenteditable 
                @blur="editTeamName(index, $event)"
                class="block w-full outline-none"
              >{{ teamName }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(round, roundIndex) in draftStore.draftBoard" :key="`round-${roundIndex}`">
            <td class="border p-2 text-center font-bold">{{ roundIndex + 1 }}</td>
            <td 
              v-for="(pick, pickIndex) in round" 
              :key="`pick-${roundIndex}-${pickIndex}`"
              class="border p-2 h-12"
              :class="{
                'bg-blue-50': pickIndex === draftStore.yourTeamPosition - 1,
                'bg-green-100': pick && pick.teamIndex === draftStore.yourTeamPosition - 1
              }"
            >
              <template v-if="pick">
                <div class="text-sm font-semibold">{{ pick.player.name }}</div>
                <div class="text-xs text-gray-600">
                  {{ pick.player.team }} - {{ pick.player.position }}
                </div>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
