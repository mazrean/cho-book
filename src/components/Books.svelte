<script lang="ts">
	import type { Book } from "/@/lib/types/book";

  export let books: Book[];
  export let nowBooks: (Book[] | null) = null;

  let nowBookMap = nowBooks ? new Map(nowBooks.map((book) => [book.isbn, book])) : null;
</script>

{#each books as book}
  <div class="card uk-card uk-card-default uk-card-body uk-margin">
    {#if book.imgUrl}
      <img class="uk-img" src={book.imgUrl ?? ""} alt={book.title}>
    {/if}
    <div class="right-container">
      <h3 class="title uk-card-title uk-text-lead">{book.title}</h3>
      {#if book.author}
        <p class="author uk-text-meta">{book.author}</p>
      {/if}
      {#if nowBookMap}
        <span class="uk-label {nowBookMap.has(book.isbn)?"uk-label-danger":"uk-label-success"}">{nowBookMap.has(book.isbn)?"所持":"未所持"}</span>
      {/if}
    </div>
  </div>
{/each}

<style>
  .right-container {
    overflow: hidden;
    word-break: break-word;
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
