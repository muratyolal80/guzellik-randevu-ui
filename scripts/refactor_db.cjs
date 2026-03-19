const fs = require('fs');
const path = require('path');

const dbPath = path.join('services', 'db.ts');
const dbContent = fs.readFileSync(dbPath, 'utf8');

const dbDir = path.join('services', 'db');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);

// Mapping of services to their target file
const targetMap = {
    'MasterDataService': 'db_core',
    'GlobalSearchService': 'db_core',
    'PlatformService': 'db_core',

    'SalonDataService': 'db_salon',
    'WorkingHoursService': 'db_salon',
    'GalleryService': 'db_salon',
    'FavoriteService': 'db_salon',
    'ReviewService': 'db_salon',

    'StaffService': 'db_staff',
    'ServiceService': 'db_staff',
    'StaffReviewService': 'db_staff',
    'StaffAnalyticsService': 'db_staff',

    'AppointmentService': 'db_appointments',
    'CampaignService': 'db_appointments',
    'InviteService': 'db_appointments',

    'PaymentService': 'db_finance',
    'SubscriptionService': 'db_finance',
    'SubmerchantService': 'db_finance',
    'FinanceService': 'db_finance',

    'SupportService': 'db_support',
    'IYSService': 'db_support',
    'NotificationService': 'db_support',
    'AuditLogService': 'db_support',

    'ProfileService': 'db_user',
    'DashboardService': 'db_user'
};

const header = `import { supabase, supabaseUrl } from '@/lib/supabase';
import type {
  City, District, SalonType, ServiceCategory, GlobalService,
  Salon, SalonDetail, Staff, SalonService, SalonServiceDetail,
  WorkingHours, SalonWorkingHours, Appointment, Review, IYSLog,
  SupportTicket, TicketMessage, Favorite, Notification,
  Invite, StaffReview, SalonGallery, ReviewImage, Profile,
  Coupon, Package, Transaction, AppointmentCoupon, DiscountType, PaymentMethod, PaymentStatus
} from '@/types';

// Helper to check if we have a real connection
const isSupabaseConfigured = () => {
  return typeof supabaseUrl === 'string' && supabaseUrl.includes('localhost:8000');
};
`;

const fileContents = {};
for (const file of new Set(Object.values(targetMap))) {
    fileContents[file] = header;
}

let currentService = null;
let currentBraceLevel = 0;
let currentBlock = [];

const lines = dbContent.split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!currentService) {
        const match = line.match(/^export const (\w+Service)\s*=\s*\{/);
        if (match) {
            currentService = match[1];
            currentBlock.push(line);
            const openBraces = (line.match(/\{/g) || []).length;
            const closeBraces = (line.match(/\}/g) || []).length;
            currentBraceLevel = openBraces - closeBraces;
        }
    } else {
        currentBlock.push(line);

        // Strip strings and comments before counting braces to prevent false positives
        const cleanLine = line.replace(/("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*'|`[^`\\]*(?:\\.[^`\\]*)*`|\/\/.*$)/g, '');
        const openBraces = (cleanLine.match(/\{/g) || []).length;
        const closeBraces = (cleanLine.match(/\}/g) || []).length;
        currentBraceLevel += (openBraces - closeBraces);

        if (currentBraceLevel === 0) {
            const targetFile = targetMap[currentService];
            if (targetFile) {
                fileContents[targetFile] += '\n' + currentBlock.join('\n') + '\n';
            } else {
                console.warn('Unknown service:', currentService);
            }
            currentService = null;
            currentBlock = [];
        }
    }
}

// Write the separated files
for (const [file, content] of Object.entries(fileContents)) {
    fs.writeFileSync(path.join(dbDir, file + '.ts'), content, 'utf8');
    console.log('Created ' + file + '.ts');
}

// Write the barrel file
const barrelContent = Object.keys(fileContents).map(f => `export * from './db/${f}';`).join('\n') + '\n';
fs.writeFileSync(dbPath, barrelContent, 'utf8');
console.log('Replaced db.ts with barrel exports.');
