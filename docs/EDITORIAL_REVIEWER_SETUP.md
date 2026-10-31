# Editorial reviewer provisioning

The Story Review workspace is restricted by the `editorial_reviewers` allowlist. A user must already have a valid authenticated UNIBUD account. Do not grant access by email address, display name, or client-supplied role.

## Before granting access

1. Apply migration `0011_editorial_review.sql` through the normal database migration process.
2. Confirm the migration created `editorial_reviewers`, `story_candidates`, and `story_review_events`.
3. Obtain the authenticated account's immutable user ID from the trusted authentication/database administration surface.
4. Have an authorized database operator review and approve the access request.

## Grant access

Run this statement using a privileged database connection after replacing the placeholder with the verified immutable user ID:

```sql
INSERT INTO editorial_reviewers (user_id, active)
VALUES ('<verified-auth-user-id>', true)
ON CONFLICT (user_id)
DO UPDATE SET active = true, updated_at = now();
```

## Revoke access

```sql
UPDATE editorial_reviewers
SET active = false, updated_at = now()
WHERE user_id = '<verified-auth-user-id>';
```

## Review safety

- Discovery results are unverified leads, not approved stories.
- Reviewers must open the original publisher page and independently verify claims, publisher identity, publication date, relevance, and corrections.
- Summaries must be written from the original source; never fill gaps by guessing.
- Media must have an explicit reuse license or documented permission, creator, and attribution. A publicly reachable image URL is not a license.
- An approval in this workspace only records an editorial decision. It does not publish or distribute content.
- Keep review events append-only and preserve the decision note and checks for audit.
- Do not add a reviewer until the migration, authentication middleware, and audit trail have been tested in a non-production environment.
