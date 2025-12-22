# GuzellikRandevu - Supabase Integration Guide

This guide explains how to set up and use the self-hosted Supabase database for the GuzellikRandevu beauty salon booking system.

## 📋 Database Structure

### 1. Master Data (Admin-Managed Global Data)

These tables contain reference data managed by super admin:

- **cities** - 81 Turkish provinces with plate codes
- **districts** - Districts/counties for each city
- **salon_types** - Business types (Kuaför, Berber, SPA, etc.)
- **service_categories** - Service categories (Hair, Nails, Makeup, etc.)
- **global_services** - Global service catalog that salons can choose from

### 2. Business/Tenant Data

These tables contain business-specific data:

- **salons** - Beauty salon/business information
- **staff** - Salon staff members
- **salon_services** - Services offered by each salon (links global_services with salon-specific pricing)

### 3. Operations Data

These tables handle day-to-day operations:

- **working_hours** - Staff working schedules
- **appointments** - Customer bookings
- **reviews** - Customer reviews and ratings
- **iys_logs** - SMS communication logs (IYS compliance)

## 🚀 Setup Instructions

### Prerequisites

- Docker Desktop installed and running
- Node.js 18+ installed
- Git

### Step 1: Clone and Install

```bash
cd D:\Projects\GuzellikRandevu
npm install
```

### Step 2: Start Supabase

```bash
cd supabase-project
docker compose up -d
```

Wait about 30 seconds for all services to start.

### Step 3: Initialize Database

**On Windows:**
```bash
init-db.bat
```

**On Mac/Linux:**
```bash
chmod +x init-db.sh
./init-db.sh
```

This will:
1. Create all database tables with proper relationships
2. Set up Row Level Security (RLS) policies
3. Load seed data (81 cities, districts, salon types, service categories, global services)

### Step 4: Verify Environment Variables

Check that `.env.local` contains:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY2MzUxNjk5LCJleHAiOjE5MjQwMzE2OTl9.GfuXrgyxrCrcIhhVNCY-DS1-7TBUgJIiijAfPDKpicY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NjYzNTE2OTksImV4cCI6MTkyNDAzMTY5OX0.Vt7ePISaEuD67tvGrMfG3A4583LtssFBLIf8ojOZdz4
```

### Step 5: Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## 🎨 Supabase Studio

Access the Supabase Studio dashboard at: http://localhost:3000 (Supabase Studio runs on port 3000, adjust Next.js dev server if needed)

Default credentials (from supabase-project/.env):
- Username: supabase
- Password: 5a537f90b6c1d701a540aa69b7bc5287

## 📊 Database Access

### Via Supabase Studio

1. Open http://localhost:3000
2. Navigate to Table Editor
3. Browse and edit data

### Via SQL Editor

Use the SQL Editor in Supabase Studio to run queries:

```sql
-- Get all salons with ratings
SELECT * FROM salon_details;

-- Get services by category
SELECT gs.name, sc.name as category
FROM global_services gs
JOIN service_categories sc ON gs.category_id = sc.id
ORDER BY sc.name, gs.name;
```

### Via Code

Use the service layer in `services/db.ts`:

```typescript
import { MasterDataService, SalonService } from '@/services/db';

// Get all cities
const cities = await MasterDataService.getCities();

// Search salons
const salons = await SalonService.searchSalons({
  cityId: 'some-uuid',
  typeId: 'some-uuid'
});

// Create appointment
const appointment = await AppointmentService.createAppointment({
  customer_name: 'Ahmet Yılmaz',
  customer_phone: '5551234567',
  salon_id: 'salon-uuid',
  staff_id: 'staff-uuid',
  salon_service_id: 'service-uuid',
  start_time: '2025-12-25T10:00:00Z',
  end_time: '2025-12-25T11:00:00Z',
  status: 'PENDING'
});
```

## 🔐 Security (Row Level Security)

### Current RLS Policies

1. **Master Data** - Public read access (anyone can browse cities, salon types, etc.)
2. **Business Data** - Public read access for browsing salons
3. **Appointments** - Anyone can create, view all (adjust for production)
4. **Reviews** - Anyone can create and view
5. **IYS Logs** - Restricted to service role only

### For Production

You should update RLS policies to:
- Require authentication for creating appointments
- Allow users to view only their own appointments
- Allow salon owners to manage their own salons/staff
- Restrict admin operations to admin role

## 🗂️ Service Layer API

### MasterDataService

```typescript
// Get reference data
await MasterDataService.getCities()
await MasterDataService.getDistrictsByCity(cityId)
await MasterDataService.getSalonTypes()
await MasterDataService.getServiceCategories()
await MasterDataService.getGlobalServicesByCategory(categoryId)
```

### SalonService

```typescript
// Query salons
await SalonService.getSalons()
await SalonService.getSalonById(id)
await SalonService.searchSalons({ cityId, districtId, typeId, query })
await SalonService.getSalonsByLocation(lat, lng, radiusKm)

