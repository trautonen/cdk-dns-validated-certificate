import * as cdk from 'aws-cdk-lib'
import { Template } from 'aws-cdk-lib/assertions'
import * as route53 from 'aws-cdk-lib/aws-route53'
import { DnsValidatedCertificate } from '../src/dns-validated-certificate'

test('DnsValidatedCertificate is created', () => {
  const app = new cdk.App()
  const stack = new cdk.Stack(app, 'TestStack', {})

  const hostedZone = route53.HostedZone.fromHostedZoneAttributes(stack, 'HostedZone', {
    hostedZoneId: 'Z53279245PYHBAN3YU2K',
    zoneName: 'example.com',
  })

  new DnsValidatedCertificate(stack, 'Certificate', {
    domainName: 'example.com',
    validationHostedZones: [
      {
        hostedZone,
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
