import logging
import re
from django import http
from django.contrib.auth.models import User
from core.models import UserResources
from python import settings

logger = logging.getLogger(__name__)


def get_logger():
    return logger


class ApplicationMiddleware(object):
    _back_urls = dict()
    _response_redirect_class = http.HttpResponseRedirect
    BACK = 'back'

    def __init__(self):
        for us in UserResources.objects.all():
            _id = str(us.user.id)
            self._back_urls[_id] = list()
            self._back_urls[_id].append(us.url)
        pass

    def process_request(self, request):
        get_logger().debug(msg='request: ' + request.get_full_path())

        if request.user.id is not None and request.user.is_authenticated():
            u = User.objects.filter(id=request.user.id)
            us = UserResources.objects.filter(user=u).first()
            if self.__is_sub_url(us.url, request.path) and not self.__is_exclude_url(request.path):
                request.session.set_expiry(None)
                request.session["user_id_" + str(request.user.id)] = request.path

        if request.user.id is not None:
            back_url = self._back_urls.get(str(request.user.id))
            if not back_url:
                u = User.objects.filter(id=request.user.id).first()
                us = UserResources.objects.filter(user=u).first()
                if us:
                    back_url = list()
                    back_url.append(us.first().url)
                else:
                    return
                self._back_urls[request.user.id] = back_url
            if not ApplicationMiddleware.__is_sub_url(back_url[0], request.path) \
                    or ApplicationMiddleware.__is_exclude_url(request.path):
                return
            else:
                if self.BACK in request.GET:
                    back_id = int(request.GET.get(self.BACK))
                    while back_id < len(back_url) - 1:
                        back_url.pop()
                    return self._response_redirect_class(request.path)
                else:
                    u1 = ApplicationMiddleware.__normal_url(request.get_full_path())
                    u2 = ApplicationMiddleware.__normal_url((back_url[len(back_url) - 1], '')[len(back_url) == 0])
                    if u1 != u2:
                        back_url.append(request.get_full_path())

    def process_template_response(self, request, response):
        back_url = self._back_urls.get(str(request.user.id))
        if not back_url:
            return response
        if len(back_url) > 0:
            _id = (len(back_url) - 2, 0)[len(back_url) < 2]
            _u = (back_url[_id], request.get_full_path())[_id < 0]
            response.context_data['back_url'] = _u + "?" + self.BACK + "=" + str(_id)
        return response

    @staticmethod
    def __normal_url(url):
        return (url, url[:len(url) - 1])[url.endswith('/')]

    @staticmethod
    def __is_sub_url(top_u, sub_u):
        if not top_u or not sub_u:
            return False
        u11 = top_u
        while u11.endswith('/'):
            u11 = u11[:len(u11) - 1]
        u22 = sub_u
        while u22.endswith('/'):
            u22 = u22[:len(u22) - 1]
        return (sub_u + '/').startswith(top_u + '/')

    @staticmethod
    def __is_exclude_url(u):
        for pattern in settings.EXCLUDE_HISTORY_URL:
            if re.match(pattern, u):
                return True
        return False
