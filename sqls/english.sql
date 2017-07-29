DECLARE @u_id;
SET @u_id = 0, @us_id = 0;
BEGIN
  --DROP TABLE IF EXISTS english.topics CASCADE;
  --DROP TABLE IF EXISTS english.topic CASCADE;
  --DROP TABLE IF EXISTS english.user_topic CASCADE;
  --DROP TABLE IF EXISTS english.dictionary CASCADE;
  --DROP TABLE IF EXISTS english.user_jsn_data CASCADE;
  --DROP TABLE IF EXISTS english.django_migrations CASCADE;
  delete from english.dictionary;
  delete from english.user_topic;
  delete from english.topic;
  delete from english.topics;
  delete from english.user_jsn_data;

  insert into english.topics select 1, 'irregular', 'irregular', 'irregular_topic.html';
  insert into english.topics select 2, 'dictionary', 'dictionary', 'dictionary_topic.html';
  insert into english.topics select 3, 'text', 'text', 'text_topic.html';
  insert into english.topics select 4, 'longman', 'longman', 'longman_topic.html';

  insert into english.topic(id, name, topic_id, data) VALUES (1, 'irregular.url', 1, 'https://raw.githubusercontent.com/ellsworth-vinson/audio/master/irregular/irregular.json');
  insert into english.topic(id, name, topic_id, data) VALUES (2, 'dictionary.url', 2, 'https://raw.githubusercontent.com/ellsworth-vinson/audio/master/dictionary/dictionary.json');
  insert into english.topic(id, name, topic_id, data) VALUES (3, 'text.url', 3, 'https://raw.githubusercontent.com/ellsworth-vinson/audio/master/text/text.json');
  insert into english.topic(id, name, topic_id, data) VALUES (4, 'longman.url', 4, 'https://raw.githubusercontent.com/ellsworth-vinson/audio/master/dictionary/longman.json');


  select * from english.topics;
  select * from english.topic;
  select * from english.user_topic;
  select * from english.user_jsn_data;
END



