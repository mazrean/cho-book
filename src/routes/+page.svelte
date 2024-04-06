<script lang="ts">
	import { page } from '$app/stores';
	import { signIn } from '@auth/sveltekit/client';

    import type { Book } from "/@/lib/types/book";

	import BookItem from "/@/components/molecules/Book.svelte";
	import BarCodeModal from '../components/organs/BarCodeModal.svelte';
	import type { PageData } from './$types';

    export let data: PageData;


    const limit = data.limit ?? 20;
    let ownBooks = data.ownBooks ?? [];
    let isEnd = data.isEnd ?? false;
    let offset = limit;
    const loadBooks = async () => {
        const res = await fetch(`/api/books?limit=${limit}&offset=${offset}`);
        if (!res.ok) {
            isLoading = false;
            return;
        }

        const newBooks = await res.json();
        ownBooks = [...(ownBooks ?? []), ...newBooks];

        offset += limit;
        isEnd = newBooks.length < limit;
    }

    let innerHeight: number;
    let scrollY: number;
    let offsetHeight: number;
    let isLoading = false;
    const scrollHandler = async () => {
        offsetHeight = document.body.offsetHeight;
        const hasReached = innerHeight + Math.ceil(scrollY) >= offsetHeight
        if (hasReached && !isLoading && !isEnd) {
            isLoading = true;
            await loadBooks();
            isLoading = false;
        }
    }

    let modalOpen = false;
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

<svelte:window on:scroll={scrollHandler} on:wheel={scrollHandler} on:touchmove={scrollHandler} bind:innerHeight={innerHeight} bind:scrollY={scrollY} />
<svelte:body bind:offsetHeight={offsetHeight} />

{#if $page.data.session?.user?.name}
    <button class="uk-button uk-button-default uk-button-primary" type="button" on:click={()=>modalOpen=true}>書籍追加</button>
    {#each ownBooks as book}
        <BookItem book={book} on:delete={onDelete} />
    {/each}
    <div class="uk-align-center" data-uk-spinner="ratio:3" style={isLoading ? "opacity: 1": "opacity: 0"}></div>
    <BarCodeModal open={modalOpen} ownBookMap={new Map(ownBooks?.map(book => [book.isbn, book]))} on:submit={onSubmit} />
{:else}
    <button class="uk-button uk-button-default uk-button-primary" on:click={() => signIn('google')}>Sign In</button>
{/if}
