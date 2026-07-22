require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
let _unpdf = null;
function getUnpdf() { if (!_unpdf) _unpdf = import('unpdf'); return _unpdf; }
const mammoth = require('mammoth');
const officeParser = require('officeparser');
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

const PORT = process.env.PORT || 3000;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean);
const OPENAI_KEY = process.env.OPENAI_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// ─── LLM provider (DeepSeek by default, OpenAI as fallback) ──────
// DeepSeek exposes an OpenAI-compatible /chat/completions endpoint.
const DEEPSEEK_KEY = process.env.DEEPSEEK_API || process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_BASE = (process.env.DEEPSEEK_API_BASE || 'https://api.deepseek.com').replace(/\/$/, '');
// deepseek-chat / deepseek-reasoner are deprecated 2026-07-24; use v4 names.
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash';

const LLM_PROVIDER = (process.env.LLM_PROVIDER || (DEEPSEEK_KEY ? 'deepseek' : 'openai')).toLowerCase();
const LLM_IS_DEEPSEEK = LLM_PROVIDER === 'deepseek';
const LLM_KEY = LLM_IS_DEEPSEEK ? DEEPSEEK_KEY : OPENAI_KEY;
const LLM_MODEL = LLM_IS_DEEPSEEK ? DEEPSEEK_MODEL : OPENAI_MODEL;
const LLM_ENDPOINT = LLM_IS_DEEPSEEK
  ? `${DEEPSEEK_API_BASE}/chat/completions`
  : 'https://api.openai.com/v1/chat/completions';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const APP_BASE_URL = (process.env.APP_BASE_URL || 'http://localhost:8085').replace(/\/$/, '');

const POLAR_ACCESS_TOKEN = process.env.POLAR_ACCESS_TOKEN;
const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET;
const POLAR_ORGANIZATION_ID = process.env.POLAR_ORGANIZATION_ID;
const POLAR_PRO_MONTHLY_PRODUCT_ID = process.env.POLAR_PRO_MONTHLY_PRODUCT_ID;
const POLAR_PRO_YEARLY_PRODUCT_ID = process.env.POLAR_PRO_YEARLY_PRODUCT_ID;
const POLAR_API_BASE = process.env.POLAR_API_BASE || 'https://sandbox-api.polar.sh/v1';

const PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID;
const PAYOS_API_KEY = process.env.PAYOS_API_KEY;
const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY;

let payosClient = null;
if (PAYOS_CLIENT_ID && PAYOS_API_KEY && PAYOS_CHECKSUM_KEY) {
  const { PayOS } = require('@payos/node');
  payosClient = new PayOS({
    clientId: PAYOS_CLIENT_ID,
    apiKey: PAYOS_API_KEY,
    checksumKey: PAYOS_CHECKSUM_KEY,
  });
}

const PAYOS_PRICE_MONTHLY = 35000;
const PAYOS_PRICE_YEARLY = 299000;

// Initialize Supabase Client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
  realtime: {
    transport: ws,
  },
});

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

app.use((req, res, next) => {
  if (req.path === '/api/v1/polar/webhook') {
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json({ limit: '2mb' })(req, res, next);
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    llmProvider: LLM_PROVIDER,
    llmModel: LLM_MODEL,
    llmConfigured: !!LLM_KEY,
    openaiModel: OPENAI_MODEL,
    openaiConfigured: !!OPENAI_KEY,
    geminiEmbeddingModel: 'gemini-embedding-001',
    geminiKeysConfigured: GEMINI_KEYS.length,
    supabaseConfigured: !!(SUPABASE_URL && SUPABASE_KEY),
    polarConfigured: !!(POLAR_ACCESS_TOKEN && POLAR_WEBHOOK_SECRET),
    payosConfigured: !!payosClient,
  });
});

// Helper: Get user ID from request (JWT auth token fallback to seeded anonymous user)
function getUserIdFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        if (payload && payload.sub) {
          return payload.sub;
        }
      }
    } catch (e) {
      console.warn('Failed to parse auth JWT payload:', e);
    }
  }
  return DEFAULT_USER_ID;
}

// Helper: Build a request-scoped Supabase client that forwards the caller's JWT.
// This makes Postgres RLS evaluate auth.uid() as the logged-in user, so owner-scoped
// SELECT/UPDATE/DELETE policies pass. The shared module-level `supabase` client (anon,
// no user context) is kept only for background workers and security-definer RPC calls.
function userClient(req) {
  const authHeader = req.headers.authorization || '';
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    // Node 20 has no global WebSocket; supabase-js needs an explicit ws transport
    // for Realtime or it throws on client creation. Mirror the shared client.
    realtime: { transport: ws },
    global: { headers: authHeader ? { Authorization: authHeader } : {} },
  });
}

// ----------------------------------------------------
// DATABASE & AI HELPERS
// ----------------------------------------------------

function chunkText(text, size = 1000) {
  const words = text.split(/\s+/);
  const chunks = [];
  let currentChunk = [];
  let currentLength = 0;
  
  for (const word of words) {
    currentChunk.push(word);
    currentLength += word.length + 1;
    if (currentLength >= size) {
      chunks.push(currentChunk.join(' '));
      currentChunk = [];
      currentLength = 0;
    }
  }
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }
  return chunks;
}

async function getGeminiEmbedding(text) {
  let lastError;
  for (const apiKey of GEMINI_KEYS) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/gemini-embedding-001',
          content: { parts: [{ text: text }] },
          outputDimensionality: 768
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error?.message || 'Embedding failed');
      }
      return payload.embedding.values;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Embedding failed.');
}

async function extractTextFromBuffer(filename, buffer) {
  const name = filename.toLowerCase();
  if (name.endsWith('.txt') || name.endsWith('.md')) {
    return mustHaveText(buffer.toString('utf8'));
  }
  if (name.endsWith('.pdf')) {
    // Use unpdf (modern pdfjs-dist) to avoid "unsupported Unicode escape sequence"
    // errors from the old pdf.js bundled with pdf-parse
    try {
      const { extractText } = await getUnpdf();
      const { text } = await extractText(buffer, { mergePages: true });
      return mustHaveText(text);
    } catch (unpdfErr) {
      console.error('unpdf failed, falling back to pdf-parse:', unpdfErr.message);
      const parsed = await pdfParse(buffer);
      return mustHaveText(parsed.text);
    }
  }
  if (name.endsWith('.docx')) {
    const parsed = await mammoth.extractRawText({ buffer: buffer });
    return mustHaveText(parsed.value);
  }
  if (name.endsWith('.pptx')) {
    const parsedText = await officeParser.parseOffice(buffer, { fileType: 'pptx' });
    return mustHaveText(parsedText);
  }
  throw new Error('Unsupported file type.');
}

// Helper: Synchronous document thunk & embeddings saver for legacy endpoints
async function saveDocumentToDb(userId, filename, mimeType, size, text) {
  const docId = crypto.randomUUID();
  const storagePath = `documents-raw-temp/${userId}/${docId}/${filename}`;
  
  const chunks = chunkText(text, 1000);
  const chunkObjects = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunkText = chunks[i];
    const embedding = await getGeminiEmbedding(chunkText);
    chunkObjects.push({
      chunk_index: i,
      content: chunkText,
      embedding: JSON.stringify(embedding)
    });
  }

  const { data: dbDoc, error: rpcError } = await supabase.rpc('rpc_create_document_and_chunks', {
    p_owner_id: userId,
    p_title: filename.replace(/\.[^.]+$/, ''),
    p_filename: filename,
    p_mime_type: mimeType,
    p_size: size,
    p_bucket: 'documents-raw-temp',
    p_path: storagePath,
    p_chunks: chunkObjects
  });

  if (rpcError) throw rpcError;
  return dbDoc;
}

// Helper: Async job worker to parse, chunk, and embed a document in the background
async function processDocumentJob(jobId, documentId, userId, filename, storagePath) {
  try {
    // 1. Update job to running
    await supabase.from('jobs').update({ status: 'running', progress: 10, current_step: 'extracting', started_at: new Date() }).eq('id', jobId);
    await supabase.from('job_events').insert({ job_id: jobId, step: 'extracting', status: 'running', message: 'Downloading raw file from storage...', progress: 10 });

    // 2. Download from storage
    const { data: fileBlob, error: downloadError } = await supabase.storage.from('documents-raw-temp').download(storagePath);
    if (downloadError) throw downloadError;

    await supabase.from('job_events').insert({ job_id: jobId, step: 'extracting', status: 'running', message: 'Extracting text content...', progress: 30 });
    const buffer = Buffer.from(await fileBlob.arrayBuffer());
    const extractedText = await extractTextFromBuffer(filename, buffer);

    // 3. Chunking & embedding
    await supabase.from('jobs').update({ progress: 50, current_step: 'embedding' }).eq('id', jobId);
    await supabase.from('job_events').insert({ job_id: jobId, step: 'embedding', status: 'running', message: 'Creating chunk embeddings with Gemini...', progress: 50 });

    const chunks = chunkText(extractedText, 1000);
    const chunkObjects = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i];
      const embedding = await getGeminiEmbedding(chunkText);
      chunkObjects.push({
        chunk_index: i,
        content: chunkText,
        embedding: JSON.stringify(embedding)
      });
    }

    // 4. Save using security definer RPC
    await supabase.from('job_events').insert({ job_id: jobId, step: 'validating', status: 'running', message: 'Persisting indices to PostgreSQL...', progress: 80 });
    const { data: dbDoc, error: rpcError } = await supabase.rpc('rpc_create_document_and_chunks', {
      p_owner_id: userId,
      p_title: filename.replace(/\.[^.]+$/, ''),
      p_filename: filename,
      p_mime_type: 'application/octet-stream',
      p_size: buffer.length,
      p_bucket: 'documents-raw-temp',
      p_path: storagePath,
      p_chunks: chunkObjects
    });

    if (rpcError) throw rpcError;

    // 5. Update job to complete
    await supabase.from('jobs').update({ status: 'completed', progress: 100, current_step: 'ready', finished_at: new Date(), output_payload: { document_id: dbDoc.document_id } }).eq('id', jobId);
    await supabase.from('job_events').insert({ job_id: jobId, step: 'ready', status: 'completed', message: 'Document ready for selection.', progress: 100 });

    // Create activity and notifications
    await supabase.from('activity_events').insert({ user_id: userId, document_id: dbDoc.document_id, event_type: 'document_uploaded', metadata: { title: filename } });
    await supabase.from('notifications').insert({ user_id: userId, type: 'document_processed', title: 'Processing complete', message: `Your document "${filename}" is processed and ready.` });

  } catch (err) {
    console.error('Async document job failed:', err);
    await supabase.from('jobs').update({ status: 'failed', error_message: err.message, finished_at: new Date() }).eq('id', jobId);
    await supabase.from('job_events').insert({ job_id: jobId, step: 'failed', status: 'failed', message: `Error: ${err.message}`, progress: 0 });
    await supabase.from('documents').update({ processing_status: 'failed', extraction_status: 'failed' }).eq('id', documentId);
  }
}

