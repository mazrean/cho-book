export type Book = {
	isbn: string;
	title: string;
	author: string | null;
	publisher: string | null;
	imgUrl: string | null;
};

export type DBBook = {
	isbn: string;
	title: string;
	author: string | null;
	publisher: string | null;
	img_url: string | null;
};
