export interface CybercrimeRule {
  id: string;
  category:
    | 'Telecom / Courier Hook'
    | 'Authority Impersonation'
    | 'Criminal Accusation'
    | 'Intimidation & Arrest Threat'
    | 'Isolation & Secrecy'
    | 'Remote Access & Surveillance'
    | 'Credential & OTP Phishing'
    | 'Financial Coercion';
  phase: number;
  pattern: RegExp;
  label: string;
}

export const CYBERCRIME_RULES: CybercrimeRule[] = [
  // Phase 1: Telecom / Courier / KYC Hook
  {
    id: 'hook-courier',
    category: 'Telecom / Courier Hook',
    phase: 1,
    pattern: /\b(fedex|dhl|bluedart|courier service|customs clearance|unclaimed parcel|seized parcel)\b/i,
    label: 'Courier / parcel seizure hook',
  },
  {
    id: 'hook-trai',
    category: 'Telecom / Courier Hook',
    phase: 1,
    pattern: /\b(trai|dot|sim (card )?(block|suspend|deactivat|disconnect)|number will be blocked|press 9|kyc (update|expired|pending|suspend))\b/i,
    label: 'TRAI / SIM / KYC suspension hook',
  },

  // Phase 2: Authority Impersonation
  {
    id: 'auth-agency',
    category: 'Authority Impersonation',
    phase: 2,
    pattern: /\b(cyber ?crime( cell)?|cbi|central bureau|enforcement directorate|ed officer|ncb|narcotics|customs department|mumbai police|delhi police|crime branch|ips officer|dcp|inspector|rbi vigilance|supreme court|high court)\b/i,
    label: 'Law enforcement / regulator impersonation',
  },
  {
    id: 'auth-transfer',
    category: 'Authority Impersonation',
    phase: 2,
    pattern: /\b(police station se|thana se|cyber cell se|badge number|fir copy|official recording|senior officer)\b/i,
    label: 'Official transfer / fake badge pretext',
  },

  // Phase 3: Criminal Accusation & Framing
  {
    id: 'accuse-crime',
    category: 'Criminal Accusation',
    phase: 3,
    pattern: /\b(money laundering|hawala|terror funding|narcotics|drugs|mdma|heroin|illegal parcel|fake passport|scam account|black money|pmla)\b/i,
    label: 'Money laundering / narcotics accusation',
  },
  {
    id: 'accuse-id',
    category: 'Criminal Accusation',
    phase: 3,
    pattern: /\b(aadhaar.*(linked|misuse|compromised|aagide)|pan card.*(linked|misuse)|bank account.*(opened|laundering)|linked to.*fraud)\b/i,
    label: 'Aadhaar / PAN identity framing',
  },

  // Phase 4: Intimidation & Arrest Threats
  {
    id: 'intim-arrest',
    category: 'Intimidation & Arrest Threat',
    phase: 4,
    pattern: /\b(digital arrest|house arrest|arrest warrant|non-bailable warrant|nbw|lookout notice|cbi raid|police team.*(door|coming|dispatched)|seize (your|all) property|freeze (your|all) (bank )?account|sextortion|leak.*video|defamation case)\b/i,
    label: 'Arrest warrant / asset freeze / blackmail threat',
  },

  // Phase 5: Isolation & Secrecy
  {
    id: 'iso-silence',
    category: 'Isolation & Secrecy',
    phase: 5,
    pattern: /\b(don'?t tell anyone|do not tell (anyone|your family|wife|husband|parents)|tell no one|kisi ko mat batana|yargu helbedi|keep this (a )?secret|confidentiality|national security protocol|official secrets act)\b/i,
    label: 'Family secrecy / silence order',
  },
  {
    id: 'iso-physical',
    category: 'Isolation & Secrecy',
    phase: 5,
    pattern: /\b(go to a separate room|separate room ge|lock (the|your) door|door lock maadi|alone in (a|the) room|do not cut the call|don'?t hang up|disconnect from everyone|turn off notifications)\b/i,
    label: 'Physical room isolation / call-lock order',
  },

  // Phase 6: Forced Surveillance & Remote Access Cybercrime
  {
    id: 'surv-video',
    category: 'Remote Access & Surveillance',
    phase: 6,
    pattern: /\b(turn on (your )?(skype|whatsapp|zoom) video|stay on (the )?video call|keep (your )?camera on|video verification|24.?7 monitoring|show your room)\b/i,
    label: 'Forced Skype / WhatsApp video surveillance',
  },
  {
    id: 'surv-remote',
    category: 'Remote Access & Surveillance',
    phase: 6,
    pattern: /\b(anydesk|teamviewer|quicksupport|rustdesk|screen ?share|share your screen|download apk|install.*apk|remote access)\b/i,
    label: 'Remote desktop / malicious APK cybercrime trigger',
  },

  // Phase 6/7: Credential & OTP Phishing
  {
    id: 'phish-otp',
    category: 'Credential & OTP Phishing',
    phase: 6,
    pattern: /\b(share (your )?otp|tell me the otp|otp batao|cvv|atm pin|upi pin|mpin|netbanking password|card number|expiry date|click this link|verify kyc link)\b/i,
    label: 'OTP / PIN / credential harvesting trigger',
  },

  // Phase 7: Financial Coercion & Extortion
  {
    id: 'fin-transfer',
    category: 'Financial Coercion',
    phase: 7,
    pattern: /\b((rtgs|imps|neft|upi|wire|bank) ?transfer|transfer.*(rupees|rs\.?|inr|lakh|crore|money|funds)|secret account|verification account|rbi (audit|escrow|treasury) account|safe custody account|refundable deposit|clear your biometrics|liquidate.*(fd|fixed deposit|mutual fund)|upi collect|approve.*request|gift card|crypto wallet|usdt)\b/i,
    label: 'Coercive money transfer / escrow extortion demand',
  },
];

export interface TriggerMatch {
  phrase: string;
  category: CybercrimeRule['category'];
  phase: number;
  label: string;
}

export function scanCybercrimeTriggers(text: string): TriggerMatch[] {
  const matches: TriggerMatch[] = [];
  const seen = new Set<string>();

  for (const rule of CYBERCRIME_RULES) {
    const globalRegex = new RegExp(rule.pattern.source, 'gi');
    let m: RegExpExecArray | null;
    while ((m = globalRegex.exec(text)) !== null) {
      const phrase = m[0].trim();
      const key = `${rule.id}:${phrase.toLowerCase()}`;
      if (phrase && !seen.has(key)) {
        seen.add(key);
        matches.push({
          phrase,
          category: rule.category,
          phase: rule.phase,
          label: rule.label,
        });
      }
    }
  }

  return matches.sort((a, b) => b.phase - a.phase);
}

export function highlightTranscriptSegments(
  text: string,
  extraPhrases: string[] = []
): Array<{ text: string; isTrigger: boolean; phase?: number; category?: string }> {
  const matches = scanCybercrimeTriggers(text);
  const spans: Array<{ start: number; end: number; phase: number; category: string }> = [];

  for (const rule of CYBERCRIME_RULES) {
    const g = new RegExp(rule.pattern.source, 'gi');
    let m: RegExpExecArray | null;
    while ((m = g.exec(text)) !== null) {
      spans.push({
        start: m.index,
        end: m.index + m[0].length,
        phase: rule.phase,
        category: rule.category,
      });
    }
  }

  for (const phrase of extraPhrases) {
    const clean = phrase.trim();
    if (clean.length < 3) continue;
    const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const g = new RegExp(escaped, 'gi');
    let m: RegExpExecArray | null;
    while ((m = g.exec(text)) !== null) {
      spans.push({
        start: m.index,
        end: m.index + m[0].length,
        phase: matches[0]?.phase ?? 4,
        category: 'AI Flagged Trigger',
      });
    }
  }

  if (spans.length === 0) {
    return [{ text, isTrigger: false }];
  }

  spans.sort((a, b) => a.start - b.start || b.end - a.end);
  const merged: typeof spans = [];
  for (const s of spans) {
    const last = merged[merged.length - 1];
    if (!last || s.start >= last.end) {
      merged.push(s);
    } else if (s.end > last.end) {
      last.end = s.end;
      last.phase = Math.max(last.phase, s.phase);
    }
  }

  const result: Array<{ text: string; isTrigger: boolean; phase?: number; category?: string }> = [];
  let cursor = 0;
  for (const span of merged) {
    if (span.start > cursor) {
      result.push({ text: text.slice(cursor, span.start), isTrigger: false });
    }
    result.push({
      text: text.slice(span.start, span.end),
      isTrigger: true,
      phase: span.phase,
      category: span.category,
    });
    cursor = span.end;
  }
  if (cursor < text.length) {
    result.push({ text: text.slice(cursor), isTrigger: false });
  }
  return result;
}
