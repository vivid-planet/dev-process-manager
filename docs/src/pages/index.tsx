import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Heading from "@theme/Heading";
import Layout from "@theme/Layout";
import clsx from "clsx";
import type { ReactNode } from "react";

import styles from "./index.module.css";

const features = [
    {
        title: "Run every process with one command",
        description: "Start your API, workers, watchers and databases together. No more juggling a dozen terminal tabs during local development.",
    },
    {
        title: "Ordered startup with waitOn",
        description: "Declare dependencies between processes — wait for a build artifact, an open TCP port or a database before a process boots.",
    },
    {
        title: "Groups, aliases & selective control",
        description: "Address processes individually, by alias, or as named @groups. Start, stop, restart and tail logs for exactly the set you need.",
    },
    {
        title: "Automatic crash recovery",
        description: "Crashed processes restart automatically with exponential backoff, so a flaky service never takes down your whole dev environment.",
    },
    {
        title: "Config as code",
        description: "A single typed dev-pm.config.ts describes your whole stack. Supports ts, mts, cts, js, mjs, cjs and json.",
    },
    {
        title: "Drops into any Node.js project",
        description: "Install one dev dependency, add a config file, alias dpm and you are done. No global daemon to manage by hand.",
    },
];

function Feature({ title, description }: { title: string; description: string }) {
    return (
        <div className={clsx("col col--4")}>
            <div className={styles.feature}>
                <Heading as="h3">{title}</Heading>
                <p>{description}</p>
            </div>
        </div>
    );
}

function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <header className={clsx("hero hero--dpm")}>
            <div className="container">
                <Heading as="h1" className="hero__title">
                    {siteConfig.title}
                </Heading>
                <p className="hero__subtitle">{siteConfig.tagline}</p>
                <div className={styles.buttons}>
                    <Link className="button button--accent button--lg" to="/docs/getting-started">
                        Get Started
                    </Link>
                    <Link className="button button--outline button--lg" to="/docs/use-cases">
                        See Use Cases
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default function Home(): ReactNode {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout title={siteConfig.title} description={siteConfig.tagline as string}>
            <HomepageHeader />
            <main>
                <section className={styles.features}>
                    <div className="container">
                        <div className="row">
                            {features.map((props) => (
                                <Feature key={props.title} {...props} />
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </Layout>
    );
}
