# WebSDK Endpoints Reference (from pytpp-master source code)

Source: `pytpp-master/pytpp/api/websdk/endpoints/*.py` (facts extracted directly from class names, URL
path strings, and `get`/`post`/`put`/`delete` method signatures in the code — not from the `docs/rst`
prose).

## File checklist (30 files found in the directory)

- [x] `__init__.py` — **empty package marker, not a resource area** (see note below)
- [x] authorize.py
- [x] certificates.py
- [x] client.py
- [x] codesign.py
- [x] config.py
- [x] config_schema.py
- [x] credentials.py
- [x] crypto.py
- [x] discovery.py
- [x] flow.py
- [x] hsm_api.py
- [x] identity.py
- [x] log.py
- [x] metadata.py
- [x] permissions.py
- [x] pki.py
- [x] platform.py
- [x] preferences.py
- [x] processing_engines.py
- [x] recycle_bin.py
- [x] revoke.py
- [x] secret_store.py
- [x] ssh.py
- [x] ssh_certificates.py
- [x] stats.py
- [x] system_status.py
- [x] teams.py
- [x] workflow.py
- [x] x509_certificate_store.py

**Count note:** the directory listing shows 30 `.py` files total, matching the prompt's "30 Python
files" count. However, `__init__.py` is empty (zero bytes) and does not mirror a REST resource area —
it's just the Python package marker. So there are **29 files that actually map to WebSDK resource
areas**, which is the number of sections below.

---

## 1. Auth

### `/Authorize` (authorize.py)
Handles legacy username/password authentication plus the newer OAuth token flows (the OAuth
sub-paths swap the `vedsdk` URL segment for `vedauth`). One sentence: this is the catalog of ways a
client obtains or verifies an API session token (legacy API key, OAuth client-certificate, device
code, integrated/Windows, password-grant OAuth, refresh token, and token verification).

| Path | Method | Purpose |
|---|---|---|
| `/Authorize` | POST | Legacy username/password login; returns `APIKey` token + `ValidUntil` |
| `/Authorize/Certificate` (vedauth) | POST | OAuth token via client certificate (`client_id`, `scope`) |
| `/Authorize/Device` (vedauth) | POST | OAuth device-code flow start (`device_code`, `user_code`, `verification_uri`) |
| `/Authorize/Integrated` (vedauth) | POST | OAuth integrated/Windows auth (`client_id`, `scope`, `state`) |
| `/Authorize/OAuth` (vedauth) | POST | OAuth password grant (`client_id`, `username`, `password`, `scope`) |
| `/Authorize/Token` (vedauth) | POST | Exchange/refresh an OAuth token (`refresh_token`, `grant_type`, `device_code`) |
| `/Authorize/Verify` (vedauth) | GET | Verify current token; returns `identity`, `scope`, `expires_unix_time` |

**Model file:** no dedicated `authorize.py` model; output classes are defined inline. Related model:
`models/oauth.py` (10 lines — small helper/type module for OAuth, used elsewhere for typing OAuth
responses).

### `/Revoke` (revoke.py) — also grouped here
Base path becomes `/vedauth/Revoke` (URL segment swapped like Authorize). One sentence: logs out /
invalidates the current token.

| Path | Method | Purpose |
|---|---|---|
| `/Revoke/Token` (vedauth) | GET | Revokes the current session token; client-side clears cached token after |

**Model file:** none dedicated; uses base `WebSdkOutputModel`.

---

## 2. Policy & Config

### `/Config` (config.py)
One sentence: the generic, low-level CRUD/attribute API for any TPP "configuration object" (policy
folders, device objects, application objects, etc.) addressed by DN — this is the most verbs-heavy
file after Certificates.

