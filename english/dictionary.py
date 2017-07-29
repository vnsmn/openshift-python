# -*- coding: utf-8 -*-
import json

from django.db import transaction
from jsonschema import validate, ValidationError

import core
from english.models import Topics, Topic, UserTopic, Dictionary

logger = core.middleware.get_logger()


class DictionaryHelper(object):
    @staticmethod
    def fill_context_data(uid, name, context):
        topics = Topics.objects.filter(name=name).first()
        dictionary_url = Topic.objects.filter(topic=topics, name="dictionary.url").first()
        context["template_name"] = topics.template
        context["title"] = topics.title
        context["dictionary_url"] = dictionary_url.data
        context["user_id"] = uid

    @staticmethod
    def fill_longman_context_data(uid, name, context):
        topics = Topics.objects.filter(name=name).first()
        dictionary_url = Topic.objects.filter(topic=topics, name="longman.url").first()
        context["template_name"] = topics.template
        context["title"] = topics.title
        context["dictionary_url"] = dictionary_url.data
        context["user_id"] = uid

    @staticmethod
    def saveSettings(uid, topic_name, instance_js):
        try:
            validate(instance_js, _dictionary_settings_schema)
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
    def saveWords(uid, topic_name, instance_js):
        try:
            validate(instance_js, _dictionary_words_schema)
            tp = Topics.objects.filter(name=topic_name).first()
            if tp:
                try:
                    with transaction.atomic():
                        for word in instance_js["words"]:
                            learnt = instance_js["words"][word]
                            dic = Dictionary.objects.filter(user_id=uid, word=word).first()
                            if not dic:
                                dic = Dictionary(user_id=uid, word=word, learnt=learnt)
                            else:
                                dic.learnt = learnt
                            dic.save()
                except Exception as ex:
                    transaction.rollback('core')
                    logger.error(str(ex))
                    raise ex
        except ValidationError as ve:
            logger.error(str(ve))
            raise ve

    @staticmethod
    def readSettings(uid, topic_name):
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


    @staticmethod
    def readWords(uid, topic_name):
        try:
            tp = Topics.objects.filter(name=topic_name).first()
            if tp:
                ctx = {"id": "words_dictionary", "words": {}}
                dics = Dictionary.objects.filter(user_id=uid);
                for dic in dics:
                    ctx["words"][dic.word] = dic.learnt
                return json.dumps(ctx)
            return None
        except Exception as ex:
            logger.error(str(ex))
            return None


# Create the schema, as a nested Python dict,
# specifying the data elements, their names and their types.
# http://json-schema.org/examples.html
_dictionary_settings_schema = {
    "type": "object",
    "properties": {
        "mode": {"enum": ["edit", "view"]},
        "is_eng": {"enum": [True, False]},
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
