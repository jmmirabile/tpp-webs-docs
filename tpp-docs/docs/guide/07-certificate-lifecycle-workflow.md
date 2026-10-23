# End-to-End Workflow: Request → Retrieve a Certificate

A walkthrough of the most common real-world flow, grounded in actual
endpoint calls. Full field-level reference is in the [Certificates API
Reference](../reference/certificates/overview.md).

## 1. Request (enroll) a certificate

```http
POST https://{host}/vedsdk/Certificates/Request
Authorization: Bearer {token}
Content-Type: application/json

{
  "PolicyDN": "\\VED\\Policy\\Certificates\\example.com",
  "Subject": "www.example.com",
  "SubjectAltNames": [
    { "TypeName": "DNS", "Name": "www.example.com" },
    { "TypeName": "DNS", "Name": "example.com" }
  ],
  "KeyAlgorithm": "RSA",
  "KeyBitSize": 2048
}
```

TPP responds with the new certificate's `CertificateDN` and `Guid`. This
step **registers and requests** the certificate — TPP's CA processes the
request asynchronously.

## 2. Wait for issuance, then retrieve it

Poll or wait for the certificate to leave its processing state, then
download the issued material:

```http
POST https://{host}/vedsdk/Certificates/Retrieve
Authorization: Bearer {token}
Content-Type: application/json

{
  "CertificateDN": "\\VED\\Policy\\Certificates\\example.com\\www.example.com",
  "Format": "PKCS #12",
  "IncludePrivateKey": true,
  "Password": "{export-password}"
}
```

Supported formats: Base64 (PEM), Base64 (PKCS#8), DER, JKS, PKCS#7, PKCS#12.

## 3. Associate it with an install target (optional)

If a certificate needs to be pushed to an [Application](./05-the-application-object.md)
(e.g. an Apache vhost), associate it and optionally push immediately:

```http
POST https://{host}/vedsdk/Certificates/Associate
Authorization: Bearer {token}
Content-Type: application/json

{
  "CertificateDN": "\\VED\\Policy\\Certificates\\example.com\\www.example.com",
  "ApplicationDN": ["\\VED\\Policy\\Devices\\web01\\Apache"],
  "PushToNew": true
}
```

## 4. Renew, when it's time

```http
POST https://{host}/vedsdk/Certificates/Renew
Authorization: Bearer {token}
Content-Type: application/json

{ "CertificateDN": "\\VED\\Policy\\Certificates\\example.com\\www.example.com" }
```

If you supply your own CSR (`PKCS10`), TPP uses it; otherwise TPP generates
a new key pair and CSR itself. The response includes the certificate's
*current* thumbprint — compare it after polling to detect when the renewed
certificate has actually landed (the thumbprint changes).

## 5. Revoke, if needed

```http
POST https://{host}/vedsdk/Certificates/Revoke
Authorization: Bearer {token}
Content-Type: application/json

{
  "CertificateDN": "\\VED\\Policy\\Certificates\\example.com\\www.example.com",
  "Reason": 0,
  "Comments": "Decommissioned host"
}
```

## Handling a stuck request

If a request stalls mid-processing (common when a workflow approval ticket
is pending — see the Workflow chapter), two recovery endpoints exist:

- `Certificates/Retry` — resume from wherever it stopped.
- `Certificates/Reset` (with `restart: true`) — clear all processing state
  and start the renewal over from scratch.
