<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLiveMatchesStore } from '@/stores/pages/live-matches'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Loader2 } from 'lucide-vue-next'
import { format } from 'date-fns'
import { getMatchStyle } from './utils'

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

const matchGroups = computed(() => store.matchesByStatus)

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
      <!-- Live Matches -->
      <template v-if="matchGroups.live.length > 0">
        <div class="flex items-center gap-2 mb-1">
          <h2 class="text-sm font-semibold text-green-500">Live Matches</h2>
          <div class="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
        </div>
        <Card
          v-for="match in matchGroups.live"
          :key="match.id"
          class="cursor-pointer transition-colors"
          :style="{
            backgroundColor: getMatchStyle(match.status).background,
            borderColor: getMatchStyle(match.status).border
          }"
          @click="openMatch(match)"
          @mouseenter="(e: MouseEvent) => (e.currentTarget as HTMLElement).style.backgroundColor = getMatchStyle(match.status).hover"
          @mouseleave="(e: MouseEvent) => (e.currentTarget as HTMLElement).style.backgroundColor = getMatchStyle(match.status).background"
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

              <div
                class="px-4 text-lg font-bold"
                :style="{
                  color: getMatchStyle(match.status).scoreColor,
                  filter: `drop-shadow(0 0 8px ${getMatchStyle(match.status).scoreGlow})`
                }"
              >
                {{ match.team1_score ?? '-' }} - {{ match.team2_score ?? '-' }}
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
      </template>

      <!-- Separator between Live and Upcoming -->
      <Separator v-if="matchGroups.live.length > 0 && matchGroups.upcoming.length > 0" class="my-2" />

      <!-- Upcoming Matches -->
      <template v-if="matchGroups.upcoming.length > 0">
        <h2 class="text-sm font-semibold text-blue-500">Upcoming Matches</h2>
        <Card
          v-for="match in matchGroups.upcoming"
          :key="match.id"
          class="cursor-pointer transition-colors"
          :style="{
            backgroundColor: getMatchStyle(match.status).background,
            borderColor: getMatchStyle(match.status).border
          }"
          @click="openMatch(match)"
          @mouseenter="(e: MouseEvent) => (e.currentTarget as HTMLElement).style.backgroundColor = getMatchStyle(match.status).hover"
          @mouseleave="(e: MouseEvent) => (e.currentTarget as HTMLElement).style.backgroundColor = getMatchStyle(match.status).background"
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

              <div
                class="px-4 text-lg font-bold"
                :style="{
                  color: getMatchStyle(match.status).scoreColor,
                  filter: `drop-shadow(0 0 8px ${getMatchStyle(match.status).scoreGlow})`
                }"
              >
                {{ match.team1_score ?? '-' }} - {{ match.team2_score ?? '-' }}
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
      </template>

      <!-- Separator between Upcoming and Ended -->
      <Separator v-if="matchGroups.upcoming.length > 0 && matchGroups.ended.length > 0" class="my-2" />

      <!-- Ended Matches -->
      <template v-if="matchGroups.ended.length > 0">
        <h2 class="text-sm font-semibold text-gray-500">Ended Matches</h2>
        <Card
          v-for="match in matchGroups.ended"
          :key="match.id"
          class="cursor-pointer transition-colors"
          :style="{
            backgroundColor: getMatchStyle(match.status).background,
            borderColor: getMatchStyle(match.status).border
          }"
          @click="openMatch(match)"
          @mouseenter="(e: MouseEvent) => (e.currentTarget as HTMLElement).style.backgroundColor = getMatchStyle(match.status).hover"
          @mouseleave="(e: MouseEvent) => (e.currentTarget as HTMLElement).style.backgroundColor = getMatchStyle(match.status).background"
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

              <div
                class="px-4 text-lg font-bold"
                :style="{
                  color: getMatchStyle(match.status).scoreColor,
                  filter: `drop-shadow(0 0 8px ${getMatchStyle(match.status).scoreGlow})`
                }"
              >
                {{ match.team1_score ?? '-' }} - {{ match.team2_score ?? '-' }}
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
      </template>
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
