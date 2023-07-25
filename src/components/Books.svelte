<script lang="ts">
	import type { Book } from "/@/lib/types/book";

  export let books: Book[];
  export let nowBooks: Book[]|null = null;

  const nowBookMap = nowBooks ? new Map(books.map((book) => [book.isbn, book])) : null;
</script>

{#each books as book}
  <div class="card uk-card uk-card-default uk-card-body uk-margin">
    {#if book.imgUrl}
      <img class="uk-img" src={book.imgUrl ?? ""} alt={book.title}>
    {/if}
    <div>
      <h3 class="title uk-card-title">{book.title}</h3>
      <p>{book.author}</p>
      {#if nowBookMap}
        <span class="uk-label {nowBookMap.has(book.isbn)?"uk-label-danger":"uk-label-success"}">{nowBookMap.has(book.isbn)?"所持":"未所持"}</span>
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
