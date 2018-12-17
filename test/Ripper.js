const Ripper = require('../modules/Ripper');
let ripper = new Ripper();
ripper.addUrl({ url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some' });
ripper.addUrl({ url: 'http://imgbox.com/g/wKThIDe15b' });
// ripper.addUrl({ url: 'https://www.tumblr.com/tagged/csgo' });
// ripper.addUrl({ url: 'https://www.tumblr.com/tagged/quotes' });
// console.log(ripper.urls);
ripper.start();