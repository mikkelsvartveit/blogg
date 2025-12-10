<script lang="ts">
  import { auth, logout } from "$lib/auth.svelte";
</script>

{#if auth.isLoggedIn && auth.user}
  <div class="flex items-center gap-3">
    <span class="text-sm text-gray-600">{auth.user.name}</span>
    <button
      onclick={logout}
      class="text-sm text-gray-500 underline hover:text-gray-700"
    >
      Logg ut
    </button>
  </div>
{/if}
