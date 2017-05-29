rm -r core/migrations
./manage.py syncdb --database default
./manage.py makemigrations
./manage.py migrate --database default
