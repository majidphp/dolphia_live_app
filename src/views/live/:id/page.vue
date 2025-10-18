<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMatchDetailStore, type MatchEvent } from '@/stores/pages/match-detail'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Goal, AlertTriangle, AlertOctagon, Brain, ArrowLeftRight, Target, Circle } from 'lucide-vue-next'
import { format } from 'date-fns'

const route = useRoute()
const store = useMatchDetailStore()

const matchId = computed(() => Number(route.params.id))

const formatTime = (dateTimeStr: string) => {
  try {
    const utcDate = new Date(dateTimeStr + ' UTC')
    return format(utcDate, 'hh:mm a')
  } catch (e) {
    return dateTimeStr
  }
}

const getEventIcon = (type: string, detail?: string) => {
  if (type === 'Goal' || detail?.includes('Goal')) return Goal
  if (type === 'Card' && detail?.includes('Yellow')) return AlertTriangle
  if (type === 'Card' && detail?.includes('Red')) return AlertOctagon
  if (type === 'Var') return Brain
  if (type === 'subst') return ArrowLeftRight
  if (detail?.includes('Penalty')) return Target
  return Circle
}

const getEventStyle = (event: MatchEvent) => {
  const type = event.type
  const detail = event.detail || ''

  // Goal events - vibrant celebration colors
  if (type === 'Goal' || detail.includes('Goal')) {
    return {
      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.08) 100%)',
      borderColor: '#10b981',
      glowColor: 'rgba(16, 185, 129, 0.4)'
    }
  }

  // Yellow card - warning color
  if (type === 'Card' && detail.includes('Yellow')) {
    return {
      background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.15) 0%, rgba(234, 179, 8, 0.08) 100%)',
      borderColor: '#eab308',
      glowColor: 'rgba(234, 179, 8, 0.4)'
    }
  }

  // Red card - danger color
  if (type === 'Card' && detail.includes('Red')) {
    return {
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.08) 100%)',
      borderColor: '#dc2626',
      glowColor: 'rgba(220, 38, 38, 0.4)'
    }
  }

  // VAR - tech purple
  if (type === 'Var') {
    return {
      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(147, 51, 234, 0.08) 100%)',
      borderColor: '#9333ea',
      glowColor: 'rgba(147, 51, 234, 0.4)'
    }
  }

  // Substitution - blue
  if (type === 'subst') {
    return {
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.08) 100%)',
      borderColor: '#2563eb',
      glowColor: 'rgba(37, 99, 235, 0.4)'
    }
  }

  // Penalty - orange
  if (detail.includes('Penalty')) {
    return {
      background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(234, 88, 12, 0.08) 100%)',
      borderColor: '#ea580c',
      glowColor: 'rgba(234, 88, 12, 0.4)'
    }
  }

  // Default - cyan (team color based)
  const teamColor = store.match && event.team_id === store.match.team1_id ? '#00c8ff' : '#ff3d8c'
  return {
    background: `linear-gradient(135deg, ${teamColor}20 0%, ${teamColor}08 100%)`,
    borderColor: teamColor,
    glowColor: `${teamColor}66`
  }
}

onMounted(() => {
  store.startPolling(matchId.value)
})

onUnmounted(() => {
  store.cleanup()
})
</script>

