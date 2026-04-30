# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### CrossAccountValidationRole <a name="CrossAccountValidationRole" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole"></a>

An IAM role for cross-account certificate DNS validation.

This role should be deployed in the account that owns the Route53 hosted zones.
The ``DnsValidatedCertificate`` construct in the certificate account will assume
this role to create and delete DNS validation records.

Extends ``iam.Role`` directly, so it can be customized with additional policies
or passed anywhere an ``iam.IRole`` is accepted.

*Example*

```typescript
const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
  hostedZoneId: 'Z1234567890',
  zoneName: 'example.com',
})

const validationRole = new CrossAccountValidationRole(this, 'ValidationRole', {
  trustedAccounts: ['123456789012'],
  hostedZones: [hostedZone],
  allowedDomainNames: ['example.com', '*.example.com'],
})
```


#### Initializers <a name="Initializers" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.Initializer"></a>

```typescript
import { CrossAccountValidationRole } from '@trautonen/cdk-dns-validated-certificate'

new CrossAccountValidationRole(scope: Construct, id: string, props: CrossAccountValidationRoleProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.Initializer.parameter.props">props</a></code> | <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRoleProps">CrossAccountValidationRoleProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.Initializer.parameter.props"></a>

- *Type:* <a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRoleProps">CrossAccountValidationRoleProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.with">with</a></code> | Applies one or more mixins to this construct. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.applyRemovalPolicy">applyRemovalPolicy</a></code> | Apply the given removal policy to this resource. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.addManagedPolicy">addManagedPolicy</a></code> | Attaches a managed policy to this role. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.addToPolicy">addToPolicy</a></code> | Add to the policy of this principal. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.addToPrincipalPolicy">addToPrincipalPolicy</a></code> | Adds a permission to the role's default policy document. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.attachInlinePolicy">attachInlinePolicy</a></code> | Attaches a policy to this role. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.grant">grant</a></code> | Grant the actions defined in actions to the identity Principal on this resource. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.grantAssumeRole">grantAssumeRole</a></code> | Grant permissions to the given principal to assume this role. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.grantPassRole">grantPassRole</a></code> | Grant permissions to the given principal to pass this role. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.withoutPolicyUpdates">withoutPolicyUpdates</a></code> | Return a copy of this Role object whose Policies will not be updated. |

---

##### `toString` <a name="toString" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `with` <a name="with" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.with"></a>

```typescript
public with(mixins: ...IMixin[]): IConstruct
```

Applies one or more mixins to this construct.

Mixins are applied in order. The list of constructs is captured at the
start of the call, so constructs added by a mixin will not be visited.
Use multiple `with()` calls if subsequent mixins should apply to added
constructs.

###### `mixins`<sup>Required</sup> <a name="mixins" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.with.parameter.mixins"></a>

- *Type:* ...constructs.IMixin[]

The mixins to apply.

---

##### `applyRemovalPolicy` <a name="applyRemovalPolicy" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.applyRemovalPolicy"></a>

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

###### `policy`<sup>Required</sup> <a name="policy" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.applyRemovalPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.RemovalPolicy

---

##### `addManagedPolicy` <a name="addManagedPolicy" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.addManagedPolicy"></a>

```typescript
public addManagedPolicy(policy: IManagedPolicy): void
```

Attaches a managed policy to this role.

###### `policy`<sup>Required</sup> <a name="policy" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.addManagedPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.aws_iam.IManagedPolicy

The the managed policy to attach.

---

##### `addToPolicy` <a name="addToPolicy" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.addToPolicy"></a>

```typescript
public addToPolicy(statement: PolicyStatement): boolean
```

Add to the policy of this principal.

###### `statement`<sup>Required</sup> <a name="statement" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.addToPolicy.parameter.statement"></a>

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement

---

##### `addToPrincipalPolicy` <a name="addToPrincipalPolicy" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.addToPrincipalPolicy"></a>

```typescript
public addToPrincipalPolicy(statement: PolicyStatement): AddToPrincipalPolicyResult
```

Adds a permission to the role's default policy document.

If there is no default policy attached to this role, it will be created.

###### `statement`<sup>Required</sup> <a name="statement" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.addToPrincipalPolicy.parameter.statement"></a>

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement

The permission statement to add to the policy document.

---

##### `attachInlinePolicy` <a name="attachInlinePolicy" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.attachInlinePolicy"></a>

```typescript
public attachInlinePolicy(policy: Policy): void
```

Attaches a policy to this role.

###### `policy`<sup>Required</sup> <a name="policy" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.attachInlinePolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.aws_iam.Policy

The policy to attach.

---

##### `grant` <a name="grant" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.grant"></a>

```typescript
public grant(grantee: IPrincipal, actions: ...string[]): Grant
```

Grant the actions defined in actions to the identity Principal on this resource.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.grant.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IPrincipal

---

###### `actions`<sup>Required</sup> <a name="actions" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.grant.parameter.actions"></a>

- *Type:* ...string[]

---

##### `grantAssumeRole` <a name="grantAssumeRole" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.grantAssumeRole"></a>

```typescript
public grantAssumeRole(identity: IPrincipal): Grant
```

Grant permissions to the given principal to assume this role.

###### `identity`<sup>Required</sup> <a name="identity" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.grantAssumeRole.parameter.identity"></a>

- *Type:* aws-cdk-lib.aws_iam.IPrincipal

---

##### `grantPassRole` <a name="grantPassRole" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.grantPassRole"></a>

```typescript
public grantPassRole(identity: IPrincipal): Grant
```

Grant permissions to the given principal to pass this role.

###### `identity`<sup>Required</sup> <a name="identity" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.grantPassRole.parameter.identity"></a>

- *Type:* aws-cdk-lib.aws_iam.IPrincipal

---

##### `withoutPolicyUpdates` <a name="withoutPolicyUpdates" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.withoutPolicyUpdates"></a>

```typescript
public withoutPolicyUpdates(options?: WithoutPolicyUpdatesOptions): IRole
```

Return a copy of this Role object whose Policies will not be updated.

Use the object returned by this method if you want this Role to be used by
a construct without it automatically updating the Role's Policies.

If you do, you are responsible for adding the correct statements to the
Role's policies yourself.

###### `options`<sup>Optional</sup> <a name="options" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.withoutPolicyUpdates.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_iam.WithoutPolicyUpdatesOptions

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.isOwnedResource">isOwnedResource</a></code> | Returns true if the construct was created by CDK, and false otherwise. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.isResource">isResource</a></code> | Check whether the given construct is a Resource. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.customizeRoles">customizeRoles</a></code> | Customize the creation of IAM roles within the given scope. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.fromRoleArn">fromRoleArn</a></code> | Import an external role by ARN. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.fromRoleName">fromRoleName</a></code> | Import an external role by name. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.isRole">isRole</a></code> | Return whether the given object is a Role. |

---

##### `isConstruct` <a name="isConstruct" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.isConstruct"></a>

```typescript
import { CrossAccountValidationRole } from '@trautonen/cdk-dns-validated-certificate'

