import yargs from 'yargs';
import { ESOut, Stdout, docBuffer } from './dumper';
import { loadConfig } from './config';
import {SpinnerNotifier} from "./notifier";

export default async function main() {
    const argv = yargs
        .usage('$0 <command> [options]')
        .options({
            config: {
                alias: 'c',
                describe: 'config path',
                default: './config.yaml',
                type: 'string',
            },
            interval: {
                alias: 'i',
                describe: 'timestamp interval between each document for an endpoint',
                default: 3600,
                type: 'number',
            },
            test: {
                alias: 't',
                describe: 'show output in terminal instead loading them into elasticsearch',
                default: false,
                type: 'boolean',
            },
            h: {
                alias: 'help'
            },
        }).commandDir('./generators')
        .demandCommand()
        .argv;

    const config = loadConfig(argv.config);
    const cli = argv.test ? new Stdout() : new ESOut(config, new SpinnerNotifier());

    try {
        await cli.dump(docBuffer);
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}