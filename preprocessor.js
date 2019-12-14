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
    let fuzzy = connection.database("fuzzy_words");

    db.exists((exists) => {
        if (!exists) {
            db.create((err) => { if (err) throw err; })
        }
    });
    fuzzy.exists((exists) => {
        if (!exists) {
            fuzzy.create((err) => { if (err) throw err; })
        }
    });
    
    for await (let filename of getFiles(inputdir)) {
        let file = await areadfile(filename);
        //preprocess every word
        for (let word in files.split(' ')) {
            // create a db entry for every word
            db.get(word, (err, obj) => {
                if (!err) {
                    // Create a new entry if the key doesn't exist yet
                    db.post({id: word, filenames: [filename]}, (err, id) => {
                        if (err) console.error(err);
                    });
                } else {
                   // Append the old entry if the key already exists
                   db.push({id: word, filenames: [...obj.filenames, filename]}, (err, id) => {
                        if (err) console.error(err);
                   });
                }
            });

            var fuzzy_key = '';
            for (let letter in word.split('')) {
                // create a fuzzy entry for every partial word
                fuzzy_key += letter;
                fuzzy.get(letter, (err, obj) => {
                    if (!err) {
                        // Create a new entry if the key doesn't exist yet
                        fuzzy.post({id: fuzzy_key, words: [word]}, (err, id) => {
                            if (err) console.error(err);
                        });
                    } else {
                       // Append the old entry if the key already exists
                       fuzzy.push({id: fuzzy_key, filenames: [...obj.words, words]}, (err, id) => {
                            if (err) console.error(err);
                       });
                    }
                });
            }


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