| Path | Method | Purpose |
|---|---|---|
| `/Config/AddDnValue` | POST | Append a DN-type value to an attribute |
| `/Config/AddPolicyValue` | POST | Add a policy-level attribute value (with `Locked` flag) |
| `/Config/AddValue` | POST | Append a plain value to an attribute |
| `/Config/ClearAttribute` | POST | Clear all values of an attribute |
| `/Config/ClearPolicyAttribute` | POST | Clear a policy attribute for a class |
| `/Config/ContainableClasses` | POST | List class names an object can contain |
| `/Config/Create` | POST | Create a new config object (`ObjectDN`, `Class`, `NameAttributeList`) |
| `/Config/DefaultDN` | GET | Get the install's default policy DN |
| `/Config/Delete` | POST | Delete an object (optionally recursive) |
| `/Config/DnToGuid` | POST | Resolve DN → GUID/class/revision |
| `/Config/Enumerate` | POST | List child objects under a DN (pattern/recursive) |
| `/Config/EnumerateAll` | POST | List all objects matching a pattern |
| `/Config/EnumerateObjectsDerivedFrom` | POST | List objects derived from a base class |
| `/Config/EnumeratePolicies` | POST | List policies that apply to a DN |
| `/Config/Find` | POST | Find objects by pattern + optional attribute names |
| `/Config/FindContainers` | POST | Find container objects under a DN |
| `/Config/FindObjectsOfClass` | POST | Find objects of one or more classes |
| `/Config/FindPolicy` | POST | Find policy DN + locked state + values for an attribute |
| `/Config/GetHighestRevision` | POST | Get highest revision number under a DN |
| `/Config/GetRevision` | POST | Get current revision number of an object |
| `/Config/GuidToDn` | POST | Resolve GUID → DN |
| `/Config/IdInfo` | POST | Resolve an object ID → GUID/class/revision |
| `/Config/IsValid` | POST | Validate that a DN or GUID exists |
| `/Config/MutateObject` | POST | Change an object's class |
| `/Config/Read` | POST | Read attribute values |
| `/Config/ReadAll` | POST | Read all name/value pairs on an object |
| `/Config/ReadDn` | POST | Read DN-typed attribute values |
| `/Config/ReadDnReferences` | POST | Read objects that reference this DN via an attribute |
| `/Config/ReadEffectivePolicy` | POST | Read effective (policy-resolved) attribute value + lock/override state |
| `/Config/ReadPolicy` | POST | Read a policy attribute's locked state + values for a class |
| `/Config/RemoveDnValue` | POST | Remove one DN value from an attribute |
| `/Config/RemovePolicyValue` | POST | Remove one policy attribute value |
| `/Config/RenameObject` | POST | Rename/move an object (new DN) |
| `/Config/Write` | POST | Write a batch of attribute data |
| `/Config/WriteDn` | POST | Write DN-typed attribute values |
| `/Config/WritePolicy` | POST | Write a policy-locked attribute value for a class |

**Model file:** `models/config.py` — key types referenced: `config.Object`, `config.Policy`,
`config.NameAttribute`, `config.Result` (a converter wraps raw result codes into `config.Result`).

### `/ConfigSchema` (config_schema.py)
One sentence: exposes the TPP configuration schema itself (class and attribute definitions) rather
than instance data.

| Path | Method | Purpose |
|---|---|---|
| `/ConfigSchema/Attributes` | POST | List all attribute definitions in the schema |
| `/ConfigSchema/Class` | POST | Get the class definition for a named class |

**Model file:** `models/config_schema.py` — `AttributeDefinition`, `ClassDefinition`, `Result`.

### `/Metadata` (metadata.py)
One sentence: manages TPP "custom fields" metadata item definitions and their values/policies on
config objects.

| Path | Method | Purpose |
|---|---|---|
| `/Metadata/DefineItem` | POST | Define a new custom-field metadata item |
| `/Metadata/Find` | POST | Find objects by item/value |
| `/Metadata/FindItem` | POST | Find an item's GUID by name |
| `/Metadata/Get` | POST | Get metadata `Data` for a DN |
| `/Metadata/GetItemGuids` | POST | List item GUIDs set on a DN |
| `/Metadata/GetItems` | POST | List full item definitions set on a DN |
| `/Metadata/GetItemsForClass` | POST | List items applicable to a config class |
| `/Metadata/GetPolicyItems` | POST | List policy-level items for a DN |
| `/Metadata/Items` | GET | List all metadata item definitions |
| `/Metadata/LoadItem` | POST | Load one item by DN |
| `/Metadata/LoadItemGuid` | POST | Load one item's GUID by DN |
| `/Metadata/ReadEffectiveValues` | POST | Read effective values for an item on a DN |
| `/Metadata/ReadPolicy` | POST | Read policy values for an item + type |
| `/Metadata/Set` | POST | Set metadata values (`GuidData`, `KeepExisting`) |
| `/Metadata/SetPolicy` | POST | Set a policy-level metadata value (lockable) |
| `/Metadata/UndefineItem` | POST | Remove an item definition |
| `/Metadata/UpdateItem` | POST | Update an item definition |

**Model file:** `models/metadata.py` — `Item`, `Data`, `GuidData`, `PolicyItem`, `Update`, `Result`.

### `/Permissions` (permissions.py)
One sentence: manages object-level ACL permission bits (read/write/create/delete/revoke/etc.) for
principals on any config object, addressed by GUID → type → principal path segments.

| Path | Method | Purpose |
|---|---|---|
| `/Permissions/Object/{guid}` | GET | List principals with any permission on the object |
| `/Permissions/Object/{guid}/{ptype}/{pname}/{principal}` | GET/POST/PUT/DELETE | Read/create/update/remove explicit + implicit permission flags for one principal |
| `/Permissions/Object/{guid}/{ptype}/{principal}/Effective` | GET | Effective (computed) permissions for a principal |
| `/Permissions/Refresh` | GET | Force a permissions cache refresh |

**Model file:** `models/permissions.py` — `Permissions` (bundles the `IsXAllowed` boolean flags).

---

## 3. Certificates

