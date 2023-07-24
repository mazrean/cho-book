<script lang="ts">
	// @ts-nocheck
	import BarCodeReader from "../components/BarCodeReader.svelte";
    import { checkDigit, checkISBN } from "$lib/ts/barCode";
    import type { Book } from "$lib/ts/book";
	import Books from "../components/Books.svelte";

    // カメラの権限要求タイミングを使う時まで遅らせるため
    let modalOpen = false;

    let books = new Map<string, Book>();
    async function onIsbn(e) {
        if (!checkDigit(e.detail) || !checkISBN(e.detail) || books.has(e.detail)) return;

        const res = await fetch(`/api/books/${e.detail}`)
        const json: Book = await res.json();
        books = books.set(json.isbn, json);
    }
</script>

<svelte:head>
	<title>重Book</title>
	<meta name="description" content="重Book" />
</svelte:head>

<button class="uk-button uk-button-default" type="button" on:click={()=>modalOpen=true} uk-toggle="target: #read-modal">書籍追加</button>

<div id="read-modal" uk-modal>
    {#if modalOpen}
        <div class="uk-modal-dialog uk-modal-body">
            <BarCodeReader on:isbn={onIsbn} />
            <Books books={[...books.values()].reverse()} withBadge={true} />
            <button class="uk-modal-close-default" type="button" uk-close></button>
        </div>
    {/if}
</div>
