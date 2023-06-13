import { awscdk } from 'projen'
import { NodePackageManager, ProseWrap } from 'projen/lib/javascript'

const awsSdkVersion = '^3.0.0'

const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Tapio Rautonen',
  authorAddress: 'trautonen@users.noreply.github.com',
  cdkVersion: '2.83.1',
  name: 'cdk-dns-validated-certificate',
  description: 'CDK certificate construct that supports cross-region and cross-account DNS validation',
  keywords: ['aws', 'cdk', 'dns', 'certificate', 'cross-region', 'cross-account'],
  license: 'Apache-2.0',

  repositoryUrl: 'https://github.com/trautonen/cdk-dns-validated-certificate.git',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.0.0',
  projenrcTs: true,

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

  devDeps: [
    `@aws-sdk/client-acm@${awsSdkVersion}`,
    `@aws-sdk/client-route-53@${awsSdkVersion}`,
    `@aws-sdk/client-sts@${awsSdkVersion}`,
    `@aws-sdk/types@${awsSdkVersion}`,
    'aws-lambda',
    '@types/aws-lambda',
  ],
})

project.eslint?.addRules({
  'import/no-extraneous-dependencies': ['error', { devDependencies: ['src/lambda/**/*.ts'] }],
})

project.synth()
