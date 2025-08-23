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
    const passwordConfirm = formData.get("passwordConfirm") as string;

    if (email && password && passwordConfirm) {
      try {
        await pb.collection("users").create({
          email,
          password,
          passwordConfirm,
        });

        await pb.collection("users").authWithPassword(email, password);

        goto("/");
      } catch (error) {
        if (error instanceof Error && "originalError" in error) {
          pocketbaseError = error.originalError as PocketBaseError;
        }
      }
    }
  };
</script>

<h1 class="text-3xl">Sign up</h1>

<p class="pt-4">
  If you already have an account, you can
  <a href="/login" class="link link-primary">sign in</a>
  instead.
</p>

<form onsubmit={handleSubmit} class="flex flex-col items-start gap-2 py-6">
  <input
    type="email"
    name="email"
    placeholder="Email"
    class="input input-bordered"
  />

  {#if pocketbaseError?.data?.email}
    <p class="mb-4 text-sm font-medium text-red-700">
      {pocketbaseError?.data?.email.message}
    </p>
  {/if}

  <input
    type="password"
    name="password"
    placeholder="Password"
    class="input input-bordered"
  />
  {#if pocketbaseError?.data?.password}
    <p class="mb-4 text-sm font-medium text-red-700">
      {pocketbaseError?.data?.password.message}
    </p>
  {/if}

  <input
    type="password"
    name="passwordConfirm"
    placeholder="Confirm Password"
    class="input input-bordered"
  />
  {#if pocketbaseError?.data?.passwordConfirm}
    <p class="mb-4 text-xs font-semibold text-red-700">
      {pocketbaseError?.data?.passwordConfirm.message}
    </p>
  {/if}

  <button type="submit" class="btn btn-primary">Sign up</button>
</form>
