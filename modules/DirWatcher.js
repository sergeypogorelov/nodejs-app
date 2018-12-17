import fs from 'fs';
import events from 'events';
import * as pathHelper from 'path';

export const EVENT_NAME = 'dirwatcher:changed';
export const EVENT_ERROR_NAME = 'dirwatcher:error';

export const TYPE_CHANGED = 'changed';
export const TYPE_ADDED = 'added';
export const TYPE_REMOVED = 'removed';

export class DirWatcher {

    constructor() {
        this._eventEmitter = new events.EventEmitter();
    }

    getEventEmitter() {
        return this._eventEmitter;
    }

    /**
     * @param {string} path the path to watch
     * @param {number} delay updates delay
     */
    watch(path, delay = 5000) {

        if (!path)
            throw new Error('Path is not specified.');

        if (!delay)
            throw new Error('Delay is not specified.')

        if (this._intervalId) {
            clearInterval(this._intervalId);
        }

        this._intervalId = setInterval(() => {

            try {
                this._update(path);
            } catch (error) {
                this._eventEmitter.emit(EVENT_ERROR_NAME, error);
            }

        }, delay);
        
    }

    _intervalId;
    _eventEmitter;

    _filesTimestamps = {};

    _update(path) {

        fs.readdir(path, (err, filenames) => {

            if (err)
                throw err;

            let pathes = filenames.map(filename => pathHelper.resolve(path, filename));
            pathes.forEach(newPath => {

                fs.stat(newPath, (err, stats) => {

                    if (err)
                        throw err;

                    let mTime = this._filesTimestamps[newPath];
                    if (mTime) {
                        if (mTime < stats.mtimeMs) {
                            this._filesTimestamps[newPath] = stats.mtimeMs;
                            this._eventEmitter.emit(EVENT_NAME, { type: TYPE_CHANGED, path: newPath });
                        }
                    } else {
                        this._filesTimestamps[newPath] = stats.mtimeMs;
                        this._eventEmitter.emit(EVENT_NAME, { type: TYPE_ADDED, path: newPath });
                    }

                });

            });

            for (let filePath in this._filesTimestamps) {
                if (pathes.indexOf(filePath) === -1) {
                    delete this._filesTimestamps[filePath];
                    this._eventEmitter.emit(EVENT_NAME, { type: TYPE_REMOVED, path: newPath });
                }
            }

        });

    }

}