### `/Certificates` (certificates.py)
One sentence: this is by far the largest/most action-rich resource file — it is the core
certificate lifecycle API (enroll, retrieve, renew, revoke, import, push to devices, validate).

| Path | Method | Purpose |
|---|---|---|
| `/Certificates` | GET | List/search certificates (filters, paging, `OptionalFields`) |
| `/Certificates` | HEAD | Get only `X-Record-Count` header for a filtered search |
| `/Certificates/Associate` | POST | Associate a certificate with an application DN |
| `/Certificates/CheckPolicy` | POST | Validate a CSR/PKCS10 against a policy DN |
| `/Certificates/Dissociate` | POST | Remove a certificate↔application association |
| `/Certificates/{guid}` | GET/PUT/DELETE | Read/update attributes/delete a certificate object by GUID |
| `/Certificates/{guid}/PreviousVersions` | GET | List prior certificate versions |
| `/Certificates/{guid}/ValidationResults` | GET | Get File/SslTls validation results |
| `/Certificates/Import` | POST | Import an existing cert + optional private key |
| `/Certificates/Push` | POST | Push a certificate to associated (or all) applications |
| `/Certificates/Renew` | POST | Renew a certificate (optionally with a new CSR) |
| `/Certificates/Request` | POST | Enroll/request a new certificate (huge parameter list: subject, SANs, key algo, CA, custom fields, etc.) |
| `/Certificates/Reset` | POST | Reset processing/revocation/private-key-mismatch state |
| `/Certificates/Retrieve` | GET/POST | Download certificate data in a given format (PEM/PKCS12/etc.) |
| `/Certificates/Retrieve/{vault_id}` | GET/POST | Retrieve by vault ID instead of DN |
| `/Certificates/Retry` | POST | Retry a stalled certificate operation |
| `/Certificates/Revoke` | POST | Revoke a certificate (by DN or thumbprint, with reason code) |
| `/Certificates/Validate` | POST | Validate a batch of certificate DNs/GUIDs |

**Model file:** `models/certificate.py` — key fields spotted: `Certificate`, `CertificateDetails`,
`CertificateFormat`, `CertificateFilter`, `ProcessingDetails`, `RenewalDetails`, `CSR`, `Policy`.

### `/RecycleBin` (recycle_bin.py) — grouped here as a certificate-adjacent lifecycle resource
One sentence: manages the deleted-object recycle bin (deletion/purge scheduling, restore, contents
browsing) that certificates and other config objects land in when deleted.

| Path | Method | Purpose |
|---|---|---|
| `/RecycleBin/DeletionTask` | POST | Start/stop the background deletion task |
| `/RecycleBin/Empty` | POST | Empty the recycle bin entirely |
| `/RecycleBin/GetConfiguration` | POST | Get deletion/purge retention configuration |
| `/RecycleBin/GetContents` | POST | List recycle bin items (paged by `Limit`) |
| `/RecycleBin/GetItem` | POST | Get one recycle bin item by GUID |
| `/RecycleBin/Purge` | POST | Permanently purge one item |
| `/RecycleBin/PurgeTask` | POST | Start/stop the purge task (optionally purge all) |
| `/RecycleBin/Restore` | POST | Restore a deleted item |
| `/RecycleBin/SetConfiguration` | POST | Set deletion/purge retention configuration |

**Model file:** `models/recycle_bin.py` — `Item`, `Deletion`, `Purge`, `Result`.

### `/X509CertificateStore` (x509_certificate_store.py) — grouped here
One sentence: a lower-level certificate-blob vault API (raw cert strings/collections keyed by vault
ID), distinct from the main `/Certificates` config-object API.

| Path | Method | Purpose |
|---|---|---|
| `/X509CertificateStore/Add` | POST | Store a certificate (or collection) string, returns `VaultId` |
| `/X509CertificateStore/Lookup` | POST | Look up vault ID(s) by name/value/owner |
| `/X509CertificateStore/LookupExpiring` | POST | Find vault IDs expiring within N days |
| `/X509CertificateStore/Remove` | POST | Remove a stored certificate |
| `/X509CertificateStore/Retrieve` | POST | Retrieve raw certificate string by vault ID |

**Model file:** no dedicated model file; reuses `models/secret_store.py` (`Result`,
`TypedNameValues`) and `models/certificate.py` (`NameTypeValue`).

---

## 4. Devices & Applications

### `/Platform` (platform.py)
One sentence: a very small resource limited to deleting a device/application "platform" record.

| Path | Method | Purpose |
|---|---|---|
| `/Platform/Delete` | POST | Delete a platform record by name |

**Model file:** none dedicated — inline `Output` only.

### `/Client` (client.py) — grouped here as device-agent related
One sentence: manages registered TPP agent/client machines (devices running the Venafi agent) —
querying their details and pending work items.

