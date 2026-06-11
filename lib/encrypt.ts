import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 64-char hex string (32 bytes)')
  }
  return Buffer.from(hex, 'hex')
}

/**
 * Encrypt a plaintext string.
 * Returns a base64-encoded payload: iv(12) + authTag(16) + ciphertext
 */
export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  // Pack: iv | authTag | encrypted
  const payload = Buffer.concat([iv, authTag, encrypted])
  return payload.toString('base64')
}

/**
 * Decrypt a value produced by encrypt().
 * Returns null if decryption fails (wrong key, corrupted data, etc.)
 */
export function decrypt(ciphertext: string): string | null {
  try {
    const key = getKey()
    const payload = Buffer.from(ciphertext, 'base64')
    const iv = payload.subarray(0, 12)
    const authTag = payload.subarray(12, 28)
    const encrypted = payload.subarray(28)
    const decipher = createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
    return decrypted.toString('utf8')
  } catch {
    return null
  }
}
