<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLiveMatchesStore } from '@/stores/pages/live-matches'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-vue-next'
import { format } from 'date-fns'

const router = useRouter()
const store = useLiveMatchesStore()

const formatTime = (dateTimeStr: string) => {
  try {
    const utcDate = new Date(dateTimeStr + ' UTC')
    return format(utcDate, 'hh:mm a')
  } catch (e) {
    return dateTimeStr
  }
}

const openMatch = (match: any) => {
  router.push(`/live/${match.id}`)
}

onMounted(() => {
  store.startMatchesPolling()
})

onUnmounted(() => {
  store.stopMatchesPolling()
})
</script>

<template>
  <div class="container mx-auto p-4 max-w-2xl">
    <div class="flex items-center justify-center gap-3 my-6">
      <div class="flex flex-col rounded-full overflow-hidden bg-muted/70 backdrop-blur">
        <img src="/logo.png" class="w-10 h-10" alt="Dolphia" />
      </div>
      <h1 class="font-bold text-2xl text-gradient">Dolphia</h1>
    </div>

    <div v-if="store.loading.matches && store.matches.length === 0" class="flex flex-col items-center justify-center mt-12 opacity-60">
      <Loader2 class="w-8 h-8 animate-spin text-[#00c8ff]" />
    </div>

    <div v-if="!store.loading.matches && store.matches.length === 0" class="text-center mt-12 opacity-60">
      No live matches right now
    </div>

    <div class="flex flex-col gap-4">
      <Card
        v-for="match in store.matches"
        :key="match.id"
        class="cursor-pointer hover:bg-[rgba(0,200,255,0.15)] transition-colors border-[rgba(0,200,255,0.2)] bg-[rgba(0,200,255,0.08)]"
        @click="openMatch(match)"
      >
        <CardContent class="p-4">
          <div class="flex justify-between items-center mb-2">
            <div class="flex items-center gap-2 flex-1">
              <img
                :src="match.team1_flag"
                :alt="match.team1_name"
                class="w-6 h-6 rounded-full object-cover border border-white/10"
              />
              <span class="font-semibold text-sm">{{ match.team1_name }}</span>
            </div>
  
            <div class="px-4 text-lg font-bold text-[#00c8ff] drop-shadow-[0_0_8px_rgba(0,200,255,0.6)]">
              {{ match.team1_score }} - {{ match.team2_score }}
            </div>
  
            <div class="flex items-center gap-2 flex-1 justify-end">
              <span class="font-semibold text-sm text-right">{{ match.team2_name }}</span>
              <img
                :src="match.team2_flag"
                :alt="match.team2_name"
                class="w-6 h-6 rounded-full object-cover border border-white/10"
              />
            </div>
          </div>
  
          <div class="flex justify-between text-xs opacity-70 flex-wrap gap-2">
            <span>{{ formatTime(match.match_start_time) }}</span>
            <span>{{ match.league_name }}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.text-gradient {
  background: linear-gradient(45deg, #3b82f6, #8b5cf6, #10b981);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient-shift 3s ease infinite;
  background-size: 200% 200%;
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
</style>
