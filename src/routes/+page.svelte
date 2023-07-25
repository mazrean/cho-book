<script lang="ts">
	// @ts-nocheck
	import BarCodeReader from "../components/BarCodeReader.svelte";
    import { checkDigit, checkISBN } from "$lib/ts/barCode";
    import type { Book } from "$lib/ts/book";
	import Books from "../components/Books.svelte";
	import { signIn } from '@auth/sveltekit/client';
	import { page } from '$app/stores';

    // カメラの権限要求タイミングを使う時まで遅らせるため
    let modalOpen = false;

    let myBooks = fetch("/api/books").then((res) => res.json() as {books:Book[]});

    console.log($page.data);

    let books = new Map<string, Book>();
    async function onIsbn(e) {
        if (!checkDigit(e.detail) || !checkISBN(e.detail) || books.has(e.detail)) return;

        const res = await fetch(`/api/books/${e.detail}`)
        const json: Book = await res.json();
        books = books.set(json.isbn, json);
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
</script>

<svelte:head>
	<title>重Book</title>
	<meta name="description" content="重Book" />
</svelte:head>

{#if $page.data.session?.user?.name}
    <button class="uk-button uk-button-default uk-button-primary" type="button" on:click={()=>modalOpen=true} uk-toggle="target: #read-modal">書籍追加</button>
    {#await myBooks}
        <div uk-spinner></div>
    {:then books}
        <Books books={books.books.reverse()} withBadge={false} />
    {/await}

    <div id="read-modal" uk-modal>
        {#if modalOpen}
            <div class="uk-modal-dialog uk-modal-body uk-align-center">
                <p>バーコードをかざしてください</p><br>
                <BarCodeReader on:isbn={onIsbn} />
                <button class="uk-button uk-button-default uk-button-primary" type="button" on:click={submit} uk-toggle="target: #read-modal">追加</button>
                <Books books={[...books.values()].reverse()} withBadge={true} />
                <button class="uk-modal-close-default" type="button" uk-close></button>
            </div>
        {/if}
    </div>
{:else}
    <button class="uk-button uk-button-default uk-button-primary" on:click={() => signIn('google')}>Sign In</button>
{/if}
