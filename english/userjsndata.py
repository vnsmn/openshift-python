# -*- coding: utf-8 -*-
import json

from django.db import transaction
from jsonschema import validate, ValidationError

import core
from english.models import UserJsnData

logger = core.middleware.get_logger()


# https://docs.djangoproject.com/en/dev/ref/contrib/postgres/fields/#django.contrib.postgres.fields.JSONField
class JSNHelper(object):
    INF_IRREGULAR_NAME = 'inf_irregular_verb'

    @staticmethod
    def save(uid, name, jsn):
        try:
            # validate(jsn, _dictionary_settings_schema)
            usd = UserJsnData.objects.filter(name=name, user_id=uid).first()
            if not usd:
                usd = UserJsnData.objects.create(name=name, user_id=uid, data=jsn)
            else:
                if name == JSNHelper.INF_IRREGULAR_NAME:
                    usd.data = JSNHelper.__bind_inf_irregular(usd.data, jsn)
                else:
                    usd.data = jsn
            try:
                with transaction.atomic():
                    usd.save()
            except Exception as ex:
                transaction.rollback('core')
                logger.error(str(ex))
                raise ex
        except ValidationError as ve:
            logger.error(str(ve))
            raise ve

    @staticmethod
    def read(uid, name):
        try:
            usd = UserJsnData.objects.filter(name=name, user_id=uid).first()
            if usd:
                return usd.data
            return None
        except Exception as ex:
            logger.error(str(ex))
            return None

    @staticmethod
    def __bind_inf_irregular(db_jsn, jsn):
        if db_jsn:
            jsn2 = {}
            for d in jsn:
                jsn2[d] = jsn[d]
            for d in db_jsn:
                if jsn2[d] is None:
                    jsn2[d] = db_jsn[d]
            pass
            return jsn2
        return jsn


# Create the schema, as a nested Python dict,
# specifying the data elements, their names and their types.
# http://json-schema.org/examples.html
_dictionary_settings_schema = {
    "type": "object",
    "properties": {
        "mode": {"enum": ["edit", "view"]},
        "is_eng": {"enum": [True, False]},
        "is_pas": {"enum": [True, False]},
        "is_prf": {"enum": [True, False]},
        "is_rus": {"enum": [True, False]},
        "total_of_words": {
            "type": "integer",
            "minimum": 1000,
            "maximum": 3000
        },
        "range_of_words": {
            "type": "integer",
            "minimum": 10,
            "maximum": 50
        },
        "range_of_words_index": {
            "type": "integer"
        },
        "delay": {"enum": [0, 1, 2]},
        "scroll": {"enum": [True, False]},
    },
}

_dictionary_words_schema = {
    "type": "object",
    "properties": {
        "words": {
            "properties": {
                "^[a-zA-Z]+$": {"enum": [True, False]},
            }
        },
    },
}
