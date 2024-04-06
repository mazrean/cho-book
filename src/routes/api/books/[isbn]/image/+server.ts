import type { RequestEvent } from '@sveltejs/kit';
import type { Book } from '/@/lib/types/book';

export async function GET({
	params,
	platform,
	request
}: RequestEvent<{ isbn: string }>): Promise<Response> {
	const isbn = params.isbn;

	let url: string | undefined;

	const cache = platform?.caches.default;
	if (cache) {
		const response = await cache.match(request);
		if (response?.ok) {
			return response;
		}

		const bookResponse = await cache.match(
			new Request(`https://cho-book.mazrean.com/api/books/${isbn}`)
		);
		if (bookResponse?.ok) {
			const book: Book = await bookResponse.json();
			url = book.rawImgUrl ?? url;
		}
	}

	if (!url) {
		const db = platform?.env.DB;
		if (!db) {
			return new Response(null, { status: 500 });
		}

		const dbBook: {
			title: string;
			author: string;
			publisher: string;
			imgUrl: string | null;
		} | null = await db
			.prepare(
				'SELECT `title`, `author`, `publisher`, `img_url` AS `imgUrl` FROM `books` WHERE `isbn` = ? LIMIT 1'
			)
			.bind(isbn)
			.first();
		if (!dbBook || !dbBook.imgUrl) {
			console.debug('No img_url found for isbn:', isbn); // 'No img_url found for isbn: 9784041021070
			return new Response(null, { status: 404 });
		}

		url = dbBook.imgUrl;
	}

	const response = await fetch(url);
	if (!response.ok) {
		console.log('Failed to fetch image:', url); // 'Failed to fetch image: https://example.com/image.jpg'
		return new Response(null, { status: 404 });
	}

	const res = new Response(response.body, response);
	res.headers.set('Cache-Control', 'public, immutable, s-maxage=604800');
	cache?.put(request, res.clone());

	return res;
}
