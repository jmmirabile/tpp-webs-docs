# TPP WebSDK Authentication — Facts from pytpp

Source: `pytpp-master` (MIT-licensed Python client for Venafi TPP WebSDK).
All facts below are derived directly from the client source code, not from the project's `.rst` prose.

## 1. Base URL structure

TPP exposes two separate REST "application" roots on the same host, distinguished only by the path segment:

- `{scheme}://{host}/vedsdk` — the general WebSDK API (certificates, config, folders, etc.)
- `{scheme}://{host}/vedauth` — the OAuth authorization API

Construction, in `pytpp/api/websdk/websdk.py`:
- `self._scheme = 'https'` (hardcoded) — line 89
- `self._base_url = f'{self._scheme}://{host}'` — line 90
- `self._app_url = f'{self._base_url}/vedsdk'` — line 91

Every endpoint object (`ApiEndpoint.__init__`, `pytpp/api/api_base.py:52-67`) is initialized with a relative `url`; if that url doesn't already start with `_base_url`, it is prefixed with `_app_url` (i.e. `/vedsdk`) by default. The OAuth-specific `_Authorize` endpoint class explicitly overrides this by string-substituting `vedsdk` → `vedauth` in its own already-built URL:

```python
# pytpp/api/websdk/endpoints/authorize.py:8-18
class _Authorize(WebSdkEndpoint):
    def __init__(self, api_obj):
        super().__init__(api_obj=api_obj, url='/Authorize')   # -> {base}/vedsdk/Authorize
        vedauth_url = self._url.replace('vedsdk', 'vedauth')  # -> {base}/vedauth/Authorize
        self.Certificate = self._Certificate(api_obj=api_obj, url=f'{vedauth_url}/Certificate')
        self.Device = self._Device(api_obj=api_obj, url=f'{vedauth_url}/Device')
        self.Integrated = self._Integrated(api_obj=api_obj, url=f'{vedauth_url}/Integrated')
        self.OAuth = self._OAuth(api_obj=api_obj, url=f'{vedauth_url}/OAuth')
        self.Token = self._Token(api_obj=api_obj, url=f'{vedauth_url}/Token')
        self.Verify = self._Verify(api_obj=api_obj, url=f'{vedauth_url}/Verify')
```

Resulting real endpoint paths (as built by the client):

| Purpose | Method | Path |
|---|---|---|
| Legacy username/password auth (deprecated) | POST | `/vedsdk/Authorize` |
| OAuth via username/password | POST | `/vedauth/Authorize/OAuth` |
| OAuth via client certificate | POST | `/vedauth/Authorize/Certificate` |
| OAuth device-code flow (start) | POST | `/vedauth/Authorize/Device` |
| OAuth "integrated" (Windows-integrated) flow | POST | `/vedauth/Authorize/Integrated` |
| OAuth token refresh / device-code exchange | POST | `/vedauth/Authorize/Token` |
| Verify current token / introspect | GET | `/vedauth/Authorize/Verify` |

(`pytpp/api/websdk/endpoints/authorize.py`, lines 8-194)

## 2. The two auth mechanisms

### 2.1 OAuth (Application ID + Scope) — current/recommended

