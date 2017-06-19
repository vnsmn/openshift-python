DECLARE @u_id;
SET @u_id = 0, @us_id = 0;
BEGIN
  --DROP TABLE IF EXISTS english.topics CASCADE;
  --DROP TABLE IF EXISTS english.topic CASCADE;
  --DROP TABLE IF EXISTS english.user_topic CASCADE;
  --DROP TABLE IF EXISTS english.dictionary CASCADE;
  --DROP TABLE IF EXISTS english.django_migrations CASCADE;
  delete from english.dictionary;
  delete from english.user_topic;
  delete from english.topic;
  delete from english.topics;

  insert into english.topics select 1, 'murhy essential', 'murhy_essential', 'topic.html';
  insert into english.topics select 2, 'murhy intermedia', 'murhy_intermedia', 'topic.html';
  insert into english.topics select 3, 'irregular', 'irregular', 'irregular_topic.html';
  insert into english.topics select 4, 'dictionary', 'dictionary', 'dictionary_topic.html';

  insert into english.topic(id, name, topic_id, data) VALUES (1, 'i50.meta.sound.url', 3, 'https://raw.githubusercontent.com/ellsworth-vinson/audio/master/irregular.50.mp3.json');
  insert into english.topic(id, name, topic_id, data) VALUES (2, 'i100.meta.sound.url', 3, 'https://raw.githubusercontent.com/ellsworth-vinson/audio/master/irregular.100.mp3.json');
  insert into english.topic(id, name, topic_id, data) VALUES (3, 'i150.meta.sound.url', 3, 'https://raw.githubusercontent.com/ellsworth-vinson/audio/master/irregular.150.mp3.json');
  insert into english.topic(id, name, topic_id, data) VALUES (4, 'i50.example.sound.url', 3, 'https://raw.githubusercontent.com/ellsworth-vinson/audio/master/irregular.50.example.mp3.json');
  insert into english.topic(id, name, topic_id, data) VALUES (5, 'i100.example.sound.url', 3, 'https://raw.githubusercontent.com/ellsworth-vinson/audio/master/irregular.100.example.mp3.json');
  insert into english.topic(id, name, topic_id, data) VALUES (6, 'i150.example.sound.url', 3, 'https://raw.githubusercontent.com/ellsworth-vinson/audio/master/irregular.150.example.mp3.json');
  insert into english.topic(id, name, topic_id, data) VALUES (7, 'i50.url', 3, 'https://raw.githubusercontent.com/ellsworth-vinson/audio/master/irregular.50.json');
  insert into english.topic(id, name, topic_id, data) VALUES (8, 'i100.url', 3, 'https://raw.githubusercontent.com/ellsworth-vinson/audio/master/irregular.100.json');
  insert into english.topic(id, name, topic_id, data) VALUES (9, 'i150.url', 3, 'https://raw.githubusercontent.com/ellsworth-vinson/audio/master/irregular.150.json');

  insert into english.topic(id, name, topic_id, data) VALUES (10, 'dictionary.url', 4, 'https://raw.githubusercontent.com/ellsworth-vinson/audio/master/dic/dictionary.json');

  select * from english.topics;
  select * from english.topic;
  select * from english.user_topic;
END



