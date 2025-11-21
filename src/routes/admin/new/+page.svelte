<script lang="ts">
  import { pb } from "$lib/pocketbase";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  let date = $state(new Date().toISOString().split("T")[0]);
  let location = $state("");
  let description = $state("");
  let files = $state<File[]>([]);
  let previews = $state<string[]>([]);

  let error = $state<string | null>(null);
  let loading = $state(false);

  onMount(() => {
    // Redirect if not logged in as superuser
    if (!pb.authStore.isValid || !pb.authStore.isSuperuser) {
      goto("/admin");
    }
  });

  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files) return;

    const newFiles = Array.from(input.files);
    files = [...files, ...newFiles];

    // Generate previews
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews = [...previews, e.target?.result as string];
      };
      reader.readAsDataURL(file);
    });
  }

  function removeImage(index: number) {
    files = files.filter((_, i) => i !== index);
    previews = previews.filter((_, i) => i !== index);
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (files.length === 0) {
      error = "Please add at least one image";
      return;
    }

    loading = true;
    error = null;

    try {
      const formData = new FormData();
      formData.append("date", new Date(date).toISOString());
      formData.append("location", location);
      formData.append("description", description);
      files.forEach((file) => {
        formData.append("images", file);
      });

      await pb.collection("posts").create(formData);

      // Reset form
      date = new Date().toISOString().split("T")[0];
      location = "";
      description = "";
      files = [];
      previews = [];

      alert("Post created successfully!");
      goto("/admin");
    } catch (err) {
      console.error("Failed to create post:", err);
      error = err instanceof Error ? err.message : "Failed to create post";
    } finally {
      loading = false;
    }
  }
</script>

<div class="mx-auto max-w-md px-3 py-8">
  <div class="mb-6 flex items-center justify-between">
    <h1 class="text-2xl font-bold">New Post</h1>
    <a href="/admin" class="text-blue-600 hover:underline">Back</a>
  </div>

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

    <div>
      <label for="images" class="mb-1 block text-sm font-medium">Images</label>
      <input
        id="images"
        type="file"
        accept="image/*"
        multiple
        onchange={handleFileSelect}
        class="block w-full text-sm text-gray-500 file:mr-4 file:rounded file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
      />
    </div>

    {#if previews.length > 0}
      <div class="grid grid-cols-3 gap-2">
        {#each previews as preview, i (i)}
          <div class="relative">
            <img
              src={preview}
              alt="Preview"
              class="aspect-square w-full rounded object-cover"
            />
            <button
              type="button"
              onclick={() => removeImage(i)}
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
      {loading ? "Creating..." : "Create Post"}
    </button>
  </form>
</div>
