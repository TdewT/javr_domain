import {URL, pathToFileURL} from 'url';
import path from 'path';

const baseURL = pathToFileURL(process.cwd() + '/').href;

// Define your aliases here
const aliases = {
    '@': '.',
    '@utils': './src/utils',
    '@lib': './src/lib',
    '@components': './app/components'
};

// noinspection JSUnusedGlobalSymbols
export function resolve(specifier, context, defaultResolve) {
    let url;

    for (const alias in aliases) {
        if (specifier.startsWith(alias)) {
            const newSpecifier =  specifier.replace(alias, aliases[alias]);
            url = pathToFileURL(newSpecifier).href;
        }
    }

    if (url){
        return {
            url,
            shortCircuit: true,
        };
    }

    return defaultResolve(specifier, context, defaultResolve);
}
