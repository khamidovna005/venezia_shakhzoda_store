import Anthropic from '@anthropic-ai/sdk';
import config from '../config/default.js';

/**
 * Claude bilan ishlash.
 *
 * API kaliti bo'lmasa `isEnabled()` false qaytaradi va AI imkoniyatlari
 * shunchaki ko'rinmaydi — do'kon avvalgidek ishlayveradi.
 */

let client = null;

export function isEnabled() {
  return config.ai.enabled;
}

function getClient() {
  if (!isEnabled()) throw new Error('ANTHROPIC_API_KEY sozlanmagan');
  if (!client) client = new Anthropic({ apiKey: config.ai.apiKey });
  return client;
}

/**
 * Claude'dan belgilangan JSON sxemasiga mos javob so'raydi.
 * Structured outputs tufayli javob har doim to'g'ri JSON bo'ladi —
 * qo'lda tozalash yoki qavs qidirish kerak emas.
 */
export async function askJson({ system, content, schema, maxTokens = 2000 }) {
  const response = await getClient().messages.create({
    model: config.ai.model,
    max_tokens: maxTokens,
    thinking: { type: 'adaptive' },
    output_config: {
      effort: 'medium',
      format: { type: 'json_schema', schema },
    },
    system,
    messages: [{ role: 'user', content }],
  });

  if (response.stop_reason === 'refusal') {
    throw new Error('AI bu so\'rovni bajarishdan bosh tortdi');
  }

  const text = response.content.find((block) => block.type === 'text')?.text;
  if (!text) throw new Error('AI bo\'sh javob qaytardi');

  return JSON.parse(text);
}

export default { isEnabled, askJson };
