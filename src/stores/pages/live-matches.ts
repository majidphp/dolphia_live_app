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

export const useLiveMatchesStore = defineStore('liveMatches', {
  state: () => ({
    matches: [] as LiveMatch[],
    selectedMatch: null as LiveMatch | null,
    events: [] as MatchEvent[],
    loading: {
      matches: false,
      events: false
    },
    previousScores: {} as Record<number, { team1_score: number; team2_score: number }>,
    notifiedGoals: [] as string[],
    refreshIntervals: {
      matches: null as number | null,
      events: null as number | null
    }
  }),

  actions: {
    async fetchMatches() {
      try {
        this.loading.matches = true
        const data = await apiRequest('/Live', { method: 'GET' })

        if (Array.isArray(data)) {
          this.detectGoals(data)
          this.matches = data

          const newScores: Record<number, { team1_score: number; team2_score: number }> = {}
          data.forEach((m: LiveMatch) => {
            newScores[m.id] = { team1_score: m.team1_score, team2_score: m.team2_score }
          })
          this.previousScores = newScores
        }
      } catch (err) {
        console.error('Failed to fetch live matches:', err)
      } finally {
        this.loading.matches = false
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

    detectGoals(newMatches: LiveMatch[]) {
      newMatches.forEach(match => {
        const prev = this.previousScores[match.id]
        if (prev) {
          if (match.team1_score > prev.team1_score) {
            this.sendGoalNotification(match, match.team1_name, match.team1_flag)
          } else if (match.team2_score > prev.team2_score) {
            this.sendGoalNotification(match, match.team2_name, match.team2_flag)
          }
        }
      })
    },

    sendGoalNotification(match: LiveMatch, teamName: string, flag: string) {
      const key = `${match.id}-${teamName}-${match.team1_score}-${match.team2_score}`
      if (this.notifiedGoals.includes(key)) return

      this.notifiedGoals.push(key)

      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        const title = `Goal in ${match.team1_name} vs ${match.team2_name}`
        const body = `${teamName} scored! ${match.team1_score} - ${match.team2_score}`

        try {
          new Notification(title, { body, icon: flag })
        } catch (e) {
          console.warn('Failed to show notification', e)
        }
      }
    },

    setSelectedMatch(match: LiveMatch | null) {
      this.selectedMatch = match
    },

    startMatchesPolling(interval: number = 30000) {
      this.fetchMatches()
      if (this.refreshIntervals.matches) {
        clearInterval(this.refreshIntervals.matches)
      }
      this.refreshIntervals.matches = window.setInterval(() => {
        this.fetchMatches()
      }, interval)
    },

    stopMatchesPolling() {
      if (this.refreshIntervals.matches) {
        clearInterval(this.refreshIntervals.matches)
        this.refreshIntervals.matches = null
      }
    },

    startEventsPolling(leagueId: number, matchId: number, interval: number = 15000) {
      this.fetchEvents(leagueId, matchId)
      if (this.refreshIntervals.events) {
        clearInterval(this.refreshIntervals.events)
      }
      this.refreshIntervals.events = window.setInterval(() => {
        this.fetchEvents(leagueId, matchId)
      }, interval)
    },

    stopEventsPolling() {
      if (this.refreshIntervals.events) {
        clearInterval(this.refreshIntervals.events)
        this.refreshIntervals.events = null
      }
    },

    cleanup() {
      this.stopMatchesPolling()
      this.stopEventsPolling()
    }
  }
})
