# @comet/dev-process-manager

## Installation

```console
$ npm install
$ npm run build
```

## Usage

Add `pm.config.js` file to the project root.
This file defines all available apps, which should be started by dev-process-manager.

### pm.config.js

```javascript
module.exports = {
    apps: [
        {
             name: "api",
             script: "npm --prefix api install && dotenv -- wait-on -l tcp:$POSTGRESQL_PORT && npm run --prefix api fixtures:dev && npm --prefix api run start:dev",
        },
        ...
    ],
};

```

Update dev script in package.json

### package.json

```json
  ...
  "dev": "dotenv -- node <path-to-dev-process-manager>/lib/index.js start pm.config.js",
  ...
```

## Commands

### Start
Either use the package.json script and run `npm run dev`
or start with:
```console
$ node <path-to-dev-process-manager>/lib/index.js start <path-to-pm.config.js>
```

### Shutdown

Shutdown all running apps
```console
$ node <path-to-dev-process-manager>/lib/index.js shutdown
```

### Restart

Restart a previously started apps

```console
$ node <path-to-dev-process-manager>/lib/index.js restart <app-name>
```


### Status
Lists running apps

```console
$ node <path-to-dev-process-manager>/lib/index.js status
```

### Logs
Prints logs of either a specific app or all running apps in real time.

```console
$ node <path-to-dev-process-manager>/lib/index.js logs [app-name]
```
