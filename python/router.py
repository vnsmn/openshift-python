from django.conf import settings

class DatabaseAppsRouter(object):
    def db_for_read(self, model, **hints):
        db = None
        try:
            if settings.DATABASE_APPS_MAPPING.has_key(model._meta.app_label):
                db = settings.DATABASE_APPS_MAPPING[model._meta.app_label]
                return db
        finally:
            print 'route.db_for_read: ' + model._meta.app_label + ';' + db.__str__()
        return db

    def db_for_write(self, model, **hints):
        db = None
        try:
            if settings.DATABASE_APPS_MAPPING.has_key(model._meta.app_label):
                db = settings.DATABASE_APPS_MAPPING[model._meta.app_label]
                return db
        finally:
            print 'route.db_for_write: ' + model._meta.app_label + ';' + db.__str__()
        return db

    def allow_relation(self, obj1, obj2, **hints):
        db_obj1 = settings.DATABASE_APPS_MAPPING.get(obj1._meta.app_label)
        db_obj2 = settings.DATABASE_APPS_MAPPING.get(obj2._meta.app_label)
        print 'route.allow_relation: ' + db_obj1 + ';' + db_obj2
        if db_obj1 and db_obj2:
            return db_obj1 == db_obj2
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        allow_migrate_result = db == 'default'
        try:
            if settings.DATABASE_APPS_MAPPING.has_key(app_label):
                allow_migrate_result = db == settings.DATABASE_APPS_MAPPING[app_label]
                return allow_migrate_result
            return allow_migrate_result
        finally:
            print 'route.allow_migrate: ' + db + ';' + app_label + ';' + model_name + ';' + allow_migrate_result.__str__()

    def allow_syncdb(self, db, model):
        print 'route.allow_syncdb: ' + db + ';' + model._meta.app_label
        if settings.DATABASE_APPS_MAPPING.has_key(model._meta.app_label):
            return db == settings.DATABASE_APPS_MAPPING[model._meta.app_label]
        return False
