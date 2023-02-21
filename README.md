# @comet/dev-process-manager

dev-process-manager is a Node.js process manager for local development environments that need multiple processes. It can be easily integrated into existing Node.js projects.

## Installation

```console
$ npm install @comet/dev-process-manager
```

Recommended Alias:
```console
alias dpm="npm exec dev-pm"
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
$ npx dev-pm start [options] [script-name or @group]
```

Options:
`--follow` Follow logs after starting script (script will not be stopped when stopping this process)

### Stop

Stop running processes

```console
$ npx dev-pm stop [script-name or @group]
```

### Restart

Restart a previously started processes

```console
$ npx dev-pm restart [options] [script-name or @group]
```

Options:
`--follow` Follow logs after starting script (script will not be stopped when stopping this process)

### Status

Lists running processes

```console
$ npx dev-pm status [options] [script-name or @group]
```

Options:
`--interval [seconds]` Keep status open and refresh periodically at specified interval

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