CrossAccountValidationRole.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isOwnedResource` <a name="isOwnedResource" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.isOwnedResource"></a>

```typescript
import { CrossAccountValidationRole } from '@trautonen/cdk-dns-validated-certificate'

CrossAccountValidationRole.isOwnedResource(construct: IConstruct)
```

Returns true if the construct was created by CDK, and false otherwise.

###### `construct`<sup>Required</sup> <a name="construct" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.isOwnedResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `isResource` <a name="isResource" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.isResource"></a>

```typescript
import { CrossAccountValidationRole } from '@trautonen/cdk-dns-validated-certificate'

CrossAccountValidationRole.isResource(construct: IConstruct)
```

Check whether the given construct is a Resource.

###### `construct`<sup>Required</sup> <a name="construct" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.isResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `customizeRoles` <a name="customizeRoles" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.customizeRoles"></a>

```typescript
import { CrossAccountValidationRole } from '@trautonen/cdk-dns-validated-certificate'

CrossAccountValidationRole.customizeRoles(scope: Construct, options?: CustomizeRolesOptions)
```

Customize the creation of IAM roles within the given scope.

It is recommended that you **do not** use this method and instead allow
CDK to manage role creation. This should only be used
in environments where CDK applications are not allowed to created IAM roles.

This can be used to prevent the CDK application from creating roles
within the given scope and instead replace the references to the roles with
precreated role names. A report will be synthesized in the cloud assembly (i.e. cdk.out)
that will contain the list of IAM roles that would have been created along with the
IAM policy statements that the role should contain. This report can then be used
to create the IAM roles outside of CDK and then the created role names can be provided
in `usePrecreatedRoles`.

*Example*

```typescript
declare const app: App;
iam.Role.customizeRoles(app, {
  usePrecreatedRoles: {
    'ConstructPath/To/Role': 'my-precreated-role-name',
  },
});
```


###### `scope`<sup>Required</sup> <a name="scope" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.customizeRoles.parameter.scope"></a>

- *Type:* constructs.Construct

construct scope to customize role creation.

---

###### `options`<sup>Optional</sup> <a name="options" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.customizeRoles.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_iam.CustomizeRolesOptions

options for configuring role creation.

---

##### `fromRoleArn` <a name="fromRoleArn" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.fromRoleArn"></a>

```typescript
import { CrossAccountValidationRole } from '@trautonen/cdk-dns-validated-certificate'

