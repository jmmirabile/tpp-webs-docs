# Code Signing

> **Status: placeholder.** Not yet formalized into the OpenAPI spec — full
> path/method catalog lives in `notes/pytpp-facts/endpoints.md` (§9) in the
> repo until this area is built out.

Covers **`/Codesign`** — the full code-signing subsystem object model
(projects, environments, templates, applications, application collections,
and their administrators/approvers/rights). The largest single endpoint area
by sub-action count, since it models six parallel key-type variants (Apple,
CSP, .NET, GPG, KeyPair, Certificate) across Environments and Templates.
