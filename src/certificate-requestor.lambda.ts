import * as crypto from 'crypto'
import {
  ACMClient,
  AddTagsToCertificateCommand,
  AddTagsToCertificateCommandInput,
  CertificateDetail,
  DeleteCertificateCommand,
  DeleteCertificateCommandInput,
  DescribeCertificateCommand,
  DescribeCertificateCommandInput,
  RequestCertificateCommand,
  RequestCertificateCommandInput,
  waitUntilCertificateValidated,
} from '@aws-sdk/client-acm'
import {
  ChangeAction,
  ChangeResourceRecordSetsCommand,
  ChangeResourceRecordSetsCommandInput,
  InvalidChangeBatch,
  ResourceRecordSet,
  Route53Client,
  waitUntilResourceRecordSetsChanged,
} from '@aws-sdk/client-route-53'
import { AssumeRoleCommand, AssumeRoleCommandInput, STSClient } from '@aws-sdk/client-sts'
import type { AwsCredentialIdentity, Provider } from '@aws-sdk/types'
import type { CloudFormationCustomResourceEvent } from 'aws-lambda'
import {
  cleanChangeId,
  cleanDomainName,
  containsSame,
  objectToString,
  orderBySignificance,
  stringToBoolean,
  tryFor,
} from './utils'

export type ValidationHostedZoneProperties = {
  DomainName: string
  HostedZoneId: string
  ValidationRoleArn?: string
  ValidationExternalId?: string
}

export type Properties = {
  DomainName: string
  AlternativeDomainNames?: string[]
  ValidationHostedZones: Record<string, ValidationHostedZoneProperties>
  CertificateRegion: string
  CleanupValidationRecords: string
  TransparencyLoggingEnabled: string
  Tags?: Record<string, string>
  RemovalPolicy: string
}

type Route53Factory = (roleArn: string | undefined, externalId: string | undefined) => Route53Client

const parseProperties = (properties: Record<string, any>): Properties => {
  // maybe should actually parse and not just assume
  return properties as unknown as Properties
}

const parseDomainValidationRecords = (certificate: CertificateDetail): ResourceRecordSet[] | null => {
  const options = certificate.DomainValidationOptions ?? []
  if (options.length > 0 && options.every((opt) => opt.ResourceRecord?.Name)) {
    const uniqueRecords = [...new Map(options.map((opt) => [opt.ResourceRecord?.Name!, opt.ResourceRecord!])).values()]
    return uniqueRecords.map((record) => {
      return {
        Name: record.Name,
        Type: record.Type,
        TTL: 30,
        ResourceRecords: [
          {
            Value: record.Value,
          },
        ],
      }
    })
  }
  return null
}

const changeRecordSets = async (
  route53: Route53Client,
  action: ChangeAction,
  records: ResourceRecordSet[],
  hostedZoneId: string
): Promise<void> => {
  const changeRecordSetsInput: ChangeResourceRecordSetsCommandInput = {
    HostedZoneId: hostedZoneId,
    ChangeBatch: {
      Changes: records.map((record) => ({
        Action: action,
        ResourceRecordSet: record,
      })),
    },
  }
  try {
    const { ChangeInfo } = await route53.send(new ChangeResourceRecordSetsCommand(changeRecordSetsInput))
    const changeId = ChangeInfo?.Id!
    const result = await waitUntilResourceRecordSetsChanged({ client: route53, maxWaitTime: 180 }, { Id: changeId })
    if (result.state !== 'SUCCESS') {
      throw new Error(
        `Validation records never changed for hosted zone ${hostedZoneId}: [${result.state}] ${result.reason ?? ''}`
      )
    }
    const operation = action === 'CREATE' || action === 'UPSERT' ? 'changed' : 'deleted'
    const change = cleanChangeId(changeId)
    console.log(`Validation records succesfully ${operation} for hosted zone ${hostedZoneId} with change id ${change}`)
  } catch (error: unknown) {
    if (action === 'DELETE' && error instanceof InvalidChangeBatch && error.message.includes('not found')) {
      // there's a deletion race condition where some other certificate has already deleted the records
      console.log(`All validation records have already been removed by some other certificate`)
    } else {
      throw error
    }
  }
}

const getRecordsForZoneNames = (
  records: ResourceRecordSet[],
  zoneNames: string[],
  result?: Record<string, ResourceRecordSet[]>
): Record<string, ResourceRecordSet[]> => {
  const [zoneName, ...restZoneNames] = zoneNames
  if (!zoneName) {
    return result ?? {}
  }
  const matchingRecords: ResourceRecordSet[] = []
  const unmatchingRecords: ResourceRecordSet[] = []
  for (const record of records) {
    const normalizedRecordName = cleanDomainName(record.Name!)
    if (normalizedRecordName === zoneName || normalizedRecordName.endsWith('.' + zoneName)) {
      matchingRecords.push(record)
    } else {
      unmatchingRecords.push(record)
    }
  }
  return getRecordsForZoneNames(unmatchingRecords, restZoneNames, {
    ...(result ?? {}),
    [zoneName]: matchingRecords,
  })
}

