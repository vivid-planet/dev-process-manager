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
             group: ["foo", "bar"], //to access a group of scripts in all commands using @groupname
             waitOn: [
                "packages/foo/lib/index.d.ts", //wait until package is built
                "tcp:5432"  //wait until database is started (tcp:$POSTGRESQL_PORT is also supported)
             ]
        },
        ...
    ],
};

```

## Commands

### Start

Start one or all processes. The script-name argument can also be multiple names, "all" or a @group.

```console
$ npx dev-pm start [script-name or @group]
```

### Stop

Stop running processes

```console
$ npx dev-pm stop [script-name or @group]
```

### Restart

Restart a previously started processes

```console
$ npx dev-pm restart [script-name or @group]
```

### Status

Lists running processes

```console
$ npx dev-pm status [options] [script-name or @group]
```

Options:
`--refresh` Keep status open and refresh periodically

### Logs

Prints logs of either a specific process or all running processes in real time.

```console
$ npx dev-pm logs [script-name or @group]
```

### Start Daemon

Starts the dev-pm daemon, usually done automatically by other commands.

```console
$ npx dev-pm start-daemon
```

### Shutdown

Stop all running processes and shutdown dev-pm

```console
$ npx dev-pm shutdown
```
