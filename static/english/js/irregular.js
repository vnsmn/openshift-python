var player = null;

function loadPage(jsound_path, jmeta_sound_path, qsettings, startImgName, stopImgName, mode) {
    let sound;
    let meta_sound;
    let settings;
    loadJson(jsound_path, function (response1) {
        sound = response1;
        loadJson(jmeta_sound_path, function (response2) {
            meta_sound = response2;
            loadJson(qsettings, function (response3) {
                settings = response3;
                createPage(sound, meta_sound, settings, startImgName, stopImgName, mode);
            });
        });
    });
}

function getTimes(soundJsn, data) {
    let l = soundJsn.lines[data[0]];
    let t1 = l === undefined || l == null ? 0 : l[0];
    let t2 = l === undefined || l == null ? 0 : l[1];
    return {t1:t1, t2:t2}
}


function createPage(soundJsn, metaJsn, dataJsn, startImgName, stopImgName, mode) {
    player = new AudioPlayer(soundJsn.soundUrl)

    var RowStateHandler = function() {
        this.perform = function (state, ctl) {
            var modeid = document.getElementById("modeid");
            if (state == 'start') {
                modeid.disabled = true;
            } else if (state == 'start_trace')
                ctl.style.color = 'blue'
            else if (state == 'stop_trace')
                ctl.style.color = 'black'
            else if (state == 'stop') {
                if (ctl !== undefined) ctl.style.color = 'black'
                modeid.disabled = false;
            }
        }
    }


    let plays = [];
    let delay = 0;
    let loop = 0;
    var table = document.getElementById("table1");
    for (let t in metaJsn.lines) {
        let line = metaJsn.lines[t];

        let checked = dataJsn.sels[line.inf[0]] !== undefined;
        if (mode == 'view' && !checked) continue;

        let traces = [];
        var row = table.insertRow(table.rows.length);
        var cell0 = row.insertCell(0);
        var cell1 = row.insertCell(1);
        var cell2 = row.insertCell(2);
        var cell21 = row.insertCell(3);
        var cell3 = row.insertCell(4);
        var cell31 = row.insertCell(5);
        var cell4 = row.insertCell(6);
        var cell41 = row.insertCell(7);
        var cell5 = row.insertCell(8);


        let ts = getTimes(soundJsn, line.inf);
        traces.push(player.createTrace(ts.t1, ts.t2, delay, cell2));
        plays.push(player.createTrace(ts.t1, ts.t2, delay, cell2));
        ts = getTimes(soundJsn, line.pas);
        traces.push(player.createTrace(ts.t1, ts.t2, delay, cell3));
        plays.push(player.createTrace(ts.t1, ts.t2, delay, cell3));
        ts = getTimes(soundJsn, line.prf);
        traces.push(player.createTrace(ts.t1, ts.t2, delay, cell4));
        plays.push(player.createTrace(ts.t1, ts.t2, delay, cell4));
        ts = getTimes(soundJsn, line.rus);
        traces.push(player.createTrace(ts.t1, ts.t2, delay, cell5));
        plays.push(player.createTrace(ts.t1, ts.t2, delay, cell5));

        let playImg = new PlayerWrapper(player, traces, loop, startImgName, stopImgName, new RowStateHandler());

        var chk = document.createElement("INPUT");
        chk.setAttribute("type", "checkbox");
        chk.checked = checked;
        chk.setAttribute("identity", line.inf[0]);
        if (mode == 'edit') cell0.appendChild(chk);
        cell1.appendChild(playImg.getControl());
        cell2.innerHTML = line.inf[0];
        cell21.innerHTML = line.inf[1];
        cell3.innerHTML = line.pas[0];
        cell31.innerHTML = line.pas[1];
        cell4.innerHTML = line.prf[0];
        cell41.innerHTML = line.prf[1];
        cell5.innerHTML = line.rus[0];
    }

    var playAll = document.getElementById("playAll");
    let playImg = new PlayerWrapper(player, plays, loop, startImgName, stopImgName, new RowStateHandler());
    playAll.appendChild(playImg.getControl());
}


