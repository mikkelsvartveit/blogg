<script lang="ts">
  import { goto } from "$app/navigation";
  import LoginForm from "$lib/components/LoginForm.svelte";

  function handleSuccess() {
    goto("/");
  }
</script>

<div class="mx-auto max-w-sm px-3 py-12">
  <h1 class="mb-6 text-2xl font-bold">Logg inn</h1>

  <LoginForm onSuccess={handleSuccess} />

  <p class="mt-6 text-center text-sm text-gray-600">
    Har du ikke bruker?
    <a href="/register/" class="text-gray-800 underline hover:text-gray-600"
      >Registrer deg</a
    >
  </p>
</div>
