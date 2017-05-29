rm -r english/migrations
./manage.py makemigrations english
./manage.py migrate english --database=english
