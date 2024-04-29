import * as cdk from 'aws-cdk-lib'
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager'
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as custom_resources from 'aws-cdk-lib/custom-resources'
import { Construct } from 'constructs'
import { CertificateRequestorFunction } from './certificate-requestor-function'
import { Properties, ValidationHostedZoneProperties } from './certificate-requestor.lambda'
import { booleanToString, cleanDomainName, cleanHostedZoneId, matchNamesToZones } from './utils'

export interface ValidationHostedZone {
  /**
   * Hosted zone to use for DNS validation. The zone name is matched to domain name to use the right
   * hosted zone for validation.
   *
   * If the hosted zone is not managed by the CDK application, it needs to be provided via
   * ``HostedZone.fromHostedZoneAttributes()``.
   */
  readonly hostedZone: route53.IHostedZone

  /**
   * The role that is assumed for DNS record changes for certificate validation.
   *
   * This role should exist in the same account as the hosted zone and include permissions to change the DNS records
   * for the given ``hostedZone``. The ``customResourceRole`` or the default execution role is given permission to
   * assume this role.
   *
   * @default - No separate role for DNS record changes. The given customResourceRole or the default role is used
   * for DNS record changes.
   */
  readonly validationRole?: iam.IRole

  /**
   * External id for ``validationRole`` role assume verification.
   *
   * This should be used only when ``validationRole`` is given and the role expects an external id provided on assume.
   *
   * @default - No external id provided during assume.
   */
  readonly validationExternalId?: string
}

export interface DnsValidatedCertificateProps {
  /**
   * Fully-qualified domain name to request a certificate for.
   *
   * May contain wildcards, such as ``*.domain.com``.
   */
  readonly domainName: string

  /**
   * Fully-qualified alternative domain names to request a certificate for.
   *
   * May contain wildcards, such as ``*.otherdomain.com``.
   */
  readonly alternativeDomainNames?: string[]

  /**
   * List of hosted zones to use for validation. Hosted zones are mapped to domain names by the zone name.
   */
  readonly validationHostedZones: ValidationHostedZone[]

  /**
   * AWS region where the certificate is deployed.
   *
   * You should use the default ``Certificate`` construct instead if the region is same as the stack's and the hosted
   * zone is in the same account.
   *
   * @default - Same region as the stack.
   */
  readonly certificateRegion?: string

  /**
   * The role that is used for the custom resource Lambda execution.
   *
   * The role is given permissions to request certificates from ACM. If there are any ``validationRole``s provided,
   * this role is also given permission to assume the ``validationRole``. Otherwise it is assumed that the hosted zone
   * is in same account and the execution role is given permissions to change DNS records for the given ``domainName``.
   *
   * @default - Lambda creates a default execution role.
   */
  readonly customResourceRole?: iam.IRole

  /**
   * Enable or disable cleaning of validation DNS records from the hosted zone.
   *
   * If there's multiple certificates created for same domain, it is possible to encouter a race condition where some
   * certificate is removed and another certificate would need the same validation record. Prefer single certificate
   * for a domain or set this to false and cleanup records manually when not needed anymore. If you change this
   * property after creation, a new certificate will be requested.
   *
   * @default true
   */
  readonly cleanupValidationRecords?: boolean

  /**
   * Enable or disable transparency logging for this certificate.
   *
   * Once a certificate has been logged, it cannot be removed from the log. Opting out at that point will have no
   * effect. If you change this property after creation, a new certificate will be requested.
   *
   * @see https://docs.aws.amazon.com/acm/latest/userguide/acm-bestpractices.html#best-practices-transparency
   *
   * @default true
   */
  readonly transparencyLoggingEnabled?: boolean

  /**
   * Apply the given removal policy to this resource.
   *
   * The removal policy controls what happens to this resource when it stops being managed by CloudFormation, either
   * because you've removed it from the CDK application or because you've made a change that requires the resource to
   * be replaced. The resource can be deleted (``RemovalPolicy.DESTROY``), or left in your AWS account for data
   * recovery and cleanup later (``RemovalPolicy.RETAIN``). If you change this property after creation, a new
   * certificate will be requested.
   *
   * @default RemovalPolicy.DESTROY
   */
  readonly removalPolicy?: cdk.RemovalPolicy
}

const DNS_VALIDATED_CERTIFICATE_TYPE = 'Custom::DnsValidatedCertificate'
const CERTTIFICATE_RESOURCE_TYPE = 'AWS::CertificateManager::Certificate'

