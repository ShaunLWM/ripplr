const AbstractRipper = require('../AbstractRipper');
const Request = require('../Request');
const cheerio = require('cheerio');

class ImgboxRipper extends AbstractRipper {
    constructor(url) {
        super(url);
    }

    getHost() {
        return 'imgbox';
    }

    getDomain() {
        return 'imgbox.com';
    }

    getGid(url) {
        let match = /^https?:\/\/[wm.]*imgbox.com\/g\/([a-zA-Z0-9]+).*$/g.exec(url);
        if (match !== null) {
            return match[1];
        }

        throw new Error(`Expected imgbox.com URL format: imgbox.com/g/albumid - got ${url} instead`)
    }

    async rip() {
        try {
            let index = 1;
            let getInfo = new Request({ url: this.url });
            let result = await getInfo.commit(false);
            if (!isNaN(result)) { // if returned a status code
                throw new Error(`!> status code is not 200 ${result}`);
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
            return console.error(`!> ${e}`)
        }
    }

    downloadUrl(url, index) {
        return this.addURLToDownload(url, this.getPrefix(index));
    }
}

module.exports = ImgboxRipper;