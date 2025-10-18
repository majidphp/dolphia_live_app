import { defineStore } from 'pinia'
import { apiRequest } from '@/utils/api'

export interface LiveMatch {
  id: number
  team1_id: number
  team1_name: string
  team1_flag: string
  team1_score: number
  team2_id: number
  team2_name: string
  team2_flag: string
  team2_score: number
  league_id: number
  league_name: string
  match_start_time: string
}

export interface MatchEvent {
  id: number
  team_id: number
  team_name: string
  player_name: string
  assist_name?: string
  type: string
  detail?: string
  elapsed: number
}

export const useMatchDetailStore = defineStore('matchDetail', {
  state: () => ({
    match: null as LiveMatch | null,
    events: [] as MatchEvent[],
    loading: {
      match: false,
      events: false
    },
    refreshInterval: null as number | null
  }),

  actions: {
    async fetchMatch(matchId: number) {
      try {
        this.loading.match = true
        const data = await apiRequest('/Live', { method: 'GET' })

        if (Array.isArray(data)) {
          const foundMatch = data.find((m: LiveMatch) => m.id === matchId)
          if (foundMatch) {
            this.match = foundMatch
          } else {
            throw new Error('Match not found')
          }
        }
      } catch (err) {
        console.error('Failed to fetch match:', err)
        this.match = null
      } finally {
        this.loading.match = false
      }
    },

    async fetchEvents(leagueId: number, matchId: number) {
      try {
        this.loading.events = true
        const data = await apiRequest(
          `/Leagues/${leagueId}/Matches/${matchId}/Events`,
          { method: 'GET' }
        )

        if (Array.isArray(data)) {
          this.events = data
        }
      } catch (err) {
        console.error('Failed to fetch match events:', err)
      } finally {
        this.loading.events = false
      }
    },

    async fetchAll(matchId: number) {
      // First fetch the match to get league_id
      await this.fetchMatch(matchId)

      // Then fetch events if we have the match
      if (this.match) {
        await this.fetchEvents(this.match.league_id, matchId)
      }
    },

    startPolling(matchId: number, interval: number = 15000) {
      // Fetch immediately
      this.fetchAll(matchId)

      // Set up polling
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval)
      }

      this.refreshInterval = window.setInterval(() => {
        this.fetchAll(matchId)
      }, interval)
    },

    stopPolling() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval)
        this.refreshInterval = null
      }
    },

    cleanup() {
      this.stopPolling()
      this.match = null
      this.events = []
    }
  }
})
