<script lang="ts">
    import type UIkit from "uikit";
	import { createEventDispatcher } from 'svelte';

    import type { Book } from "/@/lib/types/book";
    import { checkISBN, checkDigit } from "/@/lib/ts/barCode";

	import BarCodeReader from "/@/components/molecules/BarCodeReader.svelte";
	import BookItem from "/@/components/molecules/Book.svelte";
	import { browser } from "$app/environment";

    export let open = false;
    export let ownBookMap: Map<string, Book> | null = null;

    const dispatcher = createEventDispatcher();

    let uikit: typeof UIkit | undefined;
    if (browser) {
        import('uikit').then(m => {
            uikit = m.default;
        });
    }
    $: open? uikit?.modal("#bar-code-modal")?.show(): uikit?.modal("#bar-code-modal")?.hide();

    let books: {
        book: Book;
        isOwn: boolean;
    }[] = [];
    let hasDuplicate = false;
    const bookMap = new Map<string, {}>();
    async function onIsbn(e: CustomEvent<string>) {
        const isbn = e.detail;

        if (!checkDigit(isbn) || !checkISBN(isbn) || bookMap.has(isbn)) return;
        bookMap.set(isbn, {});

        const ownPromise = (async () => {
            if (ownBookMap?.has(isbn)) return true;

            const res = await fetch(`/api/books/${isbn}/own`);
            if (!res.ok) return false;

            return (await res.json()).isOwn as boolean;
        })();

        const bookPromise = fetch(`/api/books/${isbn}`).then(async res => {
            if (!res.ok) {
                bookMap.delete(isbn);
                return null;
            };

            return (await res.json()) as Book;
        });

        const [isOwn, book] = await Promise.all([ownPromise, bookPromise]);
        if (!book) {
            return;
        }

        books = [...books, {book, isOwn}];

        if (isOwn) {
            hasDuplicate = true;
            ownBookMap?.set(book.isbn, book);
            uikit?.notification(`<p uk-text>「${book.title}」は既に所持しています</p>`, {status:'danger', timeout: 5000});
        }
    }

    const onSubmit = () => {
        dispatcher("submit", books);
        books = [];
    };

    const onDelete = (e: CustomEvent<Book>) => {
        const book = e.detail;
        books = books.filter(b => b.book.isbn !== book.isbn);
        hasDuplicate = books.some(b => b.isOwn);
        bookMap.delete(book.isbn);
    }
</script>

<div id="bar-code-modal" data-uk-modal >
    {#if open}
        <div class="uk-modal-dialog uk-modal-body uk-align-center ">
            <p class="uk-text">バーコードをかざしてください</p>
            <BarCodeReader on:isbn={onIsbn} />
            <button
                class="uk-button uk-button-default uk-button-primary uk-width-1-1"
                disabled={books.length === 0 || hasDuplicate}
                type="button"
                on:click={onSubmit}
                data-uk-toggle="target: #read-modal"
            >追加</button>
            {#if ownBookMap}
                {#each books as book}
                    <BookItem book={book.book} owned={ownBookMap.has(book.book.isbn)} on:delete={onDelete} />
                {/each}
            {/if}
            <button class="uk-modal-close-default" type="button" data-uk-close></button>
        </div>
    {/if}
</div>
