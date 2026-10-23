// @ts-check

// NOTE: docusaurus-plugin-openapi-docs writes docs/reference/generated/sidebar.ts
// each time `npx docusaurus gen-api-docs tpp` runs. Importing a .ts file from this
// plain .js config isn't reliable across Docusaurus's config loader, so the two
// generated categories below are copied in by hand. If you re-run gen-api-docs
// after adding more paths/tags to openapi/tpp-websdk.yaml, re-sync these two
// arrays (and add new `type: 'category'` blocks for any new tags) from the
// freshly generated sidebar.ts.

const authApiItems = [
  {type: 'doc', id: 'reference/generated/legacy-username-password-login-deprecated-since-tpp-20-1', label: 'Legacy username/password login (deprecated since TPP 20.1)', className: 'api-method post'},
  {type: 'doc', id: 'reference/generated/o-auth-token-via-username-password-password-grant', label: 'OAuth token via username/password (password grant)', className: 'api-method post'},
  {type: 'doc', id: 'reference/generated/o-auth-token-via-client-certificate-mutual-tls', label: 'OAuth token via client certificate (mutual TLS)', className: 'api-method post'},
  {type: 'doc', id: 'reference/generated/refresh-an-o-auth-token-or-exchange-a-device-code', label: 'Refresh an OAuth token, or exchange a device code', className: 'api-method post'},
  {type: 'doc', id: 'reference/generated/verify-introspect-the-current-token', label: 'Verify/introspect the current token', className: 'api-method get'},
  {type: 'doc', id: 'reference/generated/revoke-log-out-the-current-session-token', label: 'Revoke (log out) the current session token', className: 'api-method get'},
];

const certificatesApiItems = [
  {type: 'doc', id: 'reference/generated/list-search-certificates', label: 'List/search certificates', className: 'api-method get'},
  {type: 'doc', id: 'reference/generated/enroll-request-a-new-certificate', label: 'Enroll/request a new certificate', className: 'api-method post'},
  {type: 'doc', id: 'reference/generated/renew-a-certificate', label: 'Renew a certificate', className: 'api-method post'},
  {type: 'doc', id: 'reference/generated/download-certificate-data-in-a-given-format', label: 'Download certificate data in a given format', className: 'api-method post'},
  {type: 'doc', id: 'reference/generated/revoke-a-certificate', label: 'Revoke a certificate', className: 'api-method post'},
  {type: 'doc', id: 'reference/generated/associate-a-certificate-with-one-or-more-application-objects', label: 'Associate a certificate with one or more Application objects', className: 'api-method post'},
  {type: 'doc', id: 'reference/generated/import-an-externally-issued-certificate-and-optional-private-key', label: 'Import an externally-issued certificate (and optional private key)', className: 'api-method post'},
  {type: 'doc', id: 'reference/generated/run-file-ssl-tls-validation-against-a-batch-of-certificates', label: 'Run file/SSL-TLS validation against a batch of certificates', className: 'api-method post'},
  {type: 'doc', id: 'reference/generated/read-a-certificate-objects-attributes-by-guid', label: "Read a certificate object's attributes by GUID", className: 'api-method get'},
  {type: 'doc', id: 'reference/generated/delete-a-certificate-object-by-guid', label: 'Delete a certificate object by GUID', className: 'api-method delete'},
];

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  guideSidebar: [
    'guide/overview',
    'guide/authentication',
    'guide/object-model',
    'guide/policy-and-folders',
    'guide/the-application-object',
    'guide/devices-and-certificates',
    'guide/certificate-lifecycle-workflow',
    'guide/workflow-approvals',
    'guide/permissions-and-identity',
  ],

  referenceSidebar: [
    {
      type: 'category',
      label: 'Auth',
      link: {type: 'doc', id: 'reference/auth/overview'},
      items: authApiItems,
    },
    {
      type: 'category',
      label: 'Policy & Config',
      link: {type: 'doc', id: 'reference/policy-config/overview'},
      items: [],
    },
    {
      type: 'category',
      label: 'Certificates',
      link: {type: 'doc', id: 'reference/certificates/overview'},
      items: certificatesApiItems,
    },
    {
      type: 'category',
      label: 'Devices & Applications',
      link: {type: 'doc', id: 'reference/devices-applications/overview'},
      items: [],
    },
    {
      type: 'category',
      label: 'Identity & Access',
      link: {type: 'doc', id: 'reference/identity-access/overview'},
      items: [],
    },
    {
      type: 'category',
      label: 'Workflow',
      link: {type: 'doc', id: 'reference/workflow/overview'},
      items: [],
    },
    {
      type: 'category',
      label: 'Discovery',
      link: {type: 'doc', id: 'reference/discovery/overview'},
      items: [],
    },
    {
      type: 'category',
      label: 'SSH',
      link: {type: 'doc', id: 'reference/ssh/overview'},
      items: [],
    },
    {
      type: 'category',
      label: 'Code Signing',
      link: {type: 'doc', id: 'reference/codesign/overview'},
      items: [],
    },
    {
      type: 'category',
      label: 'PKI / HSM / Crypto',
      link: {type: 'doc', id: 'reference/pki-crypto/overview'},
      items: [],
    },
    {
      type: 'category',
      label: 'Platform & System',
      link: {type: 'doc', id: 'reference/platform-system/overview'},
      items: [],
    },
  ],
};

export default sidebars;
