const path = require('path');
const config = require('../config');
const fs = require('fs-extra');
var requireDir = require('require-dir');

class PluginManager {
    constructor() {
        this.Plugins = requireDir(path.join(__dirname, 'plugins')); // require all needed plugins
        this.pluginsMapping = [];
        this.setup();
    }

    setup() { // make sure that the file itself actually exist
        config.plugins.forEach(p => {
            let name = `${p.name}Ripper`;
            let filePath = `${__dirname}/plugins/${name}.js`;
            if (!fs.existsSync(filePath)) {
                return console.error(`!> failed to load ${p.name} plugin`);
            }

            this.pluginsMapping.push(p);
            return console.log(`>> loaded ${p.name} plugin`);
        });
    }

    validateUrl(url) {
        try {
            console.log(`>> validating ${url}`);
            const currentUrl = new URL(url);
            let result = this.pluginsMapping.filter(p => {
                return currentUrl.host.endsWith(p.host);
            });

            if (result.length > 0) {
                return result[0];
            }

            return null;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    start({ url, name, host }) {
        let p;
        switch (name) {
            case 'Grafolio':
                p = new this.Plugins.GrafolioRipper({ url });
                p.rip();
                break;
            case 'Imgbox':
                p = new this.Plugins.ImgboxRipper({ url });
                p.rip();
                break;
            case 'NineGag':
                p = new this.Plugins.NinGagRipper({ url: '' });
                p.rip();
                break;
            case 'Tumblr':
                p = new this.Plugins.TumblrRipper({ url });
                p.rip();
                break;
        }
    }
}

module.exports = PluginManager;