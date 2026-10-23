# Devices and Certificates

> **Status: placeholder.** Full chapter coming in Phase 2.

A **Device** represents a managed host (by hostname/IP) — the server that
one or more [Application](./05-the-application-object.md) install targets
live on. Devices are created directly under a Policy Folder; Applications
are created under a Device.

**Certificates** are a separate object type, associated with (not nested
under) Applications — see [Certificate Lifecycle
Workflow](./07-certificate-lifecycle-workflow.md) for the full request →
retrieve → renew → revoke flow.
