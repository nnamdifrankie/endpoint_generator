import yaml from 'js-yaml';
import fs from 'fs';


interface Config {
    esConfig: {
        node?: string
        auth?: {
            username: string
            password: string
        }
        ssl?: {
            rejectUnauthorized: boolean
        }
    }

    index: string
    indexTemplatePath: string
}

function loadConfig(configFile: string): Config {
    return yaml.safeLoad(fs.readFileSync(configFile).toString());
}

export { loadConfig, Config }