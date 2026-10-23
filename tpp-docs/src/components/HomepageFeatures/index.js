import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'The Real Object Model',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Policy Folders, Devices, Applications, and Certificates — explained as
        they actually work in TPP, including why "Application" doesn't mean
        what you think and why there's no "Zone" object on-prem.
      </>
    ),
  },
  {
    title: 'Authentication, Clarified',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        OAuth vs. the deprecated legacy API key, token refresh, and the exact
        headers and endpoints TPP expects.
      </>
    ),
  },
  {
    title: 'Organized Endpoint Reference',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        WebSDK REST endpoints grouped by what they're for, not an alphabetical
        dump of resource names.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
