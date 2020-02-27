const fs = require('fs');
const moment = require("moment");
const path = require("path");

class Attempt {

    constructor(recordFilePath){
        this.recordFilePath = recordFilePath;
    }

    computeCompletedAttemptsForToday(){ 
        const record = this.getRecordFile();
        const todayDate = moment().format('l');
        const count = record.pastAttempts.reduce( (s,obj) => {
            let c = 0;
            if(obj.endDateTime && todayDate == obj.startDate){
                c = 1;
            }
            return s + c;
        }, 0);
        return count;
    }

    createFocusAttempt(durationInMins){
        if(!durationInMins || durationInMins < 1){
            throw new Error("createFocusAttempt(%s) is invalid. durationInMins must be positive", durationInMins);
        }
        return {
            startTimestamp: Date.now(),
            // startDate and startDateTime will be used for analytics
            startDate: moment().format('l'),
            startDateTime: moment().format('llll'),
            durationInMins: durationInMins,        
            endDateTime: null
        }
    }
    
    createFocusTable(){
        return {
            currentAttempt: null,
            pastAttempts: []
        }
    }
    
    createNewRecordFile(obj){
        const content = JSON.stringify(obj || this.createFocusTable());
        
        if(!fs.existsSync(this.recordFilePath)){
            const dirName = path.dirname(this.recordFilePath);
            fs.mkdirSync(dirName, { recursive: true });
        }
        
        fs.writeFileSync(this.recordFilePath, content, 'utf8');
    }
    
    getRecordFile(){
        if(!fs.existsSync(this.recordFilePath)){
            this.createNewRecordFile();
        }
        const fileContent = fs.readFileSync(this.recordFilePath, 'utf8');
        return JSON.parse(fileContent);
    }
    
    addCurrentAttemptToRecord(durationInMins){
        const record = this.getRecordFile()
        if(record.currentAttempt){
            record.pastAttempts.push( Object.assign({}, record.currentAttempt) );
        }
        record.currentAttempt = this.createFocusAttempt(durationInMins);
        this.createNewRecordFile(record);
    }
    
    markCurrentAttemptCompleteInRecord(){
        const record = this.getRecordFile()
        if(record.currentAttempt){
            record.currentAttempt.endDateTime = moment().format('llll');
            record.pastAttempts.push( Object.assign({}, record.currentAttempt) );
        }
        record.currentAttempt = null;
        this.createNewRecordFile(record);
    }
}

module.exports = Attempt;