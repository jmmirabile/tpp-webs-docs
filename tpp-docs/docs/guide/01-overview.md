# Overview

This guide documents the **TPP WebSDK REST API** — the on-prem Venafi Trust
Protection Platform's REST interface. It's written for someone calling the
API directly over HTTP/JSON, without the VCert CLI or any vendor SDK.

## Scope

This guide covers **only the on-prem TPP WebSDK API**. It does not cover:

- **VCert** — an open-source Venafi client/CLI that wraps this same REST API
  for certificate enrollment automation (cert-manager, Jenkins, Ansible,
  etc.). VCert is a convenience layer; everything it does, you can do with
  plain REST calls, and this guide assumes you're doing exactly that.
- **Venafi Cloud / Venafi as a Service (VaaS)** — a separate hosted product
  with its own API and its own vocabulary (notably "Zones," which don't exist
  on TPP — see [The Application Object](./05-the-application-object.md)).

## Base URLs

TPP exposes two REST roots on the same host, distinguished only by path
prefix:

| Root | Used for |
|---|---|
| `https://{host}/vedsdk` | The general WebSDK API — certificates, config objects, identity, permissions, workflow, and almost everything else. |
| `https://{host}/vedauth` | The OAuth authorization API — obtaining and refreshing tokens. |

A handful of specialized areas swap in their own prefix the same way
(`/vedhsm` for the dedicated HSM signing API). Every other resource lives
under `/vedsdk`.

## How this guide is organized

- **Guide chapters** (this section) explain the concepts: authentication, the
  object model, and common workflows — in plain language, grounded in real
  endpoint calls.
- **API Reference** is grouped by what each resource area is *for* (Auth,
  Certificates, Devices & Applications, etc.), not an alphabetical dump of
  TPP's ~29 WebSDK resource files.

## Where this content comes from

TPP doesn't expose a live OpenAPI/Swagger spec, so this guide is built from
two sources: Venafi's own public documentation, and the actual request/
response behavior encoded in [pytpp](https://github.com/Venafi/pytpp), a
real open-source Python client for this API. Where the two disagree or
public docs are unclear, the code wins — it's what the server actually does.
