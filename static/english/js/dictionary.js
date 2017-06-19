var player = null;
var player_example = null;

var __context;
var __traces = {}
var __playAllWrapper;
var __startImgName;
var __stopImgName;

var Context = function(meta_sound_url, example_sound_url, dictionary_url) {
    this.meta_sound_url = meta_sound_url;
    this.example_sound_url = example_sound_url;
    this.dictionary_url = dictionary_url;

    this.meta_sound = null;
    this.example_sound = null;
    this.dictionary = null;

    this.isLoaded = function() {
        return this.meta_sound != null && this.example_sound != null && this.dictionary != null;
    }
}

function loadFile(ctx) {
    loadJson(ctx.meta_sound_url, function (response) {
        ctx.meta_sound = response;
    });
    loadJson(ctx.example_sound_url, function (response) {
        ctx.example_sound = response;
    });
    loadJson(ctx.dictionary_url, function (response) {
        ctx.dictionary = response;
    });
}

function loadPage(ctx, startImgName, stopImgName, callback) {
    if (ctx != null) __context = ctx;
    __startImgName = startImgName;
    __stopImgName = stopImgName;

    [].forEach.call(__context, function(x) {
        loadFile(x);
    });

    var intervalid = setInterval(function() {
        let isLoaded = true;
        [].forEach.call(__context, function(x) {
            isLoaded &= x.isLoaded();
        });

        if (isLoaded) {
            clearInterval(intervalid);
            var content = document.getElementById("table1");
            content.style.display = 'none'
            callback();
            createPage();
            showContent();
            content.style.display = 'block'
        }
    }, 1000)
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

function disabledControlPanel(disabled, excludeIds) {
    var controlid = document.getElementById("controlid");
    var all_ctls = controlid.getElementsByTagName('*');
    if (disabled) {
        controlid.disabled = true;
        [].forEach.call(all_ctls, function(el) {
            if (!isAssignedProp(excludeIds, el.id))
                el.disabled = true;
        });
    } else {
        controlid.disabled = false;
        [].forEach.call(all_ctls, function(el) {
            if (!isAssignedProp(excludeIds, el.id))
                el.disabled = false;
        });
    }
}

var RowStateHandler = function() {
    this.perform = function (state, ctl) {
        //var controlid = document.getElementById("controlid");
        //var all_ctls = controlid.getElementsByTagName('*');
        if (state == 'start') {
            disabledControlPanel(true);
            // controlid.disabled = true;
            // [].forEach.call(all_ctls, function(el) {
            //     el.disabled = true;
            // });
        } else if (state == 'start_trace') {
            if (ctl !== undefined) {
                let settings2 = SettingsSingleton.getInstance().get();
                if (settings2['scroll'] !== undefined && settings2.scroll)
                    ctl.scrollIntoView(true);
                let attr = ctl.getAttribute('dic');
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
            disabledControlPanel(false)
            // controlid.disabled = false;
            // [].forEach.call(all_ctls, function(el) {
            //     el.disabled = false;
            // });
        }
    }
}

var ExampleRowStateHandler = function() {
    this.perform = function (state, ctl) {
        var controlid = document.getElementById("controlid");
        var all_ctls = controlid.getElementsByTagName('*');
        if (state == 'start') {
            controlid.disabled = true;
            [].forEach.call(all_ctls, function(el) {
                el.disabled = true;
            });
        } else if (state == 'start_trace') {
            if (ctl !== undefined) {
                let settings2 = SettingsSingleton.getInstance().get();
                if (settings2['scroll'] !== undefined && settings2.scroll)
                    ctl.scrollIntoView(true);
                let attr = ctl.getAttribute('dic');
                if (attr == 'rus') {
                    ctl.style.color = 'grey'
                    ctl.style.fontWeight = 'bold'
                } else {
                    ctl.style.color = 'red'
                    ctl.style.fontWeight = 'bold'
                }
            }
        } else if (state == 'stop_trace') {
            if (ctl !== undefined) {
                ctl.style.color = 'black'
                ctl.style.fontWeight = 'normal'
            }
        } else if (state == 'stop') {
            if (ctl !== undefined) {
                ctl.style.color = 'black'
                ctl.style.fontWeight = 'normal'
            }
            controlid.disabled = false;
            [].forEach.call(all_ctls, function(el) {
                el.disabled = false;
            });
        }
    }
}

function createPage() {
    let settings = SettingsSingleton.getInstance().get();
    let words = WordsSingleton.getInstance().get();
    let ctx = currentContext();
    let dic = ctx.dictionary;
    let meta_sound = ctx.meta_sound;

    player = new AudioPlayer(meta_sound.sound_url);
    player_example = new AudioPlayer(ctx.example_sound.sound_url);

    __traces = {};
    let delay = settings.delay * 1000;
    let loop = 1000;
    var table = document.getElementById("table1");

    let n = 1;

    var sortingLines = [];
    if (settings.sort != 0) {
        [].forEach.call(dic.lines, function(line) {
            sortingLines.push(line);
        });

        sortingLines.sort(function (w1, w2) {
            switch (settings.sort) {
                case 1:
                    return w1.eng.localeCompare(w2.eng);
                    ;
                case 2:
                    return w2.eng.localeCompare(w1.eng);
                    ;
            }
            return 0;
        });
    } else {
        sortingLines = dic.lines;
    }

    for (let t in sortingLines) {
        let line = sortingLines[t];
        let checked = getValueOfProp(words.words, line.eng, false);

        var row = table.insertRow(table.rows.length);
        var celln = row.insertCell(0);
        var cell0 = row.insertCell(1);
        var cell1 = row.insertCell(2);
        var cell2 = row.insertCell(3);
        var cell21 = row.insertCell(4);
        var cell5 = row.insertCell(5);

        row.setAttribute("linedic", line.eng)
        let trace = []
        let ts = getTimes(meta_sound, line.eng);
        trace.push(player.createTrace(ts.t1, ts.t2, delay, cell2, line.eng))
        ts = getTimes(meta_sound, line.rus);
        trace.push(player.createTrace(ts.t1, ts.t2, delay, cell5, line.rus))
        __traces[line.eng] = trace;
        let playImg = new PlayerWrapper(player, [], loop, __startImgName, __stopImgName, new RowStateHandler());
        row.playImg = playImg;

        var chk = document.createElement("INPUT");
        chk.setAttribute("type", "checkbox");
        chk.checked = checked;
        chk.setAttribute("identity", line.eng);
        cell0.appendChild(chk);
        cell0.setAttribute("dic","sel");
        cell1.appendChild(playImg.getControl());
        cell2.innerHTML = line.eng;
        cell2.setAttribute("dic","eng");
        cell21.innerHTML = getTrn(meta_sound, line.eng);
        cell21.className = 'trn'
        cell21.setAttribute("dic","eng");
        cell5.innerHTML = line.rus;
        cell5.setAttribute("dic","rus");
        celln.innerHTML = n++;
        celln.className = 'number';
        row.examples = [];

        createExample(table, row, line, ctx)
    }

    var playAll = document.getElementById("playAll");
    __playAllWrapper = new PlayerWrapper(player, [], loop, __startImgName, __stopImgName, new RowStateHandler());
    playAll.appendChild(__playAllWrapper.getControl());
}

function createExample(table, ln, line, ctx) {
    if (line['examples'] === undefined || line.examples == null || line.examples.length == 0) {
        return;
    }

    var delay = 1000;
    var loop = 1000;

    let allTrace = [];

    if (line.examples.length > 1) {
        var row = table.insertRow(table.rows.length);
        ln.examples.push(row);

        row.insertCell(0);
        row.insertCell(1);

        var cell1 = row.insertCell(2);
        let playImg = new PlayerWrapper(player_example, allTrace, loop, __startImgName, __stopImgName, new ExampleRowStateHandler());
        cell1.appendChild(playImg.getControl());
        row.playImg = playImg;
    }

    [].forEach.call(line.examples, function(text) {
        var row = table.insertRow(table.rows.length);
        ln.examples.push(row);

        row.insertCell(0);
        row.insertCell(1);

        var cell1 = row.insertCell(2);
        let trace = []
        let ts = getTimes(ctx.example_sound, text);
        let playImg = new PlayerWrapper(player_example, trace, loop, __startImgName, __stopImgName, new ExampleRowStateHandler());
        cell1.appendChild(playImg.getControl());
        row.playImg = playImg;

        var cell2 = row.insertCell(3);
        cell2.setAttribute('colspan', 9);
        cell2.innerHTML = text;
        trace.push(player_example.createTrace(ts.t1, ts.t2, delay, cell2, text))
        allTrace.push(player_example.createTrace(ts.t1, ts.t2, delay, cell2, text))
    });
}

function showContent() {
    let settings = SettingsSingleton.getInstance().get();
    let words = WordsSingleton.getInstance().get();
    let els = document.querySelectorAll('tr[linedic]');
    let all_trace = [];
    let i = 0;
    let min = settings.range_of_words * settings.range_of_words_index;
    let max = min + settings.range_of_words;
    let delay = settings.delay * 1000;
    [].forEach.call(els, function(el) {
        let eng = el.getAttribute('linedic');
        let selected = (i >= min && i < max) && (settings.mode == 'edit' || !getValueOfProp(words.words, eng, false));
        i++;
        el.style.display = selected ? '' : 'none';
        [].forEach.call(el.examples, function(el_ex) {
            el_ex.style.display = settings.example && selected ? '' : 'none'
            el_ex.playImg.setLoop(settings.loop);
            [].forEach.call(el_ex.playImg.getTraces(), function (trace) {
                trace.dl = delay;
            })
        });
        let line_trace = []
        if (selected) {
            if (settings.is_eng) {
                line_trace.push(__traces[eng][0])
                all_trace.push(__traces[eng][0])
            }
            __traces[eng][0].dl = delay;
            if (settings.is_rus) {
                line_trace.push(__traces[eng][1])
                all_trace.push(__traces[eng][1])
            }
            __traces[eng][1].dl = delay;
        }
        el.playImg.setTraces(line_trace)
        el.playImg.setLoop(settings.loop)
    });
    __playAllWrapper.setTraces(all_trace)
    __playAllWrapper.setLoop(settings.loop)

    els = document.querySelectorAll('input[sel]');
    [].forEach.call(els, function(el) {
        el.style.display = settings.mode == 'view' ? 'none' : 'inline'
    });

    els = document.querySelectorAll('td[dic]');
    [].forEach.call(els, function(el) {
        let attr = el.getAttribute('dic');
        if (attr == 'eng')
            el.style.display = settings.is_eng ? '' : 'none'
        if (attr == 'rus')
            el.style.display = settings.is_rus ? '' : 'none'
        if (attr == 'sel')
            el.style.display = settings.mode == 'view' ? 'none' : ''
    });
}

function currentContext() {
    let settings = SettingsSingleton.getInstance().get();
    return __context[settings.topic];
}

function createPageNavigation(viewID, doclick) {
    let settings = SettingsSingleton.getInstance().get();
    let ctx = currentContext();
    let group = document.getElementById(viewID);
    clearElement(viewID);
    let count = Math.floor(ctx.dictionary.lines.length / settings.range_of_words);
    if (ctx.dictionary.lines.length % settings.range_of_words > 0) count++;
    for (var i = 0; i < count; i++) {
        let el = document.createElement("input");
        el.type = 'radio';
        el.name = 'page_navigation';
        el.value = i;
        el.checked = i == settings.range_of_words_index;
        el.onclick = function () {
            SettingsSingleton.getInstance().get().range_of_words_index = this.value;
            SettingsSingleton.getInstance().save();
            doclick();
        };
        group.appendChild(el);
        let span = document.createElement("span");
        span.innerHTML = i + 1;
        group.appendChild(span);
    }
}

var SettingsSingleton = (function () {
    var instance;

    function createInstance() {
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

var WordsSingleton = (function () {
    var instance;

    function createInstance() {
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