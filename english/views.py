import core.middleware

import json
from jsonschema import validate, ValidationError

from django.contrib.auth.models import User
from django.views.generic.base import TemplateView
from django.views.generic.list import ListView
from django.http import HttpResponse, Http404
from django.views.decorators.csrf import csrf_exempt

from english.dictionary import DictionaryHelper
from english.irregular import IrregularHelper
from english.userjsndata import JSNHelper
from english.models import Topics, Topic, UserTopic
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
        return super(TopicView, self).get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(TopicView, self).get_context_data(**kwargs)
        if 'irregular' == self.name:
            IrregularHelper.fill_context_data(self.uid, self.name, context)
            self.template_name = context["template_name"]
        if 'dictionary' == self.name:
            DictionaryHelper.fill_context_data(self.uid, self.name, context)
            self.template_name = context["template_name"]
        return context


# https://docs.djangoproject.com/en/dev/ref/csrf/#how-to-use-it
@csrf_exempt
def topic_handler(request, topic_name, uid):
    try:
        __ret = None
        if topic_name == 'dictionary':
            q = request.GET.get('dir', '')
            if q == 'ssave' or q == 'wsave':
                __in = json.loads(request.body)
                __save_dictionary(__in, topic_name, uid, q)
            else:
                if q == 'sread' or q == 'wread':
                    __ret = __read_dictionary(topic_name, uid, q)
                    if not __ret or __ret == '':
                        __ret = json.dumps({})
    except Exception as err:
        logger.error("error: {0}".format(err))
        return HttpResponse("error: {0}".format(err))
    return HttpResponse(__ret, content_type='application/json')


# https://djbook.ru/rel1.8/ref/models/instances.html
def __save_dictionary(instance_js, topic_name, uid, q):
    if q == 'ssave':
        DictionaryHelper.saveSettings(uid, topic_name, instance_js)
    else:
        DictionaryHelper.saveWords(uid, topic_name, instance_js)


def __read_dictionary(topic_name, uid, q):
    if q == 'sread':
        return DictionaryHelper.readSettings(uid, topic_name)
    else:
        return DictionaryHelper.readWords(uid, topic_name)


@csrf_exempt
def user_jsn_data(request, mode, name, uid):
    try:
        __ret = None
        if mode == 'w':
            __in = json.loads(request.body)
            JSNHelper.save(uid, name, __in)
        elif mode == 'r':
            __ret = json.dumps(JSNHelper.read(uid, name))
            if not __ret or __ret == '':
                __ret = json.dumps({})
        else:
            raise NotImplementedError()
    except Exception as err:
        logger.error("error: {0}".format(err))
        return HttpResponse("error: {0}".format(err))
    return HttpResponse(__ret, content_type='application/json')

# pip freeze
# pip install functools32
# pip install jsonschema
# pip install --upgrade jsonschema
