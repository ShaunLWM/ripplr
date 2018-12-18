const AbstractRipper = require('../AbstractRipper');
const Request = require('../Request');
const cheerio = require('cheerio');
const path = require('path');

class ImgboxRipper extends AbstractRipper {
    constructor({ url }) {
        super({ url });
        this.url = url;
        this.galleryId = null;
        this._host = 'imgbox';
        this._domain = 'imgbox.com';
        this.setup();
    }

    static get host() {
        return this._host;
    }

    canRip(url) {
        const currentUrl = new URL(url);
        return currentUrl.host.endsWith(this._domain);
    }

    setup() {
        let match = /^https?:\/\/[wm.]*imgbox.com\/g\/([a-zA-Z0-9]+).*$/g.exec(this.url);
        if (match !== null) {
            return this.galleryId = match[1];
        }

        throw new Error(`[imgbox setup] expected imgbox.com URL format: imgbox.com/g/albumid - got ${this.url} instead`)
    }

    async rip() {
        try {
            let index = 1;
            let getInfo = new Request({ url: this.url });
            let result = await getInfo.commit(false);
            if (!isNaN(result)) { // if returned a status code
                throw new Error(`!> [imgbox rip] status code is not 200 ${result}`);
            }

            let $ = cheerio.load(result);
            let gallery = $('#gallery-view-content').children();
            if (gallery.length < 1) {
                return;
            }

            gallery.each((i, element) => {
                let image = $(element).find('img')
                if (image.length > 0) {
                    let img = image.attr('src').replace(/thumbs/g, 'images').replace(/_b/g, '_o').replace(/\\d-s/g, 'i');
                    // console.log(img);
                    this.downloadUrl(img, index);
                    index++;
                }
            });
        } catch (e) {
            return console.error(`!> ${e}`);
        }
    }

    downloadUrl(url, index) {
        return super.addURLToDownload(url, super.getPrefix(index), null, path.join('Imgbox', this.galleryId));
    }
}

module.exports = ImgboxRipper;