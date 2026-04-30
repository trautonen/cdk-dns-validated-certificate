import * as cdk from 'aws-cdk-lib'
import { Match, Template } from 'aws-cdk-lib/assertions'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as route53 from 'aws-cdk-lib/aws-route53'
import { CrossAccountValidationRole } from '../src/cross-account-validation-role'

test('creates role with single trusted account and hosted zone', () => {
  const app = new cdk.App()
  const stack = new cdk.Stack(app, 'TestStack')

  const hostedZone = route53.HostedZone.fromHostedZoneAttributes(stack, 'HostedZone', {
    hostedZoneId: 'Z1234567890',
    zoneName: 'example.com',
  })

  new CrossAccountValidationRole(stack, 'ValidationRole', {
    trustedAccounts: ['123456789012'],
    hostedZones: [hostedZone],
  })

  const template = Template.fromStack(stack)

  // Verify the role trust policy
  template.hasResourceProperties('AWS::IAM::Role', {
    AssumeRolePolicyDocument: Match.objectLike({
      Statement: [
        Match.objectLike({
          Action: 'sts:AssumeRole',
          Effect: 'Allow',
          Principal: {
            AWS: {
              'Fn::Join': ['', ['arn:', { Ref: 'AWS::Partition' }, ':iam::123456789012:root']],
            },
          },
        }),
      ],
    }),
  })

  // Verify route53:GetChange permission
  template.hasResourceProperties('AWS::IAM::Policy', {
    PolicyDocument: Match.objectLike({
      Statement: Match.arrayWith([
        Match.objectLike({
          Action: 'route53:GetChange',
          Effect: 'Allow',
          Resource: '*',
        }),
      ]),
    }),
  })

  // Verify route53:ChangeResourceRecordSets with conditions
  template.hasResourceProperties('AWS::IAM::Policy', {
    PolicyDocument: Match.objectLike({
      Statement: Match.arrayWith([
        Match.objectLike({
          Action: 'route53:ChangeResourceRecordSets',
          Effect: 'Allow',
          Resource: 'arn:aws:route53:::hostedzone/Z1234567890',
          Condition: {
            'ForAllValues:StringEquals': {
              'route53:ChangeResourceRecordSetsRecordTypes': ['CNAME'],
              'route53:ChangeResourceRecordSetsActions': ['UPSERT', 'DELETE'],
            },
          },
        }),
      ]),
    }),
  })
})

test('creates role with multiple trusted accounts', () => {
  const app = new cdk.App()
  const stack = new cdk.Stack(app, 'TestStack')

  const hostedZone = route53.HostedZone.fromHostedZoneAttributes(stack, 'HostedZone', {
    hostedZoneId: 'Z1234567890',
    zoneName: 'example.com',
  })

  new CrossAccountValidationRole(stack, 'ValidationRole', {
    trustedAccounts: ['111111111111', '222222222222'],
    hostedZones: [hostedZone],
  })

  const template = Template.fromStack(stack)

  // Verify both accounts can assume the role
  template.hasResourceProperties('AWS::IAM::Role', {
    AssumeRolePolicyDocument: Match.objectLike({
      Statement: Match.arrayWith([
        Match.objectLike({
          Action: 'sts:AssumeRole',
          Effect: 'Allow',
          Principal: {
            AWS: {
              'Fn::Join': ['', ['arn:', { Ref: 'AWS::Partition' }, ':iam::111111111111:root']],
            },
          },
        }),
        Match.objectLike({
          Action: 'sts:AssumeRole',
          Effect: 'Allow',
          Principal: {
            AWS: {
              'Fn::Join': ['', ['arn:', { Ref: 'AWS::Partition' }, ':iam::222222222222:root']],
            },
          },
        }),
      ]),
    }),
  })
})

