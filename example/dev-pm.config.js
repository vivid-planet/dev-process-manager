module.exports = {
    scripts: [
        {
            name: "sleep-1",
            script: "bash -c 'while true; do echo sleep-1; sleep 5; touch foo; done'",
            group: "sleep",
        },
        {
            name: "sleep-2",
            script: "bash -c 'while true; do echo sleep-2; sleep 5; done'",
            waitOn: "foo",
            group: "sleep",
        },
    ],
};
