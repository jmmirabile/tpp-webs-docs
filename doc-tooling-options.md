# Documentation Toolchain Options

Candidates for hosting both an auto-generated REST endpoint reference and a
hand-written conceptual guide (Venafi domain model, auth flow, workflows).

## 1. Docusaurus + OpenAPI plugin (`docusaurus-plugin-openapi-docs`)
- React/JS static site generator (Node toolchain).
- Narrative pages written in Markdown/MDX live alongside auto-generated
  endpoint reference pages built from an OpenAPI spec.
- Strong built-in search, versioning, nice default theme.
- Best if: you don't mind a Node/npm build step, want the most polished
  out-of-the-box look, and may eventually version the guide (v1 API vs v2 API).

## 2. Sphinx + sphinxcontrib-openapi
- Python ecosystem tool — this is literally what generates the official
  Python docs (docs.python.org) and Sphinx's own docs.
- Narrative written in reStructuredText (or MyST Markdown), endpoint
  reference generated from an OpenAPI spec via the `sphinxcontrib-openapi`
  extension.
- Mature, very stable, huge plugin ecosystem — but default theme output
  looks more "textbook" unless you add a modern theme (e.g. `furo`,
  `sphinx-rtd-theme`).
- Best if: you're already comfortable in the Python tooling world.

## 3. MkDocs Material + an OpenAPI plugin (e.g. `mkdocs-render-swagger-plugin`)
- Python/YAML config, lighter-weight than Sphinx.
- The Material theme itself (squidfunk's own docs site) is a good example
  of how polished plain MkDocs output can look.
- Narrative pages in plain Markdown; OpenAPI reference rendered via plugin
  (quality/completeness varies more by plugin than with Docusaurus/Sphinx).
- Best if: you want the simplest config and don't need deep OpenAPI
  customization.

## Note on this project's scope
No live Swagger/OpenAPI spec is available (working from Venafi's public
docs site only), so whichever tool we pick, the "auto-generated" reference
will actually need to be semi-manual: either hand-authoring an OpenAPI spec
from the public docs, or hand-writing the endpoint reference directly in
the tool's native format.
