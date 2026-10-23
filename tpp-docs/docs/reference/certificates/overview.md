# Certificates

The core certificate lifecycle API: enroll (`Request`), retrieve, renew,
revoke, import, associate with [Application](../../guide/05-the-application-object.md)
install targets, and validate. This is the largest, most action-rich
resource area in the WebSDK API.

Related, certificate-adjacent resources not yet formalized into the OpenAPI
spec:

- **RecycleBin** — manages the deleted-object recycle bin that certificates
  (and other config objects) land in when deleted (restore, purge, retention
  configuration).
- **X509CertificateStore** — a lower-level certificate-blob vault API (raw
  certificate strings keyed by vault ID), distinct from the main
  `/Certificates` config-object API.

See the [Certificate Lifecycle Workflow guide
chapter](../../guide/07-certificate-lifecycle-workflow.md) for a narrative
end-to-end walkthrough, and the generated endpoint pages below for full
request/response schemas.
