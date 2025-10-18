<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// shadcn/ui
import { Button } from '@/components/ui/button'
// icons
import { ChevronLeft } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const canGoBack = ref(false)

const updateCanGoBack = () => {
  const hasHistory = window.history.length > 1
  const p = route.path.toLowerCase()
  const isRootOrLeagues = p === '/' || p === '/leagues'

  canGoBack.value = hasHistory && !isRootOrLeagues
}

onMounted(updateCanGoBack)

watch(
  () => route.fullPath,
  () => updateCanGoBack()
)

const goBack = () => {
  if (canGoBack.value) {
    router.back()
  }
}
</script>

<template>
  <Button
    v-if="canGoBack"
    variant="ghost"
    size="icon"
    class="fixed top-6 left-4 z-50"
    @click="goBack"
  >
    <ChevronLeft class="w-4 h-4" />
  </Button>
</template>
