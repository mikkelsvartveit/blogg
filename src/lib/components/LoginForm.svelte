<script lang="ts">
  import { login } from "$lib/auth.svelte";
  import type { PocketBaseError } from "$lib/pocketbase";

  interface Props {
    onSuccess?: () => void;
  }

  let { onSuccess }: Props = $props();

  let email = $state("");
  let password = $state("");
  let error = $state("");
  let loading = $state(false);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    error = "";
    loading = true;

    try {
      await login(email, password);
      onSuccess?.();
    } catch (err) {
      const pbError = err as PocketBaseError;
      error =
        pbError.data?.identity?.message ||
        pbError.data?.password?.message ||
        "Ugyldig e-post eller passord";
    } finally {
      loading = false;
    }
  }
</script>

<form onsubmit={handleSubmit} class="flex flex-col gap-4">
  <div class="flex flex-col gap-1">
    <label for="email" class="text-sm font-medium text-gray-700">E-post</label>
    <input
      id="email"
      type="email"
      bind:value={email}
      required
      class="rounded border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
      placeholder="din@epost.no"
    />
  </div>

  <div class="flex flex-col gap-1">
    <label for="password" class="text-sm font-medium text-gray-700"
      >Passord</label
    >
    <input
      id="password"
      type="password"
      bind:value={password}
      required
      class="rounded border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
      placeholder="Ditt passord"
    />
  </div>

  {#if error}
    <p class="text-sm text-red-500">{error}</p>
  {/if}

  <button
    type="submit"
    disabled={loading}
    class="rounded bg-gray-800 px-4 py-2 font-medium text-white hover:bg-gray-700 disabled:opacity-50"
  >
    {loading ? "Logger inn..." : "Logg inn"}
  </button>
</form>
