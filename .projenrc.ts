import { awscdk } from 'projen'
import { LambdaRuntime } from 'projen/lib/awscdk'
import { NodePackageManager, NpmAccess, ProseWrap, UpgradeDependenciesSchedule } from 'projen/lib/javascript'

const awsSdkVersion = '^3.0.0'

const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Tapio Rautonen',
  authorAddress: 'trautonen@users.noreply.github.com',
  cdkVersion: '2.83.1',
  name: 'cdk-dns-validated-certificate',
  packageName: '@trautonen/cdk-dns-validated-certificate',
  description: 'CDK certificate construct that supports cross-region and cross-account DNS validation',
  keywords: ['aws', 'cdk', 'dns', 'certificate', 'cross-region', 'cross-account'],
  license: 'Apache-2.0',

  repositoryUrl: 'https://github.com/trautonen/cdk-dns-validated-certificate.git',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.0.0',
  projenrcTs: true,
  releaseToNpm: true,
  npmAccess: NpmAccess.PUBLIC,

  lambdaOptions: {
    runtime: LambdaRuntime.NODEJS_18_X,
    bundlingOptions: {
      externals: ['@aws-sdk/*'],
      sourcemap: true,
    },
  },

  packageManager: NodePackageManager.NPM,
  prettier: true,
  prettierOptions: {
    settings: {
      printWidth: 120,
      semi: false,
      singleQuote: true,
      proseWrap: ProseWrap.ALWAYS,
    },
  },

  depsUpgradeOptions: {
    workflowOptions: {
      labels: ['auto-approve'],
      schedule: UpgradeDependenciesSchedule.WEEKLY,
    },
  },

  githubOptions: {
    mergify: true,
    mergifyOptions: {
      rules: [
        {
          name: 'auto-approve',
          conditions: [
            {
              and: [
                'base=main',
                'label=auto-approve',
                '#approved-reviews-by>=1',
                'check-success=build',
                'check-success=package-js',
              ],
            },
          ],
          actions: {
            queue: {
              name: 'default',
            },
          },
        },
      ],
      queues: [
        {
          name: 'default',
          mergeMethod: 'fast-forward',
          updateMethod: 'rebase',
          conditions: [
            {
              and: ['#approved-reviews-by>=1', 'check-success=build', 'check-success=package-js'],
            },
          ],
        },
      ],
    },
  },

  autoMerge: false,
  autoApproveUpgrades: true,

  autoApproveOptions: {
    allowedUsernames: ['github-actions[bot]', 'trautonen'],
    label: 'auto-approve',
    secret: 'GITHUB_TOKEN',
  },

  devDeps: [
    `@aws-sdk/client-acm@${awsSdkVersion}`,
    `@aws-sdk/client-route-53@${awsSdkVersion}`,
    `@aws-sdk/client-sts@${awsSdkVersion}`,
    `@aws-sdk/types@${awsSdkVersion}`,
    '@types/aws-lambda',
    'aws-lambda',
    'esbuild',
  ],
})

project.eslint?.addRules({
  'import/no-extraneous-dependencies': ['error', { devDependencies: ['src/**/*.lambda.ts'] }],
})

project.synth()
