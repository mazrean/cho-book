<script lang="ts">
	import type { Book } from "/@/lib/types/book";

  export let book: Book;
  export let owned: Boolean | null = null;
</script>

<div class="card uk-card uk-card-default uk-card-body uk-margin">
  {#if book.imgUrl}
    <img src={book.imgUrl ?? ""} alt={book.title} data-uk-img>
  {/if}
  <div class="right-container uk-width-1-1">
    <h3 class="title uk-card-title uk-text-lead">{book.title}</h3>
    {#if book.author}
      <p class="author uk-text-meta">{book.author}
      </p>
    {/if}
    {#if owned !== null}
      <span class="uk-label {owned?"uk-label-danger":"uk-label-success"}">{owned?"所持":"未所持"}</span>
    {/if}
    <button class="uk-button uk-button-default uk-button-secondary uk-width-1-1">削除</button>
  </div>
</div>

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
