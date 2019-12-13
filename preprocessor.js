const fs = require("fs");
const path = require("path");
const util = require('util');
const nosqlite = require("nosqlite");

const astat = util.promisify(fs.stat);
const areaddir = util.promisify(fs.readdir);
const areadfile = util.promisify(fs.readFile);

const DATABASE = "database/";

async function process(inputdir) {
    //Open the database, create it if it doesn't exist
    let connection = new (nosqlite.Connection)(DATABASE);
    let db = connection.database("words_to_files");
    db.exists((exists) => {
        if (!exists) {
            db.create((err) => { if (err) throw err; })
        }
    });
    
    for await (let filename of getFiles(inputdir)) {
        let file = await areadfile(filename);
        //preprocess every word
        for (let word in files.split(' ')) {
            db.get(word, (err, obj) => {
                if (!err) {
                    // Create a new entry if the key doesn't exist yet
                    db.post({id: word, filenames: [filename]}, (err, id) => {
                        console.log(id);
                    });
                } else {
                   // Append the old entry if the key already exists
                   db.push({id: word, filenames: [...obj.filenames, filename]}, (err, id) => {
                        console.log(id);
                   });
                }
            });
        }
    }
}

async function * getFiles(dir) {
    let files = await areaddir(dir);
    for (let i = 0; i < files.length; i++) {
        let curPath = path.join(dir, files[i]);
        let stats = await astat(curPath);

        if (stats.isDirectory()) {
            // recusive yield if we're a directory
            yield * getFiles(curPath);
        } else {
            // yield the path when we find a file
            yield curPath;
        }
    }
}

process("maildir/");
