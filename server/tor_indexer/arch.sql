create database alina;

-- Master table --
create table domain (
	id int auto_increment,
  	domain varchar(100),
  	duplicate boolean default false,
	duplicateId int default null,
  	primary key(id)
)

create table pages(
  	pageid int auto_increment,
	url text,
  	title text,
  	primary key(pageid)
)

create table images(
  	imageid int auto_increment,
	url text,
  	alt text,
  	id text, 
  	name text, 
  	type text,
  	primary key(imageid)
)

create table videos(
  	videoid int auto_increment,
	url text,
  	alt text,
  	id text, 
  	name text, 
	type text,
  	primary key(videoid)
)

--Containers table--

create table paragraphs(
  	pageid int,
	content text
)

create table email(
  	domainID int,
	email text
)

create table crypto(
	domainid int,
  	name varchar(20),
  	value text
)
