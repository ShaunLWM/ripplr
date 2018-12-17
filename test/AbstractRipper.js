const AbstractRipper = require('../modules/AbstractRipper');
// let rip = new AbstractRipper('https://www.w3schools.com/jsref/jsref_substring.asp');
// console.log(rip.getFileName({
//     url: 'https://66.media.tumblr.com/73f60f0729ed265440847e4218f5d9ff/tumblr_pjgtrl9eYZ1xn0vayo1_1280.jpg'
// }));

let rip = new AbstractRipper('http://imgbox.com/g/wKThIDe15b');
rip.rip();