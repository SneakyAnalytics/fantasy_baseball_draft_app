<script setup>
import { onMounted, ref } from 'vue';
import { useDraftStore } from './stores/draftStore';
import DraftBoard from "./components/DraftBoard.vue";
import PlayerList from "./components/PlayerList.vue";
import TeamRoster from "./components/TeamRoster.vue";
import DraftCelebration from "./components/DraftCelebration.vue";

// Team images
import metsLogo from './assets/images/mets/mets_logo.png';
import padresLogo from './assets/images/padres/sd_image.png';

// Initialize the store
const draftStore = useDraftStore();

// Theme state
const theme = ref('mets'); // default theme

// Toggle theme function
const toggleTheme = () => {
  theme.value = theme.value === 'mets' ? 'padres' : 'mets';
};

onMounted(() => {
  // Load player data and saved draft state
  draftStore.initialize();
  draftStore.loadDraftState();
});
</script>

<template>
  <div class="min-h-screen" :class="theme === 'mets' ? 'bg-mets-light' : 'bg-padres-light'">
    <!-- Celebration Overlay -->
    <DraftCelebration :theme="theme" />
    
    <header :class="theme === 'mets' ? 'bg-mets-blue' : 'bg-padres-brown'" class="text-white p-4 shadow-md">
      <div class="container mx-auto flex items-center justify-between">
        <div class="flex items-center">
          <img :src="theme === 'mets' ? metsLogo : padresLogo" alt="Team Logo" class="h-12 mr-4">
          <div>
            <h1 class="text-3xl font-bold">Fantasy Baseball Draft Tool</h1>
            <p :class="theme === 'mets' ? 'text-mets-light' : 'text-padres-light'">
              Plan your draft strategy with real-time data
            </p>
          </div>
        </div>
        <button 
          @click="toggleTheme" 
          :class="theme === 'mets' 
            ? 'bg-mets-orange hover:bg-mets-orange/80' 
            : 'bg-padres-gold hover:bg-padres-gold/80'"
          class="px-4 py-2 rounded font-bold text-white">
          Switch to {{ theme === 'mets' ? 'Padres' : 'Mets' }} Theme
        </button>
      </div>
    </header>
    
    <main class="container mx-auto px-4 py-6">
      <!-- Mobile view: Stack all components -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Draft Board - full width on larger screens -->
        <div class="lg:col-span-3 bg-white p-4 rounded shadow" 
          :class="theme === 'mets' ? 'border-mets-blue border-t-4' : 'border-padres-brown border-t-4'">
          <DraftBoard />
        </div>
        
        <!-- Player List - takes 2 columns on larger screens -->
        <div class="lg:col-span-2 bg-white p-4 rounded shadow"
          :class="theme === 'mets' ? 'border-mets-orange border-t-4' : 'border-padres-gold border-t-4'">
          <PlayerList />
        </div>
        
        <!-- Team Roster - takes 1 column on larger screens -->
        <div class="bg-white p-4 rounded shadow"
          :class="theme === 'mets' ? 'border-mets-blue border-t-4' : 'border-padres-brown border-t-4'">
          <TeamRoster />
        </div>
      </div>
    </main>
    
    <footer :class="theme === 'mets' ? 'bg-mets-blue/10' : 'bg-padres-brown/10'" class="border-t mt-8 py-4">
      <div class="container mx-auto px-4 text-center text-gray-600 text-sm">
        <p>Fantasy Baseball Draft Tool - Created for the 2025 Draft Season</p>
        <p class="mt-1">
          Data sourced from FanGraphs projections - Built with Vue.js and Tailwind CSS
        </p>
      </div>
    </footer>
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
}
</style>
