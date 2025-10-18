<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = withDefaults(defineProps<{
  class?: HTMLAttributes["class"],
  hoverable?: boolean
}>(), {
  hoverable: false,
})
</script>

<template>
  <div
    data-slot="card"
    :class="
      cn(
        'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
        props.hoverable ? 'hover:shadow-md hover:bg-secondary/40 transition-all duration-200 cursor-pointer' : '',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