| Path | Method | Purpose |
|---|---|---|
| `/Client` | GET | List clients (filter by host name, IP, OS, region, etc.) |
| `/Client/Delete` | POST | Bulk-delete clients (optionally their associated devices) |
| `/Client/Details` | GET | List detailed client records |
| `/Client/Work` | GET | List pending work items for clients |

**Model file:** `models/client.py` — `Client`, `ClientDetails`, `ClientType`, `OSNameType`, `Work`,
`WorkType`.

---

## 5. Identity & Access

### `/Identity` (identity.py)
One sentence: manages TPP identity objects — users, local/AD groups, group membership, and identity
lookups — distinct from Teams (below) which are a higher-level grouping concept.

| Path | Method | Purpose |
|---|---|---|
| `/Identity/AddGroup` | POST | Create a local group with members |
| `/Identity/AddGroupMembers` | PUT | Add members to an existing group |
| `/Identity/Browse` | POST | Search/browse identities by filter + type |
| `/Identity/GetAssociatedEntries` | POST | Get related identity entries |
| `/Identity/GetMembers` | POST | Get members of a group (optionally resolve nested) |
| `/Identity/GetMemberships` | POST | Get groups an identity belongs to |
| `/Identity/Group/{prefix}/{principal}` | DELETE | Delete a group by prefix+principal |
| `/Identity/ReadAttribute` | POST | Read an attribute of an identity |
| `/Identity/RemoveGroupMembers` | PUT | Remove members from a group |
| `/Identity/RenameGroup` | PUT | Rename a group |
| `/Identity/Self` | GET | Get the calling identity's own identity record |
| `/Identity/SetPassword` | POST | Set/change a local identity's password |
| `/Identity/Validate` | POST | Validate/resolve an identity reference |

**Model file:** `models/identity.py` — `Identity`, `InvalidIdentity`.

### `/Teams` (teams.py)
One sentence: manages TPP "Teams" (named groups with owners + members + product/asset scoping),
layered on top of the Identity system.

| Path | Method | Purpose |
|---|---|---|
| `/Teams` | POST | Create a team (name, owners, members, assets, products) |
| `/Teams/AddTeamMembers` | PUT | Add members to a team |
| `/Teams/AddTeamOwners` | PUT | Add owners to a team |
| `/Teams/DemoteTeamOwners` | PUT | Demote owners to regular members |
| `/Teams/{prefix}/{universal}` | GET/PUT/DELETE | Read/update/delete one team by universal ID |
| `/Teams/RemoveTeamMembers` | PUT | Remove members from a team |
| `/Teams/RenameTeam` | PUT | Rename a team |

**Model file:** no dedicated `teams.py` model; reuses `models/identity.py` (`Identity`,
`InvalidIdentity`).

### `/Permissions` — see Policy & Config section (ACLs are config-object-centric but access-control
related; cross-referenced here since it's also an access-control resource).

---

## 6. Workflow

### `/Workflow` (workflow.py)
One sentence: manages approval-workflow "tickets" attached to config objects (e.g., a certificate
change requiring sign-off), separate from the Flow ticket system used for code-signing.

| Path | Method | Purpose |
|---|---|---|
| `/Workflow/Ticket/Create` | POST | Create an approval ticket for an object DN |
| `/Workflow/Ticket/Delete` | POST | Delete a ticket by GUID |
| `/Workflow/Ticket/Details` | POST | Get full ticket details (approvers, status, timestamps) |
| `/Workflow/Ticket/Enumerate` | POST | List ticket GUIDs for an object/user-data filter |
| `/Workflow/Ticket/Exists` | POST | Check if a ticket GUID exists |
| `/Workflow/Ticket/Status` | POST | Get a ticket's status |
| `/Workflow/Ticket/UpdateStatus` | POST | Update ticket status (approve/reject/schedule) |

**Model file:** `models/workflow.py` — `Result` (ticket result/status code wrapper).

### `/Flow` (flow.py) — grouped here as the second workflow/ticketing system
One sentence: a separate, code-signing-oriented ticket/approval system (pre-qualification +
approve/reject/enumerate), plus a generic "Actions" sub-tree used by CodeSign pre-approval flows.

| Path | Method | Purpose |
|---|---|---|
| `/Flow/Actions/CodeSign/PreQualify/Create` | POST | Create a code-sign pre-qualification entry |
| `/Flow/Tickets/Approve` | POST | Approve one or more tickets |
| `/Flow/Tickets/Count` | POST | Count all tickets |
| `/Flow/Tickets/CountApproved` | POST | Count approved tickets |
| `/Flow/Tickets/Enumerate` | POST | List tickets (paged, by product code) |
| `/Flow/Tickets/EnumerateApproved` | POST | List approved tickets (paged) |
| `/Flow/Tickets/Load` | POST | Load one or more tickets by ID |
| `/Flow/Tickets/Reject` | POST | Reject tickets with a reason/comment |
| `/Flow/Tickets/Update` | POST | Update ticket expiry/comment/use-count |

