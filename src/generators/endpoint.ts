import uuidv4 from 'uuid/v4';
import {names} from './names';
import {loadDoc} from '../dumper';
import ora from 'ora';

const command = 'endpoint [options]';

const describe = 'generate endpoint data';

const builder = {
    endpoint_count: {
        alias: 'n',
        describe: 'number of endpoint to populate',
        default: 100,
        type: 'number',
    },
    doc_count: {
        alias: 'd',
        describe: 'number of document per endpoint',
        default: 50,
        type: 'number'
    },
};

function handler(argv: any): void {
    const spinner = ora({
        text: 'Generating endpoint data',
    });
    spinner.start();
    generateDocs(argv);
    spinner.succeed()
}

async function generateDocs(argv: any) {
    const endpoints = [...Array(argv.endpoint_count)].map(() => new EndpointDocGenerator());
    const t = new Date().getTime();

    for (let i = 0; i < argv.doc_count; i++) {
        let nt = new Date(t - (i * argv.interval * 1000));
        loadDoc(...endpoints.map(x => x.generate(nt)));
    }
}

const Windows: { name: string, full: string }[] = [
    {
        name: 'windows 10.0',
        full: 'Windows 10'
    },
    {
        name: 'windows 10.0',
        full: 'Windows Server 2016'
    },
    {
        name: 'windows 6.2',
        full: 'Windows Server 2012'
    },
    {
        name: 'windows 6.3',
        full: 'Windows Server 2012R2'
    },
];

const Linux: { name: string, full: string }[] = [];

const Mac: { name: string, full: string }[] = [];

const OS: { name: string, full: string }[] = [
    ...Windows,
    ...Mac,
    ...Linux,
];

const POLICIES: { name: string, id: string }[] = [
    // mapping name and ID as a sperate attribute makes query more complicated
    // perhaps, combine them into a single field such that
    // policy.namd_id = 'Default:C2A9093E-E289-4C0A-AA44-8C32A414FA7A'
    {
        name: 'Default',
        id: '00000000-0000-0000-0000-000000000000'
    },
    {
        name: 'With Eventing',
        id: 'C2A9093E-E289-4C0A-AA44-8C32A414FA7A'
    },
];

function randomN(n: number): number {
    return Math.floor((Math.random() * n))
}

function* randomNGenerator(max: number, count: number) {
    while (count > 0) {
        yield randomN(max);
        count--;
    }
}

function randomMac(): string {
    return [...randomNGenerator(255, 6)].map(x => x.toString(16)).join('-');
}

function randomIP(): string {
    return [10, ...randomNGenerator(255, 3)].map(x => x.toString()).join('.');
}

function randomChoice<T>(arg: T[]): T {
    return arg[randomN(arg.length)];
}

function randomHostname(): string {
    return `${randomChoice(names)}-${randomN(10)}`;
}

function hostname(name: string, domain: string): string {
    return `${name}.${domain}`;
}

function adName(name: string, domain: string): string {
    const nodes = [`CN=${name}`, ...domain.split('.').map(x => `DC=${x}`)];
    return nodes.join(',');
}


class EndpointDocGenerator {
    machine_id: string;
    name: string;
    domain: string;
    lastDHCPLeaseAt: Date;
    mac_address: string;
    ip: string;

    constructor() {
        this.machine_id = uuidv4();
        this.name = randomHostname();
        this.domain = 'example.com';
        this.lastDHCPLeaseAt = new Date();
        this.ip = randomIP();
        this.mac_address = randomMac();
    }

    generate(ts: Date) {
        if (Math.abs(ts.getTime() - this.lastDHCPLeaseAt.getTime()) > 3600 * 12 * 1000) {
            this.lastDHCPLeaseAt = ts;
            this.ip = randomIP();
        }
        return {
            machine_id: this.machine_id,
            created_at: ts.toISOString(),
            host: {
                name: this.name,
                hostname: hostname(this.name, this.domain),
                ip: this.ip,
                mac_address: this.mac_address,
                os: randomChoice(OS),
            },

            endpoint: {
                domain: this.domain,
                is_base_image: false,
                active_directory_distinguished_name: adName(this.name, this.domain),
                active_directory_hostname: hostname(this.name, this.domain),
                upgrade: {
                    status: null,
                    updated_at: null,
                },
                isolation: {
                    status: false,
                    request_status: null,
                    updated_at: null,
                },
                policy: randomChoice(POLICIES),
                sensor: {
                    persistence: true,
                    status: {},
                },
            },
        };
    }
}

export {command, describe, builder, handler, generateDocs};