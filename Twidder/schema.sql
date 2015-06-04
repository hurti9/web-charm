drop table if exists users;
create table users (
  firstname text not null,
  familyname text not null,
  gender text not null,
  city text not null,
  country text not null,
  email text not null,
  password text not null,
  primary key(email)
);
drop table if exists posts;
create table posts(
wallowner text not null,
author text not null,
post text not null,
foreign key (wallowner) references users(email),
foreign key (author) references logged(email)
);
drop table if exists logged;
create table logged(
email text primary key not null,
token text not null,
foreign key (email) REFERENCES users(email)
);