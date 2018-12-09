const Queue = require('bull');
const fs = require('fs');
const download = require('download');
const Arena = require('bull-arena');

const express = require('express');
const app = express();

class JobManager {
    constructor() {
        this.downloadqueue = new Queue('download queue');
        this.arena = Arena({
            queues: [{
                name: 'download queue',
                "hostId": "Downloader"
            }]
        });

        app.use('/', this.arena);
        app.listen(8081, () => console.log(`Example app listening on port 8081!`));


        this.downloadqueue.process(function (job, done) {
            // download(job.data.url).pipe(fs.createWriteStream(job.data.dir));
            // return done();
            console.log(job.data.url, job.data.dir, job.data.fn);
            return download(job.data.url, job.data.dir, {
                filename: job.data.fn
            }).then(() => {
                console.log(`Done ${job.data.url}`);
                return done();
            });

            return done();
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