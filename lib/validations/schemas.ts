import { z } from "zod";

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name is too long"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
    rollNumber: z.string().optional(),
    department: z.string().optional(),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ─── Asset Schemas ────────────────────────────────────────────────────────────

export const createAssetSchema = z.object({
  name: z.string().min(2, "Asset name is required").max(200),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  totalQuantity: z.number().int().min(1, "Quantity must be at least 1"),
  availableQty: z.number().int().min(0),
  condition: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR", "DAMAGED"]),
  location: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().min(0).optional(),
  warrantyExpiry: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export const updateAssetSchema = createAssetSchema.partial();

// ─── Category Schemas ─────────────────────────────────────────────────────────

export const createCategorySchema = z.object({
  name: z.string().min(2, "Category name is required").max(100),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

// ─── Booking Schemas ──────────────────────────────────────────────────────────

export const createBookingSchema = z
  .object({
    assetId: z.string().min(1, "Asset is required"),
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
    purpose: z.string().min(10, "Purpose must be at least 10 characters").max(500),
    eventName: z.string().optional(),
    fromDate: z.string().min(1, "Start date is required"),
    toDate: z.string().min(1, "End date is required"),
  })
  .refine(
    (data) => new Date(data.toDate) > new Date(data.fromDate),
    {
      message: "Return date must be after booking date",
      path: ["toDate"],
    }
  )
  .refine(
    (data) => new Date(data.fromDate) >= new Date(new Date().setHours(0, 0, 0, 0)),
    {
      message: "Booking date cannot be in the past",
      path: ["fromDate"],
    }
  );

export const reviewBookingSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  adminNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
});

// ─── Maintenance Schemas ──────────────────────────────────────────────────────

export const createMaintenanceSchema = z.object({
  assetId: z.string().min(1, "Asset is required"),
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  condition: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR", "DAMAGED"]),
  cost: z.number().min(0).optional(),
  technicianName: z.string().optional(),
  scheduledAt: z.string().optional(),
});

// ─── Types from schemas ───────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type ReviewBookingInput = z.infer<typeof reviewBookingSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
