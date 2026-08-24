import { z } from "zod";

// define como deverão ser os dados recebidos por requisições
export const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2)
        .max(100),

    email: z
        .string()
        .trim()
        .email()
        .toLowerCase(),

    password: z
        .string()
        .min(12)
        .max(128),
});

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .email()
        .toLowerCase(),

    password: z
        .string()
        .min(1)
        .max(128),
});
