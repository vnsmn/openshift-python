"""
Django settings for python project.

Generated by 'django-admin startproject' using Django 1.8.18.

For more information on this file, see
https://docs.djangoproject.com/en/1.8/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.8/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.8/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '@-*x1tybmj0*h)o)4w-i^$h7kz(a3d0igz54p4h1h4ql)r(ot4'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['vlad.sitel.ua', 'localhost', '127.0.0.1','django-kilimandjaro.1d35.starter-us-east-1.openshiftapps.com']

# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'core',
    'english'
)

#https://djbook.ru/rel1.8/topics/http/sessions.html

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'core.middleware.ApplicationMiddleware',
)

ROOT_URLCONF = 'python.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates'), ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'python.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.8/ref/settings/#databases
# https://docs.djangoproject.com/el/1.10/ref/settings/
# https://docs.djangoproject.com/el/1.10/ref/settings/#std:setting-DATABASE-ENGINE
# https://docs.djangoproject.com/el/1.10/ref/databases/#postgresql-notes
# https://docs.djangoproject.com/en/1.11/
# https://wiki.postgresql.org/wiki/Psycopg2_Tutorial
# https://wiki.postgresql.org/wiki/Using_psycopg2_with_PostgreSQL
# https://djbook.ru/rel1.9/ref/settings.html

DATABASE_ROUTERS = ['python.router.DatabaseAppsRouter']

DATABASE_APPS_MAPPING = {'core': 'core', 'english': 'english'}

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'postgresdb',
        'USER': 'postgresql',
        'PASSWORD': 'postgresql',
        'HOST': 'postgresql.kilimandjaro.svc',
        'PORT': '5432'
    },
    'english': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'postgresdb',
        'USER': 'postgresql',
        'PASSWORD': 'postgresql',
        'HOST': 'postgresql.kilimandjaro.svc',
        'PORT': '5432',
        'OPTIONS': {
            'options': '-c search_path=english'
        }
    },
    'core': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'postgresdb',
        'USER': 'postgresql',
        'PASSWORD': 'postgresql',
        'HOST': 'postgresql.kilimandjaro.svc',
        'PORT': '5432',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# https://docs.djangoproject.com/en/1.8/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.8/howto/static-files/

STATIC_URL = '/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "static"),
    os.path.join(BASE_DIR, "static/english"),
]

LOGIN_REDIRECT_URL = 'redirect'
LOGIN_URL = 'login'

DJANGO_LOG_LEVEL = 'DEBUG'

# https://docs.python.org/3/library/logging.html#formatter-objects
# https://docs.djangoproject.com/en/1.11/topics/logging/

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(module)s %(processName)s %(threadName)s %(message)s'
        },
        'simple': {
            'format': '%(levelname)s %(message)s'
        },
    },
    'handlers': {
        'file': {
            'level': os.getenv('DJANGO_LOG_LEVEL', DJANGO_LOG_LEVEL),
            'class': 'logging.FileHandler',
            'filename': 'openshift_django.log',
            'formatter': 'verbose',
        },
        'console': {
            'class': 'logging.StreamHandler',
            'level': os.getenv('DJANGO_LOG_LEVEL', DJANGO_LOG_LEVEL),
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': os.getenv('DJANGO_LOG_LEVEL', DJANGO_LOG_LEVEL),
            'propagate': True,
        },
        'core.middleware': {
            'handlers': ['file', 'console'],
            'level': os.getenv('DJANGO_LOG_LEVEL', DJANGO_LOG_LEVEL),
            'propagate': True,
        },
    },
}

CSRF_USE_SESSIONS = True

EXCLUDE_HISTORY_URL = ['^/eng/[a-z_]+/\\d+[/]*([?][a-z=0-9_]+)*$']