
# Usage

```
# Modify config.yaml file to meet your need.
node bin/doc_gen endpoint
```

# Options

```
bin/doc_gen endpoint -h
doc_gen endpoint [options]

generate endpoint data

Options:
  --version             Show version number                            [boolean]
  --config, -c          config path          [string] [default: "./config.yaml"]
  --interval, -i        timestamp interval between each document for an endpoint
                                                        [number] [default: 3600]
  --test, -t            show output in terminal instead loading them into
                        elasticsearch                 [boolean] [default: false]
  -h, --help            Show help                                      [boolean]
  --endpoint_count, -n  number of endpoint to populate   [number] [default: 100]
  --doc_count, -d       number of document per endpoint   [number] [default: 50]
```

# Test
With your elastic search running, executing the test will load documents into your server. 

```npm test```