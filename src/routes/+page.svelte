<script lang="ts">
  import { onMount } from "svelte";
  import { pb } from "$lib/pocketbase";
  import type { PostsResponse } from "$lib/pocketbase-typegen";
  import LikeButton from "$lib/components/LikeButton.svelte";

  interface PostWithCounts extends PostsResponse {
    likeCount: number;
    commentCount: number;
  }

  let posts = $state<PostWithCounts[]>([]);
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

      // Fetch like and comment counts for each post
      // Use unique requestKey to prevent auto-cancellation
      const postsWithCounts: PostWithCounts[] = await Promise.all(
        result.items.map(async (post) => {
          const [likesResult, commentsResult] = await Promise.all([
            pb.collection("likes").getList(1, 1, {
              filter: `post = "${post.id}"`,
              requestKey: `likes-${post.id}`,
            }),
            pb.collection("comments").getList(1, 1, {
              filter: `post = "${post.id}"`,
              requestKey: `comments-${post.id}`,
            }),
          ]);

          return {
            ...post,
            likeCount: likesResult.totalItems,
            commentCount: commentsResult.totalItems,
          };
        }),
      );

      posts = reset ? postsWithCounts : [...posts, ...postsWithCounts];
      page = currentPage + 1;
      hasMore = result.page < result.totalPages;
      loading = false;
    } catch (err) {
      console.error("Error loading posts:", err);
      loading = false;
      error =
        err instanceof Error ? err.message : "Kunne ikke laste inn innlegg";
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
  {#if loading && posts.length === 0}
    <div class="flex flex-col items-center justify-center py-12">
      <div
        class="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"
      ></div>
      <p class="text-gray-500">Laster innlegg...</p>
    </div>
  {:else}
    {#each posts as post (post.id)}
      <div class="flex flex-col gap-1">
        <h2 class="text-sm font-medium text-gray-500">
          🗓️ {new Date(post.date).toDateString()}
        </h2>

        <h3 class="text-sm font-medium text-gray-500">📍 {post.location}</h3>

        {#if post.description}
          <p class="pt-1">{post.description}</p>
        {/if}

        {#each post.images as filename (filename)}
          <a href="/api/files/posts/{post.id}/{filename}" class="pt-3">
            <img
              class="rounded"
              src="/api/files/posts/{post.id}/{filename}?thumb=1080x0"
              alt=""
            />
          </a>
        {/each}

        <div class="mt-3 flex items-center gap-4">
          <LikeButton
            postId={post.id}
            likeCount={post.likeCount}
            isLiked={false}
          />

          <a
            href="/post/{post.id}/#comments"
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
            <span class="text-sm">{post.commentCount}</span>
          </a>
        </div>

        <div class="mt-6 mb-8 h-px w-full bg-gray-200"></div>
      </div>
    {/each}

    {#if hasMore}
      <div bind:this={sentinel} class="h-1"></div>
      {#if loading}
        <div class="flex flex-col items-center justify-center py-8">
          <div
            class="mb-3 h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-500"
          ></div>
          <div class="text-sm text-gray-500">Laster flere innlegg...</div>
        </div>
      {/if}
    {:else if posts.length > 0}
      <div class="py-8 text-center text-gray-500">
        Ingen flere innlegg å laste
      </div>
    {/if}

    {#if error}
      <div class="py-4 text-center text-red-500">
        Feil: {error}
      </div>
    {/if}
  {/if}
</div>
