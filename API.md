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

# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### DnsValidatedCertificate <a name="DnsValidatedCertificate" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate"></a>

- *Implements:* aws-cdk-lib.aws_certificatemanager.ICertificate, aws-cdk-lib.ITaggable

A certificate managed by AWS Certificate Manager.

Will be automatically validated using DNS validation against the
specified Route 53 hosted zone. This construct should be used only for cross-region or cross-account certificate
validations. The default ``Certificate`` construct is better in cases where everything is managed by the CDK
application.

Please note that this construct does not support alternative names yet as it would require domain to role mapping.

*Example*

```typescript
// ### Cross-region certificate validation
// hosted zone managed by the CDK application
const hostedZone: route53.IHostedZone = ...
// no separate validation role is needed
const certificate = new DnsValidatedCertificate(this, 'CrossRegionCertificate', {
  domainName: 'example.com',     // must be compatible with the hosted zone
  validationHostedZones: [{      // hosted zone used with the execution role's permissions
    hostedZone: hostedZone
  }],
  certificateRegion: 'us-east-1' // used by for example CloudFront
})
// ### Cross-account certificate validation
// external hosted zone
const hostedZone: route53.IHostedZone =
  route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
    hostedZoneId: 'Z532DGDEDFS123456789',
    zoneName: 'example.com'
  })
// validation role in the same account as the hosted zone
const roleArn = 'arn:aws:iam::123456789:role/ChangeDnsRecordsRole'
const externalId = 'domain-assume'
const validationRole: iam.IRole =
  iam.Role.fromRoleArn(this, 'ValidationRole', roleArn)
const certificate = new DnsValidatedCertificate(this, 'CrossAccountCertificate', {
  domainName: 'example.com',
  validationHostedZones: [{
    hostedZone: hostedZone,
    validationRole: validationRole,
    validationExternalId: externalId
  }]
})
// ### Cross-account alternative name validation
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
})@resource[object Object]@resource[object Object]
```


#### Initializers <a name="Initializers" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.Initializer"></a>

```typescript
import { DnsValidatedCertificate } from '@trautonen/cdk-dns-validated-certificate'

new DnsValidatedCertificate(scope: Construct, id: string, props: DnsValidatedCertificateProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | construct hosting this construct. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.Initializer.parameter.id">id</a></code> | <code>string</code> | construct's identifier. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.Initializer.parameter.props">props</a></code> | <code><a href="#@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificateProps">DnsValidatedCertificateProps</a></code> | properties for the construct. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

construct hosting this construct.

---

##### `id`<sup>Required</sup> <a name="id" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.Initializer.parameter.id"></a>

- *Type:* string

construct's identifier.

---

##### `props`<sup>Required</sup> <a name="props" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.Initializer.parameter.props"></a>

- *Type:* <a href="#@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificateProps">DnsValidatedCertificateProps</a>

properties for the construct.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.applyRemovalPolicy">applyRemovalPolicy</a></code> | Apply the given removal policy to this resource. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.metricDaysToExpiry">metricDaysToExpiry</a></code> | Return the DaysToExpiry metric for this AWS Certificate Manager Certificate. By default, this is the minimum value over 1 day. |

---

##### `toString` <a name="toString" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `applyRemovalPolicy` <a name="applyRemovalPolicy" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.applyRemovalPolicy"></a>

```typescript
public applyRemovalPolicy(policy: RemovalPolicy): void
```

Apply the given removal policy to this resource.

The Removal Policy controls what happens to this resource when it stops
being managed by CloudFormation, either because you've removed it from the
CDK application or because you've made a change that requires the resource
to be replaced.

The resource can be deleted (`RemovalPolicy.DESTROY`), or left in your AWS
account for data recovery and cleanup later (`RemovalPolicy.RETAIN`).

###### `policy`<sup>Required</sup> <a name="policy" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.applyRemovalPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.RemovalPolicy

---

##### `metricDaysToExpiry` <a name="metricDaysToExpiry" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.metricDaysToExpiry"></a>

```typescript
public metricDaysToExpiry(props?: MetricOptions): Metric
```

Return the DaysToExpiry metric for this AWS Certificate Manager Certificate. By default, this is the minimum value over 1 day.

This metric is no longer emitted once the certificate has effectively
expired, so alarms configured on this metric should probably treat missing
data as "breaching".

###### `props`<sup>Optional</sup> <a name="props" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.metricDaysToExpiry.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.isOwnedResource">isOwnedResource</a></code> | Returns true if the construct was created by CDK, and false otherwise. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.isResource">isResource</a></code> | Check whether the given construct is a Resource. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.isConstruct"></a>

```typescript
import { DnsValidatedCertificate } from '@trautonen/cdk-dns-validated-certificate'

DnsValidatedCertificate.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isOwnedResource` <a name="isOwnedResource" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.isOwnedResource"></a>

```typescript
import { DnsValidatedCertificate } from '@trautonen/cdk-dns-validated-certificate'

