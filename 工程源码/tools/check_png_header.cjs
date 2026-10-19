const fs = require('fs');

const buf = fs.readFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/verify_dark_profiles_v2.png');
console.log('Size of verify_dark_profiles_v2.png:', buf.length);
// Read PNG width & height from IHDR
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);
console.log('Dimensions:', width, 'x', height);
