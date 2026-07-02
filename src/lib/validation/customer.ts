import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

export const customerLoginSchema = z.object({
  email: z.string().trim().email().max(180).transform((value) => value.toLowerCase()),
  password: z.string().min(1),
  next: z.string().trim().optional(),
});

export const customerRegisterSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(180).transform((value) => value.toLowerCase()),
  phone: optionalText,
  password: z.string().min(8, "Use at least 8 characters.").max(120),
  next: z.string().trim().optional(),
});

export const customerAddressSchema = z.object({
  id: optionalText,
  label: optionalText,
  fullName: z.string().trim().min(2, "Enter a full name.").max(120),
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(40),
  line1: z.string().trim().min(3, "Enter a street address.").max(180),
  line2: optionalText,
  suburb: z.string().trim().min(2, "Enter a suburb or city.").max(100),
  state: z.string().trim().min(2, "Enter a state.").max(80),
  postalCode: z.string().trim().min(3, "Enter a postcode.").max(20),
  country: z.string().trim().min(2).max(80).default("Australia"),
  isDefault: z.boolean().default(false),
});
