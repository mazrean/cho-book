<script lang="ts">
	import { page } from '$app/stores';
	import { signIn } from '@auth/sveltekit/client';

    import type { Book } from "/@/lib/types/book";

	import BookItem from "/@/components/molecules/Book.svelte";
	import BarCodeModal from '../components/organs/BarCodeModal.svelte';

    // カメラの権限要求タイミングを使う時まで遅らせるため
    let modalOpen = false;

    let ownBooks: Book[] | null = null;

    (async () => {
        const res = await fetch("/api/books");
        if (!res.ok) return null;

        ownBooks = await res.json();
    })()

    const onSubmit = async (e: CustomEvent<Book[]>) => {
        const books = e.detail;

        const res = await fetch(`/api/books`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(books),
        });
        if (res.ok) {
            modalOpen = false;
            ownBooks = [...books, ...ownBooks ?? []];
        }
    }

    const onDelete = async (e: CustomEvent<Book>) => {
        const book = e.detail;

        const res = await fetch(`/api/books/${book.isbn}`, {
            method: "DELETE",
        });
        if (res.ok) {
            ownBooks = ownBooks?.filter(b => b.isbn !== book.isbn) ?? ownBooks;
        }
    }
</script>

<svelte:head>
	<title>重Book</title>
	<meta name="description" content="重Book" />
</svelte:head>

{#if $page.data.session?.user?.name}
    <button class="uk-button uk-button-default uk-button-primary" type="button" on:click={()=>modalOpen=true}>書籍追加</button>
    {#if ownBooks}
        {#each ownBooks as book}
            <BookItem book={book} on:delete={onDelete} />
        {/each}
        <BarCodeModal open={modalOpen} ownBookMap={new Map(ownBooks?.map(book => [book.isbn, book]))} on:submit={onSubmit} />
    {:else}
        <div class="uk-align-center" data-uk-spinner="ratio:3"></div>
    {/if}
{:else}
    <button class="uk-button uk-button-default uk-button-primary" on:click={() => signIn('google')}>Sign In</button>
{/if}
