<script setup lang="ts">
const user = useSupabaseUser()

// Watch the user session state. Once Supabase confirms the login, kick them back to the calendar dashboard!
watch(user, () => {
  if (user.value) {
    return navigateTo('/')
  }
}, { immediate: true })
</script>

<template>
  <div class="confirm-wait">
    <span class="loading-sprout">🌱</span>
    <p>Securing your garden vault connection...</p>
  </div>
</template>

<style scoped>
.confirm-wait {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  gap: 1rem;
  font-size: 1rem;
  color: var(--ink-soft, #606662);
}
.loading-sprout {
  font-size: 2.5rem;
  animation: pulse 1.5s infinite ease-in-out;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}
</style>
