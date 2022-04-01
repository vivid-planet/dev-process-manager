# @comet/dev-process-manager

## Installation

```console
$ npm install
$ npm run build
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

Update dev script in package.json

### package.json

```json
  ...
  "start": "node <path-to-dev-process-manager>/lib/index.js start dev-pm.config.js",
  ...
```

## Commands

### Start
Either use the package.json script and run `npm run start`
or start with:
```console
$ node <path-to-dev-process-manager>/lib/index.js start <path-to-dev-pm.config.js>
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
