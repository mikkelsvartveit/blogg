<script lang="ts">
  import { pb } from "$lib/pocketbase";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import type { PostsResponse } from "$lib/pocketbase-typegen";

  let post = $state<PostsResponse | null>(null);
  let date = $state("");
  let location = $state("");
  let description = $state("");
  let existingImages = $state<string[]>([]);
  let imagesToRemove = $state<string[]>([]);
  let newFiles = $state<File[]>([]);
  let newPreviews = $state<string[]>([]);

  let error = $state<string | null>(null);
  let loading = $state(false);
  let deleting = $state(false);

  onMount(async () => {
    if (!pb.authStore.isValid || !pb.authStore.isSuperuser) {
      goto("/admin");
      return;
    }

    try {
      const id = page.params.id as string;
      const loaded = await pb.collection("posts").getOne(id);
      post = loaded;
      date = new Date(loaded.date).toISOString().split("T")[0];
      location = loaded.location || "";
      description = loaded.description || "";
      existingImages = loaded.images || [];
    } catch (err) {
      console.error("Failed to load post:", err);
      error = "Failed to load post";
    }
  });

  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    newFiles = [...newFiles, ...files];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews = [...newPreviews, e.target?.result as string];
      };
      reader.readAsDataURL(file);
    });
  }

  function toggleRemoveExisting(filename: string) {
    if (imagesToRemove.includes(filename)) {
      imagesToRemove = imagesToRemove.filter((f) => f !== filename);
    } else {
      imagesToRemove = [...imagesToRemove, filename];
    }
  }

  function removeNewImage(index: number) {
    newFiles = newFiles.filter((_, i) => i !== index);
    newPreviews = newPreviews.filter((_, i) => i !== index);
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!post) return;

    const remainingExisting = existingImages.filter(
      (img) => !imagesToRemove.includes(img),
    );
    if (remainingExisting.length === 0 && newFiles.length === 0) {
      error = "Please keep or add at least one image";
      return;
    }

    loading = true;
    error = null;

    try {
      const formData = new FormData();
      formData.append("date", new Date(date).toISOString());
      formData.append("location", location);
      formData.append("description", description);

      // Add new files
      newFiles.forEach((file) => {
        formData.append("images", file);
      });

      // Remove images marked for deletion
      imagesToRemove.forEach((filename) => {
        formData.append("images-", filename);
      });

      await pb.collection("posts").update(post.id, formData);
      alert("Post updated successfully!");
      goto("/admin");
    } catch (err) {
      console.error("Failed to update post:", err);
      error = err instanceof Error ? err.message : "Failed to update post";
    } finally {
      loading = false;
    }
  }

  async function handleDelete() {
    if (!post || !confirm("Are you sure you want to delete this post?")) return;

    deleting = true;
    try {
      await pb.collection("posts").delete(post.id);
      alert("Post deleted!");
      goto("/admin");
    } catch (err) {
      console.error("Failed to delete post:", err);
      error = err instanceof Error ? err.message : "Failed to delete post";
    } finally {
      deleting = false;
    }
  }
</script>

<div class="mx-auto max-w-md px-3 py-8">
  <div class="mb-6 flex items-center justify-between">
    <h1 class="text-2xl font-bold">Edit Post</h1>
    <a href="/admin" class="text-blue-600 hover:underline">Back</a>
  </div>

  {#if !post && !error}
    <p class="text-gray-500">Loading...</p>
  {:else if error && !post}
    <p class="text-red-500">{error}</p>
  {:else if post}
    <form onsubmit={handleSubmit} class="space-y-4">
      {#if error}
        <div class="rounded bg-red-100 p-3 text-red-700">{error}</div>
      {/if}

      <div>
        <label for="date" class="mb-1 block text-sm font-medium">Date</label>
        <input
          id="date"
          type="date"
          bind:value={date}
          required
          class="w-full appearance-none rounded border px-3 py-2"
        />
      </div>

      <div>
        <label for="location" class="mb-1 block text-sm font-medium"
          >Location</label
        >
        <input
          id="location"
          type="text"
          bind:value={location}
          class="w-full rounded border px-3 py-2"
          placeholder="Rome, Italy"
        />
      </div>

      <div>
        <label for="description" class="mb-1 block text-sm font-medium"
          >Description</label
        >
        <textarea
          id="description"
          bind:value={description}
          rows={3}
          class="w-full rounded border px-3 py-2"
          placeholder="What happened today..."
        ></textarea>
      </div>

      {#if existingImages.length > 0}
        <div>
          <span class="mb-1 block text-sm font-medium">Current Images</span>
          <div class="grid grid-cols-3 gap-2">
            {#each existingImages as filename (filename)}
              <button
                type="button"
                onclick={() => toggleRemoveExisting(filename)}
                class="relative"
              >
                <img
                  src="/api/files/posts/{post.id}/{filename}?thumb=1080x0"
                  alt=""
                  class="aspect-square w-full rounded object-cover {imagesToRemove.includes(
                    filename,
                  )
                    ? 'opacity-30'
                    : ''}"
                />
                {#if imagesToRemove.includes(filename)}
                  <span
                    class="absolute inset-0 flex items-center justify-center text-sm font-medium text-red-600"
                  >
                    Remove
                  </span>
                {/if}
              </button>
            {/each}
          </div>
          <p class="mt-1 text-xs text-gray-500">Click to toggle removal</p>
        </div>
      {/if}

      <div>
        <label for="images" class="mb-1 block text-sm font-medium"
          >Add Images</label
        >
        <input
          id="images"
          type="file"
          accept="image/*"
          multiple
          onchange={handleFileSelect}
          class="block w-full text-sm text-gray-500 file:mr-4 file:rounded file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {#if newPreviews.length > 0}
        <div class="grid grid-cols-3 gap-2">
          {#each newPreviews as preview, i (i)}
            <div class="relative">
              <img
                src={preview}
                alt="Preview"
                class="aspect-square w-full rounded object-cover"
              />
              <button
                type="button"
                onclick={() => removeNewImage(i)}
                class="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white"
              >
                ×
              </button>
            </div>
          {/each}
        </div>
      {/if}

      <button
        type="submit"
        disabled={loading}
        class="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>

      <button
        type="button"
        onclick={handleDelete}
        disabled={deleting}
        class="w-full rounded bg-red-100 px-4 py-2 text-red-700 hover:bg-red-200 disabled:opacity-50"
      >
        {deleting ? "Deleting..." : "Delete Post"}
      </button>
    </form>
  {/if}
</div>
