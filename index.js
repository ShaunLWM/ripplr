require('string-format-js');
String.prototype.count = function (s1) {
    return (this.length - this.replace(new RegExp(s1, "g"), '').length) / s1.length;
}

// const TumblrRipper = require('./modules/plugins/TumblrRipper');
// let ripper = new TumblrRipper('https://junkerratboy.tumblr.com/');
// ripper.getGid('https://junkerratboy.tumblr.com/');
// ripper.rip();

const ImgboxRipper = require('./modules/plugins/ImgboxRipper');
let ripper = new ImgboxRipper('http://imgbox.com/g/wKThIDe15b');
// ripper.getGid('https://junkerratboy.tumblr.com/');
ripper.rip();

// console.log('%03d_'.format(1233) )