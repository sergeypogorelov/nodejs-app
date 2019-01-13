const os = require('os');
const fs = require('fs');
const path = require('path');
const csvParse = require('csv-parse');
const through2 = require('through2');

const ACTION_KEY = '--action';
const ACTION_SHORT_KEY = '-a';

const FILE_KEY = '--file';
const FILE_SHORT_KEY = '-f';

const PATH_KEY = '--path';
const PATH_SHORT_KEY = '-p';

const HELP_KEY = '--help';
const HELP_SHORT_KEY = '-h';

const OPTIONS_DICTIONARY = {
    action: [ACTION_KEY, ACTION_SHORT_KEY],
    file: [FILE_KEY, FILE_SHORT_KEY],
    path: [PATH_KEY, PATH_SHORT_KEY],
    help: [HELP_KEY, HELP_SHORT_KEY]
};

const ACTION_REVERSE_KEY = 'reverse';
const ACTION_TRANSFORM_KEY = 'transform';
const ACTION_OUTPUT_FILE_KEY = 'outputFile';
const ACTION_CONVERT_FROM_FILE_KEY = 'convertFromFile';
const ACTION_CONVERT_TO_FILE_KEY = 'convertToFile';
const ACTION_CSS_BUNDLER = 'cssBundler';

const ACTIONS = { };
ACTIONS[ACTION_REVERSE_KEY] = reverse;
ACTIONS[ACTION_TRANSFORM_KEY] = transform;
ACTIONS[ACTION_OUTPUT_FILE_KEY] = outputFile;
ACTIONS[ACTION_CONVERT_FROM_FILE_KEY] = convertFromFile;
ACTIONS[ACTION_CONVERT_TO_FILE_KEY] = convertToFile;
ACTIONS[ACTION_CSS_BUNDLER] = cssBundler;

const BUNDLE_FILENAME = 'bundle.css';
const BUNDLE_END_FILENAME = '../styles/common/end.css';

///// MAIN START

let appParams = getAppParams();
if (appParams.helpIsFirstOption) {
    console.log(genHelpMsg());
} else if (appParams.noOptionsPassed) {
    console.log(genMsgIfNoOptionsPassed());
    console.log(genHelpMsg());
} else {
    let actionName = appParams.options.action;
    if (actionName) {
        if (ACTIONS[actionName]) {
            ACTIONS[actionName](appParams, error => console.error(error.message));
        } else {
            console.error(genMsgIfActionIsNotRecognised(actionName));
            console.log(genMsgAboutSupportedActions());
        }
    } else {
        console.error(genMsgIfActionIsNotSpecified());
    }
}

///// MAIN END

function reverse(appParams) {
    process.stdin
        .pipe(through2(function (chunk, enc, callback) {
            let str = chunk.toString();
            let newStr = '';
            if (str.length) {
                for (let i = str.length - 1; i >= 0; i--) {
                    newStr += str[i];
                }
            }
            this.push(newStr);
            callback();
        }))
        .pipe(process.stdout);
}

function transform(appParams) {
    process.stdin
        .pipe(through2(function (chunk, enc, callback) {
            this.push(chunk.toString().toUpperCase());
            callback();
        }))
        .pipe(process.stdout);
}

function outputFile(appParams, errorCallback) {
    let fileName = appParams.options.file;
    if (fileName) {
        let fullName = path.resolve(fileName);
        fs.access(fullName, fs.F_OK & fs.R_OK, err => {
            if (err) {
                errorCallback(new Error(genMsgIfFileIsNotAccessible(fullName)));
                return;
            }
            let readableStream = fs.createReadStream(fullName);
            readableStream.pipe(process.stdout);
        });
    } else {
        errorCallback(new Error(genMsgIfFileIsNotSpecified()));
    }
}

function convertFromFile(appParams, errorCallback) {
    let fileName = appParams.options.file;
    if (fileName) {
        let fullName = path.resolve(fileName);
        fs.access(fullName, fs.F_OK & fs.R_OK, err => {
            if (err) {
                errorCallback(new Error(genMsgIfFileIsNotAccessible(fullName)));
                return;
            }
            let readableStream = fs.createReadStream(fullName);
            getJsonFromReadableStream(readableStream)
                .then(data => {
                    process.stdout.write(JSON.stringify(data));
                })
                .catch(error => {
                    throw error;
                });
        });
    } else {
        errorCallback(new Error(genMsgIfFileIsNotSpecified()));
    }
}

function convertToFile(appParams, errorCallback) {
    let fileName = appParams.options.file;
    if (fileName) {
        let fullName = path.resolve(fileName);
        fs.access(fullName, fs.F_OK & fs.R_OK, err => {
            if (err) {
                errorCallback(new Error(genMsgIfFileIsNotAccessible(fullName)));
                return;
            }
            let readableStream = fs.createReadStream(fullName);
            getJsonFromReadableStream(readableStream)
                .then(data => {
                    let newFileName = path.basename(fullName, path.extname(fullName)) + '.json';
                    let newFullName = path.resolve(path.dirname(fullName), newFileName);
                    let writableStream = fs.createWriteStream(newFullName);
                    writableStream.write(JSON.stringify(data));
                })
                .catch(error => {
                    errorCallback(error);
                });
        });
    } else {
        errorCallback(new Error(genMsgIfFileIsNotSpecified()));
    }
}

