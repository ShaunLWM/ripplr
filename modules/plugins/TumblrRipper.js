const Request = require('../Request');
const AbstractRipper = require('../AbstractRipper');
const async = require('async');
const cheerio = require('cheerio');

class TumblrRipper extends AbstractRipper {
    constructor({ url }) {
        super({ url });
        this.index = 1;
        this.limitIncrement = 50;
        this.domain = "tumblr.com";
        this._host = "tumblr";
        this.ALBUM_TYPE = {
            SUBDOMAIN: 0,
            TAG: 1,
            POST: 2,
            LIKED: 3
        }

        this.albumType = null;
        this.subdomain = null;
        this.tagName = null;
        this.postNumber = null;
        this.useDefaultApiKey = false;
        this.API_KEY = null;
        this.tagBeforeTimestamp = Math.round((new Date()).getTime() / 1000);
        if (this.getApiKey() === null) {
            throw new Error("Could not find tumblr authentication key in configuration");
        }

        this.setup();
    }

    static get host() {
        return this._host;
    }

    getApiKey() {
        if (this.API_KEY === null) {
            this.API_KEY = this.pickRandomApiKey();
        }

        if (this.useDefaultApiKey) {
            return "JFNLu3CbINQjRdUvZibXW9VpSEVYYtiPJ86o8YmvgLZIoKyuNX";
        }

        return "UHpRFx16HFIRgQjtjJKgfVIcwIeb71BYwOQXTMtiCvdSEPjV7N"; // this is a test key
        // https://github.com/RipMeApp/ripme/blob/master/src/main/java/com/rarchives/ripme/ripper/rippers/TumblrRipper.java#L57
    }

    pickRandomApiKey() {
        let APIKEYS = ["JFNLu3CbINQjRdUvZibXW9VpSEVYYtiPJ86o8YmvgLZIoKyuNX",
            "FQrwZMCxVnzonv90rgNUJcAk4FpnoS0mYuSuGYqIpM2cFgp9L4",
            "qpdkY6nMknksfvYAhf2xIHp0iNRLkMlcWShxqzXyFJRxIsZ1Zz"];
        return APIKEYS[Math.floor(Math.random() * APIKEYS.length)];
    }

    canRip(url) {
        const currentUrl = new URL(url);
        return currentUrl.host.endsWith(this.domain);
    }

    async sanitizeUrl() {
        if (this.url.count(".") > 2) {
            this.url = this.url.replace(/.tumblr.com/g, '');
            if (await this.isTumblrUrl()) {
                console.debug(`>> detected tumblr site: ${this.url}`);
            } else {
                console.debug(`>> not a tumblr site: ${this.url}`);
            }
        }
    }

    async isTumblrUrl() {
        console.info(`i> checking if ${this.url} is a tumblr url..`);
        const currentUrl = new URL(this.url);
        let checkUrl = `https://api.tumblr.com/v2/blog/${currentUrl.host}/info?api_key=${this.getApiKey()}`;
        try {
            let getInfo = new Request({ url: checkUrl });
            let result = await getInfo.commit();
            let status = parseInt((JSON.parse(result))["meta"]["status"]);
            return status === 200;
        } catch (e) {
            console.error(`!> Error while checking possible tumblr domain: ${currentUrl.host}`, e);
            return e;
        }
    }

    getTumblrApiURL(mediaType, offset) {
        if (this.albumType == this.ALBUM_TYPE.LIKED) {
            return `https://api.tumblr.com/v2/blog/${this.subdomain}/likes?api_key=${this.getApiKey()}&offset=${offset}`;
        }

        if (this.albumType == this.ALBUM_TYPE.POST) {
            return `https://api.tumblr.com/v2/blog/${this.subdomain}/posts?id=${this.postNumber}&api_key=${this.getApiKey()}`;
        }

        if (this.albumType == this.ALBUM_TYPE.TAG) {
            return `https://api.tumblr.com/v2/tagged/?api_key=${this.getApiKey()}&limit=${this.limitIncrement}&tag=${this.tagName}&before=${this.tagBeforeTimestamp}`;
        }

        return `https://api.tumblr.com/v2/blog/${this.subdomain}/posts/${mediaType}?api_key=${this.getApiKey()}&offset=${offset}&limit=50`;
    }

