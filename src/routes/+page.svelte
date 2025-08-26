<script lang="ts">
  import { pb } from "$lib/pocketbase";

  const posts = pb.collection("posts").getFullList({ sort: "-date" });

  posts.then((p) => console.log(p));
</script>

<div class="mx-auto max-w-md px-3 py-8">
  <h1 class="text-3xl">Mikkels Italiablogg</h1>

  {#await posts}
    <p>Loading...</p>
  {:then posts}
    {#each posts as { id, images, location, description, date }}
      <div class="flex flex-col gap-1">
        <div class="mt-8 mb-6 h-px w-full bg-gray-200"></div>

        <h2 class="text-sm font-medium text-gray-500">
          🗓️ {new Date(date).toDateString()}
        </h2>

        <h3 class="text-sm font-medium text-gray-500">📍 {location}</h3>

        {#if description}
          <p class="pt-1">{description}</p>
        {/if}

        {#each images as filename}
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
  {/await}
</div>