CrossAccountValidationRole.fromRoleArn(scope: Construct, id: string, roleArn: string, options?: FromRoleArnOptions)
```

Import an external role by ARN.

If the imported Role ARN is a Token (such as a
`CfnParameter.valueAsString` or a `Fn.importValue()`) *and* the referenced
role has a `path` (like `arn:...:role/AdminRoles/Alice`), the
`roleName` property will not resolve to the correct value. Instead it
will resolve to the first path component. We unfortunately cannot express
the correct calculation of the full path name as a CloudFormation
expression. In this scenario the Role ARN should be supplied without the
`path` in order to resolve the correct role resource.

###### `scope`<sup>Required</sup> <a name="scope" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.fromRoleArn.parameter.scope"></a>

- *Type:* constructs.Construct

construct scope.

---

###### `id`<sup>Required</sup> <a name="id" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.fromRoleArn.parameter.id"></a>

- *Type:* string

construct id.

---

###### `roleArn`<sup>Required</sup> <a name="roleArn" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.fromRoleArn.parameter.roleArn"></a>

- *Type:* string

the ARN of the role to import.

---

###### `options`<sup>Optional</sup> <a name="options" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.fromRoleArn.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_iam.FromRoleArnOptions

allow customizing the behavior of the returned role.

---

##### `fromRoleName` <a name="fromRoleName" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.fromRoleName"></a>

```typescript
import { CrossAccountValidationRole } from '@trautonen/cdk-dns-validated-certificate'

CrossAccountValidationRole.fromRoleName(scope: Construct, id: string, roleName: string, options?: FromRoleNameOptions)
```

Import an external role by name.

The imported role is assumed to exist in the same account as the account
the scope's containing Stack is being deployed to.

###### `scope`<sup>Required</sup> <a name="scope" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.fromRoleName.parameter.scope"></a>

- *Type:* constructs.Construct

construct scope.

---

###### `id`<sup>Required</sup> <a name="id" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.fromRoleName.parameter.id"></a>

- *Type:* string

construct id.

---

###### `roleName`<sup>Required</sup> <a name="roleName" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.fromRoleName.parameter.roleName"></a>

- *Type:* string

the name of the role to import.

---

###### `options`<sup>Optional</sup> <a name="options" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.fromRoleName.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_iam.FromRoleNameOptions

allow customizing the behavior of the returned role.

---

##### `isRole` <a name="isRole" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.isRole"></a>

```typescript
import { CrossAccountValidationRole } from '@trautonen/cdk-dns-validated-certificate'