DnsValidatedCertificate.isOwnedResource(construct: IConstruct)
```

Returns true if the construct was created by CDK, and false otherwise.

###### `construct`<sup>Required</sup> <a name="construct" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.isOwnedResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `isResource` <a name="isResource" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.isResource"></a>

```typescript
import { DnsValidatedCertificate } from '@trautonen/cdk-dns-validated-certificate'

DnsValidatedCertificate.isResource(construct: IConstruct)
```

Check whether the given construct is a Resource.

###### `construct`<sup>Required</sup> <a name="construct" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.isResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.property.certificateArn">certificateArn</a></code> | <code>string</code> | The certificate's ARN. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.property.certificateRegion">certificateRegion</a></code> | <code>string</code> | The region where the certificate is deployed to. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.property.tags">tags</a></code> | <code>aws-cdk-lib.TagManager</code> | The tag manager to set, remove and format tags for the certificate. |

---

##### `node`<sup>Required</sup> <a name="node" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.property.env"></a>

```typescript
public readonly env: ResourceEnvironment;
```

- *Type:* aws-cdk-lib.ResourceEnvironment

The environment this resource belongs to.

For resources that are created and managed by the CDK
(generally, those created by creating new class instances like Role, Bucket, etc.),
this is always the same as the environment of the stack they belong to;
however, for imported resources
(those obtained from static methods like fromRoleArn, fromBucketName, etc.),
that might be different than the stack they were imported into.

---

##### `stack`<sup>Required</sup> <a name="stack" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `certificateArn`<sup>Required</sup> <a name="certificateArn" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.property.certificateArn"></a>

```typescript
public readonly certificateArn: string;
```

- *Type:* string

The certificate's ARN.

---

##### `certificateRegion`<sup>Required</sup> <a name="certificateRegion" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.property.certificateRegion"></a>

```typescript
public readonly certificateRegion: string;
```

- *Type:* string

The region where the certificate is deployed to.

---

##### `tags`<sup>Required</sup> <a name="tags" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.property.tags"></a>

```typescript
public readonly tags: TagManager;
```

- *Type:* aws-cdk-lib.TagManager

The tag manager to set, remove and format tags for the certificate.

---


## Structs <a name="Structs" id="Structs"></a>

### DnsValidatedCertificateProps <a name="DnsValidatedCertificateProps" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificateProps"></a>

#### Initializer <a name="Initializer" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificateProps.Initializer"></a>

```typescript
import { DnsValidatedCertificateProps } from '@trautonen/cdk-dns-validated-certificate'

const dnsValidatedCertificateProps: DnsValidatedCertificateProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificateProps.property.domainName">domainName</a></code> | <code>string</code> | Fully-qualified domain name to request a certificate for. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificateProps.property.validationHostedZones">validationHostedZones</a></code> | <code><a href="#@trautonen/cdk-dns-validated-certificate.ValidationHostedZone">ValidationHostedZone</a>[]</code> | List of hosted zones to use for validation. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificateProps.property.alternativeDomainNames">alternativeDomainNames</a></code> | <code>string[]</code> | Fully-qualified alternative domain names to request a certificate for. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificateProps.property.certificateRegion">certificateRegion</a></code> | <code>string</code> | AWS region where the certificate is deployed. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificateProps.property.cleanupValidationRecords">cleanupValidationRecords</a></code> | <code>boolean</code> | Enable or disable cleaning of validation DNS records from the hosted zone. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificateProps.property.customResourceRole">customResourceRole</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | The role that is used for the custom resource Lambda execution. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificateProps.property.removalPolicy">removalPolicy</a></code> | <code>aws-cdk-lib.RemovalPolicy</code> | Apply the given removal policy to this resource. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificateProps.property.transparencyLoggingEnabled">transparencyLoggingEnabled</a></code> | <code>boolean</code> | Enable or disable transparency logging for this certificate. |

---

##### `domainName`<sup>Required</sup> <a name="domainName" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificateProps.property.domainName"></a>

```typescript
public readonly domainName: string;
```

- *Type:* string

Fully-qualified domain name to request a certificate for.

May contain wildcards, such as ``*.domain.com``.

---

##### `validationHostedZones`<sup>Required</sup> <a name="validationHostedZones" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificateProps.property.validationHostedZones"></a>

```typescript
public readonly validationHostedZones: ValidationHostedZone[];
```

- *Type:* <a href="#@trautonen/cdk-dns-validated-certificate.ValidationHostedZone">ValidationHostedZone</a>[]

List of hosted zones to use for validation.

Hosted zones are mapped to domain names by the zone name.

---

##### `alternativeDomainNames`<sup>Optional</sup> <a name="alternativeDomainNames" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificateProps.property.alternativeDomainNames"></a>

```typescript
public readonly alternativeDomainNames: string[];
```

- *Type:* string[]

Fully-qualified alternative domain names to request a certificate for.

May contain wildcards, such as ``*.otherdomain.com``.

---

##### `certificateRegion`<sup>Optional</sup> <a name="certificateRegion" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificateProps.property.certificateRegion"></a>

```typescript
public readonly certificateRegion: string;
```

- *Type:* string
- *Default:* Same region as the stack.

AWS region where the certificate is deployed.

