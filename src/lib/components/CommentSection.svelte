<script lang="ts">
  import { onMount } from "svelte";
  import {
    getBrowserId,
    getCommenterName,
    setCommenterName,
  } from "$lib/browser-id";
  import { pb } from "$lib/pocketbase";
  import type { CommentsResponse } from "$lib/pocketbase-typegen";
  import CommentItem from "./CommentItem.svelte";

  interface Props {
    postId: string;
  }

  let { postId }: Props = $props();

  let comments = $state<CommentsResponse[]>([]);
  let loading = $state(true);
  let newComment = $state("");
  let authorName = $state("");
  let submitting = $state(false);
  let error = $state("");

  onMount(async () => {
    // Pre-populate author name from localStorage
    authorName = getCommenterName();
    await loadComments();
  });

  async function loadComments() {
    loading = true;
    try {
      const result = await pb.collection("comments").getFullList({
        filter: `post = "${postId}"`,
        sort: "created",
      });
      comments = result;
    } catch {
      // Silently fail
    } finally {
      loading = false;
    }
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim()) return;

    submitting = true;
    error = "";

    const browserId = getBrowserId();

    // Save the author name to localStorage for future use
    setCommenterName(authorName);

    try {
      const record = await pb.collection("comments").create({
        user: browserId,
        post: postId,
        content: newComment.trim(),
        author_name: authorName.trim(),
      });
      comments = [...comments, record];
      newComment = "";
    } catch {
      error = "Kunne ikke legge inn kommentar";
    } finally {
      submitting = false;
    }
  }
</script>

<div id="comments" class="mt-6 border-t border-gray-200 pt-6">
  <h3 class="mb-4 text-lg font-medium">Kommentarer</h3>

  {#if loading}
    <p class="text-sm text-gray-500">Laster kommentarer...</p>
  {:else if comments.length === 0}
    <p class="text-sm text-gray-500">Ingen kommentarer enda. Bli den første!</p>
  {:else}
    <div class="mb-4">
      {#each comments as comment (comment.id)}
        <CommentItem {comment} />
      {/each}
    </div>
  {/if}

  <form onsubmit={handleSubmit} class="mt-4">
    <div class="mb-2">
      <input
        type="text"
        bind:value={authorName}
        placeholder="Ditt navn"
        class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
      />
    </div>
    <textarea
      bind:value={newComment}
      placeholder="Skriv en kommentar..."
      rows="2"
      class="w-full resize-none rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
    ></textarea>
    {#if error}
      <p class="mt-1 text-sm text-red-500">{error}</p>
    {/if}
    <button
      type="submit"
      disabled={submitting || !newComment.trim() || !authorName.trim()}
      class="mt-2 rounded bg-gray-800 px-4 py-1.5 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
    >
      {submitting ? "Publiserer..." : "Publiser kommentar"}
    </button>
  </form>
</div>
