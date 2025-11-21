<script lang="ts">
  import { pb } from "$lib/pocketbase";
  import { onMount } from "svelte";
  import type { PostsResponse } from "$lib/pocketbase-typegen";

  let email = $state("");
  let password = $state("");
  let error = $state<string | null>(null);
  let loading = $state(false);
  let posts = $state<PostsResponse[]>([]);

  // Check if already logged in as superuser
  let isLoggedIn = $state(pb.authStore.isValid && pb.authStore.isSuperuser);

  onMount(() => {
    if (isLoggedIn) loadPosts();
  });

  async function loadPosts() {
    try {
      const result = await pb
        .collection("posts")
        .getList(1, 50, { sort: "-date" });
      posts = result.items;
    } catch (err) {
      console.error("Failed to load posts:", err);
    }
  }

  async function handleLogin(e: Event) {
    e.preventDefault();
    loading = true;
    error = null;

    try {
      await pb.collection("_superusers").authWithPassword(email, password);
      isLoggedIn = true;
      loadPosts();
    } catch (err) {
      console.error("Login failed:", err);
      error = "Invalid email or password";
    } finally {
      loading = false;
    }
  }

  function handleLogout() {
    pb.authStore.clear();
    isLoggedIn = false;
    posts = [];
  }
</script>

<div class="mx-auto max-w-md px-3 py-8">
  <h1 class="mb-6 text-2xl font-bold">Admin</h1>

  {#if isLoggedIn}
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <p class="text-sm text-gray-600">{pb.authStore.record?.email}</p>
        <button
          onclick={handleLogout}
          class="text-sm text-gray-500 hover:underline"
        >
          Logout
        </button>
      </div>

      <a
        href="/admin/new"
        class="block w-full rounded bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700"
      >
        + New Post
      </a>

      <h2 class="pt-4 text-lg font-semibold">Posts</h2>
      {#each posts as post (post.id)}
        <a
          href="/admin/edit/{post.id}"
          class="flex items-center gap-3 rounded border p-3 hover:bg-gray-50"
        >
          {#if post.images.length > 0}
            <img
              src="/api/files/posts/{post.id}/{post.images[0]}?thumb=1080x0"
              alt=""
              class="h-12 w-12 rounded object-cover"
            />
          {/if}
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium">
              {post.location || "No location"}
            </p>
            <p class="text-xs text-gray-500">
              {new Date(post.date).toDateString()}
            </p>
          </div>
        </a>
      {/each}
    </div>
  {:else}
    <form onsubmit={handleLogin} class="space-y-4">
      {#if error}
        <div class="rounded bg-red-100 p-3 text-red-700">{error}</div>
      {/if}

      <div>
        <label for="email" class="mb-1 block text-sm font-medium">Email</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          required
          class="w-full rounded border px-3 py-2"
          placeholder="admin@example.com"
        />
      </div>

      <div>
        <label for="password" class="mb-1 block text-sm font-medium"
          >Password</label
        >
        <input
          id="password"
          type="password"
          bind:value={password}
          required
          class="w-full rounded border px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        class="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  {/if}
</div>
