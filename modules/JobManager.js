const Queue = require('bull');
const fs = require('fs');
const download = require('download');
const Arena = require('bull-arena');

const express = require('express');
const app = express();
let arena = Arena({
    queues: [{
        name: 'download queue',
        "hostId": "Downloader"
    }]
});

app.use('/', arena);
app.listen(8081, () => console.log(`Queue server listening on port 8081!`));

class JobManager {
    constructor() {
        this.downloadqueue = new Queue('download queue');
        this.downloadqueue.process(function (job, done) {
            // console.log(job.data.url, job.data.dir, job.data.fn);
            return download(job.data.url, job.data.dir, {
                filename: job.data.fn
            }).then(() => {
                console.log(`>> [jm] downloaded: ${job.data.url}`);
                
                return done();
            });
        });
    }

    addJob(opts) {
        this.downloadqueue.add(opts, {
            delay: 2000,
            attempts: 2
        });
    }
}

module.exports = JobManager;