You should use the default ``Certificate`` construct instead if the region is same as the stack's and the hosted
zone is in the same account.

---

##### `cleanupValidationRecords`<sup>Optional</sup> <a name="cleanupValidationRecords" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificateProps.property.cleanupValidationRecords"></a>

```typescript
public readonly cleanupValidationRecords: boolean;
```

- *Type:* boolean
- *Default:* true

Enable or disable cleaning of validation DNS records from the hosted zone.

If there's multiple certificates created for same domain, it is possible to encouter a race condition where some
certificate is removed and another certificate would need the same validation record. Prefer single certificate
for a domain or set this to false and cleanup records manually when not needed anymore. If you change this
property after creation, a new certificate will be requested.

---

##### `customResourceRole`<sup>Optional</sup> <a name="customResourceRole" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificateProps.property.customResourceRole"></a>

```typescript
public readonly customResourceRole: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole
- *Default:* Lambda creates a default execution role.

The role that is used for the custom resource Lambda execution.

The role is given permissions to request certificates from ACM. If there are any ``validationRole``s provided,
this role is also given permission to assume the ``validationRole``. Otherwise it is assumed that the hosted zone
is in same account and the execution role is given permissions to change DNS records for the given ``domainName``.

---

##### `removalPolicy`<sup>Optional</sup> <a name="removalPolicy" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificateProps.property.removalPolicy"></a>

```typescript
public readonly removalPolicy: RemovalPolicy;
```

- *Type:* aws-cdk-lib.RemovalPolicy
- *Default:* RemovalPolicy.DESTROY

Apply the given removal policy to this resource.

The removal policy controls what happens to this resource when it stops being managed by CloudFormation, either
because you've removed it from the CDK application or because you've made a change that requires the resource to
be replaced. The resource can be deleted (``RemovalPolicy.DESTROY``), or left in your AWS account for data
recovery and cleanup later (``RemovalPolicy.RETAIN``). If you change this property after creation, a new
certificate will be requested.

---

##### `transparencyLoggingEnabled`<sup>Optional</sup> <a name="transparencyLoggingEnabled" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificateProps.property.transparencyLoggingEnabled"></a>

```typescript
public readonly transparencyLoggingEnabled: boolean;
```

- *Type:* boolean
- *Default:* true

Enable or disable transparency logging for this certificate.

Once a certificate has been logged, it cannot be removed from the log. Opting out at that point will have no
effect. If you change this property after creation, a new certificate will be requested.

> [https://docs.aws.amazon.com/acm/latest/userguide/acm-bestpractices.html#best-practices-transparency](https://docs.aws.amazon.com/acm/latest/userguide/acm-bestpractices.html#best-practices-transparency)

---

### ValidationHostedZone <a name="ValidationHostedZone" id="@trautonen/cdk-dns-validated-certificate.ValidationHostedZone"></a>

#### Initializer <a name="Initializer" id="@trautonen/cdk-dns-validated-certificate.ValidationHostedZone.Initializer"></a>

```typescript
import { ValidationHostedZone } from '@trautonen/cdk-dns-validated-certificate'

const validationHostedZone: ValidationHostedZone = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.ValidationHostedZone.property.hostedZone">hostedZone</a></code> | <code>aws-cdk-lib.aws_route53.IHostedZone</code> | Hosted zone to use for DNS validation. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.ValidationHostedZone.property.validationExternalId">validationExternalId</a></code> | <code>string</code> | External id for ``validationRole`` role assume verification. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.ValidationHostedZone.property.validationRole">validationRole</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | The role that is assumed for DNS record changes for certificate validation. |

---

##### `hostedZone`<sup>Required</sup> <a name="hostedZone" id="@trautonen/cdk-dns-validated-certificate.ValidationHostedZone.property.hostedZone"></a>

```typescript
public readonly hostedZone: IHostedZone;
```

- *Type:* aws-cdk-lib.aws_route53.IHostedZone

Hosted zone to use for DNS validation.

The zone name is matched to domain name to use the right
hosted zone for validation.

If the hosted zone is not managed by the CDK application, it needs to be provided via
``HostedZone.fromHostedZoneAttributes()``.

---

##### `validationExternalId`<sup>Optional</sup> <a name="validationExternalId" id="@trautonen/cdk-dns-validated-certificate.ValidationHostedZone.property.validationExternalId"></a>

```typescript
public readonly validationExternalId: string;
```

- *Type:* string
- *Default:* No external id provided during assume.

External id for ``validationRole`` role assume verification.

This should be used only when ``validationRole`` is given and the role expects an external id provided on assume.

---

##### `validationRole`<sup>Optional</sup> <a name="validationRole" id="@trautonen/cdk-dns-validated-certificate.ValidationHostedZone.property.validationRole"></a>

```typescript
public readonly validationRole: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole
- *Default:* No separate role for DNS record changes. The given customResourceRole or the default role is used for DNS record changes.

The role that is assumed for DNS record changes for certificate validation.

This role should exist in the same account as the hosted zone and include permissions to change the DNS records
for the given ``hostedZone``. The ``customResourceRole`` or the default execution role is given permission to
assume this role.

---



