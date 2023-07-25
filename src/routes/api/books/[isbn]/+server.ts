import { json } from '@sveltejs/kit';
import { XMLParser } from 'fast-xml-parser';
import type { Book } from '/@/lib/types/book';

export async function GET({ params }) {
	const isbn = params.isbn;

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

		const title = record['dc:title'];
		const author = record['dc:creator'];
		const publisher = record['dc:publisher'];
		const imgUrl = imgRes.ok ? issImgUrl : null;

		return { title, author, publisher, imgUrl };
	});

	const googlePromise = fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`).then(
		async (res) => {
			const json = await res.json();
			if (json.totalItems === 0) return null;

			const item = json.items[0];
			const title = item.volumeInfo.title;
			const author = item.volumeInfo.authors?.join(', ');
			const publisher = item.volumeInfo.publisher;
			const imgUrl = item.volumeInfo.imageLinks?.thumbnail;

			return { title, author, publisher, imgUrl };
		}
	);

	const openbdPromise = fetch(`https://api.openbd.jp/v1/get?isbn=${isbn}`).then(async (res) => {
		const json = await res.json();
		if (json.length === 0 || json[0] === null) return null;

		const item = json[0].summary;
		const title = item.title;
		const author = item.author;
		const publisher = item.publisher;
		const imgUrl = item.cover;

		return { title, author, publisher, imgUrl };
	});

	const book: Book = {
		isbn: isbn,
		title: null,
		author: null,
		publisher: null,
		imgUrl: null
	};
	const requests = [issPromise, googlePromise, openbdPromise];
	let i = 0;
	while (i < requests.length && (!book.title || !book.author || !book.publisher || !book.imgUrl)) {
		const res = await Promise.race(requests);
		i++;

		if (res) {
			book.title ||= res.title || null;
			book.author ||= res.author || null;
			book.publisher ||= res.publisher || null;
			book.imgUrl ||= res.imgUrl || null;
		}
	}
	if (!book.title) {
		return new Response('no book', { status: 404 });
	}

	return json(book);
}