test('creates role with allowed domain names', () => {
  const app = new cdk.App()
  const stack = new cdk.Stack(app, 'TestStack')

  const hostedZone = route53.HostedZone.fromHostedZoneAttributes(stack, 'HostedZone', {
    hostedZoneId: 'Z1234567890',
    zoneName: 'example.com',
  })

  new CrossAccountValidationRole(stack, 'ValidationRole', {
    trustedAccounts: ['123456789012'],
    hostedZones: [hostedZone],
    allowedDomainNames: ['example.com', '*.example.com'],
  })

  const template = Template.fromStack(stack)

  // Verify domain name condition is added
  template.hasResourceProperties('AWS::IAM::Policy', {
    PolicyDocument: Match.objectLike({
      Statement: Match.arrayWith([
        Match.objectLike({
          Action: 'route53:ChangeResourceRecordSets',
          Condition: {
            'ForAllValues:StringEquals': {
              'route53:ChangeResourceRecordSetsRecordTypes': ['CNAME'],
              'route53:ChangeResourceRecordSetsActions': ['UPSERT', 'DELETE'],
            },
            'ForAllValues:StringLike': {
              'route53:ChangeResourceRecordSetsNormalizedRecordNames': ['_*.example.com'],
            },
          },
        }),
      ]),
    }),
  })
})

test('creates role with external id', () => {
  const app = new cdk.App()
  const stack = new cdk.Stack(app, 'TestStack')

  const hostedZone = route53.HostedZone.fromHostedZoneAttributes(stack, 'HostedZone', {
    hostedZoneId: 'Z1234567890',
    zoneName: 'example.com',
  })

  new CrossAccountValidationRole(stack, 'ValidationRole', {
    trustedAccounts: ['123456789012'],
    hostedZones: [hostedZone],
    externalId: 'my-external-id',
  })

  const template = Template.fromStack(stack)

  template.hasResourceProperties('AWS::IAM::Role', {
    AssumeRolePolicyDocument: Match.objectLike({
      Statement: [
        Match.objectLike({
          Condition: {
            StringEquals: {
              'sts:ExternalId': 'my-external-id',
            },
          },
        }),
      ],
    }),
  })
})

test('creates role with multiple hosted zones', () => {
  const app = new cdk.App()
  const stack = new cdk.Stack(app, 'TestStack')

  const zone1 = route53.HostedZone.fromHostedZoneAttributes(stack, 'Zone1', {
    hostedZoneId: 'Z1111111111',
    zoneName: 'example.com',
  })

  const zone2 = route53.HostedZone.fromHostedZoneAttributes(stack, 'Zone2', {
    hostedZoneId: 'Z2222222222',
    zoneName: 'other.com',
  })

  new CrossAccountValidationRole(stack, 'ValidationRole', {
    trustedAccounts: ['123456789012'],
    hostedZones: [zone1, zone2],
  })

  const template = Template.fromStack(stack)

  // Verify separate policy statements per hosted zone
  template.hasResourceProperties('AWS::IAM::Policy', {
    PolicyDocument: Match.objectLike({
      Statement: Match.arrayWith([
        Match.objectLike({
          Action: 'route53:ChangeResourceRecordSets',
          Resource: 'arn:aws:route53:::hostedzone/Z1111111111',
        }),
        Match.objectLike({
          Action: 'route53:ChangeResourceRecordSets',
          Resource: 'arn:aws:route53:::hostedzone/Z2222222222',
        }),
      ]),
    }),
  })
})

test('normalizes hosted zone id with prefix', () => {
  const app = new cdk.App()
  const stack = new cdk.Stack(app, 'TestStack')

  const hostedZone = route53.HostedZone.fromHostedZoneAttributes(stack, 'HostedZone', {
    hostedZoneId: '/hostedzone/Z1234567890',
    zoneName: 'example.com',
  })

  new CrossAccountValidationRole(stack, 'ValidationRole', {
    trustedAccounts: ['123456789012'],
    hostedZones: [hostedZone],
  })

  const template = Template.fromStack(stack)

  template.hasResourceProperties('AWS::IAM::Policy', {
    PolicyDocument: Match.objectLike({
      Statement: Match.arrayWith([
        Match.objectLike({
          Resource: 'arn:aws:route53:::hostedzone/Z1234567890',
        }),
      ]),
    }),
  })
})

