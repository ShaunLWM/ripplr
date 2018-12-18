const Request = require('../Request');
const AbstractRipper = require('../AbstractRipper');

class NineGagRipper extends AbstractRipper {
    constructor({ url }) {
        super({ url });
        this.index = 1;
        this._domain = "9gag.com";
        this._host = "9gag";
        this.nextCursor = '';
    }

    static get host() {
        return this._host;
    }

    canRip(url) {
        const currentUrl = new URL(url);
        return currentUrl.host.endsWith(this._domain);
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
            for (const [, value] of Object.entries(images)) {
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
        super.addURLToDownload(url, super.getPrefix(this.index), null, '9gag');
        return this.index++;
    }
}

module.exports = NineGagRipper;