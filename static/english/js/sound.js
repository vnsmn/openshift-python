function getHTTPObject() {
    if (typeof XMLHttpRequest != 'undefined') {
        return new XMLHttpRequest();
    } try {
        return new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
        try {
            return new ActiveXObject("Microsoft.XMLHTTP");
        } catch (e) {}
    }
    return false;
}

function getJSON(query, callback) {
    var http = getHTTPObject();
    http.overrideMimeType("application/json");
    http.open('GET', query, true);
    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == "200") {
            callback(http.responseText);
        }
    }
    http.send();
}

function postJson(query, dataJson, callback) {
    var http = getHTTPObject();
    http.overrideMimeType("application/json");
    http.open('POST', query, true);
    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == "200") {
            callback(http.responseText);
        }
    }
    http.send(dataJson);
}

function loadJson(fileName, handler) {
    getJSON(fileName, function (response) {
        try {
            let jsonresponse = JSON.parse(response);
            handler(jsonresponse);
        } catch (ex) {
            handler({});
        }
    });
}

var STATE = {
    STARTED : "0",
    STOPED : "1"
}

AudioContext = function (traces, loop, stateHandler) {
    this.endTime;
    this.iterator = traces[Symbol.iterator]();
    this.loop = loop;
    this.traces = traces;
    this.tag;
    this.doStateHandler = function(state) {
        if (stateHandler !== undefined && typeof stateHandler == 'function' && stateHandler != null) {
            stateHandler(state, this.tag);
        }
    }
    this.starting = true;
}

AudioPlayer = function (url) {
    this.play = function (traces, loop, finishedHandler) {
        if (this.isPlayinig()) {
            dispath({
                name: STATE.STOPED
            });
        }
        dispath({
            name: STATE.STARTED,
            ctx: new AudioContext(traces, loop, finishedHandler)
        });
    }

    var dispath = function(command) {
        __commandQueue.push(command);
        if (__queueTimeoutId == -1) {
            __queueTimeoutId = setTimeout(queueHandler, 100);
        }
    }

    var queueHandler = function() {
        if (__commandQueue.length == 0) {
            __queueTimeoutId = -1;
            return;
        }
        let command = __commandQueue[0];
        if (command.name == STATE.STOPED) {
            if (self.isPlayinig()) {
                __audio.pause();
            } else {
                __commandQueue.shift();
            }
        }
        if (command.name == STATE.STARTED) {
            if (self.isPlayinig()) {
                __audio.pause();
            } else {
                __currentAudioContext = command.ctx;
                __commandQueue.shift();
                process()
            }
        }
        if (__commandQueue.length > 0) {
            __queueTimeoutId = setTimeout(queueHandler, 100);
        } else {
            __queueTimeoutId = -1;
        }
    }

    var next = function () {
        __currentAudioContext.doStateHandler('stop_trace')
        var t = __currentAudioContext.iterator.next();
        if (t.done && __currentAudioContext.loop > 0) {
            __currentAudioContext.loop--;
            __currentAudioContext.iterator = __currentAudioContext.traces[Symbol.iterator]();
            t = __currentAudioContext.iterator.next();
        }
        while (!t.done) {
            if (t.value.dl !== undefined && t.value.dl != null && t.value.dl > 0) {
                if (!__currentAudioContext.starting) sleep(t.value.dl);
                //t = __currentAudioContext.iterator.next();
                __currentAudioContext.starting = false;
                //continue;
            }
            __audio.currentTime = t.value.st;
            __currentAudioContext.endTime = t.value.ft;
            console.log(t.value.st + "-" + t.value.ft + ";" + t.value.text);
            __currentAudioContext.starting = false;
            __currentAudioContext.tag = t.value.tag;
            __currentAudioContext.doStateHandler('start_trace')
            return true;
        }
        return false;
    }

    var process = function () {
        if (__commandQueue.length > 0) {
            let command = __commandQueue[0];
            if (command.name = STATE.STOPED) {
                __commandQueue.shift();
                __currentAudioContext.doStateHandler('stop');
                return
            }
        }
        if (next(__currentAudioContext)) {
            __currentAudioContext.doStateHandler('start')
            __audio.play();
        } else {
            __currentAudioContext.doStateHandler('stop');
        }
    }

    var doEnded = function () {
    }

    this.stop = function () {
        dispath({
            name: STATE.STOPED
        })

    }

    this.createTrace = function (start, finish, delay, tag, text) {
        if (delay !== undefined && delay != null && delay > 0) {
            return {st: start, ft: finish, dl: delay, tag: tag, text: text};
        }
        return {st: start, ft: finish, dl: delay, tag: tag, text: text === undefined ? '' : text};
    }

    // this.createTrace = function (start, finish, delay, tag) {
    //     return this.createTrace(start, finish, delay, tag, '');
    // }

    this.control;

    var doTimeupdate = function () {
        if (__currentAudioContext == null) return
        if (__currentAudioContext.endTime > 0 && __audio.currentTime > __currentAudioContext.endTime) {
            if (!__audio.paused) {
                __audio.pause();
            }
        }
    }

    this.isPlayinig = function () {
        return __audio.currentTime > 0 && !__audio.ended && !__audio.paused;
    }

    var __audio = new Audio();
    var self = this;
    if (__audio.canPlayType('audio/mpeg').search("probably|maybe") == -1) {
        var msg = 'no support:' + __audio.src;
        console.log(msg)
        throw msg;
    }
    __commandQueue = [];
    __queueTimeoutId = -1;
    __currentAudioContext = null;
    __audio.src = url;
    __audio.load();
    __audio.onended = doEnded;
    __audio.onpause = process;
    __audio.ontimeupdate = doTimeupdate;
    __audio.onplay = function () {
        __starting = true;
    }
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}

