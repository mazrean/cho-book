import { json, type RequestEvent } from '@sveltejs/kit';
import { XMLParser } from 'fast-xml-parser';
import type { Book } from '/@/lib/types/book';

export async function GET({
	request,
	params,
	platform,
	fetch
}: RequestEvent<{ isbn: string }>): Promise<Response> {
	const isbn = params.isbn;

	const cache = platform?.caches.default;
	if (cache) {
		const response = await cache.match(request);
		if (response) {
			return response;
		}
	}

	const db = platform?.env.DB;
	if (!db) {
		return new Response(null, { status: 500 });
	}

	const dbPromise = db
		.prepare(
			'SELECT `title`, `author`, `publisher`, `img_url` AS `imgUrl` FROM `books` WHERE `isbn` = ? LIMIT 1'
		)
		.bind(isbn)
		.first()
		.then((book) => {
			if (!book) return null;

			return {
				title: book.title as string,
				author: book.author as string,
				publisher: book.publisher as string,
				imgUrl: book.img_url as string | null
			};
		});

	const issImgUrl = `https://iss.ndl.go.jp/thumbnail/${isbn}`;
	const issPromise = Promise.all([
		fetch(
			`https://iss.ndl.go.jp/api/sru?operation=searchRetrieve&query=isbn=${isbn}&maximumRecords=1`
		),
		fetch(issImgUrl)
	]).then(async ([res, imgRes]) => {
		const parser = new XMLParser();
		const xml = parser.parse(await res.text());

		let record = xml?.searchRetrieveResponse?.records?.record?.recordData;
		if (!record) return null;

		record = parser.parse(record)?.['srw_dc:dc'];
		if (!record) return null;

		let title = record['dc:title'] as string | string[];
		if (Array.isArray(title)) {
			title = title.join(', ');
		}

		let author = record['dc:creator'] as string | string[];
		if (Array.isArray(author)) {
			author = author.join(', ');
		}

		let publisher = record['dc:publisher'] as string | string[];
		if (Array.isArray(publisher)) {
			publisher = publisher.join(', ');
		}

		const imgUrl = imgRes.ok ? (issImgUrl as string) : null;

		return { title, author, publisher, imgUrl };
	});

	const googlePromise = fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`).then(
		async (res) => {
			const json = await res.json();
			if (json.totalItems === 0) return null;

			const item = json.items[0];
			const title = item.volumeInfo.title as string;
			const author = item.volumeInfo.authors?.join(', ') as string;
			const publisher = item.volumeInfo.publisher as string;
			const imgUrl: string | null = item.volumeInfo.imageLinks?.thumbnail;

			return { title, author, publisher, imgUrl };
		}
	);

	const openbdPromise = fetch(`https://api.openbd.jp/v1/get?isbn=${isbn}`).then(async (res) => {
		const json = await res.json();
		if (json.length === 0 || json[0] === null) return null;

		const item = json[0].summary;
		const title = item.title as string;
		const author = item.author as string;
		const publisher = item.publisher as string;
		const imgUrl: string | null = item.cover;

		return { title, author, publisher, imgUrl };
	});

	const book: Book = {
		isbn: isbn,
		title: '',
		author: null,
		publisher: null,
		imgUrl: null
	};
	let requests = [dbPromise, issPromise, googlePromise, openbdPromise].map((p, i) => ({
		withI: p.then((res) => ({ res, i })),
		p
	}));
	while (requests.length > 0 && (!book.title || !book.author || !book.publisher || !book.imgUrl)) {
		const { res, i } = await Promise.race(requests.map(({ withI }) => withI));
		requests.splice(i, 1);
		requests = requests.map(({ p }, i) => ({ withI: p.then((res) => ({ res, i })), p }));

		if (res) {
			// 巻が入っていて欲しいので、長い方を採用
			// ただし、途中で全情報が揃った場合はレスポンス速度を優先して確認していない
			book.title = res.title
				? res.title.length > book.title.length
					? res.title
					: book.title
				: book.title;
			book.author ||= res.author || null;
			book.publisher ||= res.publisher || null;
			book.imgUrl ||= res.imgUrl || null;
		}
	}
	if (!book.title) {
		return new Response('no book', { status: 404 });
	}

	const res = json(book);
	res.headers.set('Cache-Control', 'public, immutable, s-maxage=604800');
	cache?.put(request, res);

	const info = await db
		.prepare(
			'INSERT OR REPLACE INTO `books` (`isbn`, `title`, `author`, `publisher`, `img_url`) VALUES (?, ?, ?, ?, ?)'
		)
		.bind(book.isbn, book.title, book.author, book.publisher, book.imgUrl)
		.run();
	if (!info?.success) return new Response('failed to insert books', { status: 500 });

	return res;
}

export async function DELETE({
	params,
	locals,
	platform
}: RequestEvent<{ isbn: string }>): Promise<Response> {
	const session = await locals.getSession();
	if (!session) {
		return new Response(null, { status: 401 });
	}

	const userEmail = session.user?.email;
	if (!userEmail) {
		return new Response(null, { status: 401 });
	}

	const isbn = params.isbn;

	const db = platform?.env.DB;
	if (!db) {
		return new Response(null, { status: 500 });
	}

	const info = await db
		.prepare('DELETE FROM user_book_relations WHERE user_email = ? AND book_isbn = ?')
		.bind(userEmail, isbn)
		.run();
	if (!info?.success) return new Response('failed to delete user_book_relations', { status: 500 });

	return new Response(null, { status: 204 });
}