test('deduplicates wildcard domain validation patterns', () => {
  const app = new cdk.App()
  const stack = new cdk.Stack(app, 'TestStack')

  const hostedZone = route53.HostedZone.fromHostedZoneAttributes(stack, 'HostedZone', {
    hostedZoneId: 'Z1234567890',
    zoneName: 'example.com',
  })

  // Both example.com and *.example.com produce the same validation pattern _*.example.com
  new CrossAccountValidationRole(stack, 'ValidationRole', {
    trustedAccounts: ['123456789012'],
    hostedZones: [hostedZone],
    allowedDomainNames: ['example.com', '*.example.com', 'sub.example.com'],
  })

  const template = Template.fromStack(stack)

  template.hasResourceProperties('AWS::IAM::Policy', {
    PolicyDocument: Match.objectLike({
      Statement: Match.arrayWith([
        Match.objectLike({
          Condition: Match.objectLike({
            'ForAllValues:StringLike': {
              'route53:ChangeResourceRecordSetsNormalizedRecordNames': ['_*.example.com', '_*.sub.example.com'],
            },
          }),
        }),
      ]),
    }),
  })
})

test('strips trailing dots from domain names', () => {
  const app = new cdk.App()
  const stack = new cdk.Stack(app, 'TestStack')

  const hostedZone = route53.HostedZone.fromHostedZoneAttributes(stack, 'HostedZone', {
    hostedZoneId: 'Z1234567890',
    zoneName: 'example.com',
  })

  new CrossAccountValidationRole(stack, 'ValidationRole', {
    trustedAccounts: ['123456789012'],
    hostedZones: [hostedZone],
    allowedDomainNames: ['example.com.'],
  })

  const template = Template.fromStack(stack)

  template.hasResourceProperties('AWS::IAM::Policy', {
    PolicyDocument: Match.objectLike({
      Statement: Match.arrayWith([
        Match.objectLike({
          Condition: Match.objectLike({
            'ForAllValues:StringLike': {
              'route53:ChangeResourceRecordSetsNormalizedRecordNames': ['_*.example.com'],
            },
          }),
        }),
      ]),
    }),
  })
})

test('throws when no trusted accounts provided', () => {
  const app = new cdk.App()
  const stack = new cdk.Stack(app, 'TestStack')

  const hostedZone = route53.HostedZone.fromHostedZoneAttributes(stack, 'HostedZone', {
    hostedZoneId: 'Z1234567890',
    zoneName: 'example.com',
  })

  expect(() => {
    new CrossAccountValidationRole(stack, 'ValidationRole', {
      trustedAccounts: [],
      hostedZones: [hostedZone],
    })
  }).toThrow('At least one trusted account must be provided')
})

test('throws when no hosted zones provided', () => {
  const app = new cdk.App()
  const stack = new cdk.Stack(app, 'TestStack')

  expect(() => {
    new CrossAccountValidationRole(stack, 'ValidationRole', {
      trustedAccounts: ['123456789012'],
      hostedZones: [],
    })
  }).toThrow('At least one hosted zone must be provided')
})

test('is an iam.Role instance usable as validationRole', () => {
  const app = new cdk.App()
  const stack = new cdk.Stack(app, 'TestStack')

  const hostedZone = route53.HostedZone.fromHostedZoneAttributes(stack, 'HostedZone', {
    hostedZoneId: 'Z1234567890',
    zoneName: 'example.com',
  })

  const validationRole = new CrossAccountValidationRole(stack, 'ValidationRole', {
    trustedAccounts: ['123456789012'],
    hostedZones: [hostedZone],
  })

  expect(validationRole).toBeInstanceOf(iam.Role)
  expect(validationRole.roleArn).toBeDefined()
})

test('creates role with custom role name', () => {
  const app = new cdk.App()
  const stack = new cdk.Stack(app, 'TestStack')

  const hostedZone = route53.HostedZone.fromHostedZoneAttributes(stack, 'HostedZone', {
    hostedZoneId: 'Z1234567890',
    zoneName: 'example.com',
  })

  new CrossAccountValidationRole(stack, 'ValidationRole', {
    trustedAccounts: ['123456789012'],
    hostedZones: [hostedZone],
    roleName: 'CertValidationRole',
  })

  const template = Template.fromStack(stack)

  template.hasResourceProperties('AWS::IAM::Role', {
    RoleName: 'CertValidationRole',
  })
})
