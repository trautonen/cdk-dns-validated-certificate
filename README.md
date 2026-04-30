# @trautonen/cdk-dns-validated-certificate

[![npm version](https://img.shields.io/npm/v/@trautonen/cdk-dns-validated-certificate.svg)](https://www.npmjs.com/package/@trautonen/cdk-dns-validated-certificate)
[![npm downloads](https://img.shields.io/npm/dm/@trautonen/cdk-dns-validated-certificate.svg)](https://www.npmjs.com/package/@trautonen/cdk-dns-validated-certificate)
[![license](https://img.shields.io/npm/l/@trautonen/cdk-dns-validated-certificate.svg)](https://github.com/trautonen/cdk-dns-validated-certificate/blob/main/LICENSE)
[![release](https://github.com/trautonen/cdk-dns-validated-certificate/actions/workflows/release.yml/badge.svg)](https://github.com/trautonen/cdk-dns-validated-certificate/actions/workflows/release.yml)

An AWS CDK construct for creating DNS-validated ACM certificates with **cross-region** and **cross-account** support.

The built-in CDK `Certificate` construct does not support cross-region or cross-account DNS validation. The cross-region references workaround has known issues and still does not cover cross-account use cases. This construct solves both problems by managing the full certificate lifecycle — request, DNS validation, and cleanup — through a Lambda-backed custom resource with direct API calls to ACM and Route 53.

## Features

- **Cross-region certificates** — provision a certificate in `us-east-1` for CloudFront while your stack is in any other region
- **Cross-account validation** — validate against a Route 53 hosted zone in a different AWS account using IAM role assumption, with a built-in construct to create the validation role
- **Multiple hosted zones** — validate a primary domain and alternative names against different hosted zones, each with its own credentials
- **Automatic DNS record management** — creates and cleans up CNAME validation records automatically
- **Certificate Transparency logging** — configurable CT logging
- **Tagging support** — tag your certificates via CDK's standard tagging mechanism
- **Configurable removal policy** — retain certificates on stack deletion if needed

## Installation

```bash
# npm
npm install @trautonen/cdk-dns-validated-certificate

# yarn
yarn add @trautonen/cdk-dns-validated-certificate

# pnpm
pnpm add @trautonen/cdk-dns-validated-certificate

# bun
bun add @trautonen/cdk-dns-validated-certificate
```

### Peer Dependencies

This construct requires the following peer dependencies:

| Package | Version |
|---|---|
| `aws-cdk-lib` | `>= 2.83.1` |
| `constructs` | `>= 10.5.1` |

## Quick Start

```typescript
import { DnsValidatedCertificate } from '@trautonen/cdk-dns-validated-certificate';
import * as route53 from 'aws-cdk-lib/aws-route53';

const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
  domainName: 'example.com',
});

const certificate = new DnsValidatedCertificate(this, 'Certificate', {
  domainName: 'example.com',
  validationHostedZones: [{
    hostedZone,
  }],
});
```

## Usage

### Cross-Region Certificate

A common scenario is provisioning a certificate in `us-east-1` for CloudFront while the CDK stack deploys to another region. Use the `certificateRegion` property to specify where the certificate should be created.

```typescript
import { DnsValidatedCertificate } from '@trautonen/cdk-dns-validated-certificate';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';

const myBucket = new s3.Bucket(this, 'WebsiteBucket');

const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
  domainName: 'example.com',
});

// Create the certificate in us-east-1 regardless of the stack's region
const certificate = new DnsValidatedCertificate(this, 'Certificate', {
  domainName: 'example.com',
  certificateRegion: 'us-east-1',
  validationHostedZones: [{
    hostedZone,
  }],
});

// Use with a CloudFront distribution
const distribution = new cloudfront.Distribution(this, 'Distribution', {
  domainNames: ['example.com'],
  certificate,
  defaultBehavior: {
    origin: new origins.S3Origin(myBucket),
  },
});
```

### Cross-Account Validation

When the Route 53 hosted zone is in a different AWS account, you need two things:

1. An IAM role **in the DNS account** with permissions to modify Route 53 records
2. The `DnsValidatedCertificate` construct **in the certificate account** configured to assume that role

#### Setting Up the Validation Role (DNS Account)

Use `CrossAccountValidationRole` to create the IAM role in the account that owns the Route 53 hosted zone. This construct extends `iam.Role`, so you can customize it further or pass it anywhere an `IRole` is accepted.

```typescript
import { CrossAccountValidationRole } from '@trautonen/cdk-dns-validated-certificate';
import * as route53 from 'aws-cdk-lib/aws-route53';

// In the DNS account stack
const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
  domainName: 'example.com',
});

const validationRole = new CrossAccountValidationRole(this, 'ValidationRole', {
  trustedAccounts: ['222222222222'],        // certificate account(s)
  hostedZones: [hostedZone],
  allowedDomainNames: ['example.com', '*.example.com'],  // recommended
  externalId: 'my-external-id',            // optional
});
```

The role grants:

- `route53:ChangeResourceRecordSets` — scoped to the specified hosted zones, restricted to CNAME records with UPSERT/DELETE actions
- `route53:GetChange` — required to wait for DNS propagation
- When `allowedDomainNames` is set, record names are further restricted to ACM validation patterns (`_*.<domain>`)

#### Requesting the Certificate (Certificate Account)

```typescript
import { DnsValidatedCertificate } from '@trautonen/cdk-dns-validated-certificate';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as iam from 'aws-cdk-lib/aws-iam';

// In the certificate account stack
const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
  hostedZoneId: 'Z0123456789ABCDEFGHIJ',
  zoneName: 'example.com',
});

const validationRole = iam.Role.fromRoleArn(
  this, 'ValidationRole',
  'arn:aws:iam::111111111111:role/DnsValidationRole',
);

const certificate = new DnsValidatedCertificate(this, 'Certificate', {
  domainName: 'example.com',
  validationHostedZones: [{
    hostedZone,
    validationRole,
    validationExternalId: 'my-external-id', // must match the role's external ID
  }],
});
```

#### Full Cross-Account Example

A complete setup with a shared domain used by multiple accounts, including a wildcard certificate for CloudFront:

```typescript
// ── dns-account-stack.ts (Account 111111111111) ──────────────────────
import { CrossAccountValidationRole } from '@trautonen/cdk-dns-validated-certificate';
import * as route53 from 'aws-cdk-lib/aws-route53';

const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
  domainName: 'example.com',
});

// Allow both staging and production accounts to validate certificates
const validationRole = new CrossAccountValidationRole(this, 'CertValidation', {
  roleName: 'CertificateDnsValidationRole',
  trustedAccounts: [
    '222222222222',  // staging account
    '333333333333',  // production account
  ],
  hostedZones: [hostedZone],
  allowedDomainNames: [
    'example.com',
    '*.example.com',
    'api.example.com',
    'cdn.example.com',
  ],
  externalId: 'cert-validation-2024',
});

// ── certificate-account-stack.ts (Account 222222222222 or 333333333333) ──
import { DnsValidatedCertificate } from '@trautonen/cdk-dns-validated-certificate';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';

const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
  hostedZoneId: 'Z0123456789ABCDEFGHIJ',
  zoneName: 'example.com',
});

const validationRole = iam.Role.fromRoleArn(
  this, 'ValidationRole',
  'arn:aws:iam::111111111111:role/CertificateDnsValidationRole',
);

// Wildcard certificate in us-east-1 for CloudFront
const certificate = new DnsValidatedCertificate(this, 'Certificate', {
  domainName: 'example.com',
  alternativeDomainNames: ['*.example.com'],
  certificateRegion: 'us-east-1',
  validationHostedZones: [{
    hostedZone,
    validationRole,
    validationExternalId: 'cert-validation-2024',
  }],
});

const bucket = new s3.Bucket(this, 'WebsiteBucket');

new cloudfront.Distribution(this, 'Distribution', {
  domainNames: ['cdn.example.com'],
  certificate,
  defaultBehavior: {
    origin: new origins.S3BucketOrigin(bucket),
  },
});
```

### Multiple Hosted Zones with Alternative Names

Validate a primary domain and subject alternative names (SANs) against different hosted zones, each with independent credentials. This is useful when your primary domain and alternative domains are managed in separate AWS accounts.

```typescript
import { DnsValidatedCertificate } from '@trautonen/cdk-dns-validated-certificate';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as iam from 'aws-cdk-lib/aws-iam';

// Primary domain — hosted zone in the current account
const primaryZone = route53.HostedZone.fromLookup(this, 'PrimaryZone', {
  domainName: 'example.com',
});

// Alternative domain — hosted zone in a different account
const secondaryZone = route53.HostedZone.fromHostedZoneAttributes(this, 'SecondaryZone', {
  hostedZoneId: 'Z0123456789ABCDEFGHIJ',
  zoneName: 'example.org',
});

const certificate = new DnsValidatedCertificate(this, 'Certificate', {
  domainName: 'example.com',
  alternativeDomainNames: ['example.org'],
  certificateRegion: 'us-east-1',
  validationHostedZones: [{
    hostedZone: primaryZone,
    // No role needed — same account
  }, {
    hostedZone: secondaryZone,
    validationRole: iam.Role.fromRoleArn(
      this, 'SecondaryValidationRole',
      'arn:aws:iam::222222222222:role/DnsValidationRole',
    ),
    validationExternalId: 'secondary-external-id',
  }],
});
```

### Wildcard Certificate

Request a wildcard certificate that covers both the apex and all subdomains.

```typescript
import { DnsValidatedCertificate } from '@trautonen/cdk-dns-validated-certificate';
import * as route53 from 'aws-cdk-lib/aws-route53';

const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
  domainName: 'example.com',
});

const certificate = new DnsValidatedCertificate(this, 'WildcardCertificate', {
  domainName: 'example.com',
  alternativeDomainNames: ['*.example.com'],
  validationHostedZones: [{
    hostedZone,
  }],
});
```

### Configuring Removal Policy

By default, certificates are destroyed when the stack is deleted. Set a removal policy to retain the certificate instead.

```typescript
import { DnsValidatedCertificate } from '@trautonen/cdk-dns-validated-certificate';
import * as cdk from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';

const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
  domainName: 'example.com',
});

const certificate = new DnsValidatedCertificate(this, 'Certificate', {
  domainName: 'example.com',
  validationHostedZones: [{ hostedZone }],
  removalPolicy: cdk.RemovalPolicy.RETAIN,
});
```

### Disabling DNS Record Cleanup

By default, validation CNAME records are removed when the certificate is deleted. To keep them in DNS (useful for faster re-provisioning), set `cleanupValidationRecords` to `false`.

```typescript
import { DnsValidatedCertificate } from '@trautonen/cdk-dns-validated-certificate';
import * as route53 from 'aws-cdk-lib/aws-route53';

const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
  domainName: 'example.com',
});

const certificate = new DnsValidatedCertificate(this, 'Certificate', {
  domainName: 'example.com',
  validationHostedZones: [{ hostedZone }],
  cleanupValidationRecords: false,
});
```

### Using a Custom Lambda Execution Role

Provide your own IAM role for the Lambda function that manages the certificate lifecycle. This is useful when you need fine-grained control over permissions or want to use a shared role.

```typescript
import { DnsValidatedCertificate } from '@trautonen/cdk-dns-validated-certificate';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as route53 from 'aws-cdk-lib/aws-route53';

const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
  domainName: 'example.com',
});

const lambdaRole = new iam.Role(this, 'CertificateLambdaRole', {
  assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
  managedPolicies: [
    iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
  ],
});

const certificate = new DnsValidatedCertificate(this, 'Certificate', {
  domainName: 'example.com',
  validationHostedZones: [{ hostedZone }],
  customResourceRole: lambdaRole,
});
```

## API Reference

### `DnsValidatedCertificate`

| Property | Type | Description |
|---|---|---|
| `certificateArn` | `string` | The ARN of the certificate |
| `certificateRegion` | `string` | The region the certificate is deployed to |
| `tags` | `TagManager` | Tag manager for the certificate |

### `DnsValidatedCertificateProps`

| Property | Type | Required | Default | Description |
|---|---|---|---|---|
| `domainName` | `string` | Yes | — | Fully qualified domain name. May contain a wildcard (`*.example.com`). |
| `validationHostedZones` | `ValidationHostedZone[]` | Yes | — | Route 53 hosted zones to use for DNS validation. |
| `alternativeDomainNames` | `string[]` | No | — | Subject Alternative Names (SANs) for the certificate. |
| `certificateRegion` | `string` | No | Stack region | Region for the certificate (e.g. `us-east-1` for CloudFront). |
| `customResourceRole` | `IRole` | No | Auto-created | IAM role for the Lambda custom resource. |
| `cleanupValidationRecords` | `boolean` | No | `true` | Remove DNS validation records on certificate deletion. |
| `transparencyLoggingEnabled` | `boolean` | No | `true` | Enable Certificate Transparency logging. |
| `removalPolicy` | `RemovalPolicy` | No | `DESTROY` | What to do with the certificate when the stack is deleted. |

### `ValidationHostedZone`

| Property | Type | Required | Default | Description |
|---|---|---|---|---|
| `hostedZone` | `IHostedZone` | Yes | — | The Route 53 hosted zone for DNS validation. |
| `validationRole` | `IRole` | No | — | IAM role to assume for cross-account DNS changes. |
| `validationExternalId` | `string` | No | — | External ID for the role assumption. |

### `CrossAccountValidationRole`

Extends `iam.Role`. Creates an IAM role for cross-account DNS validation. Deploy this in the account that owns the Route 53 hosted zones.

### `CrossAccountValidationRoleProps`

| Property | Type | Required | Default | Description |
|---|---|---|---|---|
| `trustedAccounts` | `string[]` | Yes | — | AWS account IDs allowed to assume this role. |
| `hostedZones` | `IHostedZone[]` | Yes | — | Route 53 hosted zones the role can modify. |
| `allowedDomainNames` | `string[]` | No | All domains | Domain names or wildcards to restrict validation records. |
| `roleName` | `string` | No | Auto-generated | Name of the IAM role. |
| `externalId` | `string` | No | — | External ID for role assumption security. |

For the full API reference, see [API.md](API.md).

## How It Works

The construct deploys a Lambda function (Node.js 22.x, ARM64) as a CloudFormation custom resource that:

1. **Requests** a DNS-validated certificate from ACM
2. **Creates** CNAME validation records in the specified Route 53 hosted zones (assuming cross-account roles when needed)
3. **Waits** for ACM to validate the certificate
4. **Applies** tags to the certificate
5. **Cleans up** validation records and deletes the certificate on stack removal

The Lambda function handles the full lifecycle including updates (detecting when a new certificate is needed vs. a tag-only update) and graceful deletion (waiting for the certificate to stop being in-use before deleting).

## License

[Apache-2.0](LICENSE)
