import ora from "ora";

interface Notifier {
    start(): void;

    warn(): void;

    fail(): void;

    succeed(): void;
}

class SpinnerNotifier implements Notifier {
    esSpinner = ora({
        text: 'Loading data into Elasticsearch',
        spinner: 'bouncingBall',
    });


    fail(): void {
        this.esSpinner.fail()
    }

    start(): void {
        this.esSpinner.start()
    }

    succeed(): void {
        this.esSpinner.succeed()
    }

    warn(): void {
        this.esSpinner.warn()
    }
}


export {Notifier, SpinnerNotifier}