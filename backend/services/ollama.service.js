const fetch = require('node-fetch');
const logger = require('./logger.service');

const OLLAMA_URL = process.env.OLLAMA_API_URL || 'https://ollama.if.unismuh.ac.id/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:7b-instruct';
const TIMEOUT_MS = 30000; // 30 detik timeout

/**
 * Kirim prompt ke Ollama API dan dapatkan respons
 * @param {string} prompt - Prompt yang akan dikirim
 * @param {object} options - Opsi tambahan (model, temperature, dll)
 * @returns {Promise<string>} - Teks respons dari AI
 */
const generateText = async (prompt, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options.model || OLLAMA_MODEL,
        prompt,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.maxTokens || 1024,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.response) {
      throw new Error('Respons Ollama tidak valid: tidak ada field "response"');
    }

    return data.response.trim();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('AI sedang sibuk, permintaan timeout setelah 30 detik. Coba lagi.');
    }
    logger.error(`Ollama API error: ${error.message}`);
    throw error;
  }
};

/**
 * Generate dengan retry otomatis (maks 2 percobaan)
 * @param {string} prompt
 * @param {object} options
 * @returns {Promise<string>}
 */
const generateWithRetry = async (prompt, options = {}, maxRetries = 2) => {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await generateText(prompt, options);
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries && !error.message.includes('timeout')) {
        logger.warn(`Ollama retry ${attempt}/${maxRetries}: ${error.message}`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      } else {
        break;
      }
    }
  }
  throw lastError;
};

module.exports = { generateText, generateWithRetry };
