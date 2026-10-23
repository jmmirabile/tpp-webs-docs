# Authentication

TPP supports two authentication mechanisms. Use OAuth; the legacy API key
has been deprecated since TPP 20.1.

## OAuth (current)

OAuth requires two things to be set up ahead of time in Aperture (TPP's admin
UI): an **API Application Integration**, which has an **Application ID**
(`client_id`) and defines the maximum scope and which users/groups may use
it. At request time, you supply that Application ID plus a **scope** string —
the actual subset of permissions you want for this session, which must fall
within what the Application Integration allows.

### Password grant

```http
POST https://{host}/vedauth/Authorize/OAuth
Content-Type: application/json

{
  "client_id": "my-integration",
  "username": "myuser",
  "password": "mypassword",
  "scope": "certificate:approve,delete;statistics"
}
```

The response carries `access_token`, `refresh_token`, `expires_in`, `scope`,
and `token_type`. Send the access token on every subsequent request:

```http
Authorization: Bearer {access_token}
```

### Client-certificate OAuth

If you authenticate via mutual TLS instead of a password, the request body
drops the username/password entirely — the client certificate is presented
at the TLS layer, not in JSON:

```http
POST https://{host}/vedauth/Authorize/Certificate
Content-Type: application/json

{ "client_id": "my-integration", "scope": "certificate:approve,delete" }
```

### Other OAuth flows

- **Device code** — `POST /vedauth/Authorize/Device` starts a device-code
  flow (useful for CLIs without a browser); exchange the resulting code via
  `POST /vedauth/Authorize/Token`.
- **Integrated (Windows) auth** — `POST /vedauth/Authorize/Integrated`.
- **Token refresh** — `POST /vedauth/Authorize/Token` with a `refresh_token`,
  used when your access token expires.
- **Verify/introspect** — `GET /vedauth/Authorize/Verify` returns the
  identity, scope, and remaining validity of the current token.
- **Revoke (log out)** — `GET /vedauth/Revoke/Token` invalidates the current
  token immediately.

## Legacy API key (deprecated since TPP 20.1)

```http
POST https://{host}/vedsdk/Authorize
Content-Type: application/json

{ "Username": "myuser", "Password": "mypassword" }
```

The response field is literally named `APIKey`. Send it back as:

```http
X-Venafi-API-Key: {APIKey}
```

Avoid this for new integrations — Venafi's own server emits a deprecation
warning on this path, and OAuth gives you scoped, revocable, refreshable
tokens instead of a single long-lived password-equivalent key.

## Handling token expiry

Access tokens expire. When a request comes back `401`, re-authenticate using
the refresh token (for OAuth) and retry the same request — don't treat a
single 401 as a hard failure. If you're not using OAuth, a 401 means you need
to call `/vedsdk/Authorize` again with your credentials.

## Content type and TLS

Every request body is `application/json`. TPP's default self-signed/internal
CA certificates mean you may need to explicitly configure your HTTP client's
TLS verification behavior for your environment rather than disabling it
globally.
