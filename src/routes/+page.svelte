<script lang="ts">
  import { onMount } from "svelte";
  import { pb } from "$lib/pocketbase";
  import type { PostsResponse } from "$lib/pocketbase-typegen";

  let posts = $state<PostsResponse[]>([]);
  let loading = $state(false);
  let hasMore = $state(true);
  let page = $state(1);
  let error = $state<string | null>(null);

  let sentinel: HTMLElement | undefined = $state();
  let observer: IntersectionObserver;

  async function loadPosts(reset = false) {
    loading = true;
    error = null;

    if (reset) {
      posts = [];
      page = 1;
      hasMore = true;
    }

    try {
      const currentPage = reset ? 1 : page;
      const result = await pb.collection("posts").getList(currentPage, 3, {
        sort: "-date",
      });

      posts = reset ? result.items : [...posts, ...result.items];
      page = currentPage + 1;
      hasMore = result.page < result.totalPages;
      loading = false;
    } catch (err) {
      console.error("Error loading posts:", err);
      loading = false;
      error = err instanceof Error ? err.message : "Failed to load posts";
    }
  }

  onMount(() => {
    loadPosts(true);

    if (sentinel) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting && hasMore && !loading) {
            loadPosts();
          }
        },
        { rootMargin: "100px" },
      );

      observer.observe(sentinel);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  });

  $effect(() => {
    if (observer && sentinel) {
      if (hasMore && !loading) {
        observer.observe(sentinel);
      } else {
        observer.unobserve(sentinel);
      }
    }
  });
</script>

<div class="mx-auto max-w-md px-3 py-8">
  <h1 class="text-3xl">Mikkel i Italia</h1>

  {#if loading && posts.length === 0}
    <div class="flex flex-col items-center justify-center py-12">
      <div class="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
      <p class="text-gray-500">Loading posts...</p>
    </div>
  {:else}
    {#each posts as { id, images, location, description, date } (id)}
      <div class="flex flex-col gap-1">
        <div class="mt-8 mb-6 h-px w-full bg-gray-200"></div>

        <h2 class="text-sm font-medium text-gray-500">
          🗓️ {new Date(date).toDateString()}
        </h2>

        <h3 class="text-sm font-medium text-gray-500">📍 {location}</h3>

        {#if description}
          <p class="pt-1">{description}</p>
        {/if}

        {#each images as filename (filename)}
          <a href="/api/files/posts/{id}/{filename}" class="pt-3">
            <img
              class="rounded"
              src="/api/files/posts/{id}/{filename}?thumb=1080x0"
              alt=""
            />
          </a>
        {/each}
      </div>
    {/each}

    {#if hasMore}
      <div bind:this={sentinel} class="h-1"></div>
      {#if loading}
        <div class="flex flex-col items-center justify-center py-8">
          <div class="mb-3 h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-500"></div>
          <div class="text-sm text-gray-500">Loading more posts...</div>
        </div>
      {/if}
    {:else}
      <div class="py-8 text-center text-gray-500">No more posts to load</div>
    {/if}

    {#if error}
      <div class="py-4 text-center text-red-500">
        Error: {error}
      </div>
    {/if}
  {/if}
</div>