// Helper: Process flashcard generation in background
async function processFlashcardJob(jobId, documentId, userId, title, count, difficulty, contentType, selectedSectionIds) {
  const normDifficulty = (difficulty || 'mixed').toLowerCase();
  const normContentType = (contentType || 'mixed').toLowerCase();
  try {
    await supabase.from('jobs').update({ status: 'running', progress: 20, current_step: 'extracting', started_at: new Date() }).eq('id', jobId);

    // 1. Fetch chunks context
    let query = supabase.from('document_chunks').select('content').eq('document_id', documentId);
    if (Array.isArray(selectedSectionIds) && selectedSectionIds.length > 0) {
      query = query.in('section_id', selectedSectionIds);
    }
    let { data: chunks } = await query;
    if (!chunks || chunks.length === 0) {
      // Fallback
      const { data: fallbackChunks } = await supabase.from('document_chunks').select('content').eq('document_id', documentId);
      chunks = fallbackChunks;
    }

    if (!chunks || chunks.length === 0) throw new Error('No document chunks available. Reprocess the document.');

    const contextText = chunks.map(c => c.content).join('\n\n');

    // 2. Call Gemini
    await supabase.from('jobs').update({ progress: 50, current_step: 'generating' }).eq('id', jobId);
    const cards = await generateFlashcardsWithRetry({
      text: contextText,
      deckName: title,
      count,
      difficulty: normDifficulty,
      contentType: normContentType,
      sourceName: 'Document'
    });

    if (cards.length === 0) throw new Error('OpenAI failed to return valid flashcards.');

    // 3. Save via RPC
    await supabase.from('jobs').update({ progress: 85, current_step: 'validating' }).eq('id', jobId);
    const { data: dbSet, error: saveError } = await supabase.rpc('rpc_save_flashcards', {
      p_owner_id: userId,
      p_doc_id: documentId,
      p_title: title,
      p_difficulty: toDifficultyEnum(normDifficulty),
      p_content_type: toContentTypeEnum(normContentType),
      p_cards: cards
    });

    if (saveError) throw saveError;

    await supabase.from('jobs').update({ status: 'completed', progress: 100, current_step: 'ready', finished_at: new Date(), output_payload: { resource_id: dbSet.resource_id } }).eq('id', jobId);
    await supabase.from('activity_events').insert({ user_id: userId, resource_id: dbSet.resource_id, event_type: 'generated', metadata: { type: 'flashcard_set', title } });

  } catch (err) {
    console.error('Async flashcard job failed:', err);
    await supabase.from('jobs').update({ status: 'failed', error_message: err.message, finished_at: new Date() }).eq('id', jobId);
  }
}

// Helper: Process note generation in background
async function processNoteJob(jobId, documentId, userId, title, detail, selectedSectionIds) {
  try {
    await supabase.from('jobs').update({ status: 'running', progress: 20, current_step: 'extracting', started_at: new Date() }).eq('id', jobId);

    let query = supabase.from('document_chunks').select('content').eq('document_id', documentId);
    if (Array.isArray(selectedSectionIds) && selectedSectionIds.length > 0) {
      query = query.in('section_id', selectedSectionIds);
    }
    let { data: chunks } = await query;
    if (!chunks || chunks.length === 0) {
      // Fallback
      const { data: fallbackChunks } = await supabase.from('document_chunks').select('content').eq('document_id', documentId);
      chunks = fallbackChunks;
    }

    if (!chunks || chunks.length === 0) throw new Error('No document chunks available.');

    const contextText = chunks.map(c => c.content).join('\n\n');

    await supabase.from('jobs').update({ progress: 50, current_step: 'generating' }).eq('id', jobId);
    const prompt = buildNotesPrompt({ text: contextText, noteName: title, detail, sourceName: 'Document' });
    const data = await callOpenAiJson(prompt);
    const note = normalizeNote(data, title, detail, 'Document');

    await supabase.from('jobs').update({ progress: 85, current_step: 'validating' }).eq('id', jobId);
    const { data: dbNote, error: saveError } = await supabase.rpc('rpc_save_notes', {
      p_owner_id: userId,
      p_doc_id: documentId,
      p_title: title,
      p_detail: detail,
      p_summary: note.summary,
      p_cues: note.cues,
      p_notes: note.notes
    });

    if (saveError) throw saveError;

    await supabase.from('jobs').update({ status: 'completed', progress: 100, current_step: 'ready', finished_at: new Date(), output_payload: { resource_id: dbNote.resource_id } }).eq('id', jobId);
    await supabase.from('activity_events').insert({ user_id: userId, resource_id: dbNote.resource_id, event_type: 'generated', metadata: { type: 'cornell_note', title } });

  } catch (err) {
    console.error('Async note job failed:', err);
    await supabase.from('jobs').update({ status: 'failed', error_message: err.message, finished_at: new Date() }).eq('id', jobId);
  }
}

// ----------------------------------------------------
// V2 ENDPOINTS IMPLEMENTATION
// ----------------------------------------------------

// 1. Auth & User APIs
app.get('/api/v1/auth/config', (req, res) => {
  res.json({
    success: true,
    data: {
      supabaseUrl: SUPABASE_URL,
      supabaseAnonKey: SUPABASE_KEY
    }
  });
});

app.get('/api/v1/me', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const supabase = userClient(req);
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    let { data: settings } = await supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle();
    if (!settings && userId === DEFAULT_USER_ID) {
      settings = {
        theme: 'system',
        language: 'en',
        daily_goal_cards: 20,
        email_notifications_enabled: true
      };
    }
    // Effective plan: Polar subscription (plan='pro') OR active payOS prepaid (pro_until)
    const effectiveProfile = profile ? { ...profile } : profile;
    if (effectiveProfile && effectiveProfile.plan !== 'pro' &&
        effectiveProfile.pro_until && new Date(effectiveProfile.pro_until) > new Date()) {
      effectiveProfile.plan = 'pro';
    }
    res.json({ success: true, data: { user: effectiveProfile, settings } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.patch('/api/v1/me/profile', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const supabase = userClient(req);
    const { full_name, username, avatar_url, bio } = req.body;
    const { data, error } = await supabase.from('profiles').update({ full_name, username, avatar_url, bio }).eq('id', userId).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.message } });
  }
});

app.get('/api/v1/me/settings', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const supabase = userClient(req);
    let { data } = await supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle();
    if (!data && userId === DEFAULT_USER_ID) {
      data = {
        theme: 'system',
        language: 'en',
        daily_goal_cards: 20,
        email_notifications_enabled: true
      };
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.patch('/api/v1/me/settings', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const supabase = userClient(req);
    const { theme, language, daily_goal_cards, email_notifications_enabled } = req.body;
    const { data, error } = await supabase.from('user_settings').update({ theme, language, daily_goal_cards, email_notifications_enabled }).eq('user_id', userId).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.message } });
  }
});

