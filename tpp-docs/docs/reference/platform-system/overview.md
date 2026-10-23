# Platform & System

> **Status: placeholder.** Not yet formalized into the OpenAPI spec — full
> path/method catalog lives in `notes/pytpp-facts/endpoints.md` (§11) in the
> repo until this area is built out.

Covers server/operational concerns: **`/SystemStatus`** (version, multi-
engine upgrade orchestration), **`/Stats`** (performance counters),
**`/Log`** (audit/event log), **`/Preferences`** (per-user key-value store),
**`/ProcessingEngines`** (engine-to-folder load distribution),
**`/Credentials`** (credential vault for adaptable/connector integrations),
and **`/SecretStore`** (the low-level encrypted vault underneath Credentials
and X509CertificateStore).
