CREATE TABLE `domain` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `domain` varchar(255),
  `lastcheck` varchar(255)
);

CREATE TABLE `links` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `link` text,
  `title` varchar(255),
  `lastpass` varchar(255)
);

CREATE TABLE `media` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `link` text,
  `name` text,
  `type` text,
  `ext` text,
  `lastpass` text
);

CREATE TABLE `checking` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `url` text
);
