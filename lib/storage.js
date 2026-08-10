const STORAGE_KEYS = {
  documents: 'statutesense_documents',
  analyses: 'statutesense_analyses',
  prompts: 'statutesense_prompts',
};

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function getItems(key) {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setItems(key, items) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(items));
}

export function getDocuments() {
  return getItems(STORAGE_KEYS.documents);
}

export function getDocumentById(id) {
  const docs = getDocuments();
  return docs.find((d) => d.id === id) || null;
}

export function saveDocument(doc) {
  const docs = getDocuments();
  const newDoc = {
    id: generateId(),
    title: doc.title || `Document ${new Date().toISOString().slice(0, 10)}`,
    originalText: doc.originalText,
    fileName: doc.fileName || null,
    fileType: doc.fileType || 'TXT',
    fileSize: doc.fileSize || null,
    documentType: doc.documentType || 'Other',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  docs.unshift(newDoc);
  setItems(STORAGE_KEYS.documents, docs);
  return newDoc;
}

export function updateDocument(id, updates) {
  const docs = getDocuments();
  const idx = docs.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  docs[idx] = { ...docs[idx], ...updates, updatedAt: new Date().toISOString() };
  setItems(STORAGE_KEYS.documents, docs);
  return docs[idx];
}

export function deleteDocument(id) {
  const docs = getDocuments().filter((d) => d.id !== id);
  setItems(STORAGE_KEYS.documents, docs);
  const analyses = getAnalyses().filter((a) => a.documentId !== id);
  setItems(STORAGE_KEYS.analyses, analyses);
}

export function getAnalyses(documentId) {
  const analyses = getItems(STORAGE_KEYS.analyses);
  if (documentId) {
    return analyses.filter((a) => a.documentId === documentId);
  }
  return analyses;
}

export function saveAnalysis(analysis) {
  const analyses = getAnalyses();
  const newAnalysis = {
    id: generateId(),
    documentId: analysis.documentId || null,
    prompt: analysis.prompt,
    result: analysis.result,
    modelUsed: analysis.modelUsed || 'unknown',
    tokenCount: analysis.tokenCount || null,
    duration: analysis.duration || null,
    createdAt: new Date().toISOString(),
  };
  analyses.unshift(newAnalysis);
  setItems(STORAGE_KEYS.analyses, analyses);
  return newAnalysis;
}

export function deleteAnalysis(id) {
  const analyses = getAnalyses().filter((a) => a.id !== id);
  setItems(STORAGE_KEYS.analyses, analyses);
}

export function getPrompts() {
  return getItems(STORAGE_KEYS.prompts);
}

export function savePrompt(prompt) {
  const prompts = getPrompts();
  const newPrompt = {
    id: generateId(),
    name: prompt.name,
    description: prompt.description || null,
    prompt: prompt.prompt,
    category: prompt.category || 'Custom',
    isDefault: prompt.isDefault || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  prompts.unshift(newPrompt);
  setItems(STORAGE_KEYS.prompts, prompts);
  return newPrompt;
}

export function updatePrompt(id, updates) {
  const prompts = getPrompts();
  const idx = prompts.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  prompts[idx] = { ...prompts[idx], ...updates, updatedAt: new Date().toISOString() };
  setItems(STORAGE_KEYS.prompts, prompts);
  return prompts[idx];
}

export function deletePrompt(id) {
  const prompts = getPrompts().filter((p) => p.id !== id);
  setItems(STORAGE_KEYS.prompts, prompts);
}

export function clearAllData() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}