CrossAccountValidationRole.isRole(x: any)
```

Return whether the given object is a Role.

###### `x`<sup>Required</sup> <a name="x" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.isRole.parameter.x"></a>

- *Type:* any

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.property.assumeRoleAction">assumeRoleAction</a></code> | <code>string</code> | When this Principal is used in an AssumeRole policy, the action to use. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.property.grantPrincipal">grantPrincipal</a></code> | <code>aws-cdk-lib.aws_iam.IPrincipal</code> | The principal to grant permissions to. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.property.policyFragment">policyFragment</a></code> | <code>aws-cdk-lib.aws_iam.PrincipalPolicyFragment</code> | Returns the role. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.property.roleArn">roleArn</a></code> | <code>string</code> | Returns the ARN of this role. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.property.roleId">roleId</a></code> | <code>string</code> | Returns the stable and unique string identifying the role. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.property.roleName">roleName</a></code> | <code>string</code> | Returns the name of the role. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.property.assumeRolePolicy">assumeRolePolicy</a></code> | <code>aws-cdk-lib.aws_iam.PolicyDocument</code> | The assume role policy document associated with this role. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.property.permissionsBoundary">permissionsBoundary</a></code> | <code>aws-cdk-lib.aws_iam.IManagedPolicy</code> | Returns the permissions boundary attached to this role. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.property.principalAccount">principalAccount</a></code> | <code>string</code> | The AWS account ID of this principal. |

---

##### `node`<sup>Required</sup> <a name="node" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.property.env"></a>

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

##### `stack`<sup>Required</sup> <a name="stack" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `assumeRoleAction`<sup>Required</sup> <a name="assumeRoleAction" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.property.assumeRoleAction"></a>

```typescript
public readonly assumeRoleAction: string;
```

- *Type:* string

When this Principal is used in an AssumeRole policy, the action to use.

---

##### `grantPrincipal`<sup>Required</sup> <a name="grantPrincipal" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.property.grantPrincipal"></a>

```typescript
public readonly grantPrincipal: IPrincipal;
```

- *Type:* aws-cdk-lib.aws_iam.IPrincipal

The principal to grant permissions to.

---

##### `policyFragment`<sup>Required</sup> <a name="policyFragment" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.property.policyFragment"></a>

```typescript
public readonly policyFragment: PrincipalPolicyFragment;
```

- *Type:* aws-cdk-lib.aws_iam.PrincipalPolicyFragment

Returns the role.

---

##### `roleArn`<sup>Required</sup> <a name="roleArn" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.property.roleArn"></a>

```typescript
public readonly roleArn: string;
```

- *Type:* string

Returns the ARN of this role.

---

##### `roleId`<sup>Required</sup> <a name="roleId" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.property.roleId"></a>

```typescript
public readonly roleId: string;
```

- *Type:* string

Returns the stable and unique string identifying the role.

For example,
AIDAJQABLZS4A3QDU576Q.

---

##### `roleName`<sup>Required</sup> <a name="roleName" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.property.roleName"></a>

```typescript
public readonly roleName: string;
```

- *Type:* string

Returns the name of the role.

---

##### `assumeRolePolicy`<sup>Optional</sup> <a name="assumeRolePolicy" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.property.assumeRolePolicy"></a>

```typescript
public readonly assumeRolePolicy: PolicyDocument;
```

- *Type:* aws-cdk-lib.aws_iam.PolicyDocument

The assume role policy document associated with this role.

---

##### `permissionsBoundary`<sup>Optional</sup> <a name="permissionsBoundary" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.property.permissionsBoundary"></a>

```typescript
public readonly permissionsBoundary: IManagedPolicy;
```

- *Type:* aws-cdk-lib.aws_iam.IManagedPolicy

Returns the permissions boundary attached to this role.

---

##### `principalAccount`<sup>Optional</sup> <a name="principalAccount" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRole.property.principalAccount"></a>

```typescript
public readonly principalAccount: string;
```

- *Type:* string

The AWS account ID of this principal.

Can be undefined when the account is not known
(for example, for service principals).
Can be a Token - in that case,
it's assumed to be AWS::AccountId.

---


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
| <code><a href="#@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.with">with</a></code> | Applies one or more mixins to this construct. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.applyRemovalPolicy">applyRemovalPolicy</a></code> | Apply the given removal policy to this resource. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.metricDaysToExpiry">metricDaysToExpiry</a></code> | Return the DaysToExpiry metric for this AWS Certificate Manager Certificate. By default, this is the minimum value over 1 day. |

---

##### `toString` <a name="toString" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `with` <a name="with" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.with"></a>

```typescript
public with(mixins: ...IMixin[]): IConstruct
```

Applies one or more mixins to this construct.

Mixins are applied in order. The list of constructs is captured at the
start of the call, so constructs added by a mixin will not be visited.
Use multiple `with()` calls if subsequent mixins should apply to added
constructs.

###### `mixins`<sup>Required</sup> <a name="mixins" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.with.parameter.mixins"></a>

- *Type:* ...constructs.IMixin[]

The mixins to apply.

---

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

##### `isConstruct` <a name="isConstruct" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.isConstruct"></a>

```typescript
import { DnsValidatedCertificate } from '@trautonen/cdk-dns-validated-certificate'

