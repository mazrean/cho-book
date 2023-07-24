PRAGMA foreign_keys=true;

DROP TABLE IF EXISTS `books`;
CREATE TABLE `books` (
  `isbn` char(13) NOT NULL,
  `title` varchar(255),
  `author` varchar(255),
  `publisher` varchar(255),
  `image_url` varchar(255),
  `created_at` datetime NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime')),
  PRIMARY KEY (`isbn`)
);

DROP TABLE IF EXISTS `user_book_relations`;
CREATE TABLE `user_book_relations` (
  `user_email` varchar(255) NOT NULL,
  `book_isbn` char(13) NOT NULL,
  PRIMARY KEY (`user_email`,`book_isbn`),
  FOREIGN KEY (`book_isbn`) REFERENCES `books` (`isbn`)
);
