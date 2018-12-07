import * as config from './config/config.dev.json';
import * as models from './models';

console.log(config.name);
new models.Product();
new models.User();
