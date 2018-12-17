const Ripper = require('../modules/Ripper');
Ripper.addUrl({ url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some' });
Ripper.addUrl({ url: 'http://imgbox.com/g/wKThIDe15b' });
// Ripper.addUrl({ url: 'https://www.tumblr.com/tagged/csgo' });
// Ripper.addUrl({ url: 'https://www.tumblr.com/tagged/quotes' });
console.log(Ripper.urls);
Ripper.start();