require('string-format-js');
const Utils = require('./Utils');
const Path = require('path');
const JobManager = require('./JobManager');

class AbstractRipper {
    constructor({ url, directory = "ripplr" }) {
        this.url = url; // !TODO sanitizeUrl
        this.directory = directory;
        this.shouldStopNow = false;
        this.jobManager = new JobManager();
    }

    get shouldStop() {
        return this.shouldStopNow;
    }

    set shouldStop(val) {
        this.shouldStopNow = val;
    }

    addURLToDownload(url, prefix, fileName = null, subdirectory = null) {
        // TODO: check if download before
        console.log('>> [ar] added: ' + url, prefix, fileName, subdirectory);
        let fn = Math.round((new Date()).getTime() / 1000); // just in case
        if (prefix !== null) {
            fn = this.getfn({ url, prefix: Utils.filesystemSanitized(prefix) });
        } else if (fileName !== null) {
            fn = this.getfn({ url, prefix: null, fileName });
        }

        //console.log(`fn :${fn}`)
        if (subdirectory !== null) {
            subdirectory = Utils.filesystemSafe(subdirectory);
        } else {
            subdirectory = this.directory;
        }

        // console.log(`fn :${subdirectory}`)
        let saveFileAs = Path.join(__dirname, subdirectory);
        // fs.ensureDirSync(subdirectory);
        //console.log(saveFileAs);
        return this.jobManager.addJob({
            url,
            dir: saveFileAs,
            fn: fn
        });
    }

    getPrefix(index) {
        return '_%03d'.format(index);
    }

    getfn({ url, prefix = null, fileName = null }) {
        let fn = url.split('/').pop().split('#')[0].split('?')[0];
        if (prefix !== null) {
            let s = fn.split('.');
            fn = `${s[0]}${prefix}.${s[1]}`;
        } else if (fileName !== null) {
            let s = fn.split('.');
            fn = `${fileName}.${s[1]}`;
        }

        return fn;
    }
}

module.exports = AbstractRipper;