const requestCertificate = async (
  acm: ACMClient,
  route53: Route53Factory,
  requestId: string,
  properties: Properties
): Promise<string> => {
  const { DomainName, AlternativeDomainNames, TransparencyLoggingEnabled } = properties

  console.log(`Requesting certificate for ${DomainName}`)

  const requestCertificateInput: RequestCertificateCommandInput = {
    DomainName,
    SubjectAlternativeNames: AlternativeDomainNames,
    IdempotencyToken: crypto.createHash('sha256').update(requestId).digest('hex').slice(0, 32),
    ValidationMethod: 'DNS',
    Options: {
      CertificateTransparencyLoggingPreference: TransparencyLoggingEnabled ? 'ENABLED' : 'DISABLED',
    },
  }
  const { CertificateArn } = await acm.send(new RequestCertificateCommand(requestCertificateInput))

  console.log(`Certificate ${CertificateArn} requested`)

  const validationMaxSeconds = 180
  const validationTimeoutError = `Domain validation options were not found in ${validationMaxSeconds} seconds`
  const validationRecords = await tryFor(validationMaxSeconds, validationTimeoutError, async () => {
    const describeCertificateInput: DescribeCertificateCommandInput = {
      CertificateArn,
    }
    const { Certificate } = await acm.send(new DescribeCertificateCommand(describeCertificateInput))
    return parseDomainValidationRecords(Certificate!)
  })

  const hostedZones = Object.values(properties.ValidationHostedZones)
  const hostedZoneIds = hostedZones.map((zone) => zone.HostedZoneId)

  console.log(
    `Upserting ${validationRecords.length} validation record(s) into hosted zone(s) ${hostedZoneIds.join(', ')}:`
  )
  validationRecords.forEach((record) =>
    console.log(`${record.Name} ${record.Type} ${record.ResourceRecords?.map((rr) => rr.Value).join(',')}`)
  )

  const recordsForZoneNames = getRecordsForZoneNames(
    validationRecords,
    orderBySignificance(Object.keys(properties.ValidationHostedZones))
  )
  for (const hostedZone of hostedZones) {
    const records = recordsForZoneNames[hostedZone.DomainName]
    if (records.length > 0) {
      await changeRecordSets(
        route53(hostedZone.ValidationRoleArn, hostedZone.ValidationExternalId),
        'UPSERT',
        records,
        hostedZone.HostedZoneId
      )
    }
  }

  console.log(`Waiting for certificate ${CertificateArn} to validate`)
  const result = await waitUntilCertificateValidated({ client: acm, maxWaitTime: 300 }, { CertificateArn })
  if (result.state !== 'SUCCESS') {
    throw new Error(`Certificate failed ${CertificateArn} to validate: [${result.state}] ${result.reason ?? ''}`)
  }
  console.log(`Certificate ${CertificateArn} successfully validated`)
  return CertificateArn!
}

const deleteCertificate = async (
  acm: ACMClient,
  route53: Route53Factory,
  certificateArn: string,
  properties: Properties
): Promise<void> => {
  console.log(`Waiting for certificate ${certificateArn} usage to drain before deletion`)

  const waitUsageMaxSeconds = 600
  const waitUsageTimeoutError = `Certificate was still in use after ${waitUsageMaxSeconds} seconds`
  const certificate = await tryFor(waitUsageMaxSeconds, waitUsageTimeoutError, async () => {
    const describeCertificateInput: DescribeCertificateCommandInput = {
      CertificateArn: certificateArn,
    }
    const { Certificate } = await acm.send(new DescribeCertificateCommand(describeCertificateInput))
    const inUseBy = Certificate?.InUseBy ?? []
    if (inUseBy.length > 0) {
      return null
    }
    return Certificate!
  })
  console.log('Certificate is unused and will be deleted')

  const validationRecords = parseDomainValidationRecords(certificate)
  if (validationRecords && stringToBoolean(properties.CleanupValidationRecords)) {
    const hostedZones = Object.values(properties.ValidationHostedZones)
    const hostedZoneIds = hostedZones.map((zone) => zone.HostedZoneId)

    console.log(
      `Deleting ${validationRecords.length} validation record(s) from hosted zone(s) ${hostedZoneIds.join(', ')}`
    )

    const recordsForZoneNames = getRecordsForZoneNames(
      validationRecords,
      orderBySignificance(Object.keys(properties.ValidationHostedZones))
    )
    for (const hostedZone of hostedZones) {
      const records = recordsForZoneNames[hostedZone.DomainName]
      if (records.length > 0) {
        await changeRecordSets(
          route53(hostedZone.ValidationRoleArn, hostedZone.ValidationExternalId),
          'DELETE',
          records,
          hostedZone.HostedZoneId
        )
      }
    }
  }

  console.log(`Deleting certificate ${certificateArn} from ACM`)
  const deleteCertificateInput: DeleteCertificateCommandInput = {
    CertificateArn: certificateArn,
  }
  await acm.send(new DeleteCertificateCommand(deleteCertificateInput))
  console.log(`Certificate ${certificateArn} successfully deleted`)
}

