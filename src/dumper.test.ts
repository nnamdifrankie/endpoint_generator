import {docBuffer, ESOut, Stdout} from './dumper'
import {generateDocs} from "./generators/endpoint";
import {loadConfig} from "./config";
import {Notifier} from "./notifier";

beforeEach(() => {
    while (docBuffer.length > 0) {
        docBuffer.pop();
    }
});

test('test StdOut dumper', async () => {
    const dumper = new Stdout();
    await generateDocs({endpoint_count: 3, interval: 3600, doc_count: 2});
    await dumper.dump(docBuffer);
    expect(true).toBeTruthy();
});

test('test EsOut dumper', async () => {
    const config = loadConfig('./config.yaml');
    const notify: Notifier = {
        fail: jest.fn(),
        succeed: jest.fn(),
        warn: jest.fn(),
        start: jest.fn()
    };
    const dumper = new ESOut(config, notify);
    await generateDocs({endpoint_count: 3, interval: 3600, doc_count: 3});
    await dumper.dump(docBuffer);
    expect(notify.start).toBeCalledTimes(1);
    expect(notify.succeed).toBeCalledTimes(1)
});