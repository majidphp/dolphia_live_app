<script setup lang="ts">
import { onMounted } from 'vue'
import { usePushNotifications } from '@/composables/usePushNotifications'
import { Toaster } from '@/components/ui/sonner'
import BackButton from '@/components/layouts/BackButton.vue'
import ThemeToggle from '@/components/layouts/ThemeToggle.vue'

const pushNotifications = usePushNotifications()

onMounted(() => {
  pushNotifications.checkSupport()

  // Auto-subscribe to push notifications after a short delay
  setTimeout(() => {
    pushNotifications.subscribe()
  }, 2000)
})
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <div class="flex-1 flex flex-col">
      <router-view />
    </div>
  </div>
  <BackButton />
  <ThemeToggle />
  <Toaster />
</template>