const addTags = async (acm: ACMClient, certificateArn: string, tags: Record<string, string>) => {
  const tagList = Array.from(Object.entries(tags).map(([Key, Value]) => ({ Key, Value })))
  const addTagsInput: AddTagsToCertificateCommandInput = {
    CertificateArn: certificateArn,
    Tags: tagList,
  }

  console.log(`Adding ${tagList.length} tags to certificate ${certificateArn}`)
  await acm.send(new AddTagsToCertificateCommand(addTagsInput))
  console.log(`All tags successfully added to certificate ${certificateArn}`)
}

const shouldRequestNew = (oldProperties: Properties, newProperties: Properties): boolean => {
  const oldHostedZoneIds = Object.values(oldProperties.ValidationHostedZones ?? {}).map((zone) => zone.HostedZoneId)
  const newHostedZoneIds = Object.values(newProperties.ValidationHostedZones ?? {}).map((zone) => zone.HostedZoneId)
  if (!containsSame(oldHostedZoneIds, newHostedZoneIds)) return true
  if (oldProperties.DomainName !== newProperties.DomainName) return true
  if (!containsSame(oldProperties.AlternativeDomainNames ?? [], newProperties.AlternativeDomainNames ?? [])) return true
  if (oldProperties.CertificateRegion !== newProperties.CertificateRegion) return true
  if (oldProperties.CleanupValidationRecords !== newProperties.CleanupValidationRecords) return true
  if (oldProperties.TransparencyLoggingEnabled !== newProperties.TransparencyLoggingEnabled) return true
  if (oldProperties.RemovalPolicy !== newProperties.RemovalPolicy) return true
  return false
}

const assumeRole = (
  roleArn: string | undefined,
  externalId: string | undefined
): Provider<AwsCredentialIdentity> | undefined => {
  if (!roleArn) {
    return undefined
  }
  return async () => {
    const sts = new STSClient({ retryMode: 'adaptive' })
    const assumeRoleInput: AssumeRoleCommandInput = {
      RoleArn: roleArn,
      RoleSessionName: 'CertificateRequestor',
      ExternalId: externalId,
    }
    const { Credentials } = await sts.send(new AssumeRoleCommand(assumeRoleInput))
    return {
      accessKeyId: Credentials?.AccessKeyId!,
      secretAccessKey: Credentials?.SecretAccessKey!,
      sessionToken: Credentials?.SessionToken!,
      expiration: Credentials?.Expiration,
    }
  }
}

export const handler = async (event: CloudFormationCustomResourceEvent) => {
  const properties = parseProperties(event.ResourceProperties)

  const acm = new ACMClient({ region: properties.CertificateRegion, retryMode: 'adaptive' })
  const route53 = (roleArn: string | undefined, externalId: string | undefined): Route53Client => {
    return new Route53Client({
      retryMode: 'adaptive',
      credentials: assumeRole(roleArn, externalId),
    })
  }

  switch (event.RequestType) {
    case 'Create': {
      console.log(`Requesting new certificate:\n${objectToString(properties)}`)
      const certificateArn = await requestCertificate(acm, route53, event.RequestId, properties)
      if (properties.Tags && Object.entries(properties.Tags).length > 0) {
        await addTags(acm, certificateArn, properties.Tags)
      }
      return {
        PhysicalResourceId: certificateArn,
        Data: {
          Arn: certificateArn,
        },
      }
    }
    case 'Update': {
      let certificateArn = event.PhysicalResourceId
      if (shouldRequestNew(parseProperties(event.OldResourceProperties), properties)) {
        console.log(`Requesting new certificate due to change of properties:\n${objectToString(properties)}`)
        certificateArn = await requestCertificate(acm, route53, event.RequestId, properties)
      }
      if (properties.Tags && Object.entries(properties.Tags).length > 0) {
        await addTags(acm, certificateArn, properties.Tags)
      }
      return {
        PhysicalResourceId: certificateArn,
        Data: {
          Arn: certificateArn,
        },
      }
    }
    case 'Delete': {
      const certificateArn = event.PhysicalResourceId
      if (properties.RemovalPolicy === 'destroy') {
        console.log(`Deleting old certificate as per removal policy:\n${objectToString(properties)}`)
        await deleteCertificate(acm, route53, certificateArn, properties)
      }
      return {
        PhysicalResourceId: certificateArn,
        Data: {
          Arn: certificateArn,
        },
      }
    }
  }
  throw new Error(`Invalid request type`)
}
