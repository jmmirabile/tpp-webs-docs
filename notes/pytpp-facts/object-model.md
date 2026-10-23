# TPP Configuration Object Model — Facts from pytpp

Source: `pytpp-master` (MIT-licensed Python client for Venafi TPP WebSDK).
All facts below are derived from the client source code (class names, method signatures, attribute names,
config classes, DN construction). Example descriptions in the final section are original summaries of what
each `.rst` file demonstrates, not quotations of that file's text.

TPP models almost everything as a node in a single hierarchical tree of **Config Objects**, each identified
by a Distinguished Name (DN) such as `\VED\Policy\Certificates\example.com`. A "Config Class" (a TPP-internal
type name, e.g. `"X509 Certificate"`, `"Device"`, `"Policy"`, `"Apache"`) determines what kind of node it is
and what attributes it supports. This DN-tree-plus-class-name model underlies Folders, Devices, Applications,
and Certificates alike.

## 1. Policy Folders

Implemented by `pytpp/features/folder.py`, class `Folder(FeatureBase)` registered via `@feature('Folder')`
(`folder.py:11-12`). A Folder is TPP's container/directory node — the config class name used when creating
one is `PolicyAttributes.__config_class__`, which resolves to `"Policy"` (`folder.py:124`, `pytpp/attributes/policy.py`).

Folders are the nodes in the DN tree that hold **policy** — i.e., inheritable default/locked attribute values
that apply to every object placed underneath them (certificates, devices, applications, sub-folders). Any
other config object (Device, Certificate, Application, sub-Folder) is created with a `parent_folder` /
`parent_folder_dn`, which becomes a path segment in its own DN — this is how "placement inside a policy
folder" is represented: objects are literal children of the folder node in the DN tree.

Key `Folder` methods (`pytpp/features/folder.py`):
- `create(name, parent_folder, description=None, contacts=None, log_server=None, engines=None, attributes=None, get_if_already_exists=True)` — lines 97-135. Builds `folder_dn = f'{parent_folder_dn}\\{name}'` via the shared `FeatureBase._config_create` helper (`pytpp/features/bases/feature_base.py:33-47`), which POSTs to `Config/Create` with `class_name=PolicyAttributes.__config_class__`.
- `get(folder_dn, raise_error_if_not_exists=True)` — lines 171-183, wraps `Config/IsValid`.
- `delete(folder, recursive=True, delete_owners_from_secrets=True, concurrency=1)` — lines 137-159. Recursively enumerates child objects (`Config.Enumerate`) and optionally removes their Secret Store associations before deleting.
- `search(object_name_pattern='*', object_types=None, recursive=True, starting_dn=None)` — lines 196-232. Backed by `Config.FindObjectsOfClass` or `Config.Enumerate`/`Config.EnumerateAll` depending on which parameters are given.
- Policy-attribute operations — the actual "policy" mechanism (reads/writes inheritable attribute+value pairs scoped to a TPP class name on this folder):
  - `read_policy(folder, class_name, attribute_name)` → `Config.ReadPolicy.post(...)`, returns `(values, locked)` (lines 252-278).
  - `write_policy(folder, class_name, attributes, locked)` → `Config.WritePolicy.post(...)` for each attribute, **overwrites** existing values (lines 312-338).
  - `update_policy(folder, class_name, attributes, locked)` → `Config.AddPolicyValue.post(...)`, **appends** to existing values (lines 340-362).
  - `clear_policy(folder, class_name, attributes)` → `Config.ClearPolicyAttribute.post(...)` or `Config.RemovePolicyValue.post(...)` depending on whether `attributes` is a list (remove whole attribute) or dict (remove specific values) (lines 51-95).
- Workflow management on folders: `apply_workflow`/`remove_workflow` (via `Config.AddValue`/`Config.RemoveDnValue` on `PolicyAttributes.workflow`) and `block_workflow`/`remove_blocked_workflow` (same, on `PolicyAttributes.workflow_block`) — lines 16-48, 280-310.
- Processing engine assignment: `set_engines`, `get_engines`, `delete_engines` — these call a *different* endpoint family, `ProcessingEngines.Folder.Guid(...)`, not the generic `Config` policy calls (lines 161-250).

## 2. The Application object — NOT a "user application"

