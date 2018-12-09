const request = require('request');

let DEFAULT_OPTIONS = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
    }
};

class AbstractRequest {
    constructor(options = null) {
        if (options === null) {
            return this.options = DEFAULT_OPTIONS;
        }

        this.options = Object.assign(DEFAULT_OPTIONS, options);
    }

    set url(url) {
        this.options.url = url;
    }

    async commit(statusCodeAsError = true) {
        return new Promise((resolve, reject) => {
            if (typeof this.options.url === 'undefined' || this.options.url === null) {
                throw new Error("!> no url defined");
            }

            return request(this.options, (error, response, body) => {
                if (error) {
                    return reject(error);
                }

                if (response.statusCode !== 200) {
                    if (statusCodeAsError) {
                        return reject(response.statusCode);
                    }

                    return resolve(response.statusCode);
                }

                return resolve(body);
            });
        })

    }
}

module.exports = AbstractRequest;