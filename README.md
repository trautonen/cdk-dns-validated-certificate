# AWS CDK DNS Validated Certificate

CDK does not have a built in construct to manage cross-region or cross-account DNS validated certificates. There's an
attempt to work around the issue with a cross region references option for stacks, but it has a lot of issues and still
does not solve the cross-account use case.

This construct solves these problems by managing the certificate as a custom resource and with direct API calls to ACM
and Route53. In the future it will be possible to support not only Route53, but other DNS services too.

## Usage for cross-region validation

```typescript
// hosted zone managed by the CDK application
const hostedZone: route53.IHostedZone = ...
// no separate validation role is needed
const certificate = new DnsValidatedCertificate(this, 'CrossRegionCertificate', {
  hostedZone: hostedZone,
  domainName: 'example.com',     // must be compatible with the hosted zone
  certificateRegion: 'us-east-1' // used by for example CloudFront
})
```

## Usage for cross-account validation

```typescript
// external hosted zone
const hostedZone: route53.IHostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
  hostedZoneId: 'Z532DGDEDFS123456789',
  zoneName: 'example.com',
})
// validation role on the same account as the hosted zone
const roleArn = 'arn:aws:iam::123456789:role/ChangeDnsRecordsRole'
const externalId = 'domain-assume'
const validationRole: iam.IRole = iam.Role.fromRoleArn(this, 'ValidationRole', roleArn)
const certificate = new DnsValidatedCertificate(this, 'CrossAccountCertificate', {
  hostedZone: hostedZone,
  domainName: 'example.com',
  validationRole: validationRole,
  validationExternalId: externalId,
})
```

## Usage for cross-account alternative names validation

```typescript
// example.com is validated on same account against managed hosted zone
// and secondary.com is validated against external hosted zone on other account
const hostedZoneForMain: route53.IHostedZone = ...
const hostedZoneForAlternative: route53.IHostedZone =
  route53.HostedZone.fromHostedZoneAttributes(this, 'SecondaryHostedZone', {
  hostedZoneId: 'Z532DGDEDFS123456789',
  zoneName: 'secondary.com'
})
const certificate = new DnsValidatedCertificate(this, 'CrossAccountCertificate', {
  domainName: 'example.com',
  alternativeDomainNames: ['secondary.com'],
  validationHostedZones: [{
    hostedZone: hostedZoneForMain
  },{
    hostedZone: hostedZoneForAlternative,
    validationRole: iam.Role.fromRoleArn(
      this, 'SecondaryValidationRole', 'arn:aws:iam::123456789:role/ChangeDnsRecordsRole'
    ),
    validationExternalId: 'domain-assume'
  }]
})
```
