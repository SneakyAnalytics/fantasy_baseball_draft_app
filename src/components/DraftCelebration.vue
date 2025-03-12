<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useDraftStore } from '../stores/draftStore';

// Import Mets celebration images
import metsImg1 from '../assets/images/mets/mr_met.jpeg';
import metsImg2 from '../assets/images/mets/mr_met_2.png';
import metsImg3 from '../assets/images/mets/mr_met_3.jpeg';
import metsImg4 from '../assets/images/mets/apple.jpeg';
import metsImg5 from '../assets/images/mets/citi.jpeg';

// Import Padres celebration images
import padresImg1 from '../assets/images/padres/friar.jpeg';
import padresImg2 from '../assets/images/padres/friar_2.jpeg';
import padresImg3 from '../assets/images/padres/friar_3.jpeg';
import padresImg4 from '../assets/images/padres/friar_4.jpeg';
import padresImg5 from '../assets/images/padres/petco.jpeg';

const draftStore = useDraftStore();

// Get current theme from parent
const props = defineProps({
  theme: {
    type: String,
    default: 'mets'
  }
});

// Arrays of team-specific celebration images
const metsImages = [metsImg1, metsImg2, metsImg3, metsImg4, metsImg5];
const padresImages = [padresImg1, padresImg2, padresImg3, padresImg4, padresImg5];

// Select random image based on current theme
const randomImage = ref(null);
const celebrationOpacity = ref(0);

// Display current celebration image based on theme
const currentImages = computed(() => {
  return props.theme === 'mets' ? metsImages : padresImages;
});

// Determine if player is a pitcher
const isPitcher = computed(() => {
  if (!draftStore.celebrationPlayer) return false;
  
  // Check if position is SP or RP
  if (draftStore.celebrationPlayer.position === 'SP' || draftStore.celebrationPlayer.position === 'RP') {
    return true;
  }
  
  // Check positions array if it exists
  if (draftStore.celebrationPlayer.positions) {
    return draftStore.celebrationPlayer.positions.includes('SP') || 
           draftStore.celebrationPlayer.positions.includes('RP');
  }
  
  return false;
});

// Show celebration when store updates
watch(() => draftStore.showCelebration, (newValue) => {
  if (newValue) {
    showRandomImage();
    // No longer automatically closing
  }
});

// Display a random celebration image with animation
function showRandomImage() {
  // Reset opacity
  celebrationOpacity.value = 0;
  
  // Get a random image from the current theme's image set
  const randomIndex = Math.floor(Math.random() * currentImages.value.length);
  randomImage.value = currentImages.value[randomIndex];
  
  // Animate the image to fade in
  setTimeout(() => {
    celebrationOpacity.value = 1;
  }, 50);
  
  // No longer fading out automatically
}

// Initial setup
onMounted(() => {
  const randomIndex = Math.floor(Math.random() * currentImages.value.length);
  randomImage.value = currentImages.value[randomIndex];
});
</script>

<template>
  <div v-if="draftStore.showCelebration" 
       class="fixed inset-0 flex items-center justify-center z-50 bg-black/60"
       @click="draftStore.closeCelebration">
    
    <div class="text-center p-8 rounded-lg max-w-2xl">
      <!-- Player name -->
      <h2 class="text-4xl font-bold mb-4 text-white drop-shadow-lg">
        {{ draftStore.celebrationPlayer?.name }} Drafted!
      </h2>
      
      <!-- Celebration image -->
      <div class="relative">
        <img 
          :src="randomImage" 
          :style="{opacity: celebrationOpacity}" 
          class="mx-auto max-h-96 rounded-lg shadow-2xl transition-opacity duration-500"
          alt="Celebration image" 
        />
      </div>
      
      <!-- Position and stats -->
      <div class="mt-4 text-white text-xl">
        <p class="font-bold mb-2">{{ draftStore.celebrationPlayer?.position }}</p>
        <!-- Batting stats for position players -->
        <p v-if="draftStore.celebrationPlayer?.stats && isPitcher === false">
          {{ draftStore.celebrationPlayer.stats.AVG ?? '---' }} AVG | 
          {{ draftStore.celebrationPlayer.stats.HR ?? '---' }} HR | 
          {{ draftStore.celebrationPlayer.stats.RBI ?? '---' }} RBI | 
          {{ draftStore.celebrationPlayer.stats.SB ?? '---' }} SB
        </p>
        <!-- Pitching stats for pitchers -->
        <p v-if="draftStore.celebrationPlayer?.stats && isPitcher === true">
          {{ draftStore.celebrationPlayer.stats.ERA ?? '---' }} ERA | 
          {{ draftStore.celebrationPlayer.stats.WHIP ?? '---' }} WHIP | 
          {{ draftStore.celebrationPlayer.stats.W ?? '---' }} W | 
          {{ draftStore.celebrationPlayer.stats.SO ?? '---' }} K
        </p>
      </div>
      
      <!-- Dismiss button -->
      <button 
        @click="draftStore.closeCelebration"
        class="mt-6 px-6 py-2 text-xl font-bold text-white rounded-full border-2 border-white hover:bg-white/20 transition-colors"
        :class="props.theme === 'mets' ? 'bg-mets-orange' : 'bg-padres-gold'"
      >
        Continue Drafting
      </button>
      
      <p class="mt-3 text-white/75 text-sm">
        Click anywhere to dismiss
      </p>
    </div>
  </div>
</template>