const {spawn} = require('child_process');
require('colors');
var latestJournal = [];
function getCurrentJournal(callback){
    var journalctl = spawn('journalctl', ['-b', '--no-pager', '-o', 'json']), journalstr = '';
    journalctl.stdout.on('data', (data) => {
        journalstr += `${data}`;
    });
    journalctl.on('close', (code) => {
        var data = journalstr.split(/[\r\n]\s*\{/), journal = [];
        data.forEach((tmp, i) => {
            if (i) tmp = `{${tmp}`;
            tmp = JSON.parse(tmp);
            journal.push({
                ts: tmp.__REALTIME_TIMESTAMP,
                priority: tmp.PRIORITY,
                msg: tmp.MESSAGE
            });
        });
        if (!code) callback(null, journal); else callback(code);
    });
}
function normalizeNum(num){
    if (num * 1 < 10) return `0${num}`; else return num;
}
setInterval(()=>{
    getCurrentJournal((err, journal) => {
        var diff = journal.length - latestJournal.length;
        if (!err && diff){
            latestJournal = journal;
            journal.slice(-diff).forEach(journ_entry => {
                var time = new Date();
                time.setTime(journ_entry.ts/1000);
                console.log(`[${
                    normalizeNum(time.getDate())
                }.${
                    normalizeNum(time.getMonth() + 1)
                }.${
                    time.getFullYear()
                } `.yellow + `${
                    normalizeNum(time.getHours())
                }:${
                    normalizeNum(time.getMinutes())
                }:${
                    normalizeNum(time.getSeconds())
                }`.green + ']'.yellow + ` ${
                    journ_entry.msg
                }`);
            });
        };
    });
}, 100);
