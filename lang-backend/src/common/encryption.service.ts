import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

/**
 * Mã hóa AES-256-GCM cho dữ liệu sức khỏe nhạy cảm.
 * Key lấy từ env ENCRYPTION_KEY (32 bytes hex).
 */
@Injectable()
export class EncryptionService {
  private readonly key: Buffer;

  constructor(private config: ConfigService) {
    const hex = this.config.getOrThrow<string>('ENCRYPTION_KEY');
    this.key = Buffer.from(hex, 'hex');
  }

  encrypt(plaintext: string): string {
    const iv  = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    // format: iv(hex).tag(hex).ciphertext(hex)
    return [iv.toString('hex'), tag.toString('hex'), encrypted.toString('hex')].join('.');
  }

  decrypt(ciphertext: string): string {
    const [ivHex, tagHex, dataHex] = ciphertext.split('.');
    const iv   = Buffer.from(ivHex, 'hex');
    const tag  = Buffer.from(tagHex, 'hex');
    const data = Buffer.from(dataHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(tag);
    return decipher.update(data) + decipher.final('utf8');
  }

  /** Trả về null thay vì throw nếu không thể giải mã */
  safeDecrypt(ciphertext: string | null | undefined): string | null {
    if (!ciphertext) return null;
    try { return this.decrypt(ciphertext); }
    catch { return null; }
  }
}
