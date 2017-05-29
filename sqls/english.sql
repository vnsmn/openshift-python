DECLARE @u_id;
SET @u_id = 0, @us_id = 0;
BEGIN
  --DROP TABLE IF EXISTS english.topics CASCADE;
  --DROP TABLE IF EXISTS english.django_migrations CASCADE;
  delete from english.topics;
  insert into english.topics select 1, 'murhy essential', 'murhy_essential', 'topic.html', 'english/data/sound.json', 'english/data/data.json';
  insert into english.topics select 2, 'murhy intermedia', 'murhy_intermedia', 'topic.html', 'english/data/sound.json', 'english/data/data.json';
  insert into english.topics select 3, 'irregular', 'irregular', 'irregular_topic.html', 'https://raw.githubusercontent.com/ellsworth-vinson/audio/master/irregular.50.mp3.json', 'https://raw.githubusercontent.com/ellsworth-vinson/audio/master/irregular.50.dic.json';
  select * from english.topics;
  select * from english.user_topic;
END



