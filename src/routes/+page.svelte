<script lang="ts">
	import BarCodeReader from "../components/BarCodeReader.svelte";
    import { checkDigit, checkISBN } from "/@/lib/ts/barCode";
    import type { Book } from "/@/lib/types/book";
	import Books from "../components/Books.svelte";
	import { signIn } from '@auth/sveltekit/client';
	import { page } from '$app/stores';

    // カメラの権限要求タイミングを使う時まで遅らせるため
    let modalOpen = false;

    let myBooks = (async () => {
        const res = await fetch("/api/books");
        if (!res.ok) return;

        return (await res.json()) as Book[];
    })()

    let books = new Map<string, Book>();
    async function onIsbn(e: CustomEvent<string>) {
        if (!checkDigit(e.detail) || !checkISBN(e.detail) || books.has(e.detail)) return;

        const res = await fetch(`/api/books/${e.detail}`)
        if (!res.ok) return;

        const json: Book = await res.json();
        books = books.set(e.detail, json);
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
        <div class="uk-align-center" uk-spinner="ratio:3"></div>
    {:then books}
        <Books books={books?[...books.values()].reverse():[]} />
    {/await}

    <div id="read-modal" uk-modal >
        {#if modalOpen}
            <div class="uk-modal-dialog uk-modal-body uk-align-center ">
                <p>バーコードをかざしてください</p><br>
                <BarCodeReader on:isbn={onIsbn} /><br>
                <button class="uk-button uk-button-default uk-button-primary uk-width-1-1" disabled={[...books.values()].length === 0} type="button" on:click={submit} uk-toggle="target: #read-modal">追加</button>
                {#await myBooks}
                <Books books={[...books.values()].reverse()} />
                {:then nowBooks}
                <Books books={[...books.values()].reverse()} nowBooks={nowBooks} />
                {/await}
                <button class="uk-modal-close-default" type="button" uk-close></button>
            </div>
        {/if}
    </div>
{:else}
    <button class="uk-button uk-button-default uk-button-primary" on:click={() => signIn('google')}>Sign In</button>
{/if}