**Model file:** `models/flow.py` — `Result`, `Ticket`; also uses `models/codesign.py` for
`ResultCode` on the Actions branch.

---

## 7. Discovery

### `/Discovery` (discovery.py)
One sentence: imports externally-discovered certificate/endpoint inventory data (e.g., from a
network scan) into TPP as certificates and instances.

| Path | Method | Purpose |
|---|---|---|
| `/Discovery/{guid}` | DELETE | Delete a discovery import record |
| `/Discovery/Import` | POST | Bulk-import discovered `endpoints` into a named zone; returns created/updated counts |

**Model file:** `models/discovery.py` — `Endpoint`.

---

## 8. SSH

### `/SSH` (ssh.py)
One sentence: the largest single flat action-list file after Certificates/Codesign — manages SSH
key lifecycle across devices (authorized keys, host/user private keys, rotation, approvals) plus
self-service key enrollment and compliance widgets.

| Path | Method | Purpose |
|---|---|---|
| `/SSH/AddAuthorizedKey` | POST | Add an authorized key on a device |
| `/SSH/AddHostPrivateKey` | POST | Add a host private key |
| `/SSH/AddKnownHostKey` | POST | Add a known-host key |
| `/SSH/AddSelfServiceAuthorizedKey` | POST | Self-service authorized key enrollment |
| `/SSH/AddSelfServicePrivateKey` | POST | Self-service private key enrollment |
| `/SSH/AddUserPrivateKey` | POST | Add a user private key |
| `/SSH/ApproveKeyOperation` | POST | Approve a pending key operation |
| `/SSH/CancelKeyOperation` | POST | Cancel a pending key operation |
| `/SSH/CancelRotation` | POST | Cancel a scheduled key rotation |
| `/SSH/ChangePrivateKeyPassphrase` | POST | Change a private key's passphrase |
| `/SSH/ConfirmSelfServiceKeyInstallation` | POST | Confirm a self-service key was installed |
| `/SSH/DeleteUnmatchedKeyset` | POST | Delete an unmatched/orphaned keyset |
| `/SSH/Devices` | POST | Search SSH-managed devices (paged, filterable) |
| `/SSH/EditKeyOptions` | POST | Edit key restriction options (source, forced command) |
| `/SSH/EditSelfServiceAuthorizedKey` | POST | Edit a self-service authorized key |
| `/SSH/ExportSelfServiceAuthorizedKey` | POST | Export an authorized key's material |
| `/SSH/ExportSelfServicePrivateKey` | POST | Export a private key's material |
| `/SSH/ImportAuthorizedKey` | POST | Import an authorized key (base64 content) |
| `/SSH/ImportKeyUsageData` | POST | Import key-usage log data |
| `/SSH/ImportPrivateKey` | POST | Import a private key (base64 content) |
| `/SSH/KeyDetails` | POST | Get details for one key ID |
| `/SSH/KeysetDetails` | GET/POST | Get/search keyset details (paged filter) |
| `/SSH/KeyUsage` | POST | Query key usage records |
| `/SSH/MoveKeysetsToPolicy` | POST | Move keysets to a different policy folder |
| `/SSH/RejectKeyOperation` | POST | Reject a pending key operation |
| `/SSH/RemoveKey` | POST | Remove a key |
| `/SSH/RetryKeyOperation` | POST | Retry a failed key operation |
| `/SSH/RetryRotation` | POST | Retry a failed rotation |
| `/SSH/Rotate` | POST | Rotate a keyset |
| `/SSH/SetUnmatchedKeysetPassPhrase` | POST | Set passphrase on an unmatched keyset |
| `/SSH/SkipKeyRotation` | POST | Skip a scheduled rotation for a key |
| `/SSH/TestDeviceConnection` | POST | Test SSH connectivity to devices |
| `/SSH/Widget/CriticalAlerts` | GET | Dashboard counts (orphans, small keys, shared keys) |
| `/SSH/Widget/PolicyViolations` | GET | Dashboard policy-violation summary |
| `/SSH/Widget/Stats` | GET | Dashboard stats grouped by a field |

**Model file:** `models/ssh.py` — `SshWebResponse`, `DeviceData`, `SshDeviceFilter`, `KeyData`,
`KeySetData`, `KeySetFilter`, `KeyUsageData`, `KeyUsageFilter`, `ConnectionResult`, `LogData`.

### `/SSHCertificates` (ssh_certificates.py) — grouped here
One sentence: a separate, newer SSH certificate-authority API (as opposed to raw SSH key management
above) — CA keypair creation, cert issuance/retrieval, and template management.

| Path | Method | Purpose |
|---|---|---|
| `/SSHCertificates/CAKeyPair/Create` | POST | Create a new CA keypair |
| `/SSHCertificates/Request` | POST | Request/sign a new SSH certificate from a CA |
| `/SSHCertificates/Retrieve` | POST | Retrieve an issued SSH certificate (+ optional private key) |
| `/SSHCertificates/Template/Retrieve` | POST | Retrieve a CA template's configuration |
| `/SSHCertificates/Template/Retrieve/PublicKeyData` | GET | Get a template's CA public key data |

