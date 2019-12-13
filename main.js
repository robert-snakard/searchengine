const fs = require('fs');
const path = require("path");
const util = require('util');

const astat = util.promisify(fs.stat);
const areaddir = util.promisify(fs.readdir);
const areadfile = util.promisify(fs.readFile);

const INPUTDIR = "maildir/";

async function search(searchterm) {
    for await (let filename of getFiles(INPUTDIR)) {
        let file = await areadfile(filename);
        if (file.includes(searchterm)) {
            console.log("Found " + searchterm + " in " + filename);
        }
    }
}

async function * getFiles(dir) {
    let files = await areaddir(dir);
    for (let i = 0; i < files.length; i++) {
        let curPath = path.join(dir, files[i]);
        let stats = await astat(curPath);
        if (stats.isDirectory()) {
            yield * getFiles(curPath);
        } else {
            yield curPath;
        }
    }
}

search("hello");
