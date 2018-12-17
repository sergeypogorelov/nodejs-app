import fs from 'fs';
import csvParse from 'csv-parse/lib/sync';

const ENCODING = 'utf8';

const csvParseOptions = {
    columns: true,
    skip_empty_lines: true
};

export class Importer {

    /**
     * 
     * @param {string} path the path of csv file
     * @returns {Promise}
     */
    import(path) {

        if (!path)
            throw new Error('Path is not specified.');

        return new Promise((resolve, reject) => {
            fs.readFile(path, ENCODING, (err, content) => {
                if (err) {
                    reject(err);
                }
                resolve(csvParse(content, csvParseOptions));
            });
        });

    }

    /**
     * 
     * @param {string} path the path of csv file
     * @returns {any}
     */
    importSync(path) {

        if (!path)
            throw new Error('Path is not specified.');

        let content = fs.readFileSync(path, ENCODING);
        return csvParse(content, csvParseOptions);

    }

}