**Model file:** `models/ssh_certificates.py` — `ProcessingDetails`, `CertificateDetails`,
`RequestDetails`, `AccessControl`, `APIClient`, `CAKeyPair`, `Certificate`, `Output`.

---

## 9. Code Signing

### `/Codesign` (codesign.py)
One sentence: the single largest endpoint file by sub-action count — manages the full code-signing
subsystem object model (projects, environments, templates, applications, application collections,
and their administrators/approvers/rights).

| Path | Method | Purpose |
|---|---|---|
| `/Codesign/AddAdministrator` | POST | Add a global codesign administrator |
| `/Codesign/AddApplicationAdministrator` | POST | Add an application-level administrator |
| `/Codesign/AddProjectAdministrator` | POST | Add a project-level administrator |
| `/Codesign/AddProjectApprover` | POST | Add a project approver |
| `/Codesign/AddPreApproval` | POST | Pre-approve a signing operation for a user |
| `/Codesign/CountReferences` | POST | Count references to an application/collection |
| `/Codesign/CreateApplication` | POST | Create a signing application |
| `/Codesign/CreateApplicationCollection` | POST | Create an application collection |
| `/Codesign/CreateEnvironment` | POST | Create a signing environment (per key type: Apple/CSP/.NET/GPG/KeyPair/Certificate) |
| `/Codesign/CreateProject` | POST | Create a project |
| `/Codesign/CreateTemplate` | POST | Create a certificate/key template |
| `/Codesign/DeleteApplication` | POST | Delete an application |
| `/Codesign/DeleteApplicationCollection` | POST | Delete an application collection |
| `/Codesign/DeleteEnvironment` | POST | Delete an environment |
| `/Codesign/DeleteProject` | POST | Delete a project |
| `/Codesign/DeleteTemplate` | POST | Delete a template (force option) |
| `/Codesign/EnumerateApplications` | POST | List applications (filterable) |
| `/Codesign/EnumerateApplicationCollections` | POST | List application collections |
| `/Codesign/EnumerateProjects` | POST | List projects (by rights filter) |
| `/Codesign/EnumerateReferences` | POST | List reference DNs for an app/collection |
| `/Codesign/EnumerateTemplates` | POST | List templates (all key types) |
| `/Codesign/GetApplication` | POST | Get one application |
| `/Codesign/GetApplicationCollection` | POST | Get one application collection |
| `/Codesign/GetApplicationCollectionMembers` | POST | Get collection membership |
| `/Codesign/GetApplicationCollectionMemberDNs` | POST | Get collection member DNs |
| `/Codesign/GetEnvironment` | POST | Get one environment |
| `/Codesign/GetGlobalConfiguration` | GET | Get global codesign configuration |
| `/Codesign/GetObjectRights` | POST | Get rights on an object DN |
| `/Codesign/GetProject` | POST | Get one project |
| `/Codesign/GetRight` | POST | Get the caller's rights on a DN |
| `/Codesign/GetTemplate` | POST | Get one template |
| `/Codesign/GetTrusteeRights` | POST | Get a trustee's rights list |
| `/Codesign/RemoveAdministrator` | POST | Remove a global administrator |
| `/Codesign/RemoveApplicationAdministrator` | POST | Remove an application administrator |
| `/Codesign/RemoveProjectAdministrator` | POST | Remove a project administrator |
| `/Codesign/RemoveProjectApprover` | POST | Remove a project approver |
| `/Codesign/RenameApplication` | POST | Rename an application |
| `/Codesign/RenameApplicationCollection` | POST | Rename a collection |
| `/Codesign/RenameProject` | POST | Rename a project |
| `/Codesign/RenameTemplate` | POST | Rename a template |
| `/Codesign/SetGlobalConfiguration` | POST | Set global codesign configuration |
| `/Codesign/UpdateApplication` | POST | Update an application |
| `/Codesign/UpdateApplicationCollection` | POST | Update a collection |
| `/Codesign/UpdateEnvironment` | POST | Update an environment |
| `/Codesign/UpdateProject` | POST | Update a project |
| `/Codesign/UpdateProjectStatus` | POST | Update a project's status code |
| `/Codesign/UpdateTemplate` | POST | Update a template |

**Model file:** `models/codesign.py` — `ResultCode`, `Application`, `ApplicationCollection`,
`Project`, `GlobalConfiguration`, `Rights`, `RightsKeyValue`, and per-key-type `*Environment`/
`*Template` classes (Apple, CSP, DotNet, GPG, KeyPair, Certificate).

---

## 10. PKI/HSM/Crypto

### `/PKI` (pki.py)
One sentence: manages HashiCorp Vault PKI secrets-engine integration — creating/renewing CAs and
PKI roles that TPP can issue through.

