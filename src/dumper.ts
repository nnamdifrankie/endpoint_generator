import {Client} from '@elastic/elasticsearch';
import {Config} from './config';
import fs from 'fs';
import {Notifier} from './notifier'

const docBuffer: any[] = [];

function loadDoc<T>(...doc: T[]) {
    docBuffer.push(...doc)
}

class Stdout {
    async dump<T>(docs: Array<T>) {
        for (const doc of docs) {
            console.log(JSON.stringify(doc, null, '  '));
        }
    }
}

class ESOut {
    cli: Client;
    index: string;
    indexSetting: any;
    notifier: Notifier;

    constructor({esConfig: esConfig, index: index, indexTemplatePath: indexTemplatePath}: Config, notifier: Notifier) {
        this.cli = new Client(esConfig);
        this.index = index;
        this.indexSetting = JSON.parse(fs.readFileSync(indexTemplatePath).toString());
        this.notifier = notifier;
    }



    async setupIndex() {
        try {
            await this.cli.indices.delete({index: this.index});
        } catch (e) {
            if (e.statusCode === 404) {
                // ignore 404 as index is already created
            } else {
                throw e;
            }
        }

        try {
            await this.cli.indices.create({index: this.index, body: this.indexSetting})
        } catch (e) {
            if (e.statusCode === 400) {
                // ignore 400 as index is already created
            } else {
                throw e;
            }
        }
        this.cli.search();
        //await this.cli.indices.putSettings({index: this.index, body: this.indexSetting, preserve_existing: false})
    }

    async dump(docs: any[]) {
        const body = docs.map(doc => [{index: {_index: this.index}}, doc])
            .reduce((x, y) => x.concat(y), []);


        this.notifier.start();
        try {
            await this.setupIndex();
            const {body: bulkResponse} = await this.cli.bulk({
                refresh: 'true',
                body,
            });

            if (bulkResponse.errors) {
                this.notifier.warn();
                // The items array has the same order of the dataset we just indexed.
                // The presence of the `error` key indicates that the operation
                // that we did for the document has failed.
                bulkResponse.items.forEach((action: any, i: number) => {
                    const operation = Object.keys(action)[0];
                    if (action[operation].error) {
                        console.warn({
                            // If the status is 429 it means that you can retry the document,
                            // otherwise it's very likely a mapping error, and you should
                            // fix the document before to try it again.
                            status: action[operation].status,
                            error: action[operation].error,
                            operation: body[i * 2],
                            document: body[i * 2 + 1]
                        })
                    }
                });
            }
        } catch (e) {
            this.notifier.fail();
            throw e;
        }
        this.notifier.succeed();
    }
}

export {Stdout, ESOut, loadDoc, docBuffer}