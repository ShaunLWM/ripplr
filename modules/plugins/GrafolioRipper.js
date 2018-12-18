const Request = require('../Request');
const AbstractRipper = require('../AbstractRipper');
const cheerio = require('cheerio');
const path = require('path');

class GrafolioRipper extends AbstractRipper {
    constructor({ url }) {
        super({ url });
        this.url = url;
        this.creatorId = null;
        this.maxPage = 0;

        this._domain = 'grafolio.com';
        this._host = 'grafolio';
    }

    static get host() {
        return this._host;
    }

    canRip(url) {
        const currentUrl = new URL(url);
        return currentUrl.host.endsWith(this._domain);
    }

    async rip() {
        await this.setup();
        let shouldContinue = true;
        let page = 1;
        while (shouldContinue) {
            try {
                console.log(`fetching ${page}`);
                let BASE_URL = `https://www.grafolio.com/creator/ajax/moreWorkList.json?creatorNo=${this.creatorId}&page=${page}`;
                let getInfo = new Request({ url: BASE_URL });
                let result = await getInfo.commit(false);
                if (!isNaN(result)) { // if returned a status code, and not a success 200 code

                }

                shouldContinue = this.handleJson(result);
                page += 1;
                if (page > this.maxPage) {
                    shouldContinue = false;
                }
            } catch (e) {
                console.error(`!> [grafolio rip] error: ${e}`);
            }
        }
    }

    handleJson(body) {
        let json = JSON.parse(body);
        if (json['resultForJsonView']['resultCode'] !== 'SUCCESS') {
            return false;
        }

        this.maxPage = json['resultForJsonView']['result']['pagingInfo']['totalPageSize'];
        console.log(`maxPage: ${this.maxPage}`);
        json['resultForJsonView']['result']['itemList'].forEach(element => {
            console.log(`https://g-grafolio.pstatic.net${element['representImageUrl']}`, element['worksNo']);
            this.downloadUrl(`https://g-grafolio.pstatic.net${element['representImageUrl']}`, element['worksNo']);
        });

        return true;
    }

    async setup() {
        let url = this.url;
        let getInfo = new Request({ url });
        let result = await getInfo.commit(false);
        if (!isNaN(result)) { // if returned a status code, and not a success 200 code
            return;
        }

        let $ = cheerio.load(result);
        let creatorId = $('meta[property="og:creator_no"]').attr('content');
        if (creatorId !== null && creatorId.length > 0) {
            console.log(`>> [grafolio setup] creatorId is ${creatorId}`);
            return this.creatorId = creatorId;
        }

        return console.error(`!> [grafolio setup] unable to find creator id`)
    }

    downloadUrl(url, id) {
        return super.addURLToDownload(url, null, id, path.join('Grafolio', this.creatorId));
    }
}

module.exports = GrafolioRipper;