| Path | Method | Purpose |
|---|---|---|
| `/PKI/HashiCorp/CA` | GET | List HashiCorp CA integrations |
| `/PKI/HashiCorp/CA` | POST | Create a HashiCorp CA (cert, folder DN, PKI path, roles) |
| `/PKI/HashiCorp/CA/{guid}` | GET/POST/PUT/DELETE | Read/recreate/update/delete one CA integration |
| `/PKI/HashiCorp/CA/{guid}/Renew` | POST | Renew the CA's certificate |
| `/PKI/HashiCorp/Role` | POST | Create a PKI role (allowed domains, key algorithm) |
| `/PKI/HashiCorp/Role/{guid}` | GET/PUT/DELETE | Read/update/delete a PKI role |

**Model file:** `models/pki.py` — `PKI`, `Certificate`, `Installation`.

### `/API` → `vedhsm` (hsm_api.py) — grouped here
One sentence: a dedicated HSM signing API (note the base URL swaps `vedsdk` for `vedhsm`) used for
remote cryptographic signing operations and key/GPG object retrieval.

| Path | Method | Purpose |
|---|---|---|
| `/API/Sign` (vedhsm) | POST | Perform a raw HSM sign operation (`KeyId`, `Mechanism`, `Data`) |
| `/API/SignJWT` (vedhsm) | POST | Sign a JWT header+payload via the HSM key |
| `/API/GetGPGPublicKey` (vedhsm) | POST | Retrieve a GPG public key + fingerprint |
| `/API/GetObjects` (vedhsm) | POST | List certificates/private/public keys visible to the HSM client |

**Model file:** `models/hsm_api.py` — `ClientInfo`, `ProcessInfo`, `Parameter`, `Certificate`,
`PrivateKey`, `PublicKey`.

### `/Crypto` (crypto.py) — grouped here
One sentence: tiny resource exposing which cryptographic key containers/providers are available on
the TPP server.

| Path | Method | Purpose |
|---|---|---|
| `/Crypto/AvailableKeys` | GET | List available key container names |
| `/Crypto/DefaultKey` | GET | Get the server's default key name |

**Model file:** none dedicated; inline `Output` classes only.

---

## 11. Platform & System

### `/SystemStatus` (system_status.py)
One sentence: reports TPP server/engine version and manages multi-engine upgrade orchestration and
history.

| Path | Method | Purpose |
|---|---|---|
| `/SystemStatus` | GET | List status of all engines |
| `/SystemStatus/Upgrade/Engine` | GET | Get upgrade status/tasks for one engine |
| `/SystemStatus/Upgrade/Engines` | GET | List engines' upgrade status |
| `/SystemStatus/Upgrade/History` | GET | List past upgrade runs |
| `/SystemStatus/Upgrade/Status` | GET | Whether an upgrade is currently in progress |
| `/SystemStatus/Upgrade/Summary` | GET | Get upgrade summary |
| `/SystemStatus/Version` | GET | Get the server version string |

**Model file:** `models/system_status.py` — `SystemStatus`, `Engine`, `Task`, `UpgradeStatus`,
`UpgradeInfo`, `UpgradeSummary`.

### `/Stats` (stats.py)
One sentence: exposes internal TPP performance counters and time-series statistics queries.

| Path | Method | Purpose |
|---|---|---|
| `/Stats/GetCounters` | POST | Get current counter values |
| `/Stats/Query` | POST | Query time-series stats (`StatsType`, `Tier`, grouping/filters) |

**Model file:** `models/stats.py` — `Counter`, `Result`.

### `/Log` (log.py)
One sentence: reads and writes TPP's internal audit/event log, plus its log schema definitions.

| Path | Method | Purpose |
|---|---|---|
| `/Log` | GET | Query log events (component, severity, time range, paging) |
| `/Log` | POST | Write a custom log event |
| `/Log/{guid}` | GET | Get one log event by GUID |
| `/Log/LogSchema` | GET | Get log event + application definitions |

**Model file:** `models/log.py` — `LogEvent`, `LogEventDefinition`,
`LogEventApplicationDefinition`.

### `/Preferences` (preferences.py)
One sentence: simple per-category/per-product user-preference key-value store.

| Path | Method | Purpose |
|---|---|---|
| `/Preferences` | GET | Get preferences (by category/name/product) |
| `/Preferences` | POST | Save a list of preferences |
| `/Preferences` | DELETE | Delete preferences matching filter |

**Model file:** `models/preferences.py` — `Preference`, `ProductType`.

### `/ProcessingEngines` (processing_engines.py)
One sentence: manages which processing engines are assigned to which policy folders (load
distribution for certificate work).

