import type { RequestEvent } from '@sveltejs/kit';

export async function GET({
	params,
	platform,
	locals
}: RequestEvent<{ isbn: string }>): Promise<Response> {
	const isbn = params.isbn;

	const session = await locals.auth();
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

	const isOwn: boolean =
		(await db
			.prepare(
				'SELECT TRUE AS result FROM user_book_relations WHERE user_book_relations.user_email = ? AND user_book_relations.book_isbn = ? LIMIT 1'
			)
			.bind(userEmail, isbn)
			.first('result')) ?? false;

	return new Response(JSON.stringify({ isOwn }), {});
}
