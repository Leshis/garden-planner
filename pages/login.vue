<script setup lang="ts">
const supabase = useSupabaseClient()
const email = ref('')
const loading = ref(false)
const message = ref('')

const handleLogin = async () => {
  try {
    loading.value = true
    message.value = ''
    
    const { error } = await supabase.auth.signInWithOtp({
      email: email.value,
      options: {
        // Redirects the user back to your home page calendar grid after login
        redirectTo: window.location.origin
      }
    })
    
    if (error) throw error
    message.value = '📩 Check your email for your secure garden login link!'
  } catch (err: any) {
    message.value = err.message || 'An error occurred.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo">🌿</div>
      <h2>Garden Management System</h2>
      <p>Sign in to access your personal bloom calendar</p>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <input 
          v-model="email" 
          type="email" 
          placeholder="Enter your email address..." 
          required
          class="login-input"
        />
        <button type="submit" :disabled="loading" class="login-btn">
          {{ loading ? 'Sending...' : 'Send Magic Login Link' }}
        </button>
      </form>
      
      <p v-if="message" class="message-banner">{{ message }}</p>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 85vh;
  padding: 1rem;
}
.login-card {
  background: var(--cream, #fdfbf7);
  border: 1.5px solid var(--sage, #c3cfb8);
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0,0,0,0.05);
}
.logo { font-size: 2.5rem; margin-bottom: 0.5rem; }
h2 { font-family: var(--font-display, serif); color: var(--ink, #2c302e); margin-bottom: 0.5rem; font-size: 1.4rem; }
p { color: var(--ink-soft, #606662); font-size: 0.9rem; margin-bottom: 1.5rem; }
.login-form { display: flex; flex-direction: column; gap: 0.75rem; }
.login-input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--sage-lt, #e2e7dd);
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  background: white;
}
.login-input:focus { border-color: var(--moss, #556b2f); }
.login-btn {
  background: var(--moss, #556b2f);
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.2s;
}
.login-btn:hover { background: #3d4e22; }
.login-btn:disabled { opacity: 0.5; }
.message-banner {
  margin-top: 1rem;
  font-size: 0.85rem;
  padding: 0.5rem;
  background: #eef5e8;
  color: #3b521e;
  border-radius: 6px;
}
</style>
