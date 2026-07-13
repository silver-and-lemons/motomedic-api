import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  bigserial,
  bigint,
  boolean,
  date,
  numeric,
  index,
  foreignKey,
} from 'drizzle-orm/pg-core';

// ==========================================
// 0. ENUMS
// ==========================================
export const bikeTypeEnum = pgEnum('bike_type', [
  'Auto Scooter',
  'Underbone',
  'Sport/Naked/Big Bike',
]);
export const fuelSystemEnum = pgEnum('fuel_system', ['carbureted', 'fuel_injected']);
export const coolingSystemEnum = pgEnum('cooling_system', ['air', 'liquid']);
export const checklistStatusEnum = pgEnum('checklist_status', ['Pass', 'Fail', 'N/A']);

// ==========================================
// 1. AUTH & USER TABLES
// ==========================================
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  googleId: varchar('google_id', { length: 255 }).unique(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  contactNumber: varchar('contact_number', { length: 50 }).unique(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ==========================================
// 2. OTP & REFRESH TOKEN TABLES
// ==========================================
export const otpTokens = pgTable(
  'otp_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    otpCode: varchar('otp_code', { length: 64 }).notNull(),
    purpose: varchar('purpose', { length: 20 }).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    verified: boolean('verified').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_otp_tokens_user').on(table.userId),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'otp_tokens_user_id_fkey',
    }).onDelete('cascade'),
  ],
);

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_refresh_tokens_user').on(table.userId),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'refresh_tokens_user_id_fkey',
    }).onDelete('cascade'),
  ],
);

// ==========================================
// 3. CORE BIKE CATALOG & OWNERSHIP
// ==========================================
export const bikes = pgTable(
  'bikes',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    brand: varchar('brand', { length: 100 }).notNull(),
    model: varchar('model', { length: 150 }).notNull(),
    type: bikeTypeEnum('type').notNull(),
    year: integer('year').notNull(),
    engineSize: integer('engine_size'),
    fuelSys: fuelSystemEnum('fuel_sys').notNull(),
    coolSys: coolingSystemEnum('cool_sys').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('idx_bikes_lookup').on(table.brand, table.model)],
);

export const bikeOwned = pgTable(
  'bike_owned',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    bikeId: bigint('bike_id', { mode: 'number' }).notNull(),
    plateNumber: varchar('plate_number', { length: 50 }).unique(),
    chassisNumber: varchar('chassis_number', { length: 100 }),
    currentOdometer: integer('current_odometer').default(0),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('idx_bike_owned_user').on(table.userId),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'bike_owned_user_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.bikeId],
      foreignColumns: [bikes.id],
      name: 'bike_owned_bike_id_fkey',
    }).onDelete('restrict'),
  ],
);

// ==========================================
// 4. DETAILED BIKE STATUS / CHECKLIST LOGS
// ==========================================
export const bikeStatuses = pgTable(
  'bike_statuses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    bikeOwnedId: uuid('bike_owned_id').notNull(),
    loggedAt: timestamp('logged_at', { withTimezone: true }).defaultNow().notNull(),
    odometerAtInspection: integer('odometer_at_inspection'),

    // Main Health Checklist
    tyrePressureCondition: checklistStatusEnum('tyre_pressure_condition').default('Pass'),
    engineOilLevel: checklistStatusEnum('engine_oil_level').default('Pass'),
    frontRearBrakes: checklistStatusEnum('front_rear_brakes').default('Pass'),
    lights: checklistStatusEnum('lights').default('Pass'),
    fuelLevel: checklistStatusEnum('fuel_level').default('Pass'),

    // Additional Checklist
    chainTensionLubrication: checklistStatusEnum('chain_tension_lubrication').default('Pass'),
    sprocketCondition: checklistStatusEnum('sprocket_condition').default('Pass'),
    chokeWarmup: checklistStatusEnum('choke_warmup').default('Pass'),
    fiWarningLight: checklistStatusEnum('fi_warning_light').default('Pass'),
    coolantLevel: checklistStatusEnum('coolant_level').default('Pass'),
    batteryElectricals: checklistStatusEnum('battery_electricals').default('Pass'),
    brakeFluidLevel: checklistStatusEnum('brake_fluid_level').default('Pass'),
    absSelfCheck: checklistStatusEnum('abs_self_check').default('Pass'),

    remarks: text('remarks'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_bike_statuses_owned').on(table.bikeOwnedId),
    foreignKey({
      columns: [table.bikeOwnedId],
      foreignColumns: [bikeOwned.id],
      name: 'bike_statuses_bike_owned_id_fkey',
    }).onDelete('cascade'),
  ],
);

// ==========================================
// 5. SERVICE HISTORY TRACKING
// ==========================================
export const bikeServiceHistory = pgTable(
  'bike_service_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    bikeOwnedId: uuid('bike_owned_id').notNull(),
    serviceDate: date('service_date').defaultNow().notNull(),
    odometerAtService: integer('odometer_at_service'),
    serviceType: varchar('service_type', { length: 100 }).notNull(),
    itemsServiced: text('items_serviced').array().notNull(),
    cost: numeric('cost', { precision: 10, scale: 2 }).default('0.00'),
    performedBy: varchar('performed_by', { length: 255 }),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('idx_bike_service_history_owned').on(table.bikeOwnedId),
    foreignKey({
      columns: [table.bikeOwnedId],
      foreignColumns: [bikeOwned.id],
      name: 'bike_service_history_bike_owned_id_fkey',
    }).onDelete('cascade'),
  ],
);