    async rip() {
        let mediaTypes = [];
        let shouldStopRipping = false;
        if (this.albumType === this.ALBUM_TYPE.POST) {
            console.info(`i> ripping post only`);
            mediaTypes = ['post'];
        } else {
            console.info(`i> ripping photos/videos only`);
            mediaTypes = ['photo', 'video'];
        }

        let offset;
        async.eachSeries(mediaTypes, async (mediaType, callback) => {
            if (this.shouldStop || shouldStopRipping) {
                return callback();
            }

            offset = 0;
            while (true) {
                if (this.shouldStop || shouldStopRipping) {
                    break;
                }

                let apiUrl = this.getTumblrApiURL(mediaType, offset);
                console.log(`>> Retreiving: ${apiUrl}`);
                let retry = false;
                try {
                    let getInfo = new Request({ url: apiUrl });
                    let result = await getInfo.commit(false);
                    if (!isNaN(result)) { // if returned a status code, and not a success 200 code
                        switch (result) {
                            case 401:
                                if (!this.useDefaultApiKey) {
                                    retry = true;
                                }

                                break;
                            case 404:
                                console.error('!> no user or album found!');
                                shouldStopRipping = true;
                                break;
                            case 429:
                                console.error('!> tumblr rate limit has been exceeded');
                                shouldStopRipping = true;
                                break;
                        }
                    }

                    if (retry) {
                        console.debug('#> retrying..');
                        this.useDefaultApiKey = true;
                        let apiKey = this.getApiKey();
                        console.error(`!> 401 Unauthorized. Will retry with default Tumblr API key:${apiKey}`);
                        // !TODO save the default key to the config
                        apiUrl = this.getTumblrApiURL(mediaType, offset);
                        getInfo = new Request({ url: apiUrl });
                        result = await getInfo.commit(false);
                    }

                    if (!this.handleJson(result)) {
                        console.error(`!> unable to handleJson()`);
                        break;
                    }
                } catch (e) {
                    console.error(`!> error: ${e}`);
                }

                if (this.albumType === this.ALBUM_TYPE.POST) { // normally 1 post only
                    shouldStopRipping = true;
                }

                offset += this.limitIncrement;
            }

            if (this.shouldStop) {
                return callback();
            }
        }, function (err) {
            if (err) {
                console.error(`!> async  ${err}`);
            }

            console.log('>> Done');
        });
    }

    handleJson(body) {
        let posts = [];
        let photos = [];
        let fileUrl;
        let json = JSON.parse(body);
        if (this.albumType === this.ALBUM_TYPE.LIKED) {
            posts = json["response"]["liked_posts"];
        } else if (this.albumType === this.ALBUM_TYPE.TAG) {
            posts = json["response"];
        } else {
            posts = json["response"]["posts"];
        }

        if (posts.length < 1) {
            console.error('!> zero posts returned');
            return false;
        }

        posts.forEach(post => {
            if (post.hasOwnProperty('timestamp') && post['timestamp'] !== null) {
                this.tagBeforeTimestamp = post['timestamp'];
            }

            if (post.hasOwnProperty('photos')) {
                photos = post["photos"];
                photos.forEach(photo => {
                    if (photo.hasOwnProperty('original_size')) {
                        fileUrl = photo["original_size"]["url"].replace(/http:/g, 'https:');
                        this.downloadUrl(fileUrl);
                    }
                })
            } else if (post.hasOwnProperty('video_url')) {
                fileUrl = post["video_url"].replace(/http:/g, 'https:');
                this.downloadUrl(fileUrl);
            } else if (post.hasOwnProperty('body')) {
                let $ = cheerio.load(post['body']);
                $('img').each((index, img) => {
                    let i = $(img).attr('src');
                    if (typeof i !== 'undefined' && i !== null) {
                        this.downloadUrl(i);
                    }
                });
            }

            if (this.albumType === this.ALBUM_TYPE.POST) {
                return false;
            }
        });

        console.log('>> Done parsing json.');
        return true;
    }

    setup() {
        console.info('i> setting up: ' + this.url);

        // Tagged URL
        let match = /^https?:\/\/([a-zA-Z0-9\-.]+)\/tagged\/([a-zA-Z0-9\-%]+).*$/g.exec(this.url);
        if (match !== null) {
            console.info('!> is a tagged url');
            this.albumType = this.ALBUM_TYPE.TAG;
            this.subdomain = match[1];
            this.tagName = match[2];
            this.tagName = this.tagName.replace(/-/g, '+').replace(/_/g, "%20");
            return `${this.subdomain}_tag_${this.tagName.replace(/%20/g, " ")}`;
        }

        // Post URL
        match = /^https?:\/\/([a-zA-Z0-9\-.]+)\/post\/([0-9]+).*$/g.exec(this.url);
        if (match !== null) {
            console.info('!> is a post url');
            this.albumType = this.ALBUM_TYPE.POST;
            this.subdomain = match[1];
            this.postNumber = match[2];
            return `${this.subdomain}_post_${this.postNumber}`;
        }

        // Subdomain level URL
        match = /^https?:\/\/([a-zA-Z0-9\-.]+)\/?$/g.exec(this.url);
        if (match !== null) {
            console.info('!> is a normal url');
            this.albumType = this.ALBUM_TYPE.SUBDOMAIN;
            this.subdomain = match[1];
            return this.subdomain;
        }

        // Likes URL
        match = /https?:\/\/([a-z0-9_-]+).tumblr.com\/likes/g.exec(this.url);
        if (match !== null) {
            console.info('!> is a likes url');
            this.albumType = this.ALBUM_TYPE.LIKED;
            this.subdomain = match[1];
            return `${this.subdomain}_liked`;
        }

        // Likes url different format
        match = /https:\/\/www\.tumblr\.com\/liked\/by\/([a-z0-9_-]+)/g.exec(this.url);
        if (match !== null) {
            console.info('!> is a likes [2] url');
            this.albumType = this.ALBUM_TYPE.LIKED;
            this.subdomain = match[1];
            return `${this.subdomain}_liked`;
        }

        return new Error('Expected format: https://subdomain[.tumblr.com][/tagged/tag|/post/postno]');
    }

    downloadUrl(url) {
        this.addURLToDownload(url, super.getPrefix(this.index), null, this.subdomain);
        this.index++;
    }
}

module.exports = TumblrRipper;