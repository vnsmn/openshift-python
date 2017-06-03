var player = null;

var meta_sound;
var excludes;
var i50;
var i100;
var i150;
var traces = {}
var playAllWrapper;
var __startImgName;
var __stopImgName;

function loadPage(urls, startImgName, stopImgName, callback) {
    __startImgName = startImgName;
    __stopImgName = stopImgName;
    loadJson(urls.meta_sound_url, function (response1) {
        meta_sound = response1;
        loadJson(urls.i50_url, function (response2) {
            i50 = response2;
            loadJson(urls.i100_url, function (response3) {
                i100 = response3;
                loadJson(urls.i150_url, function (response4) {
                    i150 = response4;
                    var content = document.getElementById("table1");
                    content.style.display = 'none'
                    callback();
                    createPage();
                    showContent();
                    content.style.display = 'block'
                });
            });
        });
    });
}

function getTimes(soundJsn, data) {
    let l = soundJsn.lines[data];
    let t1 = l === undefined || l == null ? 0 : l[0];
    let t2 = l === undefined || l == null ? 0 : l[1];
    return {t1:t1, t2:t2}
}

function getTrn(soundJsn, data) {
    let l = soundJsn.lines[data];
    return l === undefined || l == null ? '' : '[' + l[2] + ']';
}

function createPage() {
    let settings = SettingsSingleton.getInstance().get();
    player = new AudioPlayer(meta_sound.sound_url)
    var RowStateHandler = function() {
        this.perform = function (state, ctl) {
            var controlid = document.getElementById("controlid");
            var all_ctls = controlid.getElementsByTagName('*');
            var modeid = document.getElementById("modeid");
            var saveid = document.getElementById("saveid");
            if (state == 'start') {
                modeid.disabled = true;
                saveid.disabled = true;
                controlid.disabled = true;
                [].forEach.call(all_ctls, function(el) {
                    el.disabled = true;
                });
            } else if (state == 'start_trace') {
                if (ctl !== undefined) {
                    let attr = ctl.getAttribute('irr');
                    if (attr == 'rus') {
                        ctl.style.color = 'grey'
                        ctl.style.fontWeight = 'bold'
                    } else {
                        ctl.innerHTML = ctl.innerHTML.toUpperCase();
                        ctl.style.color = 'red'
                        ctl.style.fontWeight = 'bold'
                    }
                }
            } else if (state == 'stop_trace') {
                if (ctl !== undefined) {
                    ctl.innerHTML = ctl.innerHTML.toLowerCase();
                    ctl.style.color = 'black'
                    ctl.style.fontWeight = 'normal'
                }
            } else if (state == 'stop') {
                if (ctl !== undefined) {
                    ctl.innerHTML = ctl.innerHTML.toLowerCase();
                    ctl.style.color = 'black'
                    ctl.style.fontWeight = 'normal'
                }
                modeid.disabled = false;
                saveid.disabled = false;
                controlid.disabled = false;
                [].forEach.call(all_ctls, function(el) {
                    el.disabled = false;
                });
            }
        }
    }

    traces = {};
    let delay = settings.delay * 1000;
    let loop = 1000;
    var table = document.getElementById("table1");
    let dic = {}
    switch (settings.total_of_verbs) {
        case 50: dic = i50; break;
        case 100: dic = i100; break;
        case 150: dic = i150; break;
    }
    let n = 1;
    for (let t in dic.lines) {
        let line = dic.lines[t];
        let checked = settings.excludes[line.inf] !== undefined;

        var row = table.insertRow(table.rows.length);
        var celln = row.insertCell(0);
        var cell0 = row.insertCell(1);
        var cell1 = row.insertCell(2);
        var cell2 = row.insertCell(3);
        var cell21 = row.insertCell(4);
        var cell3 = row.insertCell(5);
        var cell31 = row.insertCell(6);
        var cell4 = row.insertCell(7);
        var cell41 = row.insertCell(8);
        var cell5 = row.insertCell(9);

        row.setAttribute("lineirr", line.inf)
        let trace = []
        let ts = getTimes(meta_sound, line.inf);
        trace.push(player.createTrace(ts.t1, ts.t2, delay, cell2, line.inf))
        ts = getTimes(meta_sound, line.pas);
        trace.push(player.createTrace(ts.t1, ts.t2, delay, cell3, line.pas))
        ts = getTimes(meta_sound, line.prf);
        trace.push(player.createTrace(ts.t1, ts.t2, delay, cell4, line.prf))
        ts = getTimes(meta_sound, line.rus);
        trace.push(player.createTrace(ts.t1, ts.t2, delay, cell5, line.rus))
        traces[line.inf] = trace;
        let playImg = new PlayerWrapper(player, [], loop, __startImgName, __stopImgName, new RowStateHandler());
        row.playImg = playImg;

        var chk = document.createElement("INPUT");
        chk.setAttribute("type", "checkbox");
        chk.checked = checked;
        chk.setAttribute("identity", line.inf);
        cell0.appendChild(chk);
        //cell0.style.display='inline-block'
        cell0.setAttribute("irr","sel");
        cell1.appendChild(playImg.getControl());
        //cell1.style.display='inline-block'
        cell2.innerHTML = line.inf;
        cell2.setAttribute("irr","inf");
        cell21.innerHTML = getTrn(meta_sound, line.inf);
        cell21.className = 'trn'
        cell21.setAttribute("irr","inf");
        cell3.innerHTML = line.pas;
        cell3.setAttribute("irr","pas");
        cell31.innerHTML = getTrn(meta_sound, line.pas);
        cell31.setAttribute("irr","pas");
        cell31.className = 'trn'
        cell4.innerHTML = line.prf;
        cell4.setAttribute("irr","prf");
        cell41.innerHTML = getTrn(meta_sound, line.prf);
        cell41.setAttribute("irr","prf");
        cell41.className = 'trn'
        cell5.innerHTML = line.rus;
        cell5.setAttribute("irr","rus");
        celln.innerHTML = n++;
        celln.className = 'number';
    }

    var playAll = document.getElementById("playAll");
    playAllWrapper = new PlayerWrapper(player, [], loop, __startImgName, __stopImgName, new RowStateHandler());
    playAll.appendChild(playAllWrapper.getControl());
}