// 2. Learn Dashboard APIs
app.get('/api/v1/learn/dashboard', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const supabase = userClient(req);
    const { data: resources } = await supabase.from('resources').select('*').eq('owner_id', userId).eq('archived', false).order('updated_at', { ascending: false });
    const { data: documents } = await supabase.from('documents').select('*').eq('owner_id', userId).order('updated_at', { ascending: false });
    let { data: settings } = await supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle();
    if (!settings && userId === DEFAULT_USER_ID) {
      settings = {
        theme: 'system',
        language: 'en',
        daily_goal_cards: 20,
        email_notifications_enabled: true
      };
    }
    const { data: activities } = await supabase.from('activity_events').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10);
    const { data: jobs } = await supabase.from('jobs').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5);

    // Calculate completed cards from study progress
    const { data: studiedCards } = await supabase.from('flashcard_study_progress').select('id').eq('user_id', userId).eq('status', 'mastered');

    res.json({
      success: true,
      data: {
        continue_learning: resources || [],
        upload_panel: { allowed_file_types: ['pdf', 'docx', 'pptx', 'txt', 'md'], max_file_size_mb: 20 },
        recent_uploads: documents || [],
        today_goal: {
          target_cards: settings?.daily_goal_cards || 20,
          completed_cards: studiedCards?.length || 0,
          streak_days: 3 // Mock streak analytics
        },
        recent_activity: activities || [],
        active_jobs: jobs || []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.get('/api/v1/learn/continue-learning', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { data } = await supabase.from('resources').select('*').eq('owner_id', userId).eq('archived', false).order('updated_at', { ascending: false }).limit(5);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// 3. Document APIs
app.post('/api/v1/documents/upload-session', async (req, res) => {
  try {
    const { filename, mime_type, file_size_bytes, checksum } = req.body;
    const userId = getUserIdFromRequest(req);
    if (!filename || !mime_type || !file_size_bytes) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing parameters' } });
    }

    const docId = crypto.randomUUID();
    const storagePath = `documents-raw-temp/${userId}/${docId}/${filename}`;

    await supabase.from('documents').insert({
      id: docId, owner_id: userId, title: filename.replace(/\.[^.]+$/, ''), original_filename: filename, mime_type, file_size_bytes, storage_bucket: 'documents-raw-temp', storage_path: storagePath, processing_status: 'upload_session_created', checksum
    });

    res.json({
      success: true,
      data: {
        document_id: docId,
        upload: {
          bucket: 'documents-raw-temp',
          storage_path: storagePath,
          signed_upload_url: `${SUPABASE_URL}/storage/v1/object/documents-raw-temp/${storagePath}`,
          expires_in_seconds: 900
        },
        status: 'upload_session_created'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.post('/api/v1/documents/complete-upload', async (req, res) => {
  try {
    const { document_id } = req.body;
    const userId = getUserIdFromRequest(req);
    if (!document_id) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing document_id' } });
    }

    const { data: doc, error } = await supabase.from('documents').select('*').eq('id', document_id).single();
    if (error || !doc) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found' } });
    }

    // Update document status
    await supabase.from('documents').update({ processing_status: 'uploaded' }).eq('id', document_id);

    // Create async processing job
    const jobId = crypto.randomUUID();
    await supabase.from('jobs').insert({
      id: jobId, user_id: userId, job_type: 'document_processing', status: 'queued', progress: 0, current_step: 'upload', input_payload: { document_id, filename: doc.original_filename }
    });
    await supabase.from('job_events').insert({
      job_id: jobId, step: 'upload', status: 'completed', message: 'File upload finalized.', progress: 100
    });

    // Start background processor
    processDocumentJob(jobId, document_id, userId, doc.original_filename, doc.storage_path);

    res.json({
      success: true,
      data: {
        document_id,
        job_id: jobId,
        status: 'uploaded',
        steps: { upload: 'completed', processing: 'queued', select: 'pending', ready: 'pending' }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.get('/api/v1/documents', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { data } = await supabase.from('documents').select('*').eq('owner_id', userId).order('created_at', { ascending: false });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.get('/api/v1/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = await supabase.from('documents').select('*').eq('id', id).single();
    if (!data) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found' } });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.get('/api/v1/documents/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = await supabase.from('documents').select('processing_status, extraction_status, embedding_status').eq('id', id).single();
    if (!data) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found' } });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.get('/api/v1/documents/:id/preview', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: sections } = await supabase.from('document_sections').select('*').eq('document_id', id).order('order_index');
    const { data: doc } = await supabase.from('documents').select('*').eq('id', id).single();

    res.json({
      success: true,
      data: {
        document: doc,
        sections: sections || []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.post('/api/v1/documents/:id/process', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromRequest(req);
    const { data: doc } = await supabase.from('documents').select('*').eq('id', id).single();
    if (!doc) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found' } });

    const jobId = crypto.randomUUID();
    await supabase.from('jobs').insert({ id: jobId, user_id: userId, job_type: 'document_processing', status: 'queued', progress: 0, current_step: 'queued', input_payload: { document_id: id } });
    processDocumentJob(jobId, id, userId, doc.original_filename, doc.storage_path);

    res.json({ success: true, data: { job_id: jobId, status: 'queued' } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.post('/api/v1/documents/:id/reprocess', async (req, res) => {
  // Alias to process endpoint for simplicity
  res.redirect(307, `/api/v1/documents/${req.params.id}/process`);
});

app.delete('/api/v1/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('documents').update({ deleted_at: new Date(), processing_status: 'deleted' }).eq('id', id);
    if (error) throw error;
    res.json({ success: true, data: { document_id: id, status: 'deleted' } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// 4. Job APIs
app.get('/api/v1/jobs/:job_id', async (req, res) => {
  try {
    const { job_id } = req.params;
    const { data: job } = await supabase.from('jobs').select('*').eq('id', job_id).single();
    if (!job) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Job not found' } });

    const { data: events } = await supabase.from('job_events').select('*').eq('job_id', job_id).order('created_at');

    res.json({
      success: true,
      data: {
        job_id: job.id,
        job_type: job.job_type,
        status: job.status,
        progress: job.progress,
        current_step: job.current_step,
        events: events || [],
        output: job.output_payload
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.get('/api/v1/jobs/:job_id/events', async (req, res) => {
  const accept = req.headers.accept || '';
  if (accept.includes('text/event-stream')) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Send existing events
    const { data: initialEvents } = await supabase
      .from('job_events')
      .select('*')
      .eq('job_id', req.params.job_id)
      .order('created_at');

    if (initialEvents) {
      for (const ev of initialEvents) {
        res.write(`data: ${JSON.stringify(ev)}\n\n`);
      }
    }

    // Subscribe to realtime updates for this job_id
    const channel = supabase
      .channel(`job_events:${req.params.job_id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'job_events',
        filter: `job_id=eq.${req.params.job_id}`
      }, (payload) => {
        res.write(`data: ${JSON.stringify(payload.new)}\n\n`);
      })
      .subscribe();

    req.on('close', () => {
      channel.unsubscribe();
      res.end();
    });
  } else {
    try {
      const { job_id } = req.params;
      const { data } = await supabase.from('job_events').select('*').eq('job_id', job_id).order('created_at');
      res.json({ success: true, data: data || [] });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
    }
  }
});

app.post('/api/v1/jobs/:job_id/cancel', async (req, res) => {
  try {
    const { job_id } = req.params;
    const { data, error } = await supabase.from('jobs').update({ status: 'cancelled' }).eq('id', job_id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.post('/api/v1/jobs/:job_id/retry', async (req, res) => {
  try {
    const { job_id } = req.params;
    const { data: job } = await supabase.from('jobs').select('*').eq('id', job_id).single();
    if (!job) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Job not found' } });

    await supabase.from('jobs').update({ status: 'queued', progress: 0, error_message: null }).eq('id', job_id);

    if (job.job_type === 'document_processing') {
      const { data: doc } = await supabase.from('documents').select('*').eq('id', job.input_payload.document_id).single();
      processDocumentJob(job_id, doc.id, job.user_id, doc.original_filename, doc.storage_path);
    } else if (job.job_type === 'flashcard_generation') {
      processFlashcardJob(job_id, job.input_payload.document_id, job.user_id, job.input_payload.title, job.input_payload.count, job.input_payload.difficulty, job.input_payload.contentType, job.input_payload.selected_section_ids);
    } else if (job.job_type === 'note_generation') {
      processNoteJob(job_id, job.input_payload.document_id, job.user_id, job.input_payload.title, job.input_payload.detail, job.input_payload.selected_section_ids);
    }

    res.json({ success: true, data: { job_id, status: 'queued' } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// 5. Generation APIs
app.get('/api/v1/generation/options/:document_id', async (req, res) => {
  try {
    const { document_id } = req.params;
    const { data: sections } = await supabase.from('document_sections').select('*').eq('document_id', document_id);
    res.json({
      success: true,
      data: {
        document_id,
        document_status: 'ready_for_selection',
        sections: sections || [],
        flashcard_options: {
          difficulty: ['easy', 'medium', 'hard', 'mixed'],
          content_type: ['multiple_choice', 'true_false', 'short_answer', 'mixed'],
          card_count: { min: 5, max: 60, recommended: 20 }
        },
        note_options: {
          method: ['cornell'],
          detail_level: ['less', 'normal', 'detail']
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.post('/api/v1/generation/flashcards', async (req, res) => {
  try {
    const { document_id, title, difficulty, content_type, number_of_cards, selected_section_ids } = req.body;
    const userId = getUserIdFromRequest(req);
    if (!document_id || !title) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing parameters' } });
    }

    const jobId = crypto.randomUUID();
    const generationId = crypto.randomUUID();

    await supabase.from('jobs').insert({
      id: jobId, user_id: userId, job_type: 'flashcard_generation', status: 'queued', progress: 0, input_payload: { document_id, title, count: number_of_cards, difficulty, contentType: content_type, selected_section_ids }
    });

    processFlashcardJob(jobId, document_id, userId, title, number_of_cards, difficulty, content_type, selected_section_ids);

    res.json({
      success: true,
      data: { generation_id: generationId, job_id: jobId, status: 'queued' }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.post('/api/v1/generation/notes', async (req, res) => {
  try {
    const { document_id, title, detail_level, selected_section_ids } = req.body;
    const userId = getUserIdFromRequest(req);
    if (!document_id || !title) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing parameters' } });
    }

    const jobId = crypto.randomUUID();
    const generationId = crypto.randomUUID();

    await supabase.from('jobs').insert({
      id: jobId, user_id: userId, job_type: 'note_generation', status: 'queued', progress: 0, input_payload: { document_id, title, detail: detail_level, selected_section_ids }
    });

    processNoteJob(jobId, document_id, userId, title, detail_level, selected_section_ids);

    res.json({
      success: true,
      data: { generation_id: generationId, job_id: jobId, status: 'queued' }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.get('/api/v1/generation/:generation_id', async (req, res) => {
  // Map generation ID requests directly to active jobs
  res.redirect(307, `/api/v1/jobs/${req.params.generation_id}`);
});

app.post('/api/v1/generation/:generation_id/confirm', async (req, res) => {
  res.json({ success: true, data: { confirmed: true } });
});

app.delete('/api/v1/generation/:generation_id', async (req, res) => {
  res.json({ success: true, data: { discarded: true } });
});

// 6. Library APIs
app.get('/api/v1/library/resources', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const supabase = userClient(req);
    const { type, favorite, archived, q, collection_id, sort, page = 1, page_size = 100 } = req.query;
    const wantArchived = archived === 'true';

    const applyFilters = (builder) => {
      if (type && type !== 'all') builder = builder.eq('type', type);
      if (favorite === 'true') builder = builder.eq('favorite', true);
      if (q) builder = builder.ilike('title', `%${q}%`);
      return builder;
    };

    // 1. Resources owned by the user
    const { data: owned, error: ownedErr } = await applyFilters(
      supabase.from('resources').select('*').eq('owner_id', userId).eq('archived', wantArchived)
    );
    if (ownedErr) throw ownedErr;

    // 2. Resources shared with the user (accepted permissions). RLS scopes
    //    resource_permissions to rows where the user is the target or the inviter.
    let shared = [];
    if (!wantArchived) {
      const { data: perms } = await supabase
        .from('resource_permissions')
        .select('resource_id, share_with_document')
        .eq('status', 'accepted')
        .eq('user_id', userId);
      const permByRes = {};
      (perms || []).forEach(p => { permByRes[p.resource_id] = p; });
      const sharedIds = Object.keys(permByRes);
      if (sharedIds.length > 0) {
        const { data: sharedRes } = await applyFilters(
          supabase.from('resources').select('*').in('id', sharedIds).eq('archived', false)
        );
        shared = (sharedRes || [])
          .filter(r => r.owner_id !== userId)
          .map(r => ({ ...r, shared: true, shared_with_document: !!permByRes[r.id]?.share_with_document }));
      }
    }

    // 3. Merge (owned wins on id collision)
    const byId = {};
    (owned || []).forEach(r => { byId[r.id] = r; });
    shared.forEach(r => { if (!byId[r.id]) byId[r.id] = r; });
    let merged = Object.values(byId);

    // 4. Optional collection filter
    if (collection_id) {
      const { data: colResources } = await supabase.from('collection_resources').select('resource_id').eq('collection_id', collection_id);
      const colIds = new Set((colResources || []).map(r => r.resource_id));
      merged = merged.filter(r => colIds.has(r.id));
    }

    // 5. Sort
    const sortCol = sort === 'created_at' ? 'created_at' : sort === 'title' ? 'title' : 'updated_at';
    merged.sort((a, b) => {
      if (sortCol === 'title') return String(a.title || '').localeCompare(String(b.title || ''));
      return new Date(b[sortCol] || 0) - new Date(a[sortCol] || 0);
    });

    // 6. Paginate
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(page_size, 10) || 100;
    const total = merged.length;
    const start = (pageNum - 1) * limitNum;
    const pageItems = merged.slice(start, start + limitNum);

    // Enrich with lightweight per-type metadata (card_count/difficulty/content_type for
    // flashcard sets, summary for notes) using two batch queries. This lets the library
    // list render without a detail round-trip per resource (the old N+1 made it take
    // ~10s and fail-to-empty if any single request stalled).
    const fcIds = pageItems.filter(r => r.type === 'flashcard_set').map(r => r.id);
    const noteResIds = pageItems.filter(r => r.type === 'cornell_note').map(r => r.id);
    const setsByRes = {};
    const notesByRes = {};
    if (fcIds.length) {
      const { data: sets } = await supabase.from('flashcard_sets').select('resource_id, card_count, difficulty, content_type').in('resource_id', fcIds);
      (sets || []).forEach(s => { setsByRes[s.resource_id] = s; });
    }
    if (noteResIds.length) {
      const { data: noteRows } = await supabase.from('notes').select('resource_id, summary').in('resource_id', noteResIds);
      (noteRows || []).forEach(n => { notesByRes[n.resource_id] = n; });
    }
    const enrichedItems = pageItems.map(r => ({
      ...r,
      flashcard_set: setsByRes[r.id] || null,
      note: notesByRes[r.id] || null,
    }));

    res.json({
      success: true,
      data: { resources: enrichedItems },
      meta: {
        page: pageNum,
        page_size: limitNum,
        total_items: total,
        total_pages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.get('/api/v1/library/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = userClient(req);
    const { data: resource } = await supabase.from('resources').select('*').eq('id', id).single();
    if (!resource) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Resource not found' } });

    let details = {};
    if (resource.type === 'flashcard_set') {
      const { data: set } = await supabase.from('flashcard_sets').select('*').eq('resource_id', id).single();
      const { data: cards } = await supabase.from('flashcards').select('*').eq('set_id', set.id).order('order_index');
      const cardList = cards || [];
      // Fetch all options for every card in a single query (was one query per card).
      const cardIds = cardList.map(c => c.id);
      const optionsByCard = {};
      if (cardIds.length) {
        const { data: options } = await supabase.from('flashcard_options').select('*').in('flashcard_id', cardIds).order('order_index');
        (options || []).forEach(o => { (optionsByCard[o.flashcard_id] = optionsByCard[o.flashcard_id] || []).push(o); });
      }
      const cardsWithOptions = cardList.map(card => ({ ...card, options: optionsByCard[card.id] || [] }));
      details = { set, cards: cardsWithOptions };
    } else if (resource.type === 'cornell_note') {
      const { data: note } = await supabase.from('notes').select('*').eq('resource_id', id).single();
      const { data: blocks } = await supabase.from('note_blocks').select('*').eq('note_id', note.id).order('order_index');
      details = { note, blocks: blocks || [] };
    }

    res.json({ success: true, data: { ...resource, details } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.patch('/api/v1/library/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = userClient(req);
    const { title, description, favorite, archived, visibility } = req.body;

    const { data, error } = await supabase
      .from('resources')
      .update({ title, description, favorite, archived, visibility })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.delete('/api/v1/library/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = userClient(req);
    const { error } = await supabase.from('resources').update({ deleted_at: new Date() }).eq('id', id);
    if (error) throw error;
    res.json({ success: true, data: { resource_id: id, status: 'deleted' } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.post('/api/v1/library/resources/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromRequest(req);

    // Fetch original
    const { data: orig } = await supabase.from('resources').select('*').eq('id', id).single();
    if (!orig) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Resource not found' } });

    const newResId = crypto.randomUUID();

    // 1. Duplicate resource metadata
    await supabase.from('resources').insert({
      id: newResId, owner_id: userId, document_id: orig.document_id, vector_index_id: orig.vector_index_id, type: orig.type, title: `${orig.title} (Copy)`, description: orig.description, visibility: 'private', created_from: 'duplicate', source_resource_id: id
    });

    if (orig.type === 'flashcard_set') {
      const { data: origSet } = await supabase.from('flashcard_sets').select('*').eq('resource_id', id).single();
      const { data: cards } = await supabase.from('flashcards').select('*').eq('set_id', origSet.id);
      
      const newSetId = crypto.randomUUID();
      await supabase.from('flashcard_sets').insert({
        id: newSetId, resource_id: newResId, card_count: origSet.card_count, difficulty: origSet.difficulty, content_type: origSet.content_type
      });

      for (const card of cards || []) {
        const newCardId = crypto.randomUUID();
        await supabase.from('flashcards').insert({
          id: newCardId, set_id: newSetId, question: card.question, answer: card.answer, explanation: card.explanation, content_type: card.content_type, difficulty: card.difficulty, order_index: card.order_index
        });

        const { data: options } = await supabase.from('flashcard_options').select('*').eq('flashcard_id', card.id);
        for (const opt of options || []) {
          await supabase.from('flashcard_options').insert({
            flashcard_id: newCardId, option_text: opt.option_text, is_correct: opt.is_correct, order_index: opt.order_index
          });
        }
      }
    } else if (orig.type === 'cornell_note') {
      const { data: origNote } = await supabase.from('notes').select('*').eq('resource_id', id).single();
      const { data: blocks } = await supabase.from('note_blocks').select('*').eq('note_id', origNote.id);

      const newNoteId = crypto.randomUUID();
      await supabase.from('notes').insert({
        id: newNoteId, resource_id: newResId, summary: origNote.summary
      });

      for (const block of blocks || []) {
        await supabase.from('note_blocks').insert({
          note_id: newNoteId, block_type: block.block_type, title: block.title, content: block.content, order_index: block.order_index
        });
      }
    }

    res.json({ success: true, data: { duplicated_resource_id: newResId } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.post('/api/v1/library/resources/:id/archive', async (req, res) => {
  try {
    await supabase.from('resources').update({ archived: true }).eq('id', req.params.id);
    res.json({ success: true, data: { resource_id: req.params.id, archived: true } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.post('/api/v1/library/resources/:id/restore', async (req, res) => {
  try {
    await supabase.from('resources').update({ archived: false, deleted_at: null }).eq('id', req.params.id);
    res.json({ success: true, data: { resource_id: req.params.id, archived: false } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.post('/api/v1/library/resources/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = userClient(req);
    const { title, description, subject, tags, document_access_policy } = req.body;
    const userId = getUserIdFromRequest(req);

    const { data: resource } = await supabase.from('resources').select('*').eq('id', id).single();
    if (!resource) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Resource not found' } });

    // Update resource visibility to public
    await supabase.from('resources').update({ visibility: 'public' }).eq('id', id);

    const row = {
      resource_id: id,
      publisher_id: userId,
      title: title || resource.title,
      description: description || resource.description,
      resource_type: resource.type,
      subject,
      tags: tags || [],
      document_access_policy: document_access_policy || 'with_document',
      status: 'published',
      published_at: new Date()
    };

    // Idempotent: re-publishing the same resource updates its existing community row
    // instead of inserting a duplicate (which is how the Explore feed accumulated
    // repeated entries before).
    const { data: existing } = await supabase
      .from('community_resources').select('id').eq('resource_id', id).limit(1).maybeSingle();

    let pubId;
    let saveError;
    if (existing) {
      pubId = existing.id;
      ({ error: saveError } = await supabase.from('community_resources').update(row).eq('id', pubId));
    } else {
      pubId = crypto.randomUUID();
      ({ error: saveError } = await supabase.from('community_resources').insert({ id: pubId, ...row }));
    }

    if (saveError) {
      return res.status(500).json({ success: false, error: { code: 'PUBLISH_FAILED', message: saveError.message } });
    }

    res.json({
      success: true,
      data: {
        community_resource_id: pubId,
        resource_id: id,
        status: 'published',
        document_access_policy: row.document_access_policy,
        public_url: `https://tempo.app/community/resources/${pubId}`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// 7. Collection APIs
app.get('/api/v1/collections', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { data } = await supabase.from('collections').select('*').eq('owner_id', userId);
    res.json({ success: true, data: data || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.post('/api/v1/collections', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { name, description, icon, color } = req.body;
    const { data, error } = await supabase.from('collections').insert({ owner_id: userId, name, description, icon, color }).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.message } });
  }
});

app.patch('/api/v1/collections/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, color } = req.body;
    const { data, error } = await supabase.from('collections').update({ name, description, icon, color }).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.delete('/api/v1/collections/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await supabase.from('collections').delete().eq('id', id);
    res.json({ success: true, data: { collection_id: id, status: 'deleted' } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.put('/api/v1/collections/:col_id/resources/:res_id', async (req, res) => {
  try {
    const { col_id, res_id } = req.params;
    await supabase.from('collection_resources').insert({ collection_id: col_id, resource_id: res_id });
    res.json({ success: true, data: { collection_id: col_id, resource_id: res_id, status: 'added' } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.delete('/api/v1/collections/:col_id/resources/:res_id', async (req, res) => {
  try {
    const { col_id, res_id } = req.params;
    await supabase.from('collection_resources').delete().eq('collection_id', col_id).eq('resource_id', res_id);
    res.json({ success: true, data: { collection_id: col_id, resource_id: res_id, status: 'removed' } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// 8. Flashcard APIs
app.get('/api/v1/flashcard-sets/:set_id', async (req, res) => {
  try {
    const { set_id } = req.params;
    const { data: set } = await supabase.from('flashcard_sets').select('*').eq('id', set_id).single();
    if (!set) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Set not found' } });

    const { data: resource } = await supabase.from('resources').select('*').eq('id', set.resource_id).single();
    res.json({ success: true, data: { ...set, resource } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.get('/api/v1/flashcard-sets/:set_id/cards', async (req, res) => {
  try {
    const { set_id } = req.params;
    const { data: cards } = await supabase.from('flashcards').select('*').eq('set_id', set_id).order('order_index');

    const result = [];
    for (const card of cards || []) {
      const { data: options } = await supabase.from('flashcard_options').select('*').eq('flashcard_id', card.id).order('order_index');
      result.push({ ...card, options: options || [] });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.post('/api/v1/flashcard-sets/:set_id/cards', async (req, res) => {
  try {
    const { set_id } = req.params;
    const { question, answer, explanation, difficulty, content_type, options } = req.body;

    const cardId = crypto.randomUUID();
    const { data: card, error: cardErr } = await supabase.from('flashcards').insert({
      id: cardId, set_id, question, answer, explanation, difficulty, content_type, order_index: 99, created_by_ai: false
    }).select().single();

    if (cardErr) throw cardErr;

    if (Array.isArray(options)) {
      for (let i = 0; i < options.length; i++) {
        await supabase.from('flashcard_options').insert({
          flashcard_id: cardId, option_text: options[i].option_text, is_correct: options[i].is_correct || false, order_index: i
        });
      }
    }

    res.json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.patch('/api/v1/flashcards/:card_id', async (req, res) => {
  try {
    const { card_id } = req.params;
    const { question, answer, explanation, difficulty } = req.body;
    const { data, error } = await supabase.from('flashcards').update({ question, answer, explanation, difficulty }).eq('id', card_id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.delete('/api/v1/flashcards/:card_id', async (req, res) => {
  try {
    await supabase.from('flashcards').delete().eq('id', req.params.card_id);
    res.json({ success: true, data: { card_id: req.params.card_id, status: 'deleted' } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.post('/api/v1/flashcard-sets/:set_id/study-sessions', async (req, res) => {
  try {
    const { set_id } = req.params;
    const userId = getUserIdFromRequest(req);
    const { data: set } = await supabase.from('flashcard_sets').select('resource_id').eq('id', set_id).single();

    const { data, error } = await supabase.from('flashcard_study_sessions').insert({
      user_id: userId, resource_id: set.resource_id, set_id
    }).select().single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.patch('/api/v1/flashcards/:card_id/progress', async (req, res) => {
  try {
    const { card_id } = req.params;
    const userId = getUserIdFromRequest(req);
    const { status, correct } = req.body;

    const { data: orig } = await supabase.from('flashcard_study_progress').select('*').eq('user_id', userId).eq('flashcard_id', card_id).single();

    let correct_count = orig?.correct_count || 0;
    let wrong_count = orig?.wrong_count || 0;
    if (correct === true) correct_count++;
    if (correct === false) wrong_count++;

    const { data: card } = await supabase.from('flashcards').select('set_id').eq('id', card_id).single();
    const { data: set } = await supabase.from('flashcard_sets').select('resource_id').eq('id', card.set_id).single();

    const { data, error } = await supabase.from('flashcard_study_progress').upsert({
      user_id: userId, flashcard_id: card_id, resource_id: set.resource_id, status: status || 'learning', correct_count, wrong_count, last_reviewed_at: new Date()
    }, { onConflict: 'user_id,flashcard_id' }).select().single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// 9. Notes APIs
app.get('/api/v1/notes/:note_id', async (req, res) => {
  try {
    const { note_id } = req.params;
    const { data: note } = await supabase.from('notes').select('*').eq('id', note_id).single();
    if (!note) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Note not found' } });

    const { data: blocks } = await supabase.from('note_blocks').select('*').eq('note_id', note_id).order('order_index');
    res.json({ success: true, data: { ...note, blocks: blocks || [] } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.patch('/api/v1/notes/:note_id', async (req, res) => {
  try {
    const { note_id } = req.params;
    const { summary } = req.body;
    const { data, error } = await supabase.from('notes').update({ summary }).eq('id', note_id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.patch('/api/v1/notes/:note_id/blocks/:block_id', async (req, res) => {
  try {
    const { block_id } = req.params;
    const { title, content } = req.body;
    const { data, error } = await supabase.from('note_blocks').update({ title, content }).eq('id', block_id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.get('/api/v1/notes/:note_id/source-map', async (req, res) => {
  try {
    const { note_id } = req.params;
    const { data } = await supabase.from('note_blocks').select('id, block_type, source_chunk_id, source_section_id').eq('note_id', note_id);
    res.json({ success: true, data: data || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.post('/api/v1/notes/:note_id/export', async (req, res) => {
  res.json({
    success: true,
    data: {
      storage_path: `resource-exports/exported_note.pdf`,
      download_url: `${SUPABASE_URL}/storage/v1/object/resource-exports/exported_note.pdf`
    }
  });
});

// 10. Community APIs
app.get('/api/v1/community/resources', async (req, res) => {
  try {
    const supabase = userClient(req);
    const { q, type } = req.query;
    let query = supabase.from('community_resources').select('*, publisher:profiles!community_resources_publisher_id_fkey(full_name, username, email)').eq('status', 'published');
    if (type) query = query.eq('resource_type', type);
    if (q) query = query.ilike('title', `%${q}%`);

    const { data } = await query.order('published_at', { ascending: false });
    res.json({ success: true, data: data || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.get('/api/v1/community/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = userClient(req);
    const { data } = await supabase.from('community_resources').select('*, publisher:profiles!community_resources_publisher_id_fkey(full_name, username, email)').eq('id', id).single();
    if (!data) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Public resource not found' } });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// Preview a public resource: general info + partial content + summary + liked-state
app.get('/api/v1/community/resources/:id/preview', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromRequest(req);
    const supabase = userClient(req);

    const { data: pub } = await supabase
      .from('community_resources')
      .select('*, publisher:profiles!community_resources_publisher_id_fkey(full_name, username, email)')
      .eq('id', id)
      .single();
    if (!pub) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Public resource not found' } });

    const { data: likeRow } = await supabase
      .from('community_resource_likes')
      .select('user_id')
      .eq('community_resource_id', id)
      .eq('user_id', userId)
      .maybeSingle();

    const PREVIEW_LIMIT = 5;
    const preview = { type: pub.resource_type, has_document: pub.document_access_policy === 'with_document' };

    if (pub.resource_type === 'flashcard_set') {
      const { data: set } = await supabase.from('flashcard_sets').select('*').eq('resource_id', pub.resource_id).maybeSingle();
      preview.card_count = set?.card_count || 0;
      preview.difficulty = set?.difficulty;
      preview.content_type = set?.content_type;
      if (set) {
        const { data: cards } = await supabase.from('flashcards')
          .select('id, question, answer, order_index').eq('set_id', set.id).order('order_index').limit(PREVIEW_LIMIT);
        const out = [];
        for (const c of cards || []) {
          const { data: opts } = await supabase.from('flashcard_options')
            .select('option_text, is_correct, order_index').eq('flashcard_id', c.id).order('order_index');
          out.push({ ...c, options: opts || [] });
        }
        preview.cards = out;
        preview.preview_count = out.length;
      }
    } else if (pub.resource_type === 'cornell_note') {
      const { data: note } = await supabase.from('notes').select('*').eq('resource_id', pub.resource_id).maybeSingle();
      preview.summary = note?.summary || '';
      if (note) {
        const { data: blocks } = await supabase.from('note_blocks')
          .select('block_type, title, content, order_index').eq('note_id', note.id).order('order_index');
        const mains = (blocks || []).filter(b => b.block_type === 'main_note');
        const cues = (blocks || []).filter(b => b.block_type === 'cue');
        preview.total_points = mains.length;
        preview.points = mains.slice(0, PREVIEW_LIMIT);
        preview.cues = cues.slice(0, PREVIEW_LIMIT);
      }
    }

    res.json({ success: true, data: { community: pub, liked: !!likeRow, preview } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.patch('/api/v1/community/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, subject, tags, status } = req.body;
    const { data, error } = await supabase.from('community_resources').update({ title, description, subject, tags, status }).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.delete('/api/v1/community/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await supabase.from('community_resources').update({ status: 'unpublished' }).eq('id', id);
    res.json({ success: true, data: { community_resource_id: id, status: 'unpublished' } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.post('/api/v1/community/resources/:id/import', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromRequest(req);
    const supabase = userClient(req);
    const { title_override } = req.body;

    const { data: pub } = await supabase.from('community_resources').select('*').eq('id', id).single();
    if (!pub) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Public resource not found' } });

    // Fetch original resource to clone
    const { data: orig } = await supabase.from('resources').select('*').eq('id', pub.resource_id).single();
    if (!orig) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Source resource missing' } });

    const newResId = crypto.randomUUID();

    const hasDocAccess = pub.document_access_policy === 'with_document';

    // Copy resource
    await supabase.from('resources').insert({
      id: newResId,
      owner_id: userId,
      document_id: hasDocAccess ? orig.document_id : null,
      vector_index_id: hasDocAccess ? orig.vector_index_id : null,
      type: orig.type,
      title: title_override || orig.title,
      description: orig.description,
      visibility: 'private',
      created_from: 'community_import',
      source_resource_id: orig.id
    });

    if (orig.type === 'flashcard_set') {
      const { data: origSet } = await supabase.from('flashcard_sets').select('*').eq('resource_id', orig.id).single();
      const { data: cards } = await supabase.from('flashcards').select('*').eq('set_id', origSet.id);

      const newSetId = crypto.randomUUID();
      await supabase.from('flashcard_sets').insert({
        id: newSetId, resource_id: newResId, card_count: origSet.card_count, difficulty: origSet.difficulty, content_type: origSet.content_type
      });

      const cardList = cards || [];
      if (cardList.length > 0) {
        // Pre-generate new card ids so we can build the flashcards + options rows up front
        // and insert each set in a single batch instead of one round-trip per row.
        const idMap = new Map(cardList.map(c => [c.id, crypto.randomUUID()]));

        const newCards = cardList.map(card => ({
          id: idMap.get(card.id), set_id: newSetId, question: card.question, answer: card.answer,
          explanation: card.explanation, content_type: card.content_type, difficulty: card.difficulty, order_index: card.order_index
        }));
        await supabase.from('flashcards').insert(newCards);

        // Fetch every option for all cards in one query, then batch-insert the copies.
        const { data: allOptions } = await supabase.from('flashcard_options').select('*').in('flashcard_id', cardList.map(c => c.id));
        const newOptions = (allOptions || []).map(opt => ({
          flashcard_id: idMap.get(opt.flashcard_id), option_text: opt.option_text, is_correct: opt.is_correct, order_index: opt.order_index
        }));
        if (newOptions.length > 0) {
          await supabase.from('flashcard_options').insert(newOptions);
        }
      }
    } else if (orig.type === 'cornell_note') {
      const { data: origNote } = await supabase.from('notes').select('*').eq('resource_id', orig.id).single();
      const { data: blocks } = await supabase.from('note_blocks').select('*').eq('note_id', origNote.id);

      const newNoteId = crypto.randomUUID();
      await supabase.from('notes').insert({
        id: newNoteId, resource_id: newResId, summary: origNote.summary
      });

      const blockList = blocks || [];
      if (blockList.length > 0) {
        const newBlocks = blockList.map(block => ({
          note_id: newNoteId, block_type: block.block_type, title: block.title, content: block.content, order_index: block.order_index
        }));
        await supabase.from('note_blocks').insert(newBlocks);
      }
    }

    // Insert import record (owned by importer, allowed by RLS)
    await supabase.from('resource_imports').insert({
      importer_id: userId, source_resource_id: orig.id, imported_resource_id: newResId, community_resource_id: id,
      clone_strategy: hasDocAccess ? 'copy_content_reuse_vector' : 'copy_content_no_vector'
    });
    // Cross-user side effects (bump import_count + notify the publisher) via SECURITY DEFINER rpc
    await supabase.rpc('rpc_after_import', { p_community_id: id, p_imported_title: title_override || orig.title });

    res.json({
      success: true,
      data: {
        imported_resource_id: newResId,
        source_resource_id: orig.id,
        community_resource_id: id,
        clone_strategy: hasDocAccess ? 'copy_content_reuse_vector' : 'copy_content_no_vector',
        vector_access: hasDocAccess
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.post('/api/v1/community/resources/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = userClient(req);
    const { data, error } = await supabase.rpc('rpc_toggle_like', { p_community_id: id });
    if (error) throw error;
    if (!data || !data.ok) {
      return res.status(400).json({ success: false, error: { code: 'LIKE_FAILED', message: data?.error || 'Failed to like' } });
    }
    res.json({ success: true, data: { liked: data.liked, like_count: data.like_count } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// 11. Sharing APIs
app.post('/api/v1/resources/:resource_id/shares', async (req, res) => {
  try {
    const { resource_id } = req.params;
    const supabase = userClient(req);
    // Accept `identifiers` (emails or usernames) or legacy `emails`.
    const { emails, identifiers, permission, share_with_document } = req.body;
    const list = (Array.isArray(identifiers) && identifiers.length ? identifiers : emails) || [];

    const shares = [];
    const errors = [];
    for (const raw of list) {
      const ident = String(raw || '').trim();
      if (!ident) continue;
      const { data, error } = await supabase.rpc('rpc_share_resource', {
        p_resource_id: resource_id,
        p_identifier: ident,
        p_permission: permission || 'viewer',
        p_with_document: !!share_with_document
      });
      if (error) { errors.push({ identifier: ident, error: error.message }); continue; }
      if (data && data.ok) shares.push({ identifier: ident, share_id: data.share_id, target_name: data.target_name, target_email: data.target_email });
      else errors.push({ identifier: ident, error: data?.error || 'SHARE_FAILED' });
    }

    res.json({ success: shares.length > 0, data: { resource_id, shares, errors } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.get('/api/v1/resources/:resource_id/shares', async (req, res) => {
  try {
    const { resource_id } = req.params;
    const supabase = userClient(req);
    const { data } = await supabase.from('resource_permissions').select('*').eq('resource_id', resource_id);
    res.json({ success: true, data: data || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.patch('/api/v1/resources/:resource_id/shares/:share_id', async (req, res) => {
  try {
    const { share_id } = req.params;
    const { permission, status } = req.body;
    const { data, error } = await supabase.from('resource_permissions').update({ permission, status }).eq('id', share_id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.delete('/api/v1/resources/:resource_id/shares/:share_id', async (req, res) => {
  try {
    await supabase.from('resource_permissions').delete().eq('id', req.params.share_id);
    res.json({ success: true, data: { share_id: req.params.share_id, status: 'revoked' } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// 12. AI Assistant Sessions APIs
app.post('/api/v1/assistant/sessions', async (req, res) => {
  try {
    const { resource_id } = req.body;
    const userId = getUserIdFromRequest(req);
    const supabase = userClient(req);
    if (!resource_id) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing resource_id' } });

    const { data: resource } = await supabase.from('resources').select('*').eq('id', resource_id).single();
    if (!resource) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Resource not found' } });

    // Does this user actually have document/vector access (owner, shared-with-document,
    // public-with-document, or imported-with-vector)? Gate the assistant accordingly.
    let canUseDoc = false;
    if (resource.vector_index_id) {
      const { data: access } = await supabase.rpc('can_access_vector_index', { u_id: userId, v_idx_id: resource.vector_index_id });
      canUseDoc = !!access;
    }

    const sessionId = crypto.randomUUID();
    const { data, error } = await supabase.from('assistant_sessions').insert({
      id: sessionId, user_id: userId, resource_id,
      document_id: canUseDoc ? resource.document_id : null,
      vector_index_id: canUseDoc ? resource.vector_index_id : null,
      title: `Chat about ${resource.title}`
    }).select().single();

    if (error) throw error;

    res.json({
      success: true,
      data: {
        session_id: sessionId,
        resource_id,
        document_id: canUseDoc ? resource.document_id : null,
        vector_index_id: canUseDoc ? resource.vector_index_id : null,
        can_use_document_context: canUseDoc
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.get('/api/v1/assistant/sessions/:session_id', async (req, res) => {
  try {
    const { session_id } = req.params;
    const supabase = userClient(req);
    const { data } = await supabase.from('assistant_sessions').select('*').eq('id', session_id).single();
    if (!data) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Session not found' } });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.post('/api/v1/assistant/sessions/:session_id/messages', async (req, res) => {
  try {
    ensureOpenAiKey();
    const { session_id } = req.params;
    const { message } = req.body;
    const userId = getUserIdFromRequest(req);
    const supabase = userClient(req);

    if (!message) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Message cannot be empty' } });

    const { data: session } = await supabase.from('assistant_sessions').select('*').eq('id', session_id).single();
    if (!session) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Session not found' } });

    // 1. Save user message
    const userMsgId = crypto.randomUUID();
    await supabase.from('assistant_messages').insert({
      id: userMsgId, session_id, role: 'user', content: message
    });

    let contextText = '';
    let citations = [];

    // 2. Perform pgvector similarity search
    if (session.document_id) {
      try {
        const queryEmbedding = await getGeminiEmbedding(message);
        const { data: matchedChunks } = await supabase.rpc('match_document_chunks', {
          query_embedding: queryEmbedding,
          match_threshold: 0.3,
          match_count: 15,
          filter_document_id: session.document_id
        });

        if (matchedChunks && matchedChunks.length > 0) {
          contextText = matchedChunks.map(c => c.content).join('\n\n');
          citations = matchedChunks.map(c => ({
            chunk_id: c.id,
            section_title: 'Document Source',
            page_start: c.page_start || 0,
            page_end: c.page_end || 0,
            score: parseFloat(c.similarity.toFixed(2))
          }));
        }
      } catch (e) {
        console.warn('Vector match in session chat failed:', e);
      }
    }

    // 3. Call Gemini
    const prompt = `
You are a study assistant answering questions based on document context.
If the context does not contain the answer, say "I cannot find the answer in the document."

Context:
${contextText || 'No document context available.'}

Question:
${message}
`.trim();

    const answer = await callOpenAiText(prompt);

    // 4. Save assistant response
    const asstMsgId = crypto.randomUUID();
    await supabase.from('assistant_messages').insert({
      id: asstMsgId, session_id, role: 'assistant', content: answer, model_name: LLM_MODEL
    });

    // 5. Save citations
    for (const cit of citations) {
      await supabase.from('assistant_message_citations').insert({
        message_id: asstMsgId, chunk_id: cit.chunk_id, page_start: cit.page_start, page_end: cit.page_end, score: cit.score, quoted_text: ''
      });
    }

    res.json({
      success: true,
      data: {
        user_message: { message_id: userMsgId, role: 'user', content: message },
        assistant_message: { message_id: asstMsgId, role: 'assistant', content: answer, citations }
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.get('/api/v1/assistant/sessions/:session_id/messages', async (req, res) => {
  try {
    const { session_id } = req.params;
    const supabase = userClient(req);
    const { data: messages } = await supabase.from('assistant_messages').select('*').eq('session_id', session_id).order('created_at');

    const result = [];
    for (const msg of messages || []) {
      const { data: citations } = await supabase.from('assistant_message_citations').select('*').eq('message_id', msg.id);
      result.push({ ...msg, citations: citations || [] });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.delete('/api/v1/assistant/sessions/:session_id', async (req, res) => {
  try {
    const { session_id } = req.params;
    await supabase.from('assistant_sessions').delete().eq('id', session_id);
    res.json({ success: true, data: { session_id, status: 'deleted' } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// 13. Notifications & Activity APIs
app.get('/api/v1/notifications', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const supabase = userClient(req);
    const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    res.json({ success: true, data: data || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.patch('/api/v1/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = userClient(req);
    const { data, error } = await supabase.from('notifications').update({ read_at: new Date() }).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.get('/api/v1/activity', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { data } = await supabase.from('activity_events').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    res.json({ success: true, data: data || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});


// ----------------------------------------------------
// LEGACY FRONTEND ENDPOINTS (Maintained for UI compatibility)
// ----------------------------------------------------

app.post('/api/generate/flashcards', upload.single('file'), async (req, res) => {
  try {
    ensureGeminiKeys();
    ensureOpenAiKey();

    const userId = getUserIdFromRequest(req);
    let filename, buffer, mimeType, fileSize;

    // Support two upload modes:
    // 1. Storage-first (JSON body with storagePath) — avoids Vercel 4.5MB body limit
    // 2. Legacy multipart upload (file in request body)
    if (req.body.storagePath) {
      const storagePath = req.body.storagePath;
      filename = req.body.originalFilename || storagePath.split('/').pop();
      const uc = userClient(req);
      const { data: fileBlob, error: dlError } = await uc.storage
        .from('documents-raw-temp')
        .download(storagePath);
      if (dlError) throw new Error('Failed to download file from storage: ' + dlError.message);
      buffer = Buffer.from(await fileBlob.arrayBuffer());
      mimeType = 'application/octet-stream';
      fileSize = buffer.length;
    } else {
      const file = ensureFile(req.file);
      filename = file.originalname;
      buffer = file.buffer;
      mimeType = file.mimetype;
      fileSize = file.size;

      const uploadBlock = await checkUploadAllowed(userId, file);
      if (uploadBlock) return res.status(uploadBlock.status).json(uploadBlock.body);
    }

    const deckName = String(req.body.deckName || '').trim();
    const difficulty = normalizeDifficulty(req.body.difficulty);
    const contentType = normalizeContentType(req.body.contentType);
    const count = clampCount(req.body.count);
    if (!deckName) {
      return res.status(400).json({ error: 'Deck name is required.' });
    }

    const quotaBlock = await checkQuota(userId, 'flashcards');
    if (quotaBlock) return res.status(quotaBlock.status).json(quotaBlock.body);

    const extractedText = await extractTextFromBuffer(filename, buffer);

    // Save document thunk & embeddings to database
    const dbDoc = await saveDocumentToDb(userId, filename, mimeType, fileSize, extractedText);

    // Generate material via OpenAI
    const cards = await generateFlashcardsWithRetry({
      text: extractedText,
      deckName,
      count,
      difficulty,
      contentType,
      sourceName: filename,
    });

    if (cards.length === 0) {
      return res.status(502).json({ error: 'OpenAI returned no usable flashcards.' });
    }


    // Save flashcards to database using RPC
    const { data: dbSet, error: saveError } = await supabase.rpc('rpc_save_flashcards', {
      p_owner_id: userId,
      p_doc_id: dbDoc.document_id,
      p_title: deckName,
      p_difficulty: toDifficultyEnum(difficulty),
      p_content_type: toContentTypeEnum(contentType),
      p_cards: cards
    });

    if (saveError) {
      console.error('Failed to save flashcards to Supabase:', saveError);
    }

    res.json({
      deck: {
        id: dbSet?.resource_id || crypto.randomUUID(),
        name: deckName,
        count: cards.length,
        difficulty,
        contentType,
        source: filename,
        createdAt: Date.now(),
        lastUsedAt: null,
        documentContext: extractedText,
        cards,
      },
    });
  } catch (error) {
    handleApiError(res, error);
  }
});

app.post('/api/generate/notes', upload.single('file'), async (req, res) => {
  try {
    ensureGeminiKeys();
    ensureOpenAiKey();

    const userId = getUserIdFromRequest(req);
    let filename, buffer, mimeType, fileSize;

    if (req.body.storagePath) {
      const storagePath = req.body.storagePath;
      filename = req.body.originalFilename || storagePath.split('/').pop();
      const uc = userClient(req);
      const { data: fileBlob, error: dlError } = await uc.storage
        .from('documents-raw-temp')
        .download(storagePath);
      if (dlError) throw new Error('Failed to download file from storage: ' + dlError.message);
      buffer = Buffer.from(await fileBlob.arrayBuffer());
      mimeType = 'application/octet-stream';
      fileSize = buffer.length;
    } else {
      const file = ensureFile(req.file);
      filename = file.originalname;
      buffer = file.buffer;
      mimeType = file.mimetype;
      fileSize = file.size;

      const uploadBlock = await checkUploadAllowed(userId, file);
      if (uploadBlock) return res.status(uploadBlock.status).json(uploadBlock.body);
    }

    const noteName = String(req.body.noteName || '').trim();
    const detail = normalizeDetail(req.body.detail);
    if (!noteName) {
      return res.status(400).json({ error: 'Note name is required.' });
    }

    const quotaBlock = await checkQuota(userId, 'notes');
    if (quotaBlock) return res.status(quotaBlock.status).json(quotaBlock.body);

    const extractedText = await extractTextFromBuffer(filename, buffer);

    // Save document thunk & embeddings to database
    const dbDoc = await saveDocumentToDb(userId, filename, mimeType, fileSize, extractedText);

    // Generate material via OpenAI
    const prompt = buildNotesPrompt({
      text: extractedText,
      noteName,
      detail,
      sourceName: filename,
    });
    const data = await callOpenAiJson(prompt);
    const note = normalizeNote(data, noteName, detail, filename);

    // Save notes to database using RPC
    const { data: dbNote, error: saveError } = await supabase.rpc('rpc_save_notes', {
      p_owner_id: userId,
      p_doc_id: dbDoc.document_id,
      p_title: noteName,
      p_detail: detail,
      p_summary: note.summary,
      p_cues: note.cues,
      p_notes: note.notes
    });

    if (saveError) {
      console.error('Failed to save notes to Supabase:', saveError);
    }

    res.json({ note: { ...note, id: dbNote?.resource_id || note.id, documentContext: extractedText } });
  } catch (error) {
    handleApiError(res, error);
  }
});

app.post('/api/assistant', async (req, res) => {
  try {
    ensureGeminiKeys();
    ensureOpenAiKey();
    // Forward the caller's JWT so RLS on `resources`/`documents` evaluates auth.uid()
    // as the logged-in user. Without this the anon global client reads 0 rows and the
    // resource lookup below wrongly returns 403 "no document context access".
    const supabase = userClient(req);
    const question = String(req.body.question || '').trim();
    const documentContext = String(req.body.documentContext || '').trim();
    const materialType = String(req.body.materialType || 'study material').trim();
    const materialName = String(req.body.materialName || 'Untitled').trim();
    const sourceName = String(req.body.sourceName || '').trim();

    if (!question) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    const assistantUserId = getUserIdFromRequest(req);
    const assistantQuotaBlock = await checkQuota(assistantUserId, 'assistant_messages');
    if (assistantQuotaBlock) return res.status(assistantQuotaBlock.status).json(assistantQuotaBlock.body);

    let ragContext = '';
    let usedRag = false;
    const resourceId = req.body.resourceId;

    // Try finding the document associated with the resource
    try {
      let docId = null;
      let hasResource = false;

      if (resourceId) {
        hasResource = true;
        const { data: resData } = await supabase
          .from('resources')
          .select('document_id')
          .eq('id', resourceId)
          .single();
        if (resData) {
          docId = resData.document_id;
        }
      }

      // If we found a resource but its document_id is null, it means no document access is allowed
      if (hasResource && !docId) {
        return res.status(403).json({ error: 'This resource does not have document context access.' });
      }

      // If no resourceId but sourceName is provided (fallback/legacy)
      if (!docId && sourceName) {
        const { data: docData } = await supabase
          .from('documents')
          .select('id')
          .eq('original_filename', sourceName)
          .order('created_at', { ascending: false })
          .limit(1);

        if (docData && docData.length > 0) {
          docId = docData[0].id;
        }
      }

      if (docId) {
        const queryEmbedding = await getGeminiEmbedding(question);

        const { data: matchedChunks, error: rpcError } = await supabase.rpc('match_document_chunks', {
          query_embedding: queryEmbedding,
          match_threshold: 0.3,
          match_count: 20,
          filter_document_id: docId
        });

        if (!rpcError && matchedChunks && matchedChunks.length > 0) {
          ragContext = matchedChunks.map(c => c.content).join('\n\n');
          usedRag = true;
          console.log(`RAG: Found ${matchedChunks.length} matching chunks using pgvector for document ${docId}.`);
        }
      }
    } catch (e) {
      console.warn('RAG processing failed, falling back to full context:', e);
    }

    const finalContext = usedRag ? ragContext : documentContext;
    if (!finalContext) {
      return res.status(400).json({ error: 'Document context is required for Tempo AI.' });
    }

    const prompt = `
You are Tempo AI, a study assistant.

Material type: ${materialType}
Material name: ${materialName}
Source file: ${sourceName || 'unknown'}

Instructions:
- Answer only using the document context.
- Stay focused on the uploaded material.
- If the answer is not supported by the document, say that the document does not provide enough information.
- Be concise but helpful for studying.

Question:
${question}

Document context:
${finalContext}
`.trim();

    const answer = await callOpenAiText(prompt);
    // Log metered usage for Free-plan quota (best-effort, don't block response)
    if (assistantUserId !== DEFAULT_USER_ID) {
      supabase.rpc('rpc_log_ai_usage', { p_user_id: assistantUserId, p_kind: 'assistant_messages' })
        .then(({ error }) => { if (error) console.error('log assistant usage error:', error); });
    }

    res.json({ answer });
  } catch (error) {
    handleApiError(res, error);
  }
});


// ----------------------------------------------------
// LEGACY HELPERS
// ----------------------------------------------------

function ensureGeminiKeys() {
  if (GEMINI_KEYS.length === 0) {
    const err = new Error('No Gemini API keys are configured.');
    err.status = 500;
    throw err;
  }
}

function ensureOpenAiKey() {
  if (!LLM_KEY) {
    const err = new Error(`No ${LLM_IS_DEEPSEEK ? 'DeepSeek' : 'OpenAI'} API key is configured.`);
    err.status = 500;
    throw err;
  }
}

function ensureFile(file) {
  if (!file) {
    const err = new Error('Please upload a document.');
    err.status = 400;
    throw err;
  }
  return file;
}

function normalizeDifficulty(value) {
  const allowed = ['Easy', 'Normal', 'Hard'];
  return allowed.includes(value) ? value : 'Normal';
}

function normalizeContentType(value) {
  const allowed = ['Multiple choice', 'Situation', 'Mixed'];
  return allowed.includes(value) ? value : 'Mixed';
}

// Map the app's display difficulty/content-type vocabulary to the Postgres enum
// labels expected by rpc_save_flashcards (difficulty_level / flashcard_content_type).
// Passing the raw display values (e.g. 'Normal', 'Mixed', 'Situation') makes the
// enum cast throw, which silently aborts the save so the deck never reaches the
// library. Accepts both display ('Normal') and lowercased ('normal') inputs.
function toDifficultyEnum(value) {
  const v = String(value || '').toLowerCase();
  if (v === 'easy') return 'easy';
  if (v === 'hard') return 'hard';
  if (v === 'mixed') return 'mixed';
  return 'medium'; // 'normal' (the app default) and anything unknown
}

function toContentTypeEnum(value) {
  const v = String(value || '').toLowerCase().replace(/\s+/g, '_');
  if (v === 'true_false') return 'true_false';
  if (v === 'short_answer') return 'short_answer';
  // The enum has no 'situation' value, so scenario MCQs are stored as multiple_choice.
  if (v === 'multiple_choice' || v === 'situation') return 'multiple_choice';
  return 'mixed'; // 'Mixed' (the app default) and anything unknown
}

function normalizeDetail(value) {
  const allowed = ['less', 'normal', 'detail'];
  return allowed.includes(value) ? value : 'normal';
}

function clampCount(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 20;
  return Math.min(60, Math.max(1, parsed));
}

function mustHaveText(text) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) {
    const err = new Error('The uploaded document does not contain readable text.');
    err.status = 400;
    throw err;
  }
  return normalized.slice(0, 32000);
}

function buildFlashcardPrompt({ text, deckName, count, difficulty, contentType, sourceName }) {
  return `
You are generating study flashcards from a real uploaded document.

Deck name: ${deckName}
Source file: ${sourceName}
Number of cards: ${count}
Difficulty: ${difficulty}
Content type: ${contentType}

Rules:
- You MUST generate EXACTLY ${count} flashcards. Do not generate fewer than ${count} under any circumstances. If the document is long, cover different parts of the document to reach the target count of ${count}.
- Use only the document content.
- Avoid generic filler.
- Each card must be answerable from the document.
- For "Multiple choice", every card must be a direct MCQ.
- For "Situation", every card must be a scenario-based MCQ grounded in the document.
- For "Mixed", combine both styles.
- Every card must include exactly 4 answer options.
- Return strict JSON only.
- Output language: You MUST generate the questions, options, answers, explanations, cues, notes, and summary in the same language as the provided Document. For example, if the Document is in Vietnamese, generate everything in Vietnamese. If the Document is in English, generate in English. Do not translate the content to English if the Document is in another language.

Return this shape:
{
  "cards": [
    {
      "type": "multiple_choice" | "situation",
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctOption": "A" | "B" | "C" | "D",
      "answer": "Option A",
      "explanation": "string"
    }
  ]
}

Document:
${text}
`.trim();
}


function buildNotesPrompt({ text, noteName, detail, sourceName }) {
  return `
You are generating Cornell-style study notes from a real uploaded document.

Note name: ${noteName}
Source file: ${sourceName}
Detail level: ${detail}

Rules:
- Use only information from the document.
- Keep cues short and high-signal.
- Keep notes concrete and study-ready.
- Return strict JSON only.
- Output language: You MUST generate the questions, options, answers, explanations, cues, notes, and summary in the same language as the provided Document. For example, if the Document is in Vietnamese, generate everything in Vietnamese. If the Document is in English, generate in English. Do not translate the content to English if the Document is in another language.

Return this shape:
{
  "cues": ["string"],
  "notes": ["string"],
  "summary": "string"
}

Document:
${text}
`.trim();
}

async function callGeminiJson(prompt) {
  let lastError;

  for (const apiKey of GEMINI_KEYS) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json',
          },
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = payload?.error?.message || `Gemini request failed with ${response.status}`;
        const err = new Error(message);
        err.status = response.status;
        throw err;
      }

      const rawText = payload?.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('') || '';
      return JSON.parse(stripCodeFence(rawText));
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Gemini request failed.');
}

async function callGeminiText(prompt) {
  let lastError;

  for (const apiKey of GEMINI_KEYS) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
          },
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = payload?.error?.message || `Gemini request failed with ${response.status}`;
        const err = new Error(message);
        err.status = response.status;
        throw err;
      }

      const rawText = payload?.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('').trim() || '';
      if (!rawText) {
        const err = new Error('Gemini returned an empty assistant response.');
        err.status = 502;
        throw err;
      }
      return rawText;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Gemini assistant request failed.');
}

// Builds the provider-specific request body. DeepSeek is OpenAI-compatible but:
//  - uses `max_tokens` (not `max_completion_tokens`)
//  - defaults to thinking mode ON, which we disable for these generation tasks
//    (much faster/cheaper, and thinking mode ignores `temperature` anyway)
function buildLlmBody(prompt, { json }) {
  const body = {
    model: LLM_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  };
  if (json) body.response_format = { type: 'json_object' };

  if (LLM_IS_DEEPSEEK) {
    body.max_tokens = 8192;
    body.thinking = { type: 'disabled' };
  } else {
    body.max_completion_tokens = 16384;
  }
  return body;
}

async function callLlm(prompt, { json }) {
  ensureOpenAiKey();
  const response = await fetch(LLM_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LLM_KEY}`
    },
    body: JSON.stringify(buildLlmBody(prompt, { json }))
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const providerName = LLM_IS_DEEPSEEK ? 'DeepSeek' : 'OpenAI';
    const message = payload?.error?.message || `${providerName} request failed with ${response.status}`;
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }
  return payload?.choices?.[0]?.message?.content || '';
}

async function callOpenAiJson(prompt) {
  const rawText = await callLlm(prompt, { json: true });
  const cleaned = stripCodeFence(rawText);
  try {
    return JSON.parse(cleaned);
  } catch (parseErr) {
    console.error('callOpenAiJson: JSON.parse failed:', parseErr.message);
    console.error('callOpenAiJson: raw (first 500 chars):', cleaned.slice(0, 500));
    // Attempt to fix bad unicode escapes and retry
    const sanitized = cleaned
      .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_m, hex) => {
        const cp = parseInt(hex, 16);
        if (cp <= 0xFFFF) return '\\u' + hex.padStart(4, '0');
        const hi = Math.floor((cp - 0x10000) / 0x400) + 0xD800;
        const lo = ((cp - 0x10000) % 0x400) + 0xDC00;
        return '\\u' + hi.toString(16) + '\\u' + lo.toString(16);
      })
      .replace(/\\u(?![0-9a-fA-F]{4})/g, '\\\\u');  // escape bare \u not followed by 4 hex
    return JSON.parse(sanitized);
  }
}

async function callOpenAiText(prompt) {
  try {
    const rawText = (await callLlm(prompt, { json: false })).trim();
    if (!rawText) {
      const err = new Error(`${LLM_IS_DEEPSEEK ? 'DeepSeek' : 'OpenAI'} returned an empty assistant response.`);
      err.status = 502;
      throw err;
    }
    return rawText;
  } catch (error) {
    throw error;
  }
}


function stripCodeFence(text) {
  let s = String(text || '').replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();
  // Fix ES6-style Unicode escapes (\u{XXXX}) → JSON-safe \uXXXX (BMP only; drop non-BMP)
  s = s.replace(/\\u\{([0-9a-fA-F]+)\}/g, (_m, hex) => {
    const cp = parseInt(hex, 16);
    if (cp <= 0xFFFF) return '\\u' + hex.padStart(4, '0');
    // Non-BMP: encode as surrogate pair
    const hi = Math.floor((cp - 0x10000) / 0x400) + 0xD800;
    const lo = ((cp - 0x10000) % 0x400) + 0xDC00;
    return '\\u' + hi.toString(16) + '\\u' + lo.toString(16);
  });
  return s;
}

function normalizeCards(cards, contentType) {
  if (!Array.isArray(cards)) {
    console.log("normalizeCards: Input cards is not an array");
    return [];
  }

  const result = cards.map((card, index) => {
    // Robustly extract options (supporting both array and object formats)
    let optionsArray = [];
    if (Array.isArray(card.options)) {
      optionsArray = card.options;
    } else if (card.options && typeof card.options === 'object') {
      optionsArray = Object.keys(card.options)
        .sort()
        .map(k => card.options[k]);
    }

    const normalizedOptions = optionsArray
      .map(option => String(option || '').trim())
      .filter(Boolean)
      .slice(0, 4);

    // Normalize correctOption (supporting lowercase and prefix matching like 'Option A' or 'a')
    let correctOption = 'A';
    if (card.correctOption) {
      const match = String(card.correctOption).trim().match(/^[A-D]/i);
      if (match) {
        correctOption = match[0].toUpperCase();
      }
    }

    const type = card.type === 'situation'
      ? 'situation'
      : contentType === 'Situation'
        ? 'situation'
        : 'multiple_choice';

    return {
      id: crypto.randomUUID(),
      type,
      question: String(card.question || '').trim(),
      options: normalizedOptions,
      correctOption,
      answer: String(card.answer || `Option ${correctOption}`).trim(),
      explanation: String(card.explanation || '').trim(),
      starred: false,
    };
  }).filter(card => card.question && card.options.length === 4);

  console.log(`normalizeCards: LLM returned ${cards.length} cards. After normalization and filtering, ${result.length} cards remain.`);
  return result;
}

async function generateFlashcardsWithRetry({ text, deckName, count, difficulty, contentType, sourceName }) {
  const prompt = buildFlashcardPrompt({ text, deckName, count, difficulty, contentType, sourceName });
  const data = await callOpenAiJson(prompt);
  let cards = normalizeCards(data.cards, contentType);

  let attempts = 0;
  const maxAttempts = 3;

  while (cards.length < count && attempts < maxAttempts) {
    attempts++;
    const missingCount = count - cards.length;
    console.log(`generateFlashcardsWithRetry: Under target count. Got ${cards.length}/${count}. Attempting to generate ${missingCount} more...`);

    const existingQuestions = cards.map(c => c.question);
    const retryPrompt = `
You are generating additional study flashcards from a real uploaded document.
We need exactly ${missingCount} more flashcards to reach our target of ${count}.

Deck name: ${deckName}
Source file: ${sourceName}
Number of cards to generate now: ${missingCount}
Difficulty: ${difficulty}
Content type: ${contentType}

Avoid these existing questions:
${existingQuestions.map((q, idx) => `${idx + 1}. ${q}`).join('\n')}

Rules:
- You MUST generate EXACTLY ${missingCount} flashcards.
- Do not repeat any of the existing questions listed above.
- Use only the document content.
- Every card must include exactly 4 answer options.
- Return strict JSON only.
- Output language: You MUST generate in the same language as the provided Document.

Return this shape:
{
  "cards": [
    {
      "type": "multiple_choice" | "situation",
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctOption": "A" | "B" | "C" | "D",
      "answer": "Option A",
      "explanation": "string"
    }
  ]
}

Document:
${text}
`.trim();

    try {
      const retryData = await callOpenAiJson(retryPrompt);
      const newCards = normalizeCards(retryData.cards, contentType);
      const uniqueNewCards = newCards.filter(nc => !existingQuestions.includes(nc.question));
      
      if (uniqueNewCards.length > 0) {
        cards = cards.concat(uniqueNewCards);
        console.log(`generateFlashcardsWithRetry: Successfully added ${uniqueNewCards.length} new unique cards. Total now: ${cards.length}/${count}.`);
      } else {
        console.log(`generateFlashcardsWithRetry: No new unique cards generated in attempt ${attempts}.`);
      }
    } catch (err) {
      console.error(`generateFlashcardsWithRetry: Error during attempt ${attempts}:`, err);
    }
  }

  if (cards.length > count) {
    cards = cards.slice(0, count);
  }

  return cards;
}


function normalizeNote(data, noteName, detail, sourceName) {
  const cues = Array.isArray(data.cues) ? data.cues.map(item => String(item || '').trim()).filter(Boolean) : [];
  const notes = Array.isArray(data.notes) ? data.notes.map(item => String(item || '').trim()).filter(Boolean) : [];
  const summary = String(data.summary || '').trim();

  if (cues.length === 0 || notes.length === 0 || !summary) {
    const err = new Error('Gemini returned an incomplete note structure.');
    err.status = 502;
    throw err;
  }

  return {
    id: crypto.randomUUID(),
    name: noteName,
    detail,
    source: sourceName,
    createdAt: Date.now(),
    lastUsedAt: null,
    cues,
    notes,
    summary,
  };
}

// ─── Polar Billing ───────────────────────────────────────────────

function verifyPolarWebhook(rawBody, headers) {
  const webhookId = headers['webhook-id'];
  const webhookTimestamp = headers['webhook-timestamp'];
  const webhookSignature = headers['webhook-signature'];

  if (!webhookId || !webhookTimestamp || !webhookSignature) return false;

  const ts = parseInt(webhookTimestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > 300) return false;

  const secret = POLAR_WEBHOOK_SECRET;
  const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;

  // Polar's official SDK uses the raw secret string as the HMAC key,
  // while the Standard Webhooks spec base64-decodes the part after "whsec_".
  // Accept any of the plausible key derivations.
  const stripped = secret.startsWith('whsec_') ? secret.slice(6) : secret;
  const candidateKeys = [
    Buffer.from(secret, 'utf8'),
    Buffer.from(stripped, 'utf8'),
  ];
  try {
    candidateKeys.push(Buffer.from(stripped, 'base64'));
  } catch (_) { /* not base64 — skip */ }

  const expectedSigs = candidateKeys.map((key) =>
    crypto.createHmac('sha256', key).update(signedContent).digest('base64')
  );

  const signatures = webhookSignature.split(' ');
  return signatures.some((sig) => {
    const sigValue = sig.startsWith('v1,') ? sig.slice(3) : sig;
    const sigBuf = Buffer.from(sigValue);
    return expectedSigs.some((exp) => {
      const expBuf = Buffer.from(exp);
      return expBuf.length === sigBuf.length && crypto.timingSafeEqual(expBuf, sigBuf);
    });
  });
}

async function isProUser(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('plan, pro_until')
    .eq('id', userId)
    .single();
  if (!data) return false;
  if (data.plan === 'pro') return true;
  return !!(data.pro_until && new Date(data.pro_until) > new Date());
}

// ─── Free-plan quotas & gating ───────────────────────────────────

const FREE_LIMITS = {
  flashcards: 50,       // AI cards generated per week
  notes: 5,             // AI notes generated per week
  assistant_messages: 10,
  max_file_bytes: 3 * 1024 * 1024,
  allowed_extensions: ['docx'],
};
const PRO_MAX_FILE_BYTES = 10 * 1024 * 1024;
const PRO_ALLOWED_EXTENSIONS = ['docx', 'pdf', 'pptx'];

async function getWeeklyUsage(userId) {
  const { data, error } = await supabase.rpc('rpc_get_weekly_usage', { p_user_id: userId });
  if (error) {
    console.error('weekly usage RPC error:', error);
    return { flashcards: 0, notes: 0, assistant_messages: 0 };
  }
  return data;
}

function fileExtension(filename) {
  const m = String(filename || '').toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : '';
}

// Returns null if allowed; otherwise a { status, body } to send back.
async function checkUploadAllowed(userId, file) {
  const pro = await isProUser(userId);
  const ext = fileExtension(file.originalname);
  const allowedExts = pro ? PRO_ALLOWED_EXTENSIONS : FREE_LIMITS.allowed_extensions;
  const maxBytes = pro ? PRO_MAX_FILE_BYTES : FREE_LIMITS.max_file_bytes;

  if (!allowedExts.includes(ext)) {
    return {
      status: 403,
      body: {
        error: pro
          ? `Unsupported file type: .${ext}`
          : `Định dạng .${ext} chỉ dành cho gói Pro. Gói Free hỗ trợ DOCX.`,
        code: 'PLAN_LIMIT', limit_type: 'file_format', upgrade: !pro,
      },
    };
  }
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    return {
      status: 403,
      body: {
        error: `File vượt giới hạn ${mb} MB của gói ${pro ? 'Pro' : 'Free'}.`,
        code: 'PLAN_LIMIT', limit_type: 'file_size', upgrade: !pro,
      },
    };
  }
  return null;
}

// Returns null if allowed; otherwise a { status, body } for over-quota.
async function checkQuota(userId, kind) {
  if (await isProUser(userId)) return null;
  const usage = await getWeeklyUsage(userId);
  const used = usage[kind] || 0;
  if (used >= FREE_LIMITS[kind]) {
    return {
      status: 403,
      body: {
        error: 'Đã đạt giới hạn gói Free trong tuần này.',
        code: 'PLAN_LIMIT', limit_type: kind,
        used, limit: FREE_LIMITS[kind], upgrade: true,
      },
    };
  }
  return null;
}

app.get('/api/v1/billing/usage', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (userId === DEFAULT_USER_ID) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    const pro = await isProUser(userId);
    const usage = await getWeeklyUsage(userId);
    return res.json({
      success: true,
      plan: pro ? 'pro' : 'free',
      limits: pro ? null : {
        flashcards: FREE_LIMITS.flashcards,
        notes: FREE_LIMITS.notes,
        assistant_messages: FREE_LIMITS.assistant_messages,
      },
      usage,
    });
  } catch (err) {
    console.error('usage error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ─── payOS (VietQR prepaid) ──────────────────────────────────────

app.post('/api/v1/billing/payos/checkout', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (userId === DEFAULT_USER_ID) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    if (!payosClient) {
      return res.status(500).json({ success: false, error: 'QR billing not configured' });
    }

    const { interval } = req.body;
    const planInterval = interval === 'year' ? 'year' : 'month';
    const amount = planInterval === 'year' ? PAYOS_PRICE_YEARLY : PAYOS_PRICE_MONTHLY;
    const orderCode = Date.now();

    const payment = await payosClient.paymentRequests.create({
      orderCode,
      amount,
      description: 'TEMPO PRO',
      returnUrl: `${APP_BASE_URL}/billing/success`,
      cancelUrl: `${APP_BASE_URL}/billing/cancel`,
    });

    const { data: orderResult, error } = await supabase.rpc('rpc_create_payos_order', {
      p_order_code: orderCode,
      p_user_id: userId,
      p_interval: planInterval,
      p_amount: amount,
      p_payment_link_id: payment.paymentLinkId || null,
    });

    if (error || !orderResult?.success) {
      console.error('payOS order insert error:', error || orderResult);
      return res.status(500).json({ success: false, error: 'Failed to record order' });
    }

    return res.json({
      success: true,
      checkout_url: payment.checkoutUrl,
      qr_code: payment.qrCode,
      order_code: orderCode,
    });
  } catch (err) {
    console.error('payOS checkout error:', err);
    return res.status(502).json({ success: false, error: 'Failed to create QR payment' });
  }
});

app.post('/api/v1/payos/webhook', async (req, res) => {
  try {
    if (!payosClient) {
      return res.status(500).json({ error: 'QR billing not configured' });
    }

    let webhookData;
    try {
      webhookData = await payosClient.webhooks.verify(req.body);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    if (webhookData.code !== '00') {
      return res.status(200).json({ received: true, ignored: 'not a successful payment' });
    }

    const { data: result, error } = await supabase.rpc('rpc_apply_payos_payment', {
      p_order_code: webhookData.orderCode,
    });

    if (error) {
      console.error('payOS webhook RPC error:', error);
      return res.status(500).json({ error: 'Failed to process payment' });
    }

    // Unknown orderCode (e.g. payOS webhook validation test) — ack with 200 so
    // registration succeeds and payOS doesn't retry forever.
    if (!result?.success) {
      console.warn('payOS webhook skipped:', result);
      return res.status(200).json({ received: true, skipped: result?.error || 'unknown order' });
    }

    return res.status(200).json({ received: true, result });
  } catch (err) {
    console.error('payOS webhook error:', err);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
});

app.post('/api/v1/polar/webhook', async (req, res) => {
  try {
    const rawBody = req.body.toString('utf8');
    if (!verifyPolarWebhook(rawBody, req.headers)) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const event = JSON.parse(rawBody);
    const type = event.type;
    const sub = event.data;

    const activatingEvents = [
      'subscription.created',
      'subscription.active',
      'subscription.updated',
      'subscription.uncanceled',
    ];
    const deactivatingEvents = [
      'subscription.canceled',
      'subscription.revoked',
    ];

    if (activatingEvents.includes(type) || deactivatingEvents.includes(type)) {
      const plan = deactivatingEvents.includes(type) ? 'free' : 'pro';
      const status = deactivatingEvents.includes(type) ? (type === 'subscription.revoked' ? 'revoked' : 'canceled') : (sub.status || 'active');
      const email = sub.customer?.email;

      if (!email) {
        return res.status(200).json({ received: true, skipped: 'no customer email' });
      }

      const { data: result, error } = await supabase.rpc('rpc_upsert_subscription', {
        p_email: email,
        p_polar_customer_id: sub.customer?.id || null,
        p_polar_subscription_id: sub.id,
        p_polar_product_id: sub.product_id || sub.product?.id || '',
        p_status: status,
        p_current_period_start: sub.current_period_start || null,
        p_current_period_end: sub.current_period_end || null,
        p_cancel_at_period_end: sub.cancel_at_period_end || false,
        p_plan: plan,
      });

      if (error) {
        console.error('Webhook RPC error:', error);
        return res.status(500).json({ error: 'Failed to process subscription' });
      }

      return res.status(200).json({ received: true, processed: type, result });
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
});

app.post('/api/v1/billing/checkout', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (userId === DEFAULT_USER_ID) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { interval } = req.body;
    const productId = interval === 'year'
      ? POLAR_PRO_YEARLY_PRODUCT_ID
      : POLAR_PRO_MONTHLY_PRODUCT_ID;

    if (!productId) {
      return res.status(500).json({ success: false, error: 'Billing not configured' });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (!profile?.email) {
      return res.status(400).json({ success: false, error: 'User email not found' });
    }

    const response = await fetch(`${POLAR_API_BASE}/checkouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${POLAR_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        products: [productId],
        customer_email: profile.email,
        success_url: `${APP_BASE_URL}/billing/success`,
      }),
    });

    const checkout = await response.json();

    if (!response.ok) {
      console.error('Polar checkout error:', checkout);
      return res.status(502).json({ success: false, error: 'Failed to create checkout session' });
    }

    return res.json({ success: true, checkout_url: checkout.url });
  } catch (err) {
    console.error('Checkout error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/v1/billing/subscription', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (userId === DEFAULT_USER_ID) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, pro_until')
      .eq('id', userId)
      .single();

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const prepaidActive = !!(profile?.pro_until && new Date(profile.pro_until) > new Date());
    const effectivePlan = profile?.plan === 'pro' || prepaidActive ? 'pro' : 'free';

    return res.json({
      success: true,
      plan: effectivePlan,
      pro_until: profile?.pro_until || null,
      subscription: subscription || null,
    });
  } catch (err) {
    console.error('Subscription status error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

function handleApiError(res, error) {
  const status = error.status && Number.isInteger(error.status) ? error.status : 500;
  res.status(status).json({ error: error.message || 'Unexpected server error.' });
}

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Tempo API listening on port ${PORT}`);
  });
}

module.exports = app;
