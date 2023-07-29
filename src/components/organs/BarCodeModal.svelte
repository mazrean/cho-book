<script lang="ts">
    import UIkit from "uikit";
	import { createEventDispatcher } from 'svelte';

    import type { Book } from "/@/lib/types/book";
    import { checkISBN, checkDigit } from "/@/lib/ts/barCode";

	import BarCodeReader from "/@/components/molecules/BarCodeReader.svelte";
	import BookItem from "/@/components/molecules/Book.svelte";

    export let open = false;
    export let ownBookMap: Map<string, Book> | null = null;

    const dispatcher = createEventDispatcher();

    $: open? UIkit.modal("#bar-code-modal")?.show(): UIkit.modal("#bar-code-modal")?.hide();

    let books: Book[] = [];
    let hasDuplicate = false;
    const bookMap = new Map<string, {}>();
    async function onIsbn(e: CustomEvent<string>) {
        const isbn = e.detail;

        if (!checkDigit(isbn) || !checkISBN(isbn) || bookMap.has(isbn)) return;
        bookMap.set(isbn, {});

        const res = await fetch(`/api/books/${isbn}`)
        if (!res.ok) {
            bookMap.delete(isbn);
            return;
        };

        const book: Book = await res.json();
        books = [book, ...books];

        if (ownBookMap?.has(isbn)) {
            hasDuplicate = true;
            UIkit.notification(`<p uk-text>「${book.title}」は既に所持しています</p>`, {status:'danger', timeout: 5000});
        }
    }

    const onSubmit = () => {
        dispatcher("submit", books);
        books = [];
    };

    const onDelete = (e: CustomEvent<Book>) => {
        const book = e.detail;
        books = books.filter(b => b.isbn !== book.isbn);
        hasDuplicate = books.some(b => ownBookMap?.has(b.isbn));
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
                    <BookItem book={book} owned={ownBookMap.has(book.isbn)} on:delete={onDelete} />
                {/each}
            {/if}
            <button class="uk-modal-close-default" type="button" data-uk-close></button>
        </div>
    {/if}
</div>