Per `pytpp/api/authenticate.py:16-20` and `pytpp/api/websdk/websdk.py:50-58` (docstrings), OAuth requires:
- An **Application ID** (`application_id`) — identifies an "API Application Integration" that must be pre-created in Aperture (TPP's admin UI), which defines the maximum allowed scope and which users/groups may use it.
- A **Scope** string (`scope`) — the actual subset of permissions requested for this session, must be within the bounds defined by the Application Integration.

Code path (`pytpp/api/websdk/websdk.py:109-130`):
```python
if not token:
    if application_id:
        if not scope:
            raise ValueError(...)
        elif isinstance(scope, Scope):
            scope = scope.to_string()
        if certificate_path and key_file_path:
            oauth = self.Authorize.Certificate.post(client_id=application_id, scope=scope)
        else:
            oauth = self.Authorize.OAuth.post(
                client_id=application_id, username=username, password=password, scope=scope
            )
        self._oauth = oauth
        token = oauth.access_token
    else:
        # Deprecated since TPP Version 20.1
        token = self.Authorize.post(username=username, password=password).token
```

The OAuth POST body for username/password OAuth (`_OAuth.post`, `authorize.py:108-133`) is:
```json
{"client_id": "...", "password": "...", "scope": "...", "username": "...", "state": null}
```
The response model (`Output` class, same method) carries: `access_token`, `expires`, `expires_in`, `identity`, `refresh_token`, `refresh_until`, `scope`, `token_type`.

### 2.2 Client-certificate OAuth variant

When both `certificate_path` and `key_file_path` are supplied, the client calls `Authorize.Certificate.post(client_id=application_id, scope=scope)` → `POST /vedauth/Authorize/Certificate` instead of the username/password OAuth endpoint (`websdk.py:117-121`). The request body for this variant is just `{"client_id": ..., "scope": ...}` — **no username/password in the body**; the client certificate itself is presented at the TLS layer. This is configured on the underlying `requests` session via `Session.__init__` (`pytpp/api/session.py:30-34`):
```python
if bool(certificate_path) != bool(key_file_path):
    raise ValueError('The path to both the certificate file and the key file must be given...')
if certificate_path and key_file_path:
    self.request_kwargs['cert'] = (certificate_path, key_file_path)
```
This sets the `cert=(cert_file, key_file)` kwarg that the `requests` library uses for mutual-TLS client certificate authentication on every HTTP call.

Other OAuth sub-flows present in the code but not part of the two headline mechanisms:
- **Device flow** — `Authorize.Device.post(client_id, scope)` → `POST /vedauth/Authorize/Device`, returns `device_code`, `user_code`, `verification_uri`, etc. (`authorize.py:65-86`).
- **Integrated (Windows) auth** — `Authorize.Integrated.post(client_id, scope, state=None)` → `POST /vedauth/Authorize/Integrated` (`authorize.py:88-106`).
- **Token refresh** — `Authorize.Token.post(client_id, refresh_token, grant_type=None, device_code=None)` → `POST /vedauth/Authorize/Token` (`authorize.py:135-157`); used both for refresh-token renewal and for completing the device-code flow.
- **Verify** — `Authorize.Verify.get()` → `GET /vedauth/Authorize/Verify`, returns token introspection data: `identity`, `scope`, `valid_for`, `expires_unix_time`, etc. (`authorize.py:159-194`).

### 2.3 Legacy X-Venafi-API-Key (deprecated)

Enabled by omitting `application_id`/`scope` and supplying only `username`/`password`. Code (`websdk.py:131-133`):
```python
else:
    # Deprecated since TPP Version 20.1
    token = self.Authorize.post(username=username, password=password).token
```
The call hits `POST /vedsdk/Authorize` (`authorize.py:20-39`), body `{"Username": ..., "Password": ...}`, and a runtime deprecation warning is raised via Python's `warnings` module:
```python
warnings.warn('Authorizing to TPP with only a username and password is being deprecated. '
              'Refer to product documentation on using OAuth authentication.')
```
(`authorize.py:24-25`)

**Deprecated since TPP version 20.1** — stated explicitly in both `authenticate.py:17` and `websdk.py:53` docstrings, and in the inline comment at `websdk.py:132`.

The response model for the legacy call (`authorize.py:31-33`) is:
```python
class Output(WebSdkOutputModel):
    token: str = ApiField(alias='APIKey')
    valid_until: datetime = ApiField(alias='ValidUntil')
```
i.e. the legacy TPP response field is literally named `APIKey`.

## 3. How the Scope object works

Defined in `pytpp/api/websdk/enums/oauth.py`. `Scope` is a small fluent/builder class, not a plain enum of constants. It models 8 permission categories, each backed by a `Permissions` dataclass (`name`, plus a subset of `approve`/`delete`/`discover`/`manage`/`read`/`revoke` booleans):

```python
# oauth.py:29-39
class Scope:
    def __init__(self):
        self._certificate = Permissions(name='certificate')
        self._ssh = Permissions(name='ssh')
        self._codesign = Permissions(name='codesign')
        self._configuration = Permissions(name='configuration')
        self._restricted = Permissions(name='restricted')
        self._security = Permissions(name='security')
        self._statistics = Permissions(name='statistics')
        self._agent = Permissions(name='agent')
```
Chainable setter methods: `.certificate(...)`, `.ssh(...)`, `.codesign(...)`, `.configuration(...)`, `.restricted(...)`, `.security(...)`, `.agent(...)`, `.statistics(read=...)` (lines 76-126).

`to_string()` (lines 64-74) serializes the scope into the wire format TPP expects: categories joined by `;`, with a category's selected permissions (other than implied `read`) joined by `,` and attached via `:`, e.g. `certificate:approve,delete;statistics`. If `application_id`/`scope` are passed as a `Scope` instance, `websdk.py:114-115` calls `.to_string()` before sending.

## 4. Bearer tokens in requests — header selection logic

`WebSDK.__init__` decides which header to send based on a heuristic: **OAuth access tokens happen to be base64 strings ending in `==`,** while legacy API keys do not. The code literally branches on that trailing pattern (`websdk.py:142-151`):

```python
if token.endswith('=='):
    self._token = f'Bearer {token}'
    authorization_header = {'Authorization': self._token}
else:
    self._token = token
    authorization_header = {'X-Venafi-API-Key': self._token}
self._session.update_headers(authorization_header)
```

So:
- **OAuth** → header `Authorization: Bearer <access_token>`
- **Legacy API key** → header `X-Venafi-API-Key: <token>`

Both headers are merged into the shared `requests` session's default headers (`Session.update_headers`, `pytpp/api/session.py:37-38`), so every subsequent call automatically carries the right header.

## 5. Required headers / content type

`Session.__init__` (`pytpp/api/websdk/websdk.py:96-104`) sets up the session with:
```python
self._session = Session(
    headers={'Content-Type': 'application/json'},
    proxies=self._proxies,
    certificate_path=certificate_path, key_file_path=key_file_path,
    verify_ssl=verify_ssl,
    connection_timeout=connection_timeout, read_timeout=read_timeout
)
```
So every request is sent as `Content-Type: application/json`, and bodies are serialized with `json.dumps` (`Session._to_json`, `pytpp/api/session.py:92-94`) after a `_sanitize` pass that strips `None` values and converts `datetime` to ISO 8601 strings (`session.py:96-123`). TLS verification defaults to `verify_ssl=False` unless explicitly enabled; `requests.packages.urllib3.disable_warnings()` is called to suppress the resulting insecure-request warnings (`session.py:21-22`).

## 6. Re-authentication on HTTP 401 / token refresh

All CRUD verbs funnel through `ApiEndpoint._get/_post/_put/_delete` in `pytpp/api/api_base.py` (lines 97-212), each of which:
1. Sends the request.
2. Checks `_should_re_authenticate(response)` — true when `response.status_code == 401` and a token is currently set (`api_base.py:79-80`).
3. If true, calls `self._re_authenticate()` (`api_base.py:214-222`), which logs a debug message and delegates to `self._api_obj.re_authenticate()` — i.e. `WebSDK.re_authenticate()`.
4. Loops back and retries the same request (up to `self.retries` = `self._retries + 1` = 4 attempts total; `api_base.py:68,72-73`).
5. Separately, a `500` response whose body matches `.*rerun the transaction.*` (case-insensitive) is also treated as retryable — this is a documented IIS/TPP deadlock condition (`_rerun_transaction_required`, `api_base.py:82-95`).
6. Plain `ConnectionError`/`ConnectionResetError` exceptions are caught and retried after `self.retry_interval` (0.5s) as well (e.g. `api_base.py:118-121`).

`WebSDK.re_authenticate()` (`pytpp/api/websdk/websdk.py:200-230`) re-runs `self.__init__(...)` with the stored connection parameters:
- If the session was established via OAuth (`self._oauth is not None`), it re-authenticates using the **refresh token** flow: `scope=self._oauth.scope, refresh_token=self._oauth.refresh_token` — this triggers the `elif refresh_token:` branch in `__init__` (lines 134-140), which calls `Authorize.Token.post(client_id=application_id, refresh_token=refresh_token)` → `POST /vedauth/Authorize/Token`.
- Otherwise (legacy auth), it simply re-runs the username/password flow, hitting `POST /vedsdk/Authorize` again.

`Authenticate.re_authenticate()` (`pytpp/api/authenticate.py:67-104`) is a thin wrapper one layer up: if any connection parameter overrides are passed, it fully reconstructs (`self.__init__(...)`); otherwise it just delegates to `self.websdk.re_authenticate()` (line 104).

## 7. Error response shape (`api_base.py`)

- `WebSdkOutputModel` (`api_base.py:375-376`) — the base output model for essentially all WebSDK responses — declares a single common field: `error: str = ApiField(alias='Error')`. I.e., TPP error bodies carry the message under an `"Error"` JSON key.
- `generate_output()` (`api_base.py:290-322`) is the universal response-to-model mapper used by every endpoint method. Behavior:
  - Parses the response JSON (empty dict on failure to parse).
  - Instantiates the Pydantic output model with the raw `api_response` plus parsed fields.
  - Calls `response.raise_for_status()`; if the HTTP status is itself an error (4xx/5xx) **and** an `error`/`Error` field was present in the body, it raises a custom `InvalidResponseError` (`api_base.py:382-386`) wrapping the message from that field; if there's no such field it re-raises the plain `HTTPError`.
  - If the HTTP status is OK but an `error` field is nevertheless present in the body, it does **not** raise — it just logs it (`api_logger.error(...)`, line 317) since some TPP WebSDK operations return 200 with a non-fatal error string alongside partial results.
- `RootOutputModel` (`api_base.py:349-372`) additionally exposes `assert_valid_response()` (raises on bad status) and `is_valid_response()` (returns bool) helpers that calling code uses to check results without relying on exceptions.

## 8. Summary table

| Mechanism | Endpoint | Header used | Status |
|---|---|---|---|
| OAuth, username/password | `POST /vedauth/Authorize/OAuth` | `Authorization: Bearer <token>` | Current |
| OAuth, client certificate | `POST /vedauth/Authorize/Certificate` | `Authorization: Bearer <token>` | Current |
| OAuth, device code | `POST /vedauth/Authorize/Device` then `POST /vedauth/Authorize/Token` | `Authorization: Bearer <token>` | Current |
| OAuth, integrated/Windows | `POST /vedauth/Authorize/Integrated` | `Authorization: Bearer <token>` | Current |
| Legacy username/password | `POST /vedsdk/Authorize` | `X-Venafi-API-Key: <token>` | Deprecated since TPP 20.1 |

Files referenced: `pytpp/api/authenticate.py`, `pytpp/api/websdk/websdk.py`, `pytpp/api/api_base.py`, `pytpp/api/session.py`, `pytpp/api/websdk/endpoints/authorize.py`, `pytpp/api/websdk/enums/oauth.py`.
