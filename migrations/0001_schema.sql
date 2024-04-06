-- Migration number: 0001 	 2024-04-06T06:14:29.966Z
PRAGMA foreign_keys=true;

CREATE TABLE IF NOT EXISTS `books` (
  `isbn` char(13) NOT NULL,
  `title` varchar(255),
  `author` varchar(255),
  `publisher` varchar(255),
  `img_url` varchar(255),
  `created_at` datetime NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime')),
  PRIMARY KEY (`isbn`)
);

CREATE TABLE IF NOT EXISTS `user_book_relations` (
  `user_email` varchar(255) NOT NULL,
  `book_isbn` char(13) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime')),
  PRIMARY KEY (`user_email`,`book_isbn`),
  FOREIGN KEY (`book_isbn`) REFERENCES `books` (`isbn`)
);
