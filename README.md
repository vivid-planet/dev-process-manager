# @comet/dev-process-manager

dev-process-manager is a Node.js process manager for local development environments that need multiple processes. It can be easily integrated into existing Node.js projects.

## Installation

```console
$ npm install @comet/dev-process-manager
```

## Usage

Add `dev-pm.config.js` file to the project root.
This file defines all available scripts, which should be started by dev-process-manager.

### dev-pm.config.js

```javascript
module.exports = {
    scripts: [
        {
             name: "api",
             script: "npm run start",
             group: ["foo", "bar"] //optional
        },
        ...
    ],
};

```

## Commands

### Start

Start one or all processes. The script-name argument can also be "all" or a group.

```console
$ npx dev-process-manager start [script-name]
```

### Stop

Stop running processes

```console
$ npx dev-process-manager stop [script-name]
```

### Restart

Restart a previously started processes

```console
$ npx dev-process-manager restart [script-name]
```

### Status

Lists running processes

```console
$ npx dev-process-manager status [script-name]
```

### Logs

Prints logs of either a specific process or all running processes in real time.

```console
$ npx dev-process-manager logs [script-name]
```

### Start Daemon

Starts the dev-pm daemon, usually done automatically by other commands.

```console
$ npx dev-process-manager start-daemon
```

### Shutdown

Stop all running processes and shutdown dev-pm

```console
$ npx dev-process-manager shutdown
```
