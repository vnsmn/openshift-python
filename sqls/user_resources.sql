DECLARE @u_id;
SET @u_id = 0, @us_id = 0;
BEGIN
  delete from user_resources;  
  set @u_id = select id from auth_user where username = 'admin';
  insert into user_resources select 1, '/eng', @u_id;
  select * from user_resources;
END



