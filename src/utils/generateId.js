import { v4 as uuidv4 } from 'uuid'

// Short, URL-safe unique public identifier used for /invoice/[publicId]
export function generatePublicId() {
  return uuidv4().replace(/-/g, '').slice(0, 12)
}
