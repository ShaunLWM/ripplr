require('string-format-js');

class Ripper {
    constructor(url) {
        this.url = url; // !TODO sanitizeUrl
        this.shouldStopNow = false;
    }

    get shouldStop() {
        return this.shouldStopNow;
    }

    set shouldStop(val) {
        this.shouldStopNow = val;
    }

    addURLToDownload(url, prefix, subdir = "", referrer = null, cookies = null, fileName = null, extension = null, getFileExtFromMime = false) {
        console.log('>> download ' + url, prefix);
    }

    getPrefix(index) {
        let prefix = "";
        //if (keepSortOrder() && Utils.getConfigBoolean("download.save_order", true)) {
        prefix = '%03d_'.format(index);
        // }

        return prefix;
    }
}

module.exports = Ripper;