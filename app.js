import path from 'path';

import { Importer } from './modules/Importer';
import { DirWatcher, EVENT_NAME, EVENT_ERROR_NAME, TYPE_ADDED, TYPE_CHANGED, TYPE_REMOVED } from './modules/DirWatcher';

import * as config from './config/config.dev.json';
//import * as models from './models';

const allData = {};

const importer = new Importer();
const dirWatcher = new DirWatcher();

dirWatcher.watch(path.resolve(config.pathToWatch));

dirWatcher.getEventEmitter().on(EVENT_NAME, ev => {

    if (ev.type === TYPE_ADDED || ev.type === TYPE_CHANGED) {

        importer.import(ev.path)
            .then(data => {
                allData[ev.path] = data
                showAllData();
            })
            .catch(error => console.error(error));

    } else if (ev.type === TYPE_REMOVED) {
        delete allData[ev.path];
        showAllData();
    }

});

dirWatcher.getEventEmitter().on(EVENT_ERROR_NAME, error => console.error(error));

/////

function showAllData() {
    console.log('----- BEGIN -----');
    console.log(allData);
    console.log('----- END -----');
}