/**
 * A certificate managed by AWS Certificate Manager. Will be automatically validated using DNS validation against the
 * specified Route 53 hosted zone. This construct should be used only for cross-region or cross-account certificate
 * validations. The default ``Certificate`` construct is better in cases where everything is managed by the CDK
 * application.
 *
 * Please note that this construct does not support alternative names yet as it would require domain to role mapping.
 *
 * @example
 * // ### Cross-region certificate validation
 * // hosted zone managed by the CDK application
 * const hostedZone: route53.IHostedZone = ...
 * // no separate validation role is needed
 * const certificate = new DnsValidatedCertificate(this, 'CrossRegionCertificate', {
 *   domainName: 'example.com',     // must be compatible with the hosted zone
 *   validationHostedZones: [{      // hosted zone used with the execution role's permissions
 *     hostedZone: hostedZone
 *   }],
 *   certificateRegion: 'us-east-1' // used by for example CloudFront
 * })
 * // ### Cross-account certificate validation
 * // external hosted zone
 * const hostedZone: route53.IHostedZone =
 *   route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
 *     hostedZoneId: 'Z532DGDEDFS123456789',
 *     zoneName: 'example.com'
 *   })
 * // validation role in the same account as the hosted zone
 * const roleArn = 'arn:aws:iam::123456789:role/ChangeDnsRecordsRole'
 * const externalId = 'domain-assume'
 * const validationRole: iam.IRole =
 *   iam.Role.fromRoleArn(this, 'ValidationRole', roleArn)
 * const certificate = new DnsValidatedCertificate(this, 'CrossAccountCertificate', {
 *   domainName: 'example.com',
 *   validationHostedZones: [{
 *     hostedZone: hostedZone,
 *     validationRole: validationRole,
 *     validationExternalId: externalId
 *   }]
 * })
 * // ### Cross-account alternative name validation
 * // example.com is validated on same account against managed hosted zone
 * // and secondary.com is validated against external hosted zone on other account
 * const hostedZoneForMain: route53.IHostedZone = ...
 * const hostedZoneForAlternative: route53.IHostedZone =
 *   route53.HostedZone.fromHostedZoneAttributes(this, 'SecondaryHostedZone', {
 *     hostedZoneId: 'Z532DGDEDFS123456789',
 *     zoneName: 'secondary.com'
 *   })
 * const certificate = new DnsValidatedCertificate(this, 'CrossAccountCertificate', {
 *   domainName: 'example.com',
 *   alternativeDomainNames: ['secondary.com'],
 *   validationHostedZones: [{
 *     hostedZone: hostedZoneForMain
 *   },{
 *     hostedZone: hostedZoneForAlternative,
 *     validationRole: iam.Role.fromRoleArn(
 *       this, 'SecondaryValidationRole', 'arn:aws:iam::123456789:role/ChangeDnsRecordsRole'
 *     ),
 *     validationExternalId: 'domain-assume'
 *   }]
 * })
 *
 * @resource Custom::DnsValidatedCertificate
 * @resource AWS::CertificateManager::Certificate
 */
export class DnsValidatedCertificate extends cdk.Resource implements certificatemanager.ICertificate, cdk.ITaggable {
  /** The certificate's ARN */
  public readonly certificateArn: string

  /** The region where the certificate is deployed to */
  public readonly certificateRegion: string

  /** The tag manager to set, remove and format tags for the certificate  */
  public readonly tags: cdk.TagManager

  /** The removal policy for the certificate */
  private removalPolicy: cdk.RemovalPolicy

