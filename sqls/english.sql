DECLARE @u_id;
SET @u_id = 0, @us_id = 0;
BEGIN
  --DROP TABLE IF EXISTS english.topics CASCADE;
  --DROP TABLE IF EXISTS english.topic CASCADE;
  --DROP TABLE IF EXISTS english.user_topic CASCADE;
  --DROP TABLE IF EXISTS english.django_migrations CASCADE;
  delete from english.user_topic;
  delete from english.topic;
  delete from english.topics;
  insert into english.topics select 1, 'murhy essential', 'murhy_essential', 'topic.html';
  insert into english.topics select 2, 'murhy intermedia', 'murhy_intermedia', 'topic.html';
  insert into english.topics select 3, 'irregular', 'irregular', 'irregular_topic.html';
  insert into english.topic(id, name, topic_id, data) VALUES (1, 'meta.sound.url', 3, 'https://raw.githubusercontent.com/ellsworth-vinson/audio/master/irregular.mp3.json');
  insert into english.topic(id, name, topic_id, data) VALUES (2, 'i50.url', 3, 'https://raw.githubusercontent.com/ellsworth-vinson/audio/master/irregular.50.json');
  insert into english.topic(id, name, topic_id, data) VALUES (3, 'i100.url', 3, 'https://raw.githubusercontent.com/ellsworth-vinson/audio/master/irregular.100.json');
  insert into english.topic(id, name, topic_id, data) VALUES (4, 'i150.url', 3, 'https://raw.githubusercontent.com/ellsworth-vinson/audio/master/irregular.150.json');
  select * from english.topics;
  select * from english.topic;
  select * from english.user_topic;
END



