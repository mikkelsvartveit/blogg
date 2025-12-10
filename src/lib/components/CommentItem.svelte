<script lang="ts">
  import { auth } from "$lib/auth.svelte";
  import { pb } from "$lib/pocketbase";
  import type {
    CommentsResponse,
    UsersResponse,
  } from "$lib/pocketbase-typegen";

  interface Props {
    comment: CommentsResponse<{ user: UsersResponse }>;
    onDelete: (id: string) => void;
    onUpdate: (id: string, content: string) => void;
  }

  let { comment, onDelete, onUpdate }: Props = $props();

  let editing = $state(false);
  let editContent = $state(comment.content);
  let loading = $state(false);

  const isOwner = $derived(auth.user?.id === comment.user);

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("no-NO", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  async function handleSave() {
    if (!editContent.trim()) return;
    loading = true;

    try {
      await pb.collection("comments").update(comment.id, {
        content: editContent.trim(),
      });
      onUpdate(comment.id, editContent.trim());
      editing = false;
    } catch {
      // Silently fail
    } finally {
      loading = false;
    }
  }

  async function handleDelete() {
    loading = true;

    try {
      await pb.collection("comments").delete(comment.id);
      onDelete(comment.id);
    } catch {
      // Silently fail
    } finally {
      loading = false;
    }
  }

  function cancelEdit() {
    editing = false;
    editContent = comment.content;
  }
</script>

<div class="border-b border-gray-100 py-3 last:border-b-0">
  <div class="flex items-start justify-between gap-2">
    <div class="flex-1">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-800">
          {comment.expand?.user?.name || "Ukjent"}
        </span>
        <span class="text-xs text-gray-400">{formatDate(comment.created)}</span>
      </div>

      {#if editing}
        <div class="mt-2">
          <textarea
            bind:value={editContent}
            class="w-full resize-none rounded border border-gray-300 px-2 py-1 text-sm focus:border-gray-500 focus:outline-none"
            rows="2"
          ></textarea>
          <div class="mt-1 flex gap-2">
            <button
              onclick={handleSave}
              disabled={loading || !editContent.trim()}
              class="text-xs text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Lagre
            </button>
            <button
              onclick={cancelEdit}
              disabled={loading}
              class="text-xs text-gray-400 hover:text-gray-600"
            >
              Avbryt
            </button>
          </div>
        </div>
      {:else}
        <p class="mt-1 text-sm text-gray-700">{comment.content}</p>
      {/if}
    </div>

    {#if isOwner && !editing}
      <div class="flex gap-2">
        <button
          onclick={() => (editing = true)}
          class="text-xs text-gray-400 hover:text-gray-600"
        >
          Rediger
        </button>
        <button
          onclick={handleDelete}
          disabled={loading}
          class="text-xs text-gray-400 hover:text-red-500 disabled:opacity-50"
        >
          Slett
        </button>
      </div>
    {/if}
  </div>
</div>
