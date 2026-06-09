import { Injectable } from '@nestjs/common';

const RISK_KEYWORDS = [
  'tự tử', 'tự vẫn', 'muốn chết', 'không muốn sống', 'kết thúc cuộc đời',
  'tự làm hại', 'tự làm đau', 'cắt tay', 'nhảy lầu', 'uống thuốc',
  'suicide', 'kill myself', 'end my life', 'self harm',
];

@Injectable()
export class CrisisDetectorService {
  detect(text: string): boolean {
    const lower = text.toLowerCase();
    return RISK_KEYWORDS.some(kw => lower.includes(kw));
  }
}
