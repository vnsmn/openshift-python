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
        topic_irregular = Topic.objects.filter(topic=topics, name="irregular.url").first()
        context["template_name"] = topics.template
        context["title"] = topics.title
        context["irregular_url"] = topic_irregular.data
        context["user_id"] = uid

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
        "phonetic": {"enum": ["am", "br"]},
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
        "scroll": {"enum": [True, False]},
    },
}
