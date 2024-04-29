import * as cdk from 'aws-cdk-lib'
import { Template } from 'aws-cdk-lib/assertions'
import * as route53 from 'aws-cdk-lib/aws-route53'
import { DnsValidatedCertificate } from '../src/dns-validated-certificate'

test('DnsValidatedCertificate is created', () => {
  const app = new cdk.App()
  const stack = new cdk.Stack(app, 'TestStack', {})

  const mainHostedZone = route53.HostedZone.fromHostedZoneAttributes(stack, 'MainHostedZone', {
    hostedZoneId: 'Z53279245PYHBAN3YU2K',
    zoneName: 'example.com',
  })

  const secondaryHostedZone = route53.HostedZone.fromHostedZoneAttributes(stack, 'SecondaryHostedZone', {
    hostedZoneId: 'Z73479245BAEBAN3YK4V',
    zoneName: 'secondary.com',
  })

  new DnsValidatedCertificate(stack, 'Certificate', {
    domainName: 'example.com',
    alternativeDomainNames: ['test.secondary.com'],
    validationHostedZones: [
      {
        hostedZone: mainHostedZone,
      },
      {
        hostedZone: secondaryHostedZone,
      },
    ],
  })

  const template = Template.fromStack(stack)

  template.hasResourceProperties('Custom::DnsValidatedCertificate', {
    DomainName: 'example.com',
  })

  template.hasCondition('*', {
    'Fn::Equals': ['example', '*'],
  })
})
