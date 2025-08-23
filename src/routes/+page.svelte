<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import { pb } from "$lib/pocketbase";

  let { data } = $props();
  const { user } = $derived(data);

  const logOut = async () => {
    pb.authStore.clear();
    await invalidateAll();
  };
</script>

<h1 class="text-3xl">Svelte + PocketBase template app</h1>

{#if user}
  <p class="py-8 text-lg">
    <span>Logged in as <span class="font-semibold">{user?.email}</span></span>
  </p>

  <button class="btn btn-primary" onclick={logOut}>Sign out</button>
{:else}
  <p class="py-8 text-lg">
    <span>You are not signed in.</span>
  </p>

  <p class="text-lg">
    <a href="/login" class="btn btn-primary">Sign in</a>

    <a href="/register" class="btn btn-primary">Sign up</a>
  </p>
{/if}
