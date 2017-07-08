/**
 * Created by vns on 7/5/17.
 */

var CONTEXTS = {
    am: {
        50: undefined,
        100: undefined,
        150: undefined,
    },
    br: {
        50: undefined,
        100: undefined,
        150: undefined,
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

var VerbSingleton = (function () {
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

var URLHelper = (function () {
    var reading_base = '/eng/jsn/r/';
    var writting_base = '/eng/jsn/w/';
    var userId;

    return {
        setUserId: function (id) {
            userId = id;
        },
        getRSettingUrl: function () {
            return reading_base + 'irregular_settings/' + userId;
        },
        getWSettingUrl: function () {
            return writting_base + 'irregular_settings/' + userId;
        },
        getRVerbUrl: function () {
            return reading_base + 'inf_irregular_verb/' + userId;
        },
        getWVerbUrl: function () {
            return writting_base + 'inf_irregular_verb/' + userId;
        }
    };
})();

var __extImg;
var __collImg;
var __playStartImg;
var __playStopImg;
var audioTextUI;

var Context = function (data_sound_url, example_sound_url, data_url) {
    this.data_sound_url = data_sound_url;
    this.example_sound_url = example_sound_url;
    this.data_url = data_url;

    this.data_sound = null;
    this.example_sound = null;
    this.data = null;

    this.isLoaded = function () {
        return this.data_sound != null && this.example_sound != null && this.data != null;
    }
};

function createPageNavigation() {
    let settings = SettingsSingleton.getInstance().get();
    let ctx = currentContext();
    let viewID = 'navigateid';
    let group = document.getElementById(viewID);
    clearElement(viewID);
    let allRows = ctx.data.lines.length;
    if (settings.mode == 'view') {
        [].forEach.call(ctx.data.lines, function (l) {
            if (l.sel) allRows--;
        })
    }
    let count = Math.floor(allRows / settings.range_of_verbs);
    if (allRows % settings.range_of_verbs > 0) count++;
    if (settings.range_of_verbs_index >= count) {
        settings.range_of_verbs_index = count - 1;
        SettingsSingleton.getInstance().save();
    }
    for (var i = 0; i < count; i++) {
        let el = document.createElement("input");
        el.type = 'radio';
        el.name = 'page_navigation';
        el.value = i;
        el.checked = i == settings.range_of_verbs_index;
        el.onclick = function () {
            SettingsSingleton.getInstance().get().range_of_verbs_index = this.value;
            SettingsSingleton.getInstance().save();
            recreatePage(SettingsSingleton.getInstance().get());
        };
        group.appendChild(el);
        let span = document.createElement("span");
        span.innerHTML = i + 1;
        group.appendChild(span);
    }
}

function createSettings() {
    let mode = document.getElementById('modeid').getAttribute('mode');
    let el = document.querySelector('input[name=page_navigation]:checked');
    let range_of_verbs_index = el == null ? 0 : parseInt(el.value);
    let settings = {
        id: 'settings_irregular',
        mode: mode,
        is_inf: document.getElementById('infid').checked,
        is_pas: document.getElementById('pasid').checked,
        is_prf: document.getElementById('prfid').checked,
        is_rus: document.getElementById('rusid').checked,
        phonetic: document.getElementById('amid').checked
            ? 'am'
            : document.getElementById('brid').checked
                ? 'br' : 'br',
        total_of_verbs: document.getElementById('50id').checked
            ? 50
            : document.getElementById('100id').checked
                ? 100
                : document.getElementById('150id').checked
                    ? 150
                    : 50,
        range_of_verbs: document.getElementById('group1id').checked
            ? 10
            : document.getElementById('group2id').checked
                ? 25
                : document.getElementById('group3id').checked
                    ? 50
                    : 25,
        range_of_verbs_index: range_of_verbs_index,
        loop: document.getElementById("loopid").checked ? 100 : 0,
        delay: document.getElementById("delayid").selectedIndex,
        scroll: document.getElementById("scrollid").checked,
        example: document.getElementById("exampleid").checked
    }
    return settings;
}

function initControls() {
    let settings = SettingsSingleton.getInstance().get();
    document.getElementById('infid').checked = settings.is_inf;
    document.getElementById('pasid').checked = settings.is_pas;
    document.getElementById('prfid').checked = settings.is_prf;
    document.getElementById('rusid').checked = settings.is_rus;
    switch (settings.phonetic) {
        case 'am':
            document.getElementById('amid').checked = true;
            break;
        case 'br':
            document.getElementById('brid').checked = true;
            break;
    }
    switch (settings.total_of_verbs) {
        case 50:
            document.getElementById('50id').checked = true;
            break;
        case 100:
            document.getElementById('100id').checked = true;
            break;
        case 150:
            document.getElementById('150id').checked = true;
            break;
    }
    switch (settings.range_of_verbs) {
        case 10:
            document.getElementById('group1id').checked = true;
            break;
        case 25:
            document.getElementById('group2id').checked = true;
            break;
        case 50:
            document.getElementById('group3id').checked = true;
            break;
    }
    document.getElementById("loopid").checked = settings.loop > 0;
    document.getElementById("delayid").selectedIndex = settings.delay;
    document.getElementById("scrollid").checked = settings.scroll;
    document.getElementById("exampleid").checked = settings.example;
}

function loadPage(urls, extImg, collImg, playStartImg, playStopImg, callback) {
    __extImg = extImg;
    __collImg = collImg;
    __playStartImg = playStartImg;
    __playStopImg = playStopImg;

    for (let ph in urls.lines) {
        let ln = urls.lines[ph];
        for (let ctx in ln) {
            let c = ln[ctx];
            let ctxObj = new Context(c.snd_url, c.snd_example_url, c.data_url);
            CONTEXTS[ph][ctx] = ctxObj;
            if (ctxObj !== undefined) {
                loadFile(ctxObj);
            }
            console.log(c + "," + ctx);
        }
    };

    var intervalid = setInterval(function () {
        let isLoaded = true;
        for (let pn in CONTEXTS) {
            let ln = CONTEXTS[pn];
            for (let c in ln) {
                let ctx = ln[c];
                if (ctx !== undefined) isLoaded &= ctx.isLoaded();
            }
        };

        if (isLoaded) {
            clearInterval(intervalid);
            createPageNavigation();
            createUI();
            repaint();
            callback();
        }
    }, 1000)
}

function createUI() {
    let settings = SettingsSingleton.getInstance().get();
    let verbs = VerbSingleton.getInstance().get();
    let ctx = currentContext();
    let builder = new ContextBuilder(ctx.data_sound.sound_url);
    builder.addRow('', true, false)
        .addCol({tx: 'inf', tg: 'inf'})
        .addCol({tx: '[inf]', tg: 'inf'})
        .addCol({tx: 'pas', tg: 'pas'})
        .addCol({tx: '[pas]', tg: 'pas'})
        .addCol({tx: 'prf', tg: 'prf'})
        .addCol({tx: '[prf]', tg: 'prf'})
        .addCol({tx: 'rus', tg: 'rus'})
        .toParent();
    [].forEach.call(ctx.data.lines, function (l) {
        let isSel = verbs[l.inf] !== undefined && verbs[l.inf] == true;
        if (settings.mode == 'view' && isSel) return;
        let inf = ctx.data_sound.lines[l.inf];
        let pas = ctx.data_sound.lines[l.pas];
        let prf = ctx.data_sound.lines[l.prf];
        let rus = ctx.data_sound.lines[l.rus];
        builder.addRow('', false, isSel)
            .addCol({tx: l.inf, tg: 'inf', st: inf[0], ft: inf[1]})
            .addCol({tx: l.inf, tg: 'inf', tx: '[' + inf[2] + ']', cl: 'grey'})
            .addCol({tx: l.pas, tg: 'pas', st: pas[0], ft: pas[1]})
            .addCol({tx: l.pas, tg: 'pas', tx: '[' + pas[2] + ']', cl: 'grey'})
            .addCol({tx: l.prf, tg: 'prf', st: prf[0], ft: prf[1]})
            .addCol({tx: l.prf, tg: 'prf', tx: '[' + prf[2] + ']', cl: 'grey'})
            .addCol({tx: l.rus, tg: 'rus', st: rus[0], ft: rus[1], cl: 'grey'});
        if (l.examples !== undefined) {
            builder.setFile(ctx.example_sound.sound_url);
            builder.addRow('', true, false)
                .addCol({tx: 'simple', cl: 'gray'}).toParent();
            [].forEach.call(l.examples, function (txt) {
                let ex = ctx.example_sound.lines[txt];
                builder.addRow(undefined, false).addCol({tx: txt, st: ex[0], ft: ex[1]}).toParent();
            });
        }
        builder.toParent();
    });

    audioTextUI = new SpeakingTextUI('container', builder.build(),
        __extImg, __collImg, __playStartImg, __playStopImg, true, false,
        function (state) {
            let els = document.querySelectorAll('.ctl');
            [].forEach.call(els, function (el) {
                disabledElement(el, state);
            })
        });
}

function loadFile(ctx) {
    loadJson(ctx.data_sound_url, function (response) {
        ctx.data_sound = response;
    });
    loadJson(ctx.example_sound_url, function (response) {
        ctx.example_sound = response;
    });
    loadJson(ctx.data_url, function (response) {
        ctx.data = response;
    });
}

function currentContext() {
    let settings = SettingsSingleton.getInstance().get();
    let ph = settings.phonetic;
    return CONTEXTS[ph][settings.total_of_verbs];
}

function repaint() {
    SettingsSingleton.getInstance().recreate();
    let settings = SettingsSingleton.getInstance().get();
    audioTextUI.setPageSize(settings.range_of_verbs, settings.range_of_verbs_index);
    UITools.callLate(function () {
        audioTextUI.recreate();
        audioTextUI.setShowSelection(settings.mode == 'edit');
        repaintHideColumns(settings);
        repaintExample(settings);
        repaintDelay(settings);
        repaintLoop(settings);
        repaintScroll(settings);
    });
}

function repaintHideColumns(settings) {
    if (settings === undefined) settings = SettingsSingleton.getInstance().recreate().get();
    let vis = [];
    let hid = [];
    if (settings.is_inf) { vis.push('inf') } else { hid.push('inf') };
    if (settings.is_pas) { vis.push('pas') } else { hid.push('pas') };
    if (settings.is_prf) { vis.push('prf') } else { hid.push('prf') };
    if (settings.is_rus) { vis.push('rus') } else { hid.push('rus') };
    audioTextUI.hideColumns(vis, false);
    audioTextUI.hideColumns(hid, true);
}

function repaintExample(settings) {
    if (settings === undefined) settings = SettingsSingleton.getInstance().recreate().get();
    if (settings.example)
        audioTextUI.expandAll();
    else
        audioTextUI.collapseAll();
}

function repaintDelay(settings) {
    if (settings === undefined) settings = SettingsSingleton.getInstance().recreate().get();
    audioTextUI.setDelay(settings.delay);
}

function repaintLoop(settings) {
    if (settings === undefined) settings = SettingsSingleton.getInstance().recreate().get();
    audioTextUI.setLoop(settings.loop);
}

function repaintScroll(settings) {
    if (settings === undefined) settings = SettingsSingleton.getInstance().recreate().get();
    audioTextUI.setScroll(settings.scroll);
}

function recreatePage(settings) {
    if (settings === undefined) settings = SettingsSingleton.getInstance().recreate().get();
    createPageNavigation();
    UITools.callLate(function () {
        audioTextUI.setPageSize(settings.range_of_verbs, settings.range_of_verbs_index);
        audioTextUI.recreate();
        if (settings.example) audioTextUI.expandAll();
    });
}

function recreate() {
    SettingsSingleton.getInstance().recreate();
    UITools.callLate(function () {
        clearElement('container');
        createUI();
        repaint();
        createPageNavigation();
    });
}

function save(el) {
    let mode = el.getAttribute('mode');
    let settings_url = URLHelper.getWSettingUrl();
    let irregular_url = URLHelper.getWVerbUrl();
    if (mode == 'save') {
        SettingsSingleton.getInstance().recreate();
        SettingsSingleton.getInstance().saveToServer(settings_url, function () {});
    } else if (mode == 'edit') {
        el.setAttribute('mode', 'view')
        el.value = 'Edit'
        SettingsSingleton.getInstance().recreate();
        VerbSingleton.getInstance().recreate();
        VerbSingleton.getInstance().saveToServer(irregular_url, function () {});
        createPageNavigation();
        clearElement("container");
        createUI('edit');
        repaint();
    } else {
        el.setAttribute('mode', 'edit');
        el.value = 'View'
        SettingsSingleton.getInstance().recreate();
        createPageNavigation();
        clearElement("container");
        createUI();
        repaint();
    }
}

SettingsSingleton.getInstance().init('settings_irregular', createSettings);

VerbSingleton.getInstance().init('inf_irregular_verb', function (data) {
    let verbs = data === undefined ? {} : data;
    if (audioTextUI === undefined) return {};
    let ctx = audioTextUI.getContext();
    [].forEach.call(ctx.rows, function (c) {
        verbs[c.cols[0].tx] = c.sel !== undefined && c.sel;
    });
    verbs['id'] = 'inf_irregular_verb';
    return verbs;
});

UITools.init('loading');