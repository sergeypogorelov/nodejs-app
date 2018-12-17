import fs from 'fs';
import * as pathHelper from 'path';

let intervalId;
let filesTimestamps = {};
///mtimeMs:
export class DirWatcher {

    /**
     * @param {string} path the path to watch
     * @param {number} delay updates delay
     */
    watch(path, delay = 5000) {

        if (!path)
            throw new Error('Path is not specified.');

        if (!delay)
            throw new Error('Delay is not specified.')

        if (intervalId) {
            clearInterval(intervalId);
        }

        intervalId = setInterval(() => {

            fs.readdir(path, (err, filenames) => {

                if (err)
                    throw err;

                let pathes = filenames.map(filename => pathHelper.resolve(path, filename));
                pathes.forEach(newPath => {

                    fs.stat(newPath, (err, stats) => {

                        if (err)
                            throw err;

                        let mTime = filesTimestamps[newPath];
                        if (mTime) {
                            if (mTime < stats.mtimeMs) {
                                filesTimestamps[newPath] = stats.mtimeMs;
                                console.log('Changed', newPath, mTime);
                            }
                        } else {
                            filesTimestamps[newPath] = stats.mtimeMs;
                            console.log('Added', newPath, stats.mtimeMs);
                        }

                    });

                });

                for (let filePath in filesTimestamps) {
                    if (pathes.indexOf(filePath) === -1) {
                        delete filesTimestamps[filePath];
                        console.log('Removed', filePath);
                    }
                }

            });

        }, delay);

        
    }

}