function showContent() {
    let settings = SettingsSingleton.getInstance().get();
    let excludes = settings == undefined || settings['excludes'] == undefined ? {} : settings.excludes;
    let els = document.querySelectorAll('tr[lineirr]');
    let all_trace = [];
    let i = 0;
    let min = settings.range_of_verbs * settings.range_of_verbs_index;
    let max = min + settings.range_of_verbs;
    let delay = settings.delay * 1000;
    [].forEach.call(els, function(el) {
        let inf = el.getAttribute('lineirr');
        let selected = (i >= min && i < max) && (settings.mode == 'edit' || excludes[inf] === undefined);
        i++;
        el.style.display = selected ? '' : 'none'
        let line_trace = []
        if (selected) {
            if (settings.is_inf) {
                line_trace.push(traces[inf][0])
                all_trace.push(traces[inf][0])
            }
            traces[inf][0].dl = delay;
            if (settings.is_pas) {
                line_trace.push(traces[inf][1])
                all_trace.push(traces[inf][1])
            }
            traces[inf][1].dl = delay;
            if (settings.is_prf) {
                line_trace.push(traces[inf][2])
                all_trace.push(traces[inf][2])
            }
            traces[inf][2].dl = delay;
            if (settings.is_rus) {
                line_trace.push(traces[inf][3])
                all_trace.push(traces[inf][3])
            }
            traces[inf][3].dl = delay;
        }
        el.playImg.setTraces(line_trace)
        el.playImg.setLoop(settings.loop)
    });
    playAllWrapper.setTraces(all_trace)
    playAllWrapper.setLoop(settings.loop)

    els = document.querySelectorAll('input[sel]');
    [].forEach.call(els, function(el) {
        el.style.display = settings.mode == 'view' ? 'none' : 'inline'
    });

    els = document.querySelectorAll('td[irr]');
    [].forEach.call(els, function(el) {
        let attr = el.getAttribute('irr');
        if (attr == 'inf')
            el.style.display = settings.is_inf ? '' : 'none'
        if (attr == 'pas')
            el.style.display = settings.is_pas ? '' : 'none'
        if (attr == 'prf')
            el.style.display = settings.is_prf ? '' : 'none'
        if (attr == 'rus')
            el.style.display = settings.is_rus ? '' : 'none'
        if (attr == 'sel')
            el.style.display = settings.mode == 'view' ? 'none' : ''
    });
}

function createPageNavigation(viewID, doclick) {
    let settings = SettingsSingleton.getInstance().get();
    let dic = null;
    switch (settings.total_of_verbs) {
        case 50: dic = i50; break;
        case 100: dic = i100; break;
        case 150: dic = i150; break;
    }
    let group = document.getElementById(viewID);
    clearElement(viewID);
    let count = Math.floor(dic.lines.length / settings.range_of_verbs);
    if (dic.lines.length % settings.range_of_verbs > 0) count++;
    for (var i = 0; i < count; i++) {
        let el = document.createElement("input");
        el.type = 'radio';
        el.name = 'page_navigation';
        el.value = i;
        el.checked = i == settings.range_of_verbs_index;
        el.onclick = function () {
            SettingsSingleton.getInstance().get().range_of_verbs_index = this.value;
            SettingsSingleton.getInstance().save();
            doclick();
        };
        group.appendChild(el);
        let span = document.createElement("span");
        span.innerHTML = i + 1;
        ;
        group.appendChild(span);
    }
}

var SettingsSingleton = (function () {
    var instance;

    function createInstance() {
        //Settings.prototype = new PersistentObject();
        //var object = new Settings('settings_irregular', null);
        return new PersistentObject();
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();