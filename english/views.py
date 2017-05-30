import core.middleware

import json
from jsonschema import validate, ValidationError

from django.contrib.auth.models import User
from django.views.generic.base import TemplateView
from django.views.generic.list import ListView
from django.http import HttpResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from english.models import Topics, UserTopic
from core.models import UserResources
from django.db import transaction

logger = core.middleware.get_logger()


class TopicsView(ListView):
    template_name = "topics.html"
    last_login = None

    def get(self, request, *args, **kwargs):
        user_ = User.objects.filter(id=self.request.user.id)
        logger.debug(user_[0].last_login)
        return super(TopicsView, self).get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(TopicsView, self).get_context_data(**kwargs)
        context["last_login"] = self.last_login
        return context

    def get_queryset(self):
        return Topics.objects.all()


class TopicView(TemplateView):
    template_name = "topic.html"
    name = None
    title = None
    uid = None

    def get(self, request, *args, **kwargs):
        self.name = kwargs['name']
        logger.debug(self.name)
        self.uid = request.user.id
        # if request.user.is_authenticated():
        #     request.session.set_expiry(None)
        #     request.session["user_id_" + str(request.user.id)] = request.get_full_path()
        return super(TopicView, self).get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(TopicView, self).get_context_data(**kwargs)
        topic = Topics.objects.filter(name=self.name).first()
        self.template_name = topic.template
        context["title"] = topic.title
        context["meta_sound_url"] = topic.meta_sound_url
        context["sound_url"] = topic.sound_url
        context["user_id"] = self.uid
        return context


# https://docs.djangoproject.com/en/dev/ref/csrf/#how-to-use-it
@csrf_exempt
def client_handler(request, topic_name, uid):
    try:
        __ret = None
        if topic_name == 'irregular':
            if request.GET.get('dir', '') == 'save':
                __in = json.loads(request.body)
                __save_irregular(__in, topic_name, uid)
                #__ret = json.dumps({"sels": []})
            else:
                __ret = __read_irregular(topic_name, uid)
                if not __ret or __ret == '':
                    __ret = json.dumps({"sels": []})
    except Exception as err:
        logger.error("error: {0}".format(err))
        return HttpResponse("error: {0}".format(err))
    return HttpResponse(__ret, content_type='application/json')


# https://djbook.ru/rel1.8/ref/models/instances.html
def __save_irregular(instance_js, topic_name, uid):
    try:
        validate(instance_js, irregular_schema)
        tp = Topics.objects.filter(name=topic_name).first()
        if tp:
            ut = UserTopic.objects.filter(user_id=uid, topic=tp).first()
            if not ut:
                ut = UserTopic(user_id=uid, topic=tp)
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


def __read_irregular(topic_name, uid):
    try:
        tp = Topics.objects.filter(name=topic_name).first()
        if tp:
            ut = UserTopic.objects.filter(user_id=uid, topic=tp).first()
            if ut:
                return ut.data
        return None
    except Exception as ex:
        logger.error(str(ex))
        return None


# Create the schema, as a nested Python dict,
# specifying the data elements, their names and their types.
irregular_schema = {
    "type": "object",
    "properties": {
        "sels": {
            "properties": {
                "^[a-zA-Z]+$": { "enum": [ 1 ] },
            }
        },
    },
}

# pip freeze
# pip install functools32
# pip install jsonschema
# pip install --upgrade jsonschema
