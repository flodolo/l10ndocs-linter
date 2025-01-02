import fs from 'fs';
import * as glob from 'glob';
import { lint as lintSync } from "markdownlint/sync";
import path from 'path';
import minimist from 'minimist';

// Default paths and configs
const argv = minimist(process.argv.slice(2));

const default_config = path.join(path.dirname(new URL(import.meta.url).pathname), 'markdownlint.json');
var config_file = 'config' in argv
    ? path.resolve(argv['config'])
    : default_config;
if (!fs.existsSync(config_file)) {
    console.log('Config file doesn\'t exist. Falling back to default.');
    config_file = default_config;
}
console.log('Using config file: ' + config_file);

const search_path = 'path' in argv
    ? path.resolve(argv['path'])
    : process.cwd();
console.log('Searching path: ' + search_path)

// Get all .md files
const filelist = glob.sync(
    path.join(search_path, '**/*.md'),
    {
        'ignore': [
            '**/node_modules/**',
        ],
        'nodir': true
    });

// Run linter
const options = {
    'files': filelist,
    'config': await import(config_file, { assert: { type: "json" } })
};
const results = lintSync(options);
console.log(results.toString(true));

if (results.toString(true)) {
    process.exit(1);
} else {
    console.log('There are no linter errors.');
}
