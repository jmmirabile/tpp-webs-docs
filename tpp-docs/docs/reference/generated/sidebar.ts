import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "reference/generated/venafi-tpp-websdk-api-unofficial-hand-maintained",
    },
    {
      type: "category",
      label: "Auth",
      items: [
        {
          type: "doc",
          id: "reference/generated/legacy-username-password-login-deprecated-since-tpp-20-1",
          label: "Legacy username/password login (deprecated since TPP 20.1)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "reference/generated/o-auth-token-via-username-password-password-grant",
          label: "OAuth token via username/password (password grant)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "reference/generated/o-auth-token-via-client-certificate-mutual-tls",
          label: "OAuth token via client certificate (mutual TLS)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "reference/generated/refresh-an-o-auth-token-or-exchange-a-device-code",
          label: "Refresh an OAuth token, or exchange a device code",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "reference/generated/verify-introspect-the-current-token",
          label: "Verify/introspect the current token",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "reference/generated/revoke-log-out-the-current-session-token",
          label: "Revoke (log out) the current session token",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Certificates",
      items: [
        {
          type: "doc",
          id: "reference/generated/list-search-certificates",
          label: "List/search certificates",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "reference/generated/enroll-request-a-new-certificate",
          label: "Enroll/request a new certificate",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "reference/generated/renew-a-certificate",
          label: "Renew a certificate",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "reference/generated/download-certificate-data-in-a-given-format",
          label: "Download certificate data in a given format",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "reference/generated/revoke-a-certificate",
          label: "Revoke a certificate",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "reference/generated/associate-a-certificate-with-one-or-more-application-objects",
          label: "Associate a certificate with one or more Application objects",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "reference/generated/import-an-externally-issued-certificate-and-optional-private-key",
          label: "Import an externally-issued certificate (and optional private key)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "reference/generated/run-file-ssl-tls-validation-against-a-batch-of-certificates",
          label: "Run file/SSL-TLS validation against a batch of certificates",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "reference/generated/read-a-certificate-objects-attributes-by-guid",
          label: "Read a certificate object's attributes by GUID",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "reference/generated/delete-a-certificate-object-by-guid",
          label: "Delete a certificate object by GUID",
          className: "api-method delete",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
