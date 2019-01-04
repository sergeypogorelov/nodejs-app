const fs = require('fs');
const path = require('path');

const ACTION_KEY = '--action';
const ACTION_SHORT_KEY = '-a';

const FILE_KEY = '--file';
const FILE_SHORT_KEY = '-f';

const HELP_KEY = '--help';
const HELP_SHORT_KEY = '-h';

const OPTIONS_DICTIONARY = {
    action: [ACTION_KEY, ACTION_SHORT_KEY],
    file: [FILE_KEY, FILE_SHORT_KEY],
    help: [HELP_KEY, HELP_SHORT_KEY]
};

const ACTION_REVERSE_KEY = 'reverse';
const ACTION_TRANSFORM_KEY = 'transform';
const ACTION_OUTPUT_FILE_KEY = 'outputFile';
const ACTION_CONVERT_FROM_FILE_KEY = 'convertFromFile';
const ACTION_CONVERT_TO_FILE_KEY = 'convertToFile';

const ACTIONS = { };
ACTIONS[ACTION_REVERSE_KEY] = reverse;
ACTIONS[ACTION_TRANSFORM_KEY] = transform;
ACTIONS[ACTION_OUTPUT_FILE_KEY] = outputFile;
ACTIONS[ACTION_CONVERT_FROM_FILE_KEY] = convertFromFile;
ACTIONS[ACTION_CONVERT_TO_FILE_KEY] = convertToFile;

///// MAIN START

let appParams = getAppParams();
if (appParams.helpIsFirstOption || appParams.noOptionsPassed) {
    console.log('help message');
} else {
    let actionName = appParams.options.action;
    if (actionName && ACTIONS[actionName]) {
        try {
            ACTIONS[actionName](appParams);
        } catch (e) {
            console.error(e);
        }
    } else {
        console.error('Action \'' + actionName + '\' is not recognised.');
    }
}

///// MAIN END

function getAppParams() {

    const args = process.argv.slice(2);

    let optionsAsArray = args
        .map(i => parseOption(i))
        .map(i => mapParsedOption(i))
        .filter(i => i);

    let helpIsFirstOption = null;
    let noOptionsPassed = !optionsAsArray.length;
    if (optionsAsArray.length) {
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

function reverse(appParams) {
    throw Error('Not implemented.');
}

function transform(appParams) {
    throw Error('Not implemented.');
}

function outputFile(appParams) {
    if (appParams.options.file) {
        let fileName = appParams.options.file.trim();
        if (fileName) {
            let fullName = path.resolve(fileName);
            let readStream = fs.createReadStream(fullName);
            readStream.pipe(process.stdout);
        }
    }
}

function convertFromFile(appParams) {
    throw Error('Not implemented.');
}

function convertToFile(appParams) {
    throw Error('Not implemented.');
}

/////

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
