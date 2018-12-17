const PluginManager = require('./PluginManager');

class Ripper {
    constructor() {
        this.pluginManager = new PluginManager();
        this._urls = [];
    }

    get urls() {
        return this._urls;
    }

    addUrl({ url, startNow = false }) {
        try {
            let result = this.pluginManager.validateUrl(url);
            if (result !== null) {
                console.log(`>> [ripper addUrl] plugin [${result.name}] found: ${url}`);
                this._urls.push({
                    url,
                    name: result.name,
                    host: result.host,
                    started: startNow
                });

                if (startNow) {
                    return this.pluginManager.start({ url });
                }
            }

            return console.error(`!> [ripper addUrl] no plugin found: ${url}`)
        } catch (e) {
            console.error(`!> [ripper addUrl] ${e}`);
        }
    }

    start() {
        this._urls.forEach((element, index) => {
            if (!element.started) {
                this._urls[index].started = true;
                return this.pluginManager.start(element);
            }
        });
    }
}

module.exports = new Ripper();