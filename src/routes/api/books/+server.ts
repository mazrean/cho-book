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

	const { books }: { books: Book[] } = await request.json();
	if (!books) {
		return new Response(null, { status: 400 });
	}

	const db = platform?.env.DB;

	// TODO: 他の人が登録した本を上書きしてしまう可能性があるのでだいぶ不味い挙動だが、時間がないので一旦許容
	let query = 'INSERT OR REPLACE INTO books (isbn, title, author, publisher, imgUrl) VALUES ';
	for (const book of books) {
		query += `(?, ?, ?, ?, ?)`;

		if (book !== books[books.length - 1]) {
			query += ', ';
		}
	}

	const preparedDB = db.prepare(query);

	const queryParams = books.flatMap((book) => [
		book.isbn,
		book.title,
		book.author,
		book.publisher,
		book.imgUrl
	]);

	const info = await preparedDB.bind(...queryParams, userEmail).run();
	if (!info?.success) return new Response('failed to insert books', { status: 500 });

	query = 'INSERT INTO user_book_relations (user_email, book_isbn) VALUES ';
	for (const book of books) {
		query += `(?, ?)`;

		if (book !== books[books.length - 1]) {
			query += ', ';
		}
	}

	const preparedDB2 = db.prepare(query);

	const queryParams2 = books.flatMap((book) => [userEmail, book.isbn]);

	const info2 = await preparedDB2.bind(...queryParams2).run();
	if (!info2?.success) return new Response('failed to insert user_book_relations', { status: 500 });

	return new Response(null, { status: 201 });
}

export async function GET({ locals, platform }) {
	const session = await locals.getSession();
	if (!session) {
		return new Response(null, { status: 401 });
	}

	const userEmail = session.user?.email;
	if (!userEmail) {
		return new Response(null, { status: 401 });
	}

	const db = platform?.env.DB;

	const { results: books }: { results: Book[] } = await db
		.prepare(
			'SELECT * FROM books JOIN user_book_relations ON books.isbn = user_book_relations.book_isbn WHERE user_book_relations.user_email = ?'
		)
		.bind(userEmail)
		.all();

	return new Response(JSON.stringify({ books }), {
		status: 200
	});
}
