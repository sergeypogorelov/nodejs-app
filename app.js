import path from 'path';
import events from 'events';

import * as config from './config/config.dev.json';
import * as models from './models';
import { DirWatcher, EVENT_NAME } from './modules/DirWatcher';

const dirWatcher = new DirWatcher();
dirWatcher.watch(path.resolve('./data'));
dirWatcher.getEventEmitter().on(EVENT_NAME, ev => console.log(ev));
