<script lang="ts">
  import { goto } from "$app/navigation";
  import RegisterForm from "$lib/components/RegisterForm.svelte";

  function handleSuccess() {
    goto("/");
  }
</script>

<div class="mx-auto max-w-sm px-3 py-12">
  <h1 class="mb-6 text-2xl font-bold">Lag bruker</h1>

  <RegisterForm onSuccess={handleSuccess} />

  <p class="mt-6 text-center text-sm text-gray-600">
    Har du allerede bruker?
    <a href="/login/" class="text-gray-800 underline hover:text-gray-600"
      >Logg inn</a
    >
  </p>
</div>
