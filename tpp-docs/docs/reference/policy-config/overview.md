# Policy & Config

> **Status: placeholder.** Not yet formalized into the OpenAPI spec — full
> path/method catalog lives in `notes/pytpp-facts/endpoints.md` (§2) in the
> repo until this area is built out.

The generic, low-level CRUD/attribute API for any TPP config object (policy
folders, devices, applications, etc.), addressed by DN — this is the
substrate most higher-level resources are built on. Covers:

- **`/Config`** — object create/read/write/delete, policy attribute
  read/write (the actual "policy" cascading mechanism), DN↔GUID resolution,
  enumeration/search.
- **`/ConfigSchema`** — the TPP configuration schema itself (class/attribute
  definitions).
- **`/Metadata`** — custom-field metadata item definitions and values.
- **`/Permissions`** — object-level ACL permission bits, cross-referenced
  from [Identity & Access](../identity-access/overview.md).

See [Policy & Folders](../../guide/04-policy-and-folders.md) for the
narrative explanation of how policy cascades.
