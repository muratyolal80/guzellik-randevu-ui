# Database Initialization Fix

## Problem
The `03-sample-data.sql` file had a PostgreSQL error:
```
ERROR: loop variable of loop over rows must be a record variable or list of scalar variables
```

## Root Cause
In the appointments section, the code was trying to use `SELECT INTO` with variables declared as `RECORD` type when they should have been scalar variables (UUID, INTEGER).

```sql
-- ❌ WRONG:
DECLARE
    staff_record RECORD;
    service_record RECORD;
...
SELECT id INTO staff_record FROM staff...
SELECT id, duration_min INTO service_record FROM salon_services...
```

PostgreSQL doesn't allow `SELECT INTO` a RECORD variable when you're only selecting specific columns.

## Solution
Changed the variable declarations to use scalar types (UUID, INTEGER) instead of RECORD:

```sql
-- ✅ CORRECT:
DECLARE
    staff_id_var UUID;
    service_id_var UUID;
    service_duration_var INTEGER;
...
SELECT id INTO staff_id_var FROM staff...
SELECT id, duration_min INTO service_id_var, service_duration_var FROM salon_services...
```

## Changes Made

### File: `supabase-project/volumes/db/init/03-sample-data.sql`

1. **Line ~187-195**: Changed variable declarations
   - `staff_record RECORD` → `staff_id_var UUID`
   - `service_record RECORD` → `service_id_var UUID` and `service_duration_var INTEGER`

2. **Line ~197-208**: Updated SELECT INTO statements
   - Split the select to get individual values into scalar variables
   - Added NULL checks to skip if staff or service not found

3. **Line ~252**: Fixed reference
   - `service_record.duration_min` → `service_duration_var`

4. **Added Safety**: 
   - Added `AND is_active = true` filter for staff selection
   - Added CONTINUE statements to skip if no staff/service found

## How to Run

### Option 1: Use the Reset Script (Recommended)
```bash
# Windows
reset-db.bat

# Linux/Mac
chmod +x reset-db.sh
./reset-db.sh
```

### Option 2: Manual Initialization
```bash
./init-db.sh
```

## Verification
After running, you should see:
```
✅ Schema created successfully
✅ Seed data loaded successfully
✅ Sample data loaded successfully  # <-- No more ERROR here!
🎉 Database initialization complete!
```

## What Data Gets Created

1. **9 Sample Salons** across Istanbul, Ankara, and İzmir
2. **30-45 Staff Members** with randomized Turkish names
3. **5-8 Services per Salon** from the global services catalog
4. **Working Hours** for all staff (Mon-Sat 9:00-18:00)
5. **25-45 Sample Appointments** for the next 7 days
6. **45-90 Sample Reviews** for all salons

All with realistic, randomized data!

