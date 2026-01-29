# NAS Supabase Setup - FamilyCare Help

## Overview

The local Supabase dev environment for FamilyCare Help runs on the TrueNAS server (`192.168.86.37`) instead of your Mac. This frees up CPU, RAM, and ~20 GB of disk space on your Mac.

## NAS Details

- **NAS IP (local)**: `192.168.86.37`
- **NAS IP (Tailscale, works anywhere)**: `100.115.5.94`
- **Project path on NAS**: `/root/supabase-projects/familycare-help/supabase/`
- **Supabase CLI on NAS**: `/root/supabase`
- **Project ID**: `familycare-help`

## Ports

| Service        | URL                                      |
| -------------- | ---------------------------------------- |
| API            | `http://192.168.86.37:54341`             |
| REST           | `http://192.168.86.37:54341/rest/v1`     |
| GraphQL        | `http://192.168.86.37:54341/graphql/v1`  |
| Edge Functions | `http://192.168.86.37:54341/functions/v1`|
| Database       | `postgresql://postgres:postgres@192.168.86.37:54342/postgres` |
| Studio         | `http://192.168.86.37:54343`             |
| Mailpit        | `http://192.168.86.37:54344`             |

## Starting and Stopping

SSH into the NAS and run:

```bash
# Start
ssh root@192.168.86.37
cd /root/supabase-projects/familycare-help
/root/supabase start

# Stop
ssh root@192.168.86.37
cd /root/supabase-projects/familycare-help
/root/supabase stop

# Check status
ssh root@192.168.86.37
cd /root/supabase-projects/familycare-help
/root/supabase status
```

Or as one-liners from your Mac:

```bash
# Start
ssh root@192.168.86.37 "cd /root/supabase-projects/familycare-help && /root/supabase start"

# Stop
ssh root@192.168.86.37 "cd /root/supabase-projects/familycare-help && /root/supabase stop"

# Status
ssh root@192.168.86.37 "cd /root/supabase-projects/familycare-help && /root/supabase status"
```

## Local Dev Setup

Update your `.env.local` to point to the NAS instead of `127.0.0.1`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://192.168.86.37:54341
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

## Creating and Syncing Migrations

1. Create the migration locally on your Mac:

```bash
supabase migration new <migration_name>
```

2. Edit the new file in `supabase/migrations/` with your SQL changes.

3. Copy it to the NAS:

```bash
scp supabase/migrations/<new_migration>.sql root@192.168.86.37:/root/supabase-projects/familycare-help/supabase/migrations/
```

Then reset the NAS database to apply:

```bash
ssh root@192.168.86.37 "cd /root/supabase-projects/familycare-help && /root/supabase db reset"
```

## Troubleshooting

```bash
# View container logs
ssh root@192.168.86.37 "docker logs supabase_db_familycare-help"

# Restart all containers
ssh root@192.168.86.37 "cd /root/supabase-projects/familycare-help && /root/supabase stop && /root/supabase start"

# Full reset (wipes data)
ssh root@192.168.86.37 "cd /root/supabase-projects/familycare-help && /root/supabase db reset"
```
