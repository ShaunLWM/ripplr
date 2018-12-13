require('string-format-js');
const Utils = require('./Utils');
const Path = require('path');
const JobManager = require('./JobManager');
const fs = require('fs-extra');

class Ripper {
    constructor(url) {
        this.url = url; // !TODO sanitizeUrl
        this.shouldStopNow = false;
        this.jobManager = new JobManager();
    }

    get shouldStop() {
        return this.shouldStopNow;
    }

    set shouldStop(val) {
        this.shouldStopNow = val;
    }

    addURLToDownload(url, prefix, subdirectory = null, referrer = null, cookies = null, fileName = null, extension = null, getFileExtFromMime = false) {
        // TODO: check if download before
        console.log('>> [ar addURLToDownload] done: ' + url, prefix);
        let fn = this.getfn({ url, prefix: Utils.filesystemSanitized(prefix) });
        //console.log(`fn :${fn}`)
        if (subdirectory !== null) {
            subdirectory = Utils.filesystemSafe(subdirectory);
        } else {
            subdirectory = "bnn";
        }

        // console.log(`fn :${subdirectory}`)
        let saveFileAs = Path.join(__dirname, subdirectory);
        // fs.ensureDirSync(subdirectory);
        //console.log(saveFileAs);
        this.jobManager.addJob({
            url,
            dir: saveFileAs,
            fn: fn
        });
    }

    getPrefix(index) {
        return '_%03d'.format(index);
    }

    getfn({ url, prefix = null }) {
        let fn = url.split('/').pop().split('#')[0].split('?')[0];
        if (prefix !== null) {
            let s = fn.split('.');
            fn = `${s[0]}${prefix}.${s[1]}`;
        }

        return fn;
    }
}

module.exports = Ripper;