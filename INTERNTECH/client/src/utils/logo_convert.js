// Script to convert logo to base64 and output it
const fs = require('fs');
const path = require('path');
const logoPath = path.join(__dirname, '..', '..', 'public', 'interntex-logo.png');
const bytes = fs.readFileSync(logoPath);
const b64 = bytes.toString('base64');
console.log('LENGTH:', b64.length);
console.log('DATA_URI:', 'data:image/png;base64,' + b64.substring(0, 50) + '...');
// Write full base64 to a file
fs.writeFileSync(path.join(__dirname, 'logoBase64.txt'), b64);
console.log('Full base64 written to logoBase64.txt');
