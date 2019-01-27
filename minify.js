/* eslint-disable */
const uglify = require('uglify-es');
const path = require('path');
const fs = require('fs');
const file = process.argv[2];
const exportFile = () => {
    const origin = fs.readFileSync(file, 'utf8');
    const {code} = uglify.minify(origin);
    const parsed = path.parse(file);

    fs.writeFileSync(`${parsed.dir}/${parsed.name}.min.js`, `javascript:${encodeURIComponent(code)}`, 'utf8');
    console.log('Done');
};

if (!file) {
    throw new Error('Require arguments.');
}

exportFile();
