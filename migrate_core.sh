rm -r core/migrations
./manage.py makemigrations core
./manage.py migrate core --database=core
