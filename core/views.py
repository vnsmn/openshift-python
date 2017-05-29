from django.contrib.auth.models import User
from django.http import Http404
from django.views.generic.base import RedirectView

from core.models import UserResources


# https://djbook.ru/rel1.7/topics/db/transactions.html

class BaseRedirectView(RedirectView):
    permanent = False
    query_string = True
    pattern_name = None
    url = None

    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated():
            u = request.session.get("user_id_" + str(request.user.id))
            if u != '/':
                self.url = request.session.get("user_id_" + str(request.user.id))
            else:
                self.url = None

        return super(BaseRedirectView, self).get(request, *args, **kwargs)

    def get_redirect_url(self, *args, **kwargs):
        u = User.objects.filter(id=self.request.user.id)
        us = UserResources.objects.filter(user=u)
        if not us.exists():
            raise Http404
        if self.url is None:
            self.url = us.first().url
            return super(BaseRedirectView, self).get_redirect_url(*args, **kwargs)
        else:
            return self.url
