const Request = require('../Request');
const AbstractRipper = require('../AbstractRipper');
const async = require('async');
const cheerio = require('cheerio');

class NineGagRipper extends AbstractRipper {
    constructor(url) {
        super(url);
        this.index = 1;
        this.DOMAIN = "9gag.com";
        this.HOST = "9gag";
        this.nextCursor = '';
    }

    canRip(url) {
        const currentUrl = new URL(url);
        return currentUrl.host.endsWith(this.DOMAIN);
    }

    async rip() {
        let shouldContinue = true;
        while (shouldContinue) {
            try {
                let BASE_URL = `https://9gag.com/v1/group-posts/group/default/type/hot?c=10${this.nextCursor}`;
                let getInfo = new Request({ url: BASE_URL });
                let result = await getInfo.commit(false);
                if (!isNaN(result)) { // if returned a status code, and not a success 200 code

                }

                shouldContinue = this.handleJson(result);
            } catch (e) {
                console.error(`!> [9gag rip] error: ${e}`);
            }
        }
    }

    handleJson(body) {
        let json = JSON.parse(body);
        let posts = json['data']['posts'];
        this.nextCursor = `&${json['data']['nextCursor']}`;
        if (posts.length < 1) {
            console.error('!> [9gag handleJson] zero posts returned');
            return false;
        }

        posts.forEach(post => {
            let images = post['images'];
            for (const [key, value] of Object.entries(images)) {
                if (typeof value['url'] !== 'undefined') {
                    this.downloadUrl((value['url']));
                    break;
                }
            }
        });

        console.log('>> [9gag handleJson] done parsing json.');
        return true;
    }

    downloadUrl(url) {
        this.addURLToDownload(url, this.getPrefix(this.index));
        this.index++;
    }
}

module.exports = NineGagRipper;