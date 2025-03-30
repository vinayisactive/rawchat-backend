import { z } from "zod";

export const groupChatPayloadSchema = z.object({
    name: z.string(),
    password: z.string()
}); 

export const groupUpdatePayloadSchema = z.object({
    name: z.string().optional(),
    password: z.string().optional()
})