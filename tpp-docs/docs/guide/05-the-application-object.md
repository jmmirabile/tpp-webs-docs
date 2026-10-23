# The Application Object (and why there's no "Zone")

This is the single most common source of confusion for anyone new to TPP —
especially if you've seen Venafi Cloud/VaaS terminology first.

## "Application" does not mean a user-facing app

In TPP, an **Application** object is not your business application. It's a
**configured install/provisioning target for a certificate** — a connector
object describing *where and how TPP should push a certificate once issued*.
Concretely, an Application object represents things like:

- A specific Apache vhost configuration
- An IIS binding
- An F5 LTM profile
- A PKCS#12 keystore file sitting on disk
- An Azure Key Vault or Amazon AWS certificate store entry

TPP ships with roughly two dozen built-in Application subtypes covering
these targets (Apache, CAPI, F5 LTM/Authentication Bundle, JKS, PEM, PKCS11,
PKCS12, Azure Key Vault, Amazon AWS, Google Cloud Load Balancer, Citrix
NetScaler, IBM DataPower, and more), plus an "Adaptable Application" type for
writing your own custom push logic via scripts.

## Applications are children of Devices, not top-level objects

An Application's parent node in the DN tree is literally a **Device** — not
a Policy Folder, and not a Certificate. The containment chain is:

```
Policy Folder → Device → Application
```

A Device represents a managed host (by hostname/IP) — e.g. the server
running Apache. One Device can have multiple Applications underneath it
(e.g. a box running both Apache and an SSH service might have two separate
Application objects).

Certificates are **associated** with Applications (a certificate object
links to one or more Application DNs), rather than nested underneath them —
this is how one certificate can be pushed to multiple install targets.

## There is no "Zone" object in TPP

If you've worked with Venafi Cloud (VaaS) first, you've seen "Zones" —
VaaS's concept that bundles a CA template with an enrollment policy. **TPP
has no equivalent first-class object or REST endpoint.** Searching the
entire on-prem WebSDK API turns up no `Zone` resource, no `Zone` feature, and
no `Zone` config-object type.

The only places the word "zone" appears in TPP at all:

- A small attribute bundle (`Zone Base`) used internally as part of a
  "Venafi Platform" driver/connector's policy attributes — not a standalone
  object or endpoint.
- A `zone_name` parameter on the Network Discovery import API, which is just
  the target folder path for discovered certificates — an unrelated,
  coincidentally-named parameter.

**If you're looking for TPP's equivalent of a VaaS Zone:** look at **Policy
Folders** instead, specifically the `certificate_authority` policy attribute
and the CA template parameter set on certificate creation. There's no
drop-in equivalent object — the grouping of "which CA, under which policy"
is expressed through folder-level policy, not a dedicated resource.

## Summary

| VaaS/Cloud term | TPP on-prem equivalent |
|---|---|
| Zone | No equivalent object — use Policy Folder + CA template policy attribute |
| Application (user-facing) | Not a TPP concept at this layer — TPP's "Application" is an install target |
| — | Device → Application is TPP's install-target hierarchy; it has no VaaS counterpart |
