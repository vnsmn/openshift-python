"""python URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.8/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import include, url
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.contrib.auth.decorators import login_required
from core.views import BaseRedirectView
from english.views import TopicsView, TopicView, topic_handler, user_jsn_data

urlpatterns = [
    url(r'^eng/$', login_required(TopicsView.as_view()), name='eng_topics'),
    url(r'^eng/(?P<name>[a-z_]+)[ ]*[/]*$', login_required(TopicView.as_view()), name='eng_topic'),
    url(r'^eng/(?P<topic_name>[a-z_]+)/(?P<uid>\d+)[ ]*[/]*$', topic_handler, name='eng_topic_handler'),
    url(r'^eng/jsn/(?P<mode>(r|w)+)/(?P<name>[a-z_]+)/(?P<uid>\d+)[ ]*[/]*$', user_jsn_data, name='user_jsn_data'),
    url(r'^$', login_required(BaseRedirectView.as_view()), name='redirect'),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^login/$', auth_views.login, {'template_name': 'login.html'}, name='login'),
    url(r'^logout/$', auth_views.logout, {'template_name': 'logged_out.html'}, name='logout'),
]