<template>
  <div class="container mx-auto p-4 max-w-2xl">
    <!-- Loading state for match -->
    <div v-if="store.loading.match && !store.match" class="flex flex-col items-center justify-center mt-12 opacity-60">
      <Loader2 class="w-8 h-8 animate-spin text-[#00c8ff]" />
      <p class="mt-2 text-sm">Loading match details...</p>
    </div>

    <!-- Match card -->
    <Card
      v-if="store.match"
      class="mb-4 border-[rgba(0,200,255,0.2)] bg-[rgba(0,200,255,0.08)]"
    >
      <CardContent class="p-4">
        <div class="flex justify-between items-center mb-2">
          <div class="flex items-center gap-2 flex-1">
            <img
              :src="store.match.team1_flag"
              :alt="store.match.team1_name"
              class="w-6 h-6 rounded-full object-cover border border-white/10"
            />
            <span class="font-semibold text-sm">{{ store.match.team1_name }}</span>
          </div>

          <div class="px-4 text-lg font-bold text-[#00c8ff] drop-shadow-[0_0_8px_rgba(0,200,255,0.6)]">
            {{ store.match.team1_score }} - {{ store.match.team2_score }}
          </div>

          <div class="flex items-center gap-2 flex-1 justify-end">
            <span class="font-semibold text-sm text-right">{{ store.match.team2_name }}</span>
            <img
              :src="store.match.team2_flag"
              :alt="store.match.team2_name"
              class="w-6 h-6 rounded-full object-cover border border-white/10"
            />
          </div>
        </div>

        <div class="flex justify-between text-xs opacity-70 flex-wrap gap-2">
          <span>{{ formatTime(store.match.match_start_time) }}</span>
          <span>{{ store.match.league_name }}</span>
        </div>
      </CardContent>
    </Card>

    <!-- Loading state for events -->
    <div v-if="store.loading.events && store.events.length === 0" class="flex flex-col items-center justify-center mt-12 opacity-60">
      <Loader2 class="w-8 h-8 animate-spin text-[#00c8ff]" />
      <p class="mt-2 text-sm">Loading live events...</p>
    </div>

    <!-- Events list -->
     <div class="flex flex-col gap-4">
       <Card
         v-for="event in store.events"
         :key="event.id"
         class="overflow-hidden event-card transition-all duration-200 hover:scale-[1.01] cursor-pointer"
         :style="{
           background: getEventStyle(event).background,
           borderLeft: `3px solid ${getEventStyle(event).borderColor}`,
           boxShadow: `0 1px 4px ${getEventStyle(event).glowColor}`
         }"
       >
         <CardContent class="p-2 py-1.5">
           <div class="flex justify-between items-start gap-2">
             <div class="flex items-start gap-1.5 flex-1 min-w-0">
               <component
                 :is="getEventIcon(event.type, event.detail)"
                 class="w-4 h-4 event-icon flex-shrink-0 mt-0.5"
                 :style="{ color: getEventStyle(event).borderColor }"
               />
               <div class="min-w-0 flex-1">
                 <div class="flex flex-col">
                   <div class="flex items-baseline gap-1.5">
                     <span v-if="event.player_name" class="font-semibold text-sm truncate">{{ event.player_name }}</span>
                     <span v-else class="font-semibold text-sm opacity-60 capitalize">{{ event.detail || event.type }}</span>
                     <span v-if="event.assist_name" class="text-xs opacity-60 truncate hidden sm:inline">
                       → {{ event.assist_name }}
                     </span>
                   </div>
                   <span class="text-xs opacity-60 truncate">{{ event.team_name }}</span>
                 </div>
               </div>
             </div>
             <div class="flex items-center gap-1.5 flex-shrink-0">
               <span class="text-xs opacity-50 capitalize hidden md:inline">{{ event.type }}</span>
               <span
                 class="text-xs font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap leading-none"
                 :style="{
                   backgroundColor: getEventStyle(event).borderColor + '20',
                   color: getEventStyle(event).borderColor
                 }"
               >
                 {{ event.elapsed }}'
               </span>
             </div>
           </div>
         </CardContent>
       </Card>
     </div>

    <!-- Empty state -->
    <div v-if="!store.loading.events && store.events.length === 0 && store.match" class="text-center mt-12 opacity-60">
      No events yet
    </div>

    <!-- Error state -->
    <div v-if="!store.loading.match && !store.match" class="text-center mt-12 opacity-60">
      Match not found
    </div>
  </div>
</template>

<style scoped>
.event-card {
  animation: slideIn 0.4s ease-out;
}

.event-icon {
  animation: bounce 0.6s ease-in-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
</style>