DnsValidatedCertificate.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

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
| <code><a href="#@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.property.certificateRef">certificateRef</a></code> | <code>any</code> | A reference to a Certificate resource. |
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

##### `certificateRef`<sup>Required</sup> <a name="certificateRef" id="@trautonen/cdk-dns-validated-certificate.DnsValidatedCertificate.property.certificateRef"></a>

```typescript
public readonly certificateRef: any;
```

- *Type:* any

A reference to a Certificate resource.

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

### CrossAccountValidationRoleProps <a name="CrossAccountValidationRoleProps" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRoleProps"></a>

#### Initializer <a name="Initializer" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRoleProps.Initializer"></a>

```typescript
import { CrossAccountValidationRoleProps } from '@trautonen/cdk-dns-validated-certificate'

const crossAccountValidationRoleProps: CrossAccountValidationRoleProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRoleProps.property.hostedZones">hostedZones</a></code> | <code>aws-cdk-lib.aws_route53.IHostedZone[]</code> | The Route53 hosted zones that the role is allowed to modify for certificate validation. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRoleProps.property.trustedAccounts">trustedAccounts</a></code> | <code>string[]</code> | The AWS account IDs that are allowed to assume this role for DNS validation. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRoleProps.property.allowedDomainNames">allowedDomainNames</a></code> | <code>string[]</code> | Domain names or wildcard patterns that the role is allowed to create validation records for. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRoleProps.property.externalId">externalId</a></code> | <code>string</code> | External ID for additional security when assuming the role. |
| <code><a href="#@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRoleProps.property.roleName">roleName</a></code> | <code>string</code> | The name of the IAM role. |

---

##### `hostedZones`<sup>Required</sup> <a name="hostedZones" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRoleProps.property.hostedZones"></a>

```typescript
public readonly hostedZones: IHostedZone[];
```

- *Type:* aws-cdk-lib.aws_route53.IHostedZone[]

The Route53 hosted zones that the role is allowed to modify for certificate validation.

The role will be granted ``route53:ChangeResourceRecordSets`` permission on these zones,
restricted to CNAME record types with UPSERT and DELETE actions only.

---

##### `trustedAccounts`<sup>Required</sup> <a name="trustedAccounts" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRoleProps.property.trustedAccounts"></a>

```typescript
public readonly trustedAccounts: string[];
```

- *Type:* string[]

The AWS account IDs that are allowed to assume this role for DNS validation.

These are the accounts where the ``DnsValidatedCertificate`` construct is deployed.

---

##### `allowedDomainNames`<sup>Optional</sup> <a name="allowedDomainNames" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRoleProps.property.allowedDomainNames"></a>

```typescript
public readonly allowedDomainNames: string[];
```

- *Type:* string[]
- *Default:* Allow validation records for any domain in the hosted zones.

Domain names or wildcard patterns that the role is allowed to create validation records for.

Each entry should be a domain name (e.g. ``example.com``) or a wildcard domain
(e.g. ``*.example.com``). For each domain, the role is allowed to create the ACM
validation CNAME record (``_<hash>.domain``) as well as wildcard variants.

If not specified, the role is allowed to create validation records for any domain
within the given hosted zones. It is recommended to specify this to further
restrict the role's permissions.

---

##### `externalId`<sup>Optional</sup> <a name="externalId" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRoleProps.property.externalId"></a>

```typescript
public readonly externalId: string;
```

- *Type:* string
- *Default:* No external ID required.

External ID for additional security when assuming the role.

When set, the assuming principal must provide this external ID.

---

##### `roleName`<sup>Optional</sup> <a name="roleName" id="@trautonen/cdk-dns-validated-certificate.CrossAccountValidationRoleProps.property.roleName"></a>

```typescript
public readonly roleName: string;
```

- *Type:* string
- *Default:* Auto-generated by CloudFormation.

The name of the IAM role.

---

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