// Manage salons
await SalonService.createSalon(salon)
await SalonService.updateSalon(id, updates)
```

### StaffService

```typescript
await StaffService.getStaffBySalon(salonId)
await StaffService.getStaffById(id)
await StaffService.createStaff(staff)
```

### ServiceService

```typescript
await ServiceService.getServicesBySalon(salonId)
await ServiceService.addServiceToSalon(service)
await ServiceService.updateSalonService(id, updates)
```

### AppointmentService

```typescript
await AppointmentService.getAppointmentsBySalon(salonId, startDate, endDate)
await AppointmentService.getAppointmentsByStaff(staffId, date)
await AppointmentService.getAppointmentsByPhone(phone)
await AppointmentService.createAppointment(appointment)
await AppointmentService.updateAppointmentStatus(id, status)
await AppointmentService.cancelAppointment(id)
```

### ReviewService

```typescript
await ReviewService.getReviewsBySalon(salonId)
await ReviewService.createReview(review)
await ReviewService.getSalonRating(salonId)
```

### IYSService

```typescript
await IYSService.logSMS(log)
await IYSService.getLogsByPhone(phone)
await IYSService.getAllLogs() // Admin only
```

## 🔄 Database Migrations

When you need to modify the schema:

1. Create a new SQL file in `supabase-project/volumes/db/init/`
2. Name it with an incremental number (e.g., `03-add-features.sql`)
3. Run it via SQL Editor or:
   ```bash
   docker exec -i supabase-db psql -U postgres -d postgres < supabase-project/volumes/db/init/03-add-features.sql
   ```

## 🧪 Testing

### Check Database Connection

```typescript
// In any component or page
import { supabase } from '@/lib/supabase';

const testConnection = async () => {
  const { data, error } = await supabase.from('cities').select('count');
  console.log('Cities count:', data);
};
```

### Verify Seed Data

```sql
-- In Supabase Studio SQL Editor
SELECT 
  (SELECT COUNT(*) FROM cities) as cities,
  (SELECT COUNT(*) FROM districts) as districts,
  (SELECT COUNT(*) FROM salon_types) as salon_types,
  (SELECT COUNT(*) FROM service_categories) as categories,
  (SELECT COUNT(*) FROM global_services) as global_services;
```

Expected results:
- Cities: 81
- Districts: ~200+
- Salon Types: 9
- Service Categories: 8
- Global Services: ~60+

## 📝 Notes

### TypeScript Types

All database types are defined in `types.ts`:
- Match exactly with database schema
- Include both base types and extended types with joins
- Used throughout the application for type safety

### Legacy Compatibility

The service layer maintains backward compatibility:
- `MasterService` is an alias for `MasterDataService`
- Some types (like `Service`) are kept for existing components

### Performance Tips

1. Use views (`salon_details`, `salon_service_details`) for common queries
2. Indexes are created on foreign keys and frequently queried columns
3. Consider adding caching layer (Redis) for production

## 🐛 Troubleshooting

### Docker Issues

```bash
# Restart containers
cd supabase-project
docker compose down
docker compose up -d

# View logs
docker compose logs -f
```

### Connection Issues

1. Verify Docker is running
2. Check containers: `docker ps`
3. Ensure port 8000 is not in use
4. Check environment variables

### Database Issues

```bash
# Reset database (WARNING: Deletes all data)
cd supabase-project
docker compose down -v
docker compose up -d
# Then run init-db.bat again
```

## 🚀 Next Steps

1. **Add Authentication** - Implement Supabase Auth for user management
2. **Create Admin Panel** - Build UI for managing master data
3. **Implement Booking Flow** - Complete appointment booking with time slot availability
4. **Add File Upload** - Integrate Supabase Storage for salon/staff photos
5. **Deploy** - Consider using managed Supabase for production

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Self-Hosting Guide](https://supabase.com/docs/guides/self-hosting/docker)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)