function cssBundler(appParams, errorCallback) {
    let specifiedPath = appParams.options.path;
    if (specifiedPath) {
        let fullPath = path.resolve(specifiedPath);
        fs.readdir(fullPath, (err, filenames) => {
            if (err) {
                errorCallback(err);
                return;
            }
            filenames = filenames.filter(filename => {
                let newFullName = path.resolve(fullPath, filename);
                return path.extname(newFullName) === '.css' && filename !== BUNDLE_FILENAME;
            });
            let bundleFullName = path.resolve(fullPath, BUNDLE_FILENAME);
            let writer = new fs.createWriteStream(bundleFullName);
            if (writer.writable) {
                for (let i = 0; i < filenames.length; i++) {
                    let filename = filenames[i];
                    let fileFullName = path.resolve(fullPath, filename);
                    let reader = fs.createReadStream(fileFullName);
                    if (reader.readable) {
                        reader.pipe(writer);
                    } else {
                        errorCallback(new Error(genMsgIfFileIsNotAccessible(fileFullName)));
                        return;
                    }
                }
                let endFullName = path.resolve(BUNDLE_END_FILENAME);
                let reader = fs.createReadStream(endFullName);
                if (reader.readable) {
                    reader.pipe(writer);
                } else {
                    errorCallback(new Error(genMsgIfFileIsNotAccessible(endFullName)));
                }
            } else {
                errorCallback(new Error(genMsgIfFileIsNotAccessible(bundleFullName)));
            }

        });
    } else {
        errorCallback(new Error(genMsgIfPathIsNotSpecified()));
    }
}

/////

function getAppParams() {

    let helpIsFirstOption = null;
    let optionsAsArray = [];

    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; i++) {
        let currentItem = args[i];
        if (currentItem.startsWith('--')) {
            optionsAsArray.push(mapParsedOption(parseOption(currentItem)));
        } else if (currentItem.startsWith('-')) {
            let nextItem = args[i + 1];
            optionsAsArray.push(mapParsedOption(parseShortOption(currentItem, nextItem)));
            i++;
        }
    }

    optionsAsArray = optionsAsArray.filter(i => i);

    let noOptionsPassed = !optionsAsArray.length;
    if (!noOptionsPassed) {
        helpIsFirstOption = optionsAsArray[0].key === 'help';
    }

    let options = {};
    optionsAsArray.forEach(i => options[i.key] = i.value);

    return {
        options: options,
        noOptionsPassed: noOptionsPassed,
        helpIsFirstOption: helpIsFirstOption
    };
}

function getJsonFromReadableStream(readableStream) {
    return new Promise((resolve, reject) => {

        try {

            let properties = null;
            let data = [];

            let parser = csvParse({
                delimiter: ','
            });

            parser.on('data', chunk => {
                if (properties) {
                    let obj = {};
                    for (let i = 0; i < properties.length; i++) {
                        obj[properties[i]] = chunk[i];
                    }
                    data.push(obj);
                } else {
                    properties = chunk;
                }
            });

            parser.on('finish', () => {
                resolve(data);
            });

            readableStream.pipe(parser);

        } catch(e) {
            reject(e);
        }

    });
}

function mapParsedOption(parsedOption) {
    if (typeof parsedOption === 'object') {
        for (let key in OPTIONS_DICTIONARY) {
            if (OPTIONS_DICTIONARY[key].indexOf(parsedOption.key) !== -1) {
                parsedOption.key = key;
                break;
            }
        }
    }
    return parsedOption;
}

function parseOption(optionStr) {
    let result = null;
    if (typeof optionStr === 'string') {
        let str = optionStr.trim();
        if (str.length) {
            let splits = optionStr.split('=');
            let key = splits[0];
            let value = splits.length > 1 ? splits[1] : null;
            result = {
                key: key,
                value: value
            };
        }
    }
    return result;
}

function parseShortOption(key, value) {
    if (!key)
        return null;

    return {
        key: key,
        value: typeof value !== 'undefined' ? value : null
    };
}

function genHelpMsg() {
    return [
        'The following commands are supported:',
        [OPTIONS_DICTIONARY.action.join(', '), 'Action to do.'].join(' - '),
        [OPTIONS_DICTIONARY.file.join(', '), 'File to work with (optional).'].join(' - '),
        [OPTIONS_DICTIONARY.path.join(', '), 'Path to work with.'].join(' - '),
        [OPTIONS_DICTIONARY.help.join(', '), 'Review of the module.'].join(' - ')
    ].join(os.EOL);
}

function genMsgAboutSupportedActions() {
    return [
        'The following actions are supported:',
        [ACTION_REVERSE_KEY, 'Reverse string data from process.stdin to process.stdout.'].join(' - '),
        [ACTION_TRANSFORM_KEY, 'Convert data from process.stdin to upper-cased data on process.stdout.'].join(' - '),
        [ACTION_OUTPUT_FILE_KEY, 'Pipe the specified file to process.stdout.'].join(' - '),
        [ACTION_CONVERT_FROM_FILE_KEY, 'Convert the specified file from .csv to .json and print.'].join(' - '),
        [ACTION_CONVERT_TO_FILE_KEY, 'Convert the specified file from .csv to .json and save as .json.'].join(' - '),
        [ACTION_CSS_BUNDLER, 'Bundle all .css files from the specified path.'].join(' - ')
    ].join(os.EOL);
}

function genMsgIfNoOptionsPassed() {
    return 'No supported options passed.';
}

function genMsgIfActionIsNotSpecified() {
    return 'Action is not specified.';
}

function genMsgIfActionIsNotRecognised(actionName) {
    if (!actionName)
        throw new Error('Action name is not specified.');
    return 'Action \'' + actionName + '\' is not recognised.';
}

function genMsgIfFileIsNotSpecified() {
    return 'File is not specified.';
}

function genMsgIfPathIsNotSpecified() {
    return 'Path is not specified.';
}

function genMsgIfFileIsNotAccessible(fullName) {
    return 'File \'' + fullName + '\' is not accessible.';
}
