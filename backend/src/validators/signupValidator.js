import { z } from "zod";

export const signupSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").trim(),

    email: z.string().email("Invalid email").toLowerCase().trim(),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[0-9]/, "Must contain at least one number"),

    role: z.enum(["donor", "organization"], {
        errorMap: () => ({message: "Role must be donor or organization"})
    }).default("donor"),
})