**Important disambiguation**: in TPP's object model, "Application" does not mean an end-user-facing business
application. It means a **configured install/provisioning target for a certificate** — essentially a
connector describing where and how TPP should push a certificate once issued (a specific Apache vhost config,
an IIS binding, an F5 LTM profile, a PKCS#12 keystore file on disk, etc.).

Implemented in `pytpp/features/application.py` (2377 lines). Structure:
- `_ApplicationBase(FeatureBase)` (lines 44-256) is the shared base class all concrete application types inherit, holding a `self._class_name` (the TPP config class string for that specific application type, e.g. `"Apache"`).
- Every concrete application subtype is declared as `@feature('<Display Name>') class <Name>(_ApplicationBase): ...` and sets its own creation attributes/subclass-specific `create()` signature, but shares `_ApplicationBase`'s `delete`, `enable`, `disable`, `get`, `get_associated_certificate`, `get_stage`, `get_status`, `wait_for_installation_to_complete`.
- Internally `_ApplicationBase._create(...)` (lines 128-146) takes a `device` argument, resolves it to `device_dn = self._get_dn(obj=device)`, and calls `self._config_create(..., parent_folder_dn=device_dn, ...)` — i.e. **the Application's parent node in the DN tree is literally the Device**, confirming Application objects are children of Device objects, not independent top-level entities (`application.py:131-146`).

Concrete Application subtypes found as real classes in `application.py` (class name, line, TPP feature label):

| Class | Line | Feature label |
|---|---|---|
| `Adaptable` | 259 | Adaptable Application |
| `AmazonAWS` | 357 | Amazon AWS |
| `Apache` | 434 | Apache |
| `AzureKeyVault` | 525 | Azure Key Vault |
| `Basic` | 605 | Basic Application |
| `BlueCoatSSLVA` | 678 | Blue Coat SSLVA |
| `CAPI` | 748 | CAPI |
| `CitrixNetScaler` | 832 | Citrix NetScaler |
| `ConnectDirect` | 910 | Connect:Direct |
| `F5AuthenticationBundle` | 967 | F5 Authentication Bundle |
| `F5LTMAdvanced` | 1001 | F5 LTM Advanced |
| `GoogleCloudLoadBalancer` | 1157 | Google Cloud Load Balancer |
| `IBMDataPower` | 1207 | IBM DataPower |
| `IBMGSK` | 1294 | IBM GSK |
| `ImpervaMX` | 1407 | Imperva MX |
| `JKS` | 1465 | JKS |
| `OracleIPlanet` | 1578 | Oracle iPlanet |
| `PaloAltoNetworkFW` | 1672 | Palo Alto Network FW |
| `PEM` | 1760 | PEM |
| `PKCS11` | 1835 | PKCS11 |
| `PKCS12` | 1932 | PKCS #12 |
| `RiverbedSteelHead` | 2028 | Riverbed Steelhead |
| `TealeafPCA` | 2082 | Tealeaf PCA |
| `VAMnShield` | 2130 | VAM nShield |

Two "group" variants also exist, under `_ApplicationGroupBase` (line 2187): `ApacheApplicationGroup` (2279, "Apache Group") and `PKCS11ApplicationGroup` (2332, "PKCS11 Group") — these group multiple Application instances of the same type for coordinated certificate pushes.

Certificate association is explicit and bidirectional in practice (though the certificate object holds the link): `_ApplicationBase.get_associated_certificate(application)` (lines 108-126) reads the `ApplicationBaseAttributes.certificate` attribute off the application node and resolves it via `Config.IsValid`; the inverse direction is driven from the Certificate feature (`Certificate.associate_application` / `Certificate.push_to_applications`, see §4).

Processing lifecycle helpers on `_ApplicationBase`: `enable()`/`disable()` toggle the `ApplicationBaseAttributes.disabled` attribute (lines 60-92); `get_stage()`/`get_status()` read `ApplicationBaseAttributes.stage`/`.status` (lines 148-181); `wait_for_installation_to_complete(application, timeout=60)` polls until the application's "Last Pushed On" timestamp catches up to the certificate's "Last Renewed On" timestamp, or raises `TimeoutError`/`UnexpectedValue` (lines 192-255).

## 3. The Device object

Implemented in `pytpp/features/device.py`. `Device(_DeviceBase)` (lines 27-118, `@feature('Device')`) and a
sibling `JumpServer(_DeviceBase)` (lines 121-212, `@feature('Jump Server')`) both subclass the shared
`_DeviceBase(FeatureBase)` (lines 12-24), which only provides `delete(device)`.

A Device represents a managed host (by hostname/IP) that one or more Applications live on — e.g. the server
running Apache, or the IIS box. Key facts:
- `Device.create(name, parent_folder, description=None, contacts=None, address=None, agent_provisioning_mode=None, concurrent_connection_limit=None, device_credential=None, temp_directory=None, os_type=None, jump_server=None, use_sudo=None, sudo_credential=None, enforce_host_key=None, attributes=None, get_if_already_exists=True)` — lines 32-85. Note `parent_folder` here is a **Policy Folder**, not another Device — so Devices live directly under Folders, and Applications in turn live under Devices. This gives the three-level containment chain: **Folder → Device → Application**.
- Config class used for creation: `Classes.device` (`application.py` imports show the broader `Classes` registry in `pytpp/features/definitions/classes.py`; device.py line 85).
- `address` maps to `DeviceAttributes.host` — the hostname/IP of the managed system (line 63).
- `scan_for_ssh_keys(device)` (lines 101-118) submits agentless SSH-key discovery work by writing the `"Agentless Discovery To Do"` attribute.
- `JumpServer` is a parallel Device-like object type with its own extra attributes (`port`, `ssh_version`, `ssh_syntax`) for a bastion/jump host used to reach other devices (lines 126-179); it uses config class `Classes.jump_server`.

Applications reference their owning Device only implicitly through DN containment (an Application's DN is `<device_dn>\<application_name>`); there is no separate explicit "device_dn" attribute stored on the Application beyond the parent path itself (`application.py:132,146`).

## 4. Certificate lifecycle

Implemented in `pytpp/features/certificate.py`, class `Certificate(FeatureBase)` (`@feature('Certificate')`,
lines 26-29). Config class on creation is `Classes.x509_certificate` (line 152).

Lifecycle operations (method name → WebSDK call → purpose):

| Method | WebSDK call | Purpose | Lines |
|---|---|---|---|
| `create(...)` | `Config.Create` (via `_config_create`) | Registers a certificate **object** in TPP (metadata, subject, SANs, key params, CA template) without requesting it yet. Docstring explicitly notes the cert is not auto-requested — call `renew()` to actually request/enroll. | 68-152 |
| `renew(certificate, csr=None, re_enable=False)` | `Certificates.Renew.post` | Requests/renews the certificate; if `csr` given, client supplies the PKCS#10 CSR (service-generated otherwise); returns the *current* thumbprint (for detecting when the new cert lands). | 580-598 |
| `download(format, certificate=None, ..., vault_id=None, timeout=60, poll_interval=0.5)` | `Certificates.Guid(...).get()` / download API | Retrieves certificate material in one of Base64, Base64 (PKCS#8), DER, JKS, PKCS#7, PKCS#12; polls until ready. | 197+ |
| `upload(certificate_data, parent_folder, ...)` | `Certificates.Import.post` | Imports externally-issued certificate (and optional private key) data into TPP as a certificate object. | 661-696 |
| `revoke(certificate, comments=None, disable=None, reason=None, thumbprint=None)` | `Certificates.Revoke.post` | Revokes the active certificate, or a specific historical version if `thumbprint` given. | 635-659 |
| `validate(certificates)` | `Certificates.Validate.post` | Performs SSL/TLS (and file) network validation against all enabled applications associated with the certificate(s); returns validated DNs + warnings. | 698-714 |
| `get_validation_results(certificate)` | — | Retrieves prior file/SSL validation results. | 306+ |
| `reset(certificate)` | `Certificates.Reset.post(restart=False)` | Resets a stuck certificate to a non-processing state without retrying. | 600-610 |
| `retry_from_current_stage(certificate)` | `Certificates.Retry.post` | Resumes renewal processing from wherever it last stopped. | 612-620 |
| `retry_from_stage_0(certificate)` | `Certificates.Reset.post(restart=True)` | Clears all processing state and restarts renewal from the beginning. | 622-633 |
| `associate_application(certificate, applications, push_to_new=False)` | `Certificates.Associate.post` | Links the certificate to one or more Application objects; optionally pushes immediately. | 49-66 |
| `dissociate_application(certificate, applications, delete_orphans=False)` | `Certificates.Dissociate.post` | Unlinks applications; can cascade-delete orphaned Application (and their Device, if childless) objects. | 177-194 |
| `push_to_applications(certificate, applications=None)` | (wraps `associate_application(..., push_to_new=True)`) | Re-pushes the active certificate to its associated (or given) applications. | 559-578 |
| `details(certificate)` | `Certificates.Guid(...).get()` | Returns `CertificateDetails` model (subject, SANs, validity, thumbprint, etc.). | 167-175 |
| `get_previous_versions(certificate, exclude_expired=False, ...)` | — | Lists historical (superseded) certificate versions, e.g. for revoking expired ones. | 288+ |
| `wait_for_stage(certificate, stage, expect_workflow=True, ...)` | — | Blocks until the certificate reaches a specific TPP processing "stage" (TPP's internal state-machine step number, e.g. stage 500 = pending workflow approval). | 749+ |
| `wait_for_enrollment_to_complete(certificate, current_thumbprint, ...)` | — | Blocks until the certificate's thumbprint changes from `current_thumbprint`, signaling a new cert has landed after `renew()`. | 716-747 |
| `delete(certificate)` | `Certificates.Guid(...).delete()` | Removes the certificate object. | 154-165 |
| `list(...)` | (threaded) `Certificates` search | Lists/searches certificates with many filter params (country, CN, validity window, etc.), using a thread pool (default 16 workers) for pagination. | 318-557 |

A `DownloadedCertificate` dataclass (`certificate_data`, `filename`, `format`) is the return type of `download()` (lines 19-23).

## 5. "Zone" — does NOT exist as a first-class TPP object

Grepping the entire codebase (`grep -rin "zone" --include="*.py" .`) turns up **no** Zone REST resource, no
`Zone` feature class, and no Zone config-object type. The only hits are:

- `pytpp/attributes/zone_base.py:4-10` — a small attribute mixin, `ZoneBaseAttributes`, with `__config_class__ = "Zone Base"` and fields `address_range`, `window_end`, `window_start`, `zone_contact`, `zone_description`. This is mixed into `VenafiPlatformAttributes` (`pytpp/attributes/venafi_platform.py:4,7`) — i.e. it's a bundle of **policy attributes for a "Venafi Platform" driver/connector config object**, not a standalone object type or endpoint.
- `pytpp/api/websdk/endpoints/discovery.py:22-34` — a `zone_name` **parameter** on `Discovery.Import.post(endpoints, zone_name)`. This is the (on-prem) Network Discovery "Import" API's target-folder-path string for where discovered certs get placed — an unrelated, coincidentally-named parameter, not a reference to a Zone object.
- `pytpp/api/websdk/enums/config.py:3592-3593,3794` and `pytpp/features/definitions/classes.py:388` — string constants `"Zone Contact"`, `"Zone Description"`, `"Zone Base"`, i.e. the same attribute/class-name strings as above, just enumerated.

**Conclusion**: on-prem TPP has no "Zone" REST resource/endpoint comparable to the "Zone" concept in Venafi
as a Service (VaaS)/Cloud, where a Zone bundles a CA template + policy for enrollment. On TPP, the equivalent
grouping of CA template + enrollment policy is expressed through **Policy Folders** (§1) plus the
`certificate_authority` policy attribute set via `Folder.write_policy`/`Folder.update_policy`, and/or the
`ca_template` parameter on `Certificate.create()` (`certificate.py:74,105,143`). Anyone coming from VaaS
looking for a "Zone" in TPP should look at Policy Folders instead — there is no drop-in equivalent object.

## 6. Pointers to example flows

Each filename below is under `docs/rst/usage/examples/` in `pytpp-master`. One-line original description of
what each example demonstrates (not quoted from the file):

- `folder.rst` — creating/deleting a Policy Folder, assigning processing engines, applying/blocking workflows, searching objects under a folder, and reading/writing/updating/clearing policy attributes.
- `application.rst` — creating and deleting an Apache-type Application under a Device, enabling/disabling it, fetching its associated certificate, checking processing stage/status, and pushing a certificate install then waiting for it to complete.
- `device.rst` — creating a Device (with address, credentials, OS type, jump server) under a parent folder, deleting it, and kicking off agentless SSH-key discovery on it.
- `certificate.rst` — the fullest lifecycle walkthrough: creating a certificate object, listing/searching certificates (with concurrency controls), renewing and downloading, revoking historical versions by thumbprint, resetting/retrying a stuck request, running file/SSL validation, inspecting certificate details, associating/dissociating applications, and handling a renewal that pauses for workflow-ticket approval.
- `discovery.rst` — defining certificate/SSH placement rules, then creating, scheduling, blacking-out, running, pausing, resuming, and cancelling a network discovery job that feeds discovered items through those placement rules.
- `authentication.rst` — setting up an OAuth `Scope`/Application ID bundle, then authenticating via username/password, client certificate, a reused token, or through a proxy.

Files referenced: `pytpp/features/folder.py`, `pytpp/features/application.py`, `pytpp/features/device.py`, `pytpp/features/certificate.py`, `pytpp/features/bases/feature_base.py`, `pytpp/attributes/zone_base.py`, `pytpp/attributes/venafi_platform.py`, `pytpp/api/websdk/endpoints/discovery.py`.
