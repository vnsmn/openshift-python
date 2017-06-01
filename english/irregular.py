# -*- coding: utf-8 -*-
import json

from django.db import transaction
from jsonschema import validate, ValidationError

import core
from english.models import Topics, Topic, UserTopic

logger = core.middleware.get_logger()


class IrregularHelper(object):
    @staticmethod
    def fill_context_data(uid, name, context):
        topics = Topics.objects.filter(name=name).first()
        meta = Topic.objects.filter(topic=topics, name="meta.sound.url").first()
        topic50 = Topic.objects.filter(topic=topics, name="i50.url").first()
        topic100 = Topic.objects.filter(topic=topics, name="i100.url").first()
        topic150 = Topic.objects.filter(topic=topics, name="i150.url").first()
        context["template_name"] = topics.template
        context["title"] = topics.title
        context["meta_sound_url"] = meta.data
        context["i50_url"] = topic50.data
        context["i100_url"] = topic100.data
        context["i150_url"] = topic150.data
        context["user_id"] = uid

    @staticmethod
    def save(uid, topic_name, instance_js):
        try:
            validate(instance_js, _irregular_schema)
            tp = Topics.objects.filter(name=topic_name).first()
            if tp:
                ut = UserTopic.objects.filter(user_id=uid, name="settings", topic=tp).first()
                if not ut:
                    ut = UserTopic(user_id=uid, name="settings", topic=tp)
                ut.data = json.dumps(instance_js)
                try:
                    with transaction.atomic():
                        ut.save()
                except Exception as ex:
                    transaction.rollback('core')
                    logger.error(str(ex))
                    raise ex
        except ValidationError as ve:
            logger.error(str(ve))
            raise ve

    @staticmethod
    def read(uid, topic_name):
        try:
            tp = Topics.objects.filter(name=topic_name).first()
            if tp:
                ut = UserTopic.objects.filter(user_id=uid, name="settings", topic=tp).first()
                if ut:
                    return ut.data
            return None
        except Exception as ex:
            logger.error(str(ex))
            return None


# Create the schema, as a nested Python dict,
# specifying the data elements, their names and their types.
# http://json-schema.org/examples.html
_irregular_schema = {
    "type": "object",
    "properties": {
        "excludes": {
            "properties": {
                "^[a-zA-Z]+$": {"enum": [1]},
            }
        },
        "mode": {"enum": ["edit", "view"]},
        "is_inf": {"enum": [True, False]},
        "is_pas": {"enum": [True, False]},
        "is_prf": {"enum": [True, False]},
        "is_rus": {"enum": [True, False]},
        "total_of_verbs": {
            "type": "integer",
            "minimum": 50,
            "maximum": 150
        },
        "range_of_verbs": {
            "type": "integer",
            "minimum": 10,
            "maximum": 50
        },
        "range_of_verbs_index": {
            "type": "integer"
        },
        "delay": {"enum": [0, 1, 2]},
    },
}