  /**
   * Creates an instance of DnsValidatedCertificate construct.
   *
   * @param scope construct hosting this construct
   * @param id construct's identifier
   * @param props properties for the construct
   */
  constructor(scope: Construct, id: string, props: DnsValidatedCertificateProps) {
    super(scope, id)

    const domainName = this.normalizeDomainName(props.domainName)
    const alternativeDomainNames = props.alternativeDomainNames?.map((alternativeDomainName) =>
      this.normalizeDomainName(alternativeDomainName)
    )
    const allDomains = [domainName, ...(alternativeDomainNames ?? [])]

    this.certificateRegion = props.certificateRegion ?? this.stack.region
    this.tags = new cdk.TagManager(cdk.TagType.MAP, CERTTIFICATE_RESOURCE_TYPE)
    this.removalPolicy = props.removalPolicy ?? cdk.RemovalPolicy.DESTROY

    const requestorFunction = new CertificateRequestorFunction(this, 'RequestorFunction', {
      architecture: lambda.Architecture.ARM_64,
      timeout: cdk.Duration.minutes(14),
      role: props.customResourceRole,
    })

    requestorFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'acm:RequestCertificate',
          'acm:DescribeCertificate',
          'acm:DeleteCertificate',
          'acm:AddTagsToCertificate',
        ],
        resources: ['*'],
      })
    )

    const domainsToZones = matchNamesToZones(
      props.validationHostedZones.map((zone) => zone.hostedZone.zoneName),
      allDomains,
      (domain) => domain
    )
    const hostedZonesWithRole = props.validationHostedZones.filter((zone) => zone.validationRole !== undefined)
    const hostedZonesWithoutRole = props.validationHostedZones.filter((zone) => zone.validationRole === undefined)

    hostedZonesWithRole.forEach((zone) => {
      requestorFunction.addToRolePolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['sts:AssumeRole'],
          resources: [zone.validationRole!.roleArn],
        })
      )
    })

    hostedZonesWithoutRole.forEach((zone) => {
      requestorFunction.addToRolePolicy(
        new iam.PolicyStatement({
          actions: ['route53:GetChange'],
          resources: ['*'],
        })
      )
      const domainNames = domainsToZones[zone.hostedZone.zoneName]
      if (domainNames && domainNames.length > 0) {
        requestorFunction.addToRolePolicy(
          new iam.PolicyStatement({
            actions: ['route53:ChangeResourceRecordSets'],
            resources: [`arn:aws:route53:::hostedzone/${this.normalizeHostedZoneId(zone.hostedZone.hostedZoneId)}`],
            conditions: {
              'ForAllValues:StringEquals': {
                'route53:ChangeResourceRecordSetsRecordTypes': ['CNAME'],
                'route53:ChangeResourceRecordSetsActions': ['UPSERT', 'DELETE'],
              },
              'ForAllValues:StringLike': {
                'route53:ChangeResourceRecordSetsNormalizedRecordNames': domainNames.map((name, index) => {
                  return this.wildcardDomainName(`DomainWildcard${zone.hostedZone.node.id}${index}`, name)
                }),
              },
            },
          })
        )
      }
    })

    const requestorProvider = new custom_resources.Provider(this, 'RequestorProvider', {
      onEventHandler: requestorFunction,
    })

    const validationHostedZones = props.validationHostedZones.map<[string, ValidationHostedZoneProperties]>((zone) => {
      const properties: ValidationHostedZoneProperties = {
        DomainName: this.normalizeDomainName(zone.hostedZone.zoneName),
        HostedZoneId: this.normalizeHostedZoneId(zone.hostedZone.hostedZoneId),
        ValidationRoleArn: zone.validationRole?.roleArn,
        ValidationExternalId: zone.validationExternalId,
      }
      return [properties.DomainName, properties]
    })

    const properties: Properties = {
      DomainName: domainName,
      AlternativeDomainNames: alternativeDomainNames,
      ValidationHostedZones: Object.fromEntries(validationHostedZones),
      CertificateRegion: this.certificateRegion,
      CleanupValidationRecords: booleanToString(props.cleanupValidationRecords ?? true),
      TransparencyLoggingEnabled: booleanToString(props.transparencyLoggingEnabled ?? true),
      Tags: cdk.Lazy.any({ produce: () => this.tags.renderTags() }) as unknown as Record<string, string>,
      RemovalPolicy: cdk.Lazy.string({ produce: () => this.removalPolicy }),
    }

    const certificate = new cdk.CustomResource(this, 'RequestorResource', {
      serviceToken: requestorProvider.serviceToken,
      resourceType: DNS_VALIDATED_CERTIFICATE_TYPE,
      properties,
    })

    this.certificateArn = certificate.getAttString('Arn')

    this.node.addValidation({
      validate: () =>
        this.validateDomainsToHostedZones(
          allDomains,
          validationHostedZones.map(([zoneName, _]) => zoneName)
        ),
    })
  }

  metricDaysToExpiry(props?: cdk.aws_cloudwatch.MetricOptions | undefined): cdk.aws_cloudwatch.Metric {
    return new cloudwatch.Metric({
      period: cdk.Duration.days(1),
      ...props,
      dimensionsMap: { CertificateArn: this.certificateArn },
      metricName: 'DaysToExpiry',
      namespace: 'AWS/CertificateManager',
      region: this.certificateRegion,
      statistic: cloudwatch.Stats.MINIMUM,
    })
  }

  applyRemovalPolicy(policy: cdk.RemovalPolicy): void {
    this.removalPolicy = policy
  }

  private normalizeDomainName(domainName: string): string {
    if (cdk.Token.isUnresolved(domainName)) {
      return domainName
    }
    return cleanDomainName(domainName)
  }

  private normalizeHostedZoneId(hostedZoneId: string): string {
    if (cdk.Token.isUnresolved(hostedZoneId)) {
      return hostedZoneId
    }
    return cleanHostedZoneId(hostedZoneId)
  }

  private wildcardDomainName(id: string, domainName: string): string {
    const parts = cdk.Fn.split('.', domainName)
    const first = cdk.Fn.select(0, parts)
    const isWildcard = new cdk.CfnCondition(this, `Is${id}`, {
      expression: cdk.Fn.conditionEquals(first, '*'),
    })
    return cdk.Fn.conditionIf(isWildcard.logicalId, domainName, `*.${domainName}`).toString()
  }

  private validateDomainsToHostedZones(domainNames: string[], zoneNames: string[]): string[] {
    const errors: string[] = []
    for (const domainName of domainNames) {
      const resolvableDomainName = !cdk.Token.isUnresolved(domainName)
      const resolvableZoneNames = !zoneNames.some((zoneName) => cdk.Token.isUnresolved(zoneName))
      if (resolvableDomainName && resolvableZoneNames && !zoneNames.some((zoneName) => domainName.endsWith(zoneName))) {
        errors.push(`Domain ${domainName} is not provided with authoritative hosted zone`)
      }
    }
    return errors
  }
}
