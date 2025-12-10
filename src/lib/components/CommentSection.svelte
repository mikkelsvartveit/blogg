<script lang="ts">
  import { onMount } from "svelte";
  import { auth } from "$lib/auth.svelte";
  import { pb } from "$lib/pocketbase";
  import type {
    CommentsResponse,
    UsersResponse,
  } from "$lib/pocketbase-typegen";
  import CommentItem from "./CommentItem.svelte";

  interface Props {
    postId: string;
  }

  let { postId }: Props = $props();

  type CommentWithUser = CommentsResponse<{ user: UsersResponse }>;

  let comments = $state<CommentWithUser[]>([]);
  let loading = $state(true);
  let newComment = $state("");
  let submitting = $state(false);
  let error = $state("");

  onMount(async () => {
    await loadComments();
  });

  async function loadComments() {
    loading = true;
    try {
      const result = await pb
        .collection("comments")
        .getFullList<CommentWithUser>({
          filter: `post = "${postId}"`,
          sort: "created",
          expand: "user",
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
    if (!newComment.trim() || !auth.user) return;

    submitting = true;
    error = "";

    try {
      const record = await pb.collection("comments").create<CommentWithUser>(
        {
          user: auth.user.id,
          post: postId,
          content: newComment.trim(),
        },
        { expand: "user" },
      );
      comments = [...comments, record];
      newComment = "";
    } catch {
      error = "Kunne ikke legge inn kommentar";
    } finally {
      submitting = false;
    }
  }

  function handleDelete(id: string) {
    comments = comments.filter((c) => c.id !== id);
  }

  function handleUpdate(id: string, content: string) {
    comments = comments.map((c) => (c.id === id ? { ...c, content } : c));
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
        <CommentItem
          {comment}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      {/each}
    </div>
  {/if}

  {#if auth.isLoggedIn}
    <form onsubmit={handleSubmit} class="mt-4">
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
        disabled={submitting || !newComment.trim()}
        class="mt-2 rounded bg-gray-800 px-4 py-1.5 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {submitting ? "Publiserer..." : "Publiser kommentar"}
      </button>
    </form>
  {:else}
    <p class="mt-4 text-sm text-gray-500">
      <a href="/login/" class="text-gray-800 underline hover:text-gray-600"
        >Logg inn</a
      > for å legge igjen en kommentar.
    </p>
  {/if}
</div>
