# Object Model Overview

> **Status: placeholder.** Full chapter coming in Phase 2.

TPP models almost everything as a node in a single hierarchical tree of
**Config Objects**, each identified by a Distinguished Name (DN), e.g.
`\VED\Policy\Certificates\example.com`. A node's **Config Class** (a TPP-
internal type name like `"Policy"`, `"Device"`, or `"Apache"`) determines
what kind of object it is.

The containment chain that matters most day-to-day:

```
Policy Folder → Device → Application
                        → Certificate (associated, not strictly nested)
```

See [The Application Object](./05-the-application-object.md) for why
"Application" doesn't mean what you'd assume, and [Certificate Lifecycle
Workflow](./07-certificate-lifecycle-workflow.md) for how certificates move
through this model end to end.
