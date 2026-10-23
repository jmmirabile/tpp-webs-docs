# Devices & Applications

> **Status: placeholder.** Not yet formalized into the OpenAPI spec — full
> path/method catalog lives in `notes/pytpp-facts/endpoints.md` (§4) in the
> repo until this area is built out.

Covers **`/Platform`** (deleting a device/application "platform" record) and
**`/Client`** (registered TPP agent/client machines — querying details and
pending work items).

Device and Application objects themselves are created and managed through
the generic [`/Config`](../policy-config/overview.md) API (there's no
dedicated `/Device` or `/Application` REST resource — they're config objects
like everything else). See [The Application
Object](../../guide/05-the-application-object.md) for what these objects
actually represent.
