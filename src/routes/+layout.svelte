<script lang="ts">
  import "../app.css";
  import { auth } from "$lib/auth.svelte";
  import UserMenu from "$lib/components/UserMenu.svelte";
</script>

<header class="border-b border-gray-200 bg-white">
  <div class="mx-auto flex max-w-md items-center justify-between px-3 py-3">
    <a href="/" class="text-lg font-bold text-gray-800">Mikkel i Italia</a>

    <nav>
      {#if auth.isLoggedIn}
        <UserMenu />
      {:else}
        <div class="flex items-center gap-3">
          <a href="/login/" class="text-sm text-gray-600 hover:text-gray-800"
            >Logg inn</a
          >
          <a
            href="/register/"
            class="rounded bg-gray-800 px-3 py-1.5 text-sm text-white hover:bg-gray-700"
            >Registrer</a
          >
        </div>
      {/if}
    </nav>
  </div>
</header>

<main>
  <slot></slot>
</main>
