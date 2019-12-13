const nosqlite = require("nosqlite");

const INPUTDIR = "maildir/";

async function search(searchterm) {
    //Open the database, we can return if it doesn't exist
    let connection = new (nosqlite.Connection)(DATABASE);
    let db = connection.database("words_to_files");
    db.exists((exists) => {
        if (!exists) {
            return undefined;
        }
    });

    return db.get(searchterm, (err, obj) => {
        if (!err) {
            return filenames
        } else {
            return undefined;
        }
    });
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
