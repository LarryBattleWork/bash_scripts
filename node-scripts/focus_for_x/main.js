const moment = require("moment");
var childProc = require('child_process');
const Attempt = require("./Attempt");

const minutesToWait = 20;
const waitInSeconds = 60 * minutesToWait;
const endTime = moment().add(minutesToWait, 'minute');

const attempt = new Attempt(recordFilePath);


// TODO: Load these from a config file
const WEBSITE = "https://www.google.com/";
const recordFilePath = "./data/focusAttempts.json";


(async ()=> {    
    attempt.addCurrentAttemptToRecord(minutesToWait);
    const todaysCompletedCount = attempt.computeCompletedAttemptsForToday();

    console.log("Session: %s", todaysCompletedCount + 1);
    console.log("Focus Period: %s minutes", minutesToWait);
    console.log("Break: %s", endTime.format("llll"));

    await new Promise(r => { setTimeout(r, 1000 * waitInSeconds )});

    attempt.markCurrentAttemptCompleteInRecord(minutesToWait);
    childProc.exec(`open -a "Google Chrome" '${WEBSITE}'`);
})();