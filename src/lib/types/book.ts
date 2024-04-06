export type Book = {
	isbn: string;
	title: string;
	author: string | null;
	publisher: string | null;
	imgUrl: string | null;
	rawImgUrl?: string | null;
};
