import { z } from "zod";

// ============================================================
// AUTH VALIDATORS
// ============================================================

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
  admissionNumber: z.string().min(1, "Admission number is required"),
  department: z.string().min(1, "Department is required"),
  batch: z.string().regex(/^\d{4}$/, "Graduation year must be a 4-digit number (e.g. 2027)"),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// ============================================================
// EVENT VALIDATORS
// ============================================================

export const createEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  eventType: z.enum([
    "workshop",
    "hackathon",
    "bootcamp",
    "seminar",
    "competition",
    "innovation_challenge",
  ]),
  venue: z.string().optional(),
  startDatetime: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid datetime"),
  endDatetime: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid datetime"),
  registrationDeadline: z.string().refine((val) => !val || !isNaN(Date.parse(val)), "Invalid datetime").optional(),
  registrationLimit: z.number().int().positive().optional(),
  participationPoints: z.number().int().default(10),
  volunteerPoints: z.number().int().default(20),
});

export const updateEventSchema = createEventSchema.partial().extend({
  status: z
    .enum(["draft", "published", "ongoing", "completed", "cancelled"])
    .optional(),
});

// ============================================================
// PROJECT VALIDATORS
// ============================================================

export const createProjectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  githubUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  demoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  teamMembers: z.array(z.string()).default([]),
});

export const reviewProjectSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

// ============================================================
// PROFILE VALIDATORS
// ============================================================

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
});

// ============================================================
// FEEDBACK VALIDATORS
// ============================================================

export const eventFeedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comments: z.string().optional(),
});

// ============================================================
// STAFF MANAGEMENT VALIDATORS
// ============================================================

export const addStaffEmailSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  role: z.enum(["coordinator", "execom", "faculty"]),
});

// ============================================================
// OPPORTUNITY VALIDATORS
// ============================================================

export const createOpportunitySchema = z.object({
  title: z.string().min(3),
  type: z.enum([
    "internship",
    "hackathon",
    "competition",
    "grant",
    "startup_program",
  ]),
  description: z.string().optional(),
  link: z.string().url().optional().or(z.literal("")),
  deadline: z.string().datetime().optional(),
});

// ============================================================
// INNOVATION IDEA VALIDATORS
// ============================================================

export const createIdeaSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type EventFeedbackInput = z.infer<typeof eventFeedbackSchema>;
export type AddStaffEmailInput = z.infer<typeof addStaffEmailSchema>;
export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>;
export type CreateIdeaInput = z.infer<typeof createIdeaSchema>;