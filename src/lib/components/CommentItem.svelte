<script lang="ts">
  import type { CommentsResponse } from "$lib/pocketbase-typegen";

  interface Props {
    comment: CommentsResponse;
  }

  let { comment }: Props = $props();

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("no-NO", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
</script>

<div class="border-b border-gray-100 py-3 last:border-b-0">
  <div class="flex items-center gap-2">
    <span class="text-sm font-medium text-gray-800">
      {comment.author_name}
    </span>
    <span class="text-xs text-gray-400">{formatDate(comment.created)}</span>
  </div>
  <p class="mt-1 text-sm text-gray-700">{comment.content}</p>
</div>