PlayerWrapper = function(player, traces, loop, startingImgName, stoppingImgName, stateHandler) {
    const __control = document.createElement("IMG");
    const __player = player;
    const __startingImgName = startingImgName;
    const __stoppingImgName = stoppingImgName;
    __control.src = __stoppingImgName;
    __control.height = 30;
    __control.width = 30;
    const __stateHandler = stateHandler;
    var __traces = traces;
    var __loop = loop;
    setState(STATE.STARTED)

    this.setTraces = function (traces) {
        __traces = traces;
    }

    this.setLoop = function (loop) {
        __loop = loop;
    }

    var getState = function() {
        return __control.getAttribute('player_state');;
    }
    function setState(state) {
        __control.setAttribute('player_state', state);
        __control.src = STATE.STARTED == state ? __startingImgName : __stoppingImgName;
    }
    this.getControl = function () {
        return __control;
    }
    __control.onclick = function () {
        let state = getState();
        if (STATE.STOPED == state) {
            __player.stop();
        } else {
            setState(STATE.STOPED);
            __stateHandler.perform('start')
            __player.play(__traces, __loop, function (state, tag) {
                if (state == 'stop') {
                    setState(STATE.STARTED)
                }
                __stateHandler.perform(state, tag)
            })
        }
    }
}

function clearElement(elementID) {
    var el = document.getElementById(elementID);
    while (el.hasChildNodes()) {
        el.removeChild(el.firstChild);
    }
}

//A page session lasts for as long as the browser is open and survives over page reloads and restores.
//Opening a page in a new tab or window will cause a new session to be initiated

function saveInSessionStorage(key, value) {
    if (typeof(Storage) !== "undefined") {
        sessionStorage.setItem(key, JSON.stringify(value))
    } else {
        console.log("Sorry! No Web Storage support..");
    }
}

function getFromSessionStorage(key) {
    if (typeof(Storage) !== "undefined") {
        return JSON.parse(sessionStorage.getItem(key));
    } else {
        console.log("Sorry! No Web Storage support..");
        return null;
    }
}

PersistentObject = function() {
    var __name = null;
    var __init_fn = null;
    var self = this;

    this.init = function(name, init_fn) {
        __name = name;
        __init_fn = init_fn;
        saveInSessionStorage(name, null);
    }

    this.recreate = function() {
        var data = __init_fn();
        self.commit(data);
    }

    this.commit = function(data) {
        saveInSessionStorage(__name, data);
    }

    this.get = function() {
        var data = getFromSessionStorage(__name)
        if (!check(data)) {
            data = __init_fn();
            saveInSessionStorage(__name, data);
        }
        return data;
    }

    this.saveToServer = function (query, fn) {
        let sdata = JSON.stringify(self.get());
        postJson(query, sdata, function(ret) {
            console.log(ret)
            try {
                fn();
            } catch (e) {
                console.log(e)
            }
        })
    }

    this.readFromServer = function (query, callback) {
        loadJson(query, function (response) {
            var data = response;
            if (!check(data)) {
                data = self.recreate();
            }
            self.commit(data);
            callback(data);
        })
    }

    var check = function (data) {
        return data != null && data['id'] !== undefined && data.id == __name;
    }
}