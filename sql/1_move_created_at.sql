DROP TABLE IF EXISTS `tmp_books`;
CREATE TABLE `tmp_books` (
  `isbn` char(13) NOT NULL,
  `title` varchar(255),
  `author` varchar(255),
  `publisher` varchar(255),
  `img_url` varchar(255),
  PRIMARY KEY (`isbn`)
);
INSERT INTO `tmp_books` SELECT `isbn`, `title`, `author`, `publisher`, `img_url` FROM `books`;

DROP TABLE IF EXISTS `tmp_user_book_relations`;
CREATE TABLE `tmp_user_book_relations` (
  `user_email` varchar(255) NOT NULL,
  `book_isbn` char(13) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime')),
  PRIMARY KEY (`user_email`,`book_isbn`),
  FOREIGN KEY (`book_isbn`) REFERENCES `tmp_books` (`isbn`)
);
CREATE INDEX `user_book_relations_created_at` ON `tmp_user_book_relations` (`created_at`);
INSERT INTO `tmp_user_book_relations`(`user_email`, `book_isbn`) SELECT * FROM `user_book_relations`;

DROP TABLE IF EXISTS `user_book_relations`;
ALTER TABLE `tmp_user_book_relations` RENAME TO `user_book_relations`;

DROP TABLE IF EXISTS `books`;
ALTER TABLE `tmp_books` RENAME TO `books`;
