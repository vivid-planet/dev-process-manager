# @comet/dev-process-manager

dev-process-manager is a Node.js process manager for local development environments that need multiple processes. It can be easily integrated into existing Node.js projects.

## Installation

```console
$ npm install @comet/dev-process-manager
```

## Usage

Add `dev-pm.config.js` file to the project root.
This file defines all available apps, which should be started by dev-process-manager.

### dev-pm.config.js

```javascript
module.exports = {
    apps: [
        {
             name: "api",
             script: "npm run start",
        },
        ...
    ],
};

```

## Commands

### Start
Either use the package.json script and run `npm run start`
or start with:
```console
$ npx dev-process-manager start [path-to-dev-pm.config.js]
```

The path to the config file can be specified in an optional parameter. "dev-pm.config.js" in the root directory is used by default.

### Stop

Stop all running apps
```console
$ npx dev-process-manager stop
```

### Restart

Restart a previously started apps

```console
$ npx dev-process-manager restart <app-name>
```


### Status
Lists running apps

```console
$ npx dev-process-manager status
```

### Logs
Prints logs of either a specific app or all running apps in real time.

```console
$ npx dev-process-manager logs [app-name]
```
