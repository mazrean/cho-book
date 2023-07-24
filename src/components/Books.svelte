<script lang="ts">
	import type { Book } from "/@/lib/types/book";

  export let books: Book[];
  export let withBadge: boolean = false;
</script>

{#each books as book}
  <div class="card uk-card uk-card-default uk-card-body uk-margin">
    {#if book.imgUrl}
      <img class="uk-img" src={book.imgUrl ?? ""} alt={book.title}>
    {/if}
    <div>
      <h3 class="title uk-card-title">{book.title}</h3>
      <p>{book.author}</p>
      {#if withBadge}
        <span class="uk-label uk-label-success">未所持</span>
      {/if}
    </div>
  </div>
{/each}

<style>
  .title {
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .card {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .card img {
    width: 100px;
    height: 100%;
    margin-right: 1rem;
  }
</style>
