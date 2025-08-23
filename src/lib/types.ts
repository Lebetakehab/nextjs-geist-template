import { z } from 'zod'

// WhatsApp Configuration Schema
export const wabaConfigSchema = z.object({
  wabaPhoneNumberId: z.string().min(1, 'Phone Number ID is required'),
  wabaBusinessId: z.string().min(1, 'Business Account ID is required'),
  accessToken: z.string().min(1, 'Access Token is required'),
  webhookVerifyToken: z.string().min(1, 'Webhook Verify Token is required'),
})

export type WabaConfig = z.infer<typeof wabaConfigSchema>

// Campaign Creation Schema
export const createBatchCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  message: z.string().min(1, 'Message is required'),
  contacts: z.array(z.string()).min(1, 'At least one contact is required'),
  mediaId: z.string().optional(),
})

export type CreateBatchCampaign = z.infer<typeof createBatchCampaignSchema>

// Import Schema
export const importContactsSchema = z.object({
  headers: z.array(z.string()),
  rows: z.array(z.array(z.any())),
  phoneColumn: z.string(),
  nameColumn: z.string().optional(),
})

export type ImportContacts = z.infer<typeof importContactsSchema>

// Media Upload Schema
export const mediaUploadSchema = z.object({
  caption: z.string().optional(),
})

export type MediaUpload = z.infer<typeof mediaUploadSchema>

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  details?: any
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// WhatsApp API Types
export interface WhatsAppMessage {
  messaging_product: 'whatsapp'
  to: string
  type: 'text' | 'image' | 'video' | 'document'
  text?: {
    body: string
  }
  image?: {
    id: string
    caption?: string
  }
  video?: {
    id: string
    caption?: string
  }
  document?: {
    id: string
    caption?: string
    filename?: string
  }
}

export interface WhatsAppMediaUploadResponse {
  id: string
}

export interface WhatsAppMessageResponse {
  messaging_product: 'whatsapp'
  contacts: Array<{
    input: string
    wa_id: string
  }>
  messages: Array<{
    id: string
  }>
}
