<script lang="ts">
  import { goto } from "$app/navigation";
  import { pb } from "$lib/pocketbase";
  import type { PocketBaseError } from "$lib/pocketbase";

  let pocketbaseError = $state<PocketBaseError | null>(null);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (email && password) {
      try {
        await pb.collection("users").authWithPassword(email, password);

        goto("/");
      } catch (error) {
        if (error instanceof Error && "originalError" in error) {
          pocketbaseError = error.originalError as PocketBaseError;

          console.log(error.originalError);
        }
      }
    }
  };
</script>

<h1 class="text-3xl">Sign in</h1>

<p class="pt-4">
  If you don't have an account, you can
  <a href="/register" class="link link-primary">sign up</a>
  instead.
</p>

<form onsubmit={handleSubmit} class="flex flex-col items-start gap-2 py-6">
  <input
    type="email"
    name="email"
    placeholder="Email"
    class="input input-bordered"
  />

  <input
    type="password"
    name="password"
    placeholder="Password"
    class="input input-bordered"
  />

  {#if pocketbaseError?.data.message}
    <p class="mb-4 text-xs font-semibold text-red-700">
      {pocketbaseError.data.message}
    </p>
  {/if}

  <button type="submit" class="btn btn-primary">Sign in</button>
</form>
