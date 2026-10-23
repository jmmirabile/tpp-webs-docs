# Discovery

> **Status: placeholder.** Not yet formalized into the OpenAPI spec — full
> path/method catalog lives in `notes/pytpp-facts/endpoints.md` (§7) in the
> repo until this area is built out.

Covers **`/Discovery`** — imports externally-discovered certificate/endpoint
inventory (e.g. from a network scan) into TPP as certificates and instances.
Note: the `zone_name` parameter here is an unrelated, coincidentally-named
target-folder-path string — see [The Application
Object](../../guide/05-the-application-object.md) for why TPP has no actual
Zone object.
