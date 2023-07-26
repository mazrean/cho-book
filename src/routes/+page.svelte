<script lang="ts">
    import UIkit from "uikit";
	import BarCodeReader from "../components/BarCodeReader.svelte";
    import { checkDigit, checkISBN } from "/@/lib/ts/barCode";
    import type { Book } from "/@/lib/types/book";
	import Books from "../components/Books.svelte";
	import { signIn } from '@auth/sveltekit/client';
	import { page } from '$app/stores';

    // カメラの権限要求タイミングを使う時まで遅らせるため
    let modalOpen = false;

    let ownBookMapPromise = (async () => {
        const res = await fetch("/api/books");
        if (!res.ok) return null;

        const books = await res.json() as Book[];

        return new Map(books.map((book) => [book.isbn, book]))
    })()

    let books = new Map<string, Book>();
    async function onIsbn(e: CustomEvent<string>) {
        const isbn = e.detail;

        if (!checkDigit(isbn) || !checkISBN(isbn) || books.has(isbn)) return;

        const res = await fetch(`/api/books/${isbn}`)
        if (!res.ok) return;

        const json: Book = await res.json();
        books = books.set(isbn, json);

        UIkit.notification(`<p uk-text>「${json.title}」は既に所持しています</p>`, {status:'danger', timeout: 5000})
    }

    async function submit() {
        const res = await fetch(`/api/books`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify([...books.values()]),
        });
        if (res.ok) {
            books = new Map<string, Book>();
            modalOpen = false;
        }
    }

    function hasDuplicateBook(books: Map<string, Book>, ownBookMap: Map<string, Book>) {
        return [...books.values()].some((book) => ownBookMap.has(book.isbn));
    }
</script>

<svelte:head>
	<title>重Book</title>
	<meta name="description" content="重Book" />
</svelte:head>

{#if $page.data.session?.user?.name}
    <button class="uk-button uk-button-default uk-button-primary" type="button" on:click={()=>modalOpen=true} data-uk-toggle="target: #read-modal">書籍追加</button>
    {#await ownBookMapPromise}
        <div class="uk-align-center" data-uk-spinner="ratio:3"></div>
    {:then ownBookMap}
        <Books books={ownBookMap?[...ownBookMap.values()].reverse():[]} />
    {/await}

    <div id="read-modal" data-uk-modal >
        {#if modalOpen}
            <div class="uk-modal-dialog uk-modal-body uk-align-center ">
                <p>バーコードをかざしてください</p><br>
                <BarCodeReader on:isbn={onIsbn} /><br>
                {#await ownBookMapPromise}
                    <button class="uk-button uk-button-default uk-button-primary uk-width-1-1" disabled={[...books.values()].length === 0} type="button" on:click={submit} data-uk-toggle="target: #read-modal">追加</button>
                    <Books books={[...books.values()].reverse()} />
                {:then ownBookMap}
                    <button class="uk-button uk-button-default uk-button-primary uk-width-1-1" disabled={[...books.values()].length === 0 || (ownBookMap && hasDuplicateBook(books, ownBookMap))} type="button" on:click={submit} data-uk-toggle="target: #read-modal">追加</button>
                    <Books books={[...books.values()].reverse()} ownBookMap={ownBookMap} />
                {/await}
                <button class="uk-modal-close-default" type="button" data-uk-close></button>
            </div>
        {/if}
    </div>
{:else}
    <button class="uk-button uk-button-default uk-button-primary" on:click={() => signIn('google')}>Sign In</button>
{/if}
