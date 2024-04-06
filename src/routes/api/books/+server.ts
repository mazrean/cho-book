import type { Book } from '/@/lib/types/book';

export async function POST({ locals, platform, request }) {
	const session = await locals.getSession();
	if (!session) {
		return new Response(null, { status: 401 });
	}

	const userEmail = session.user?.email;
	if (!userEmail) {
		return new Response(null, { status: 401 });
	}

	const books: Book[] = await request.json();
	if (!books) {
		return new Response(null, { status: 400 });
	}

	const db = platform?.env.DB;

	let query = 'INSERT INTO user_book_relations (user_email, book_isbn) VALUES ';
	for (const book of books) {
		query += `(?, ?)`;

		if (book !== books[books.length - 1]) {
			query += ', ';
		}
	}

	const info = await db
		?.prepare(query)
		.bind(...books.flatMap((book) => [userEmail, book.isbn]))
		.run();
	if (!info?.success) return new Response('failed to insert user_book_relations', { status: 500 });

	return new Response(null, { status: 201 });
}

export async function GET({ locals, platform, url }) {
	const session = await locals.getSession();
	if (!session) {
		return new Response(null, { status: 401 });
	}

	const userEmail = session.user?.email;
	if (!userEmail) {
		return new Response(null, { status: 401 });
	}

	const strLimit = url.searchParams.get('limit');
	let limit: number | undefined;
	if (strLimit) {
		limit = parseInt(strLimit);
	} else {
		limit = 20;
	}

	const strOffset = url.searchParams.get('offset');
	let offset: number | undefined;
	if (strOffset) {
		offset = parseInt(strOffset);
	} else {
		offset = 0;
	}

	const db = platform?.env.DB;
	if (!db) {
		return new Response(null, { status: 500 });
	}

	const {
		results: books
	}: {
		results: {
			isbn: string;
			title: string;
			author: string;
			publisher: string;
			img_url: string;
		}[];
	} = await db
		.prepare(
			'SELECT books.* FROM books JOIN user_book_relations ON books.isbn = user_book_relations.book_isbn WHERE user_book_relations.user_email = ? ORDER BY user_book_relations.created_at DESC LIMIT ? OFFSET ?'
		)
		.bind(userEmail, limit, offset)
		.all();

	return new Response(
		JSON.stringify(
			books.map((book) => {
				return {
					isbn: book.isbn,
					title: book.title,
					author: book.author,
					publisher: book.publisher,
					imgUrl: book.img_url
				} as Book;
			})
		),
		{
			status: 200
		}
	);
}