| Path | Method | Purpose |
|---|---|---|
| `/ProcessingEngines` | GET | List all engines |
| `/ProcessingEngines/Engine/{guid}` | GET | List folders assigned to an engine |
| `/ProcessingEngines/Engine/{guid}` | POST | Assign folders to an engine |
| `/ProcessingEngines/Folder/{guid}` | GET/PUT/DELETE | List/replace/unassign engines for a folder |
| `/ProcessingEngines/Folder/{guid}/{engine_guid}` | DELETE | Unassign one engine from a folder |

**Model file:** `models/processing_engines.py` — `Engine`, `Folder`, `Link`.

### `/Credentials` (credentials.py)
One sentence: manages the credential vault used by adaptable/connector-driven integrations
(passwords, CyberArk-synced secrets, PowerShell connector credentials).

| Path | Method | Purpose |
|---|---|---|
| `/Credentials/Adaptable/Create` | POST | Create an adaptable credential |
| `/Credentials/Adaptable/Update` | POST | Update an adaptable credential |
| `/Credentials/Connector/Adaptable` | POST | Register a PowerShell adaptable connector |
| `/Credentials/Connector/Adaptable/{guid}` | GET/PUT/DELETE | Read/update/delete a connector |
| `/Credentials/Create` | POST | Create a credential (friendly name, values, expiration) |
| `/Credentials/Delete` | POST | Delete a credential |
| `/Credentials/Enumerate` | POST | List credentials under a path |
| `/Credentials/Rename` | POST | Rename a credential |
| `/Credentials/Retrieve` | POST | Retrieve a credential's values |
| `/Credentials/Update` | POST | Update a credential |
| `/Credentials/CyberArk/Create` | POST | Create a CyberArk-backed credential |
| `/Credentials/CyberArk/Update` | POST | Update a CyberArk-backed credential |

**Model file:** `models/credential.py` — `CredentialType`, `NameTypeValue`, `CredentialInfo`,
`Result`.

### `/SecretStore` (secret_store.py)
One sentence: the low-level encrypted secret vault underneath Credentials/X509CertificateStore —
stores arbitrary base64 blobs with owner/association lookups.

| Path | Method | Purpose |
|---|---|---|
| `/SecretStore/Add` | POST | Store a base64 secret, returns `VaultID` |
| `/SecretStore/Associate` | POST | Attach a name/value association to a vault entry |
| `/SecretStore/Dissociate` | POST | Remove an association |
| `/SecretStore/EncryptionKeysInUse` | GET | List encryption keys currently in use |
| `/SecretStore/Lookup` | GET | List all vault IDs |
| `/SecretStore/LookupAllAssociationsbyVaultid` | POST | List all associations for a vault ID |
| `/SecretStore/LookupByAssociation` | POST | Find vault IDs by association name/value |
| `/SecretStore/LookupAssociationbyVaultID` | POST | Get one association's value by vault ID |
| `/SecretStore/LookupByOwner` | POST | Find vault IDs by owner |
| `/SecretStore/LookupByVaultType` | POST | Find vault IDs by vault type |
| `/SecretStore/Mutate` | POST | Change a vault entry's type |
| `/SecretStore/OrphanLookup` | POST | Find orphaned vault entries |
| `/SecretStore/OwnerAdd` | POST | Add an owner to a vault entry |
| `/SecretStore/OwnerDelete` | POST | Remove an owner |
| `/SecretStore/OwnerLookup` | POST | List owners of a vault entry |
| `/SecretStore/Retrieve` | POST | Retrieve the base64 secret data |

**Model file:** `models/secret_store.py` — `Result`, `TypedNameValues`.

---

## Notable size/shape observations

- **Codesign** (`codesign.py`, 751 lines) and **Certificates** (`certificates.py`, 429 lines) are
  the two heaviest files by distinct sub-actions — Codesign has roughly 44 sub-endpoints because it
  models six parallel key-type variants (Apple, CSP, .NET, GPG, KeyPair, Certificate) across
  Environments and Templates.
- **SSH** (`ssh.py`, 567 lines) is the next largest, with ~33 flat POST/GET actions covering key
  lifecycle, rotation, self-service enrollment, and compliance dashboards — no nested object
  hierarchy like Certificates/PKI.
- **Config** (`config.py`, 540 lines) is the largest by line count among the "plumbing" APIs — it's
  the generic attribute-level CRUD substrate that almost every other higher-level resource
  (Certificates, Metadata, Permissions) is presumably built on top of inside the real TPP server,
  though pytpp itself calls these independently.
- Smallest files: `crypto.py` (23 lines, 2 GET-only endpoints) and `platform.py` (19 lines, 1
  POST-only endpoint).
- `revoke.py` and part of `authorize.py` are unusual in that they rewrite the base URL from the
  `vedsdk` prefix to `vedauth`; `hsm_api.py` rewrites it to `vedhsm` — these three are the only
  files observed doing a URL-prefix swap in `__init__`.
- `teams.py` and parts of `identity.py` share the same model module (`models/identity.py`) rather
  than having their own — Teams has no dedicated model file.
