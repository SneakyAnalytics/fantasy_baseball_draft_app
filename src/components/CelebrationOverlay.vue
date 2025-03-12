<script setup>
import { ref, computed, onMounted, watch } from 'vue';

// Props for this component
const props = defineProps({
  player: {
    type: Object,
    required: true
  },
  team: {
    type: String,
    default: 'mets', // 'mets' or 'padres'
    validator: (value) => ['mets', 'padres'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000 // milliseconds
  },
  onClose: {
    type: Function,
    required: true
  }
});

// State
const visible = ref(true);
const randomQuote = ref('');

// Baseball celebration quotes
const quotes = [
  "Home run! What a pick!",
  "That's a grand slam of a draft pick!",
  "Knocking it out of the park with this selection!",
  "A clutch pick in the late innings!",
  "That's a five-star prospect right there!",
  "Going, going, gone! Great pick!",
  "Swing and a hit! Perfect selection!",
  "That's a high-leverage draft pick!",
  "Talk about a power move!",
  "Hitting for the cycle with that selection!",
  "Projecting for a high WAR with this pick!",
  "That's what we call a diamond in the rough!",
  "Stepping up to the plate with a great selection!",
  "Scouting department approves this pick!",
  "World Series contender right there!"
];

// Get random image based on pick number
const celebrationImage = computed(() => {
  // Check if there's a specific pick image
  const pickNum = getPick();
  
  try {
    if (pickNum) {
      // Try to load a specific image for this pick number
      return new URL(`../assets/images/${props.team}/pick_${pickNum}_pic.jpeg`, import.meta.url).href;
    } else {
      // If no specific pick image, get a random team image
      const teamImages = props.team === 'mets' 
        ? ['apple.jpeg', 'mr_met.jpeg', 'mr_met_2.png', 'mr_met_3.jpeg', 'citi.jpeg', 'citi-pic2.jpg'] 
        : ['friar.jpeg', 'friar_2.jpeg', 'friar_3.jpeg', 'friar_4.jpeg', 'petco.jpeg', 'petco_2.jpeg', 'petco_3.jpeg'];
      
      const randomIndex = Math.floor(Math.random() * teamImages.length);
      return new URL(`../assets/images/${props.team}/${teamImages[randomIndex]}`, import.meta.url).href;
    }
  } catch (e) {
    // Fallback to team logo if specific image not found
    console.error("Image not found:", e);
    return props.team === 'mets' 
      ? new URL('../assets/images/mets/mets_logo.png', import.meta.url).href
      : new URL('../assets/images/padres/sd_image.png', import.meta.url).href;
  }
});

// Team colors
const teamColors = computed(() => {
  return props.team === 'mets' 
    ? { 
        primary: 'bg-[#FF5910]', // Mets Orange
        secondary: 'bg-[#002D72]', // Mets Blue
        text: 'text-[#002D72]',
        textAlt: 'text-[#FF5910]'
      }
    : {
        primary: 'bg-[#2F241D]', // Padres Brown
        secondary: 'bg-[#FFC425]', // Padres Gold
        text: 'text-[#2F241D]',
        textAlt: 'text-[#FFC425]'
      };
});

// Get current pick number (for specific images)
function getPick() {
  // Get last 2 digits of player ID or use random number between 1-20
  if (props.player && props.player.id) {
    const id = props.player.id;
    const lastTwoDigits = id.slice(-2).replace(/\D/g, '');
    const pickNum = parseInt(lastTwoDigits);
    
    // If valid number between 1-21, use it
    if (!isNaN(pickNum) && pickNum >= 1 && pickNum <= 21) {
      return pickNum;
    }
  }
  
  // Fallback to random number between 1-20
  return Math.floor(Math.random() * 20) + 1;
}

// Set random quote on mount
onMounted(() => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  randomQuote.value = quotes[randomIndex];
  
  // Auto close after duration
  setTimeout(() => {
    if (visible.value) {
      visible.value = false;
      props.onClose();
    }
  }, props.duration);
});
</script>

<template>
  <div v-if="visible" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
    <div class="max-w-2xl w-full p-6 rounded-lg text-center transform transition-all animate-celebration">
      <!-- Player name header -->
      <h2 
        class="text-4xl font-bold mb-4 py-2 px-4 rounded-lg text-white"
        :class="teamColors.primary"
      >
        {{ player.name }}
      </h2>
      
      <!-- Image -->
      <div class="relative mb-4 overflow-hidden rounded-lg shadow-lg">
        <img 
          :src="celebrationImage" 
          alt="Celebration image" 
          class="w-full max-h-96 object-cover"
        />
        
        <div 
          class="absolute bottom-0 left-0 right-0 p-4 text-xl font-bold"
          :class="[teamColors.primary, player.team === 'NYM' ? 'text-white' : 'text-white']"
        >
          {{ player.team }} | {{ player.position }}
        </div>
      </div>
      
      <!-- Quote -->
      <div 
        class="text-2xl font-bold p-3 rounded-lg mb-4 animate-pulse-slow"
        :class="[teamColors.secondary, teamColors.text]"
      >
        "{{ randomQuote }}"
      </div>
      
      <!-- Player stats -->
      <div class="bg-white bg-opacity-90 p-4 rounded-lg text-left">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="font-bold">ADP: {{ player.adp.toFixed(1) }}</div>
            <div>Projected Points: {{ Math.round(player.projectedPoints) }}</div>
          </div>
          <div>
            <div class="font-bold">Tier: {{ player.tier }}</div>
            <div>Status: {{ player.rosterStatus || 'Unknown' }}</div>
          </div>
        </div>
      </div>
      
      <!-- Close button -->
      <button 
        @click="visible = false; onClose()" 
        class="mt-4 px-4 py-2 rounded-lg text-white font-bold"
        :class="teamColors.secondary"
      >
        Close
      </button>
    </div>
  </div>
</template>

<style scoped>
.animate-celebration {
  animation: celebration 0.5s ease-out;
}

.animate-pulse-slow {
  animation: pulse 2s infinite;
}

@keyframes celebration {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  70% {
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
</style>