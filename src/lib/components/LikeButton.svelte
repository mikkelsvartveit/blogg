<script lang="ts">
  import { goto } from "$app/navigation";
  import { auth } from "$lib/auth.svelte";
  import { pb } from "$lib/pocketbase";

  interface Props {
    postId: string;
    likeCount: number;
    isLiked: boolean;
  }

  let { postId, likeCount, isLiked }: Props = $props();

  let currentLikeCount = $state(likeCount);
  let currentIsLiked = $state(isLiked);
  let likeId = $state<string | null>(null);
  let loading = $state(false);

  // Fetch the user's like record if logged in
  async function fetchUserLike() {
    if (!auth.isLoggedIn || !auth.user) return;

    try {
      const result = await pb
        .collection("likes")
        .getFirstListItem(`user = "${auth.user.id}" && post = "${postId}"`);
      likeId = result.id;
      currentIsLiked = true;
    } catch {
      likeId = null;
      currentIsLiked = false;
    }
  }

  // Initialize on mount if logged in
  $effect(() => {
    if (auth.isLoggedIn) {
      fetchUserLike();
    } else {
      currentIsLiked = false;
      likeId = null;
    }
  });

  async function toggleLike() {
    if (!auth.isLoggedIn) {
      goto("/login/");
      return;
    }

    if (loading) return;
    loading = true;

    // Optimistic update
    const wasLiked = currentIsLiked;
    currentIsLiked = !wasLiked;
    currentLikeCount += wasLiked ? -1 : 1;

    try {
      if (wasLiked && likeId) {
        await pb.collection("likes").delete(likeId);
        likeId = null;
      } else {
        const record = await pb.collection("likes").create({
          user: auth.user!.id,
          post: postId,
        });
        likeId = record.id;
      }
    } catch {
      // Revert on error
      currentIsLiked = wasLiked;
      currentLikeCount += wasLiked ? 1 : -1;
    } finally {
      loading = false;
    }
  }
</script>

<button
  onclick={toggleLike}
  disabled={loading}
  class="flex items-center gap-1 text-gray-600 hover:text-red-500 disabled:opacity-50"
  aria-label={currentIsLiked ? "Slutt å like" : "Lik"}
>
  {#if currentIsLiked}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      class="h-6 w-6 text-red-500"
    >
      <path
        d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z"
      />
    </svg>
  {:else}
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
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
      />
    </svg>
  {/if}
  <span class="text-sm">{currentLikeCount}</span>
</button>
