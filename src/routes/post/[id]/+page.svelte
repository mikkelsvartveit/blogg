<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { pb } from "$lib/pocketbase";
  import type { PostsResponse } from "$lib/pocketbase-typegen";
  import LikeButton from "$lib/components/LikeButton.svelte";
  import CommentSection from "$lib/components/CommentSection.svelte";

  let post = $state<PostsResponse | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let likeCount = $state(0);
  let commentCount = $state(0);

  onMount(async () => {
    const id = page.params.id;
    if (!id) {
      error = "Innlegg ikke funnet";
      loading = false;
      return;
    }

    try {
      // Fetch post
      post = await pb.collection("posts").getOne(id);

      // Fetch like count
      const likesResult = await pb.collection("likes").getList(1, 1, {
        filter: `post = "${id}"`,
        requestKey: `likes-${id}`, // Add requestKey to prevent auto-cancellation
      });
      likeCount = likesResult.totalItems;

      // Fetch comment count
      const commentsResult = await pb.collection("comments").getList(1, 1, {
        filter: `post = "${id}"`,
        requestKey: `comments-${id}`, // Add requestKey to prevent auto-cancellation
      });
      commentCount = commentsResult.totalItems;
    } catch {
      error = "Innlegg ikke funnet";
    } finally {
      loading = false;
    }
  });
</script>

<div class="mx-auto max-w-md px-3 py-8">
  <a
    href="/"
    class="mb-4 inline-block text-sm text-gray-500 hover:text-gray-700"
  >
    &larr; Tilbake til alle innlegg
  </a>

  {#if loading}
    <div class="flex flex-col items-center justify-center py-12">
      <div
        class="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"
      ></div>
      <p class="text-gray-500">Laster innlegg...</p>
    </div>
  {:else if error}
    <div class="py-12 text-center">
      <p class="text-red-500">{error}</p>
      <a href="/" class="mt-4 inline-block text-gray-600 underline"
        >Gå tilbake til hjemmesiden</a
      >
    </div>
  {:else if post}
    <div class="flex flex-col gap-1">
      <h2 class="text-sm font-medium text-gray-500">
        🗓️ {new Date(post.date).toDateString()}
      </h2>

      {#if post.location}
        <h3 class="text-sm font-medium text-gray-500">📍 {post.location}</h3>
      {/if}

      {#if post.description}
        <p class="pt-1">{post.description}</p>
      {/if}

      {#if post.images.length > 0}
        <div class="mt-3 grid grid-cols-4 gap-2">
          {#each post.images as filename (filename)}
            <a
              href="/api/files/posts/{post.id}/{filename}"
              class="block aspect-square overflow-hidden rounded"
            >
              <img
                class="h-full w-full object-cover"
                src="/api/files/posts/{post.id}/{filename}?thumb=1080x0"
                alt=""
              />
            </a>
          {/each}
        </div>
      {/if}

      <div class="mt-4 flex items-center gap-4">
        <LikeButton postId={post.id} {likeCount} isLiked={false} />

        <a
          href="#comments"
          class="flex items-center gap-1 text-gray-600 hover:text-gray-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-6 w-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
            />
          </svg>
          <span class="text-sm">{commentCount}</span>
        </a>
      </div>

      <CommentSection postId={post.id} />
    </div>
  {/if}
</div>
