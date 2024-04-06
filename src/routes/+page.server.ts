import type { Book } from '/@/lib/types/book';

export async function load({ platform, locals }) {
	const session = await locals.getSession();
	if (!session) {
		return new Response(null, { status: 401 });
	}

	const userEmail = session.user?.email;
	if (!userEmail) {
		return new Response(null, { status: 401 });
	}
	const db = platform?.env.DB;
	if (!db) {
		return new Response(null, { status: 500 });
	}

	const limit = 20;
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
			'SELECT books.* FROM books JOIN user_book_relations ON books.isbn = user_book_relations.book_isbn WHERE user_book_relations.user_email = ? ORDER BY user_book_relations.created_at DESC LIMIT ?'
		)
		.bind(userEmail, limit)
		.all();
	const isEnd = books.length < limit;

	return {
		ownBooks: books.map(
			(book) =>
				({
					isbn: book.isbn,
					title: book.title,
					author: book.author,
					publisher: book.publisher,
					imgUrl: book.img_url
				} as Book)
		),
		limit,
		isEnd
	};
}
