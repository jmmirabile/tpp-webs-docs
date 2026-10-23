# Policy & Folders

> **Status: placeholder.** Full chapter coming in Phase 2.

Policy Folders are TPP's container/directory nodes. They hold **policy** —
inheritable default or locked attribute values that cascade to every object
placed underneath them (devices, applications, certificates, sub-folders).

Relevant endpoints live under [`/Config`](../reference/policy-config/overview.md)
(`ReadPolicy`, `WritePolicy`, `AddPolicyValue`, `ClearPolicyAttribute`, etc.).

See the [notes extracted from pytpp](https://github.com/Venafi/pytpp) for the
full `Folder` feature API in the meantime (`create`, `delete`, `search`,
`read_policy`/`write_policy`/`update_policy`/`clear_policy`).
