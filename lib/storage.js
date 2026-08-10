const STORAGE_KEYS = {
  documents: 'statutesense_documents',
  analyses: 'statutesense_analyses',
  prompts: 'statutesense_prompts',
  clauses: 'statutesense_clauses',
  folders: 'statutesense_folders',
  theme: 'statutesense_theme',
  chat: 'statutesense_chat',
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

function getItem(key) {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setItem(key, value) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value);
}

// Theme
export function getTheme() {
  return getItem(STORAGE_KEYS.theme) || 'dark';
}

export function setTheme(theme) {
  setItem(STORAGE_KEYS.theme, theme);
}

// Documents
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
    tags: doc.tags || [],
    folderId: doc.folderId || null,
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

// Analyses
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
    riskScore: analysis.riskScore || null,
    complianceResults: analysis.complianceResults || null,
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

// Custom Prompts
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

// Clause Library
export function getClauses() {
  return getItems(STORAGE_KEYS.clauses);
}

export function saveClause(clause) {
  const clauses = getClauses();
  const newClause = {
    id: generateId(),
    title: clause.title || 'Untitled Clause',
    content: clause.content,
    category: clause.category || 'General',
    tags: clause.tags || [],
    documentId: clause.documentId || null,
    createdAt: new Date().toISOString(),
  };
  clauses.unshift(newClause);
  setItems(STORAGE_KEYS.clauses, clauses);
  return newClause;
}

export function updateClause(id, updates) {
  const clauses = getClauses();
  const idx = clauses.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  clauses[idx] = { ...clauses[idx], ...updates };
  setItems(STORAGE_KEYS.clauses, clauses);
  return clauses[idx];
}

export function deleteClause(id) {
  const clauses = getClauses().filter((c) => c.id !== id);
  setItems(STORAGE_KEYS.clauses, clauses);
}

// Folders
export function getFolders() {
  return getItems(STORAGE_KEYS.folders);
}

export function saveFolder(folder) {
  const folders = getFolders();
  const newFolder = {
    id: generateId(),
    name: folder.name,
    color: folder.color || '#f4c04f',
    createdAt: new Date().toISOString(),
  };
  folders.push(newFolder);
  setItems(STORAGE_KEYS.folders, folders);
  return newFolder;
}

export function updateFolder(id, updates) {
  const folders = getFolders();
  const idx = folders.findIndex((f) => f.id === id);
  if (idx === -1) return null;
  folders[idx] = { ...folders[idx], ...updates };
  setItems(STORAGE_KEYS.folders, folders);
  return folders[idx];
}

export function deleteFolder(id) {
  const folders = getFolders().filter((f) => f.id !== id);
  setItems(STORAGE_KEYS.folders, folders);
  const docs = getDocuments().map((d) =>
    d.folderId === id ? { ...d, folderId: null } : d
  );
  setItems(STORAGE_KEYS.documents, docs);
}

// Chat History
export function getChatHistory(documentId) {
  const chats = getItems(STORAGE_KEYS.chat);
  if (documentId) {
    return chats.filter((c) => c.documentId === documentId);
  }
  return chats;
}

export function saveChatMessage(message) {
  const chats = getItems(STORAGE_KEYS.chat);
  const newMessage = {
    id: generateId(),
    documentId: message.documentId || null,
    role: message.role,
    content: message.content,
    createdAt: new Date().toISOString(),
  };
  chats.push(newMessage);
  setItems(STORAGE_KEYS.chat, chats);
  return newMessage;
}

export function deleteChatHistory(documentId) {
  const chats = getItems(STORAGE_KEYS.chat).filter((c) => c.documentId !== documentId);
  setItems(STORAGE_KEYS.chat, chats);
}

// Bulk operations
export function exportAllData() {
  return {
    documents: getDocuments(),
    analyses: getAnalyses(),
    prompts: getPrompts(),
    clauses: getClauses(),
    folders: getFolders(),
    chat: getChatHistory(),
    exportedAt: new Date().toISOString(),
  };
}

export function importAllData(data) {
  if (data.documents) setItems(STORAGE_KEYS.documents, data.documents);
  if (data.analyses) setItems(STORAGE_KEYS.analyses, data.analyses);
  if (data.prompts) setItems(STORAGE_KEYS.prompts, data.prompts);
  if (data.clauses) setItems(STORAGE_KEYS.clauses, data.clauses);
  if (data.folders) setItems(STORAGE_KEYS.folders, data.folders);
  if (data.chat) setItems(STORAGE_KEYS.chat, data.chat);
}

export function clearAllData() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

// Search
export function searchDocuments(query) {
  const q = query.toLowerCase();
  const docs = getDocuments();
  return docs.filter(
    (d) =>
      d.title.toLowerCase().includes(q) ||
      d.documentType.toLowerCase().includes(q) ||
      d.originalText.toLowerCase().includes(q) ||
      (d.tags && d.tags.some((t) => t.toLowerCase().includes(q)))
  );
}

export function searchClauses(query) {
  const q = query.toLowerCase();
  const clauses = getClauses();
  return clauses.filter(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      c.content.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      (c.tags && c.tags.some((t) => t.toLowerCase().includes(q)))
  );
}

export function getDeadlines() {
  const docs = getDocuments();
  const deadlinePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{1,2},?\s*\d{4})/gi;
  const deadlines = [];

  docs.forEach((doc) => {
    const matches = doc.originalText.match(deadlinePattern);
    if (matches) {
      matches.forEach((match) => {
        const date = new Date(match);
        if (!isNaN(date.getTime())) {
          deadlines.push({
            id: generateId(),
            date: date.toISOString(),
            context: doc.originalText.substring(
              Math.max(0, doc.originalText.indexOf(match) - 50),
              doc.originalText.indexOf(match) + match.length + 50
            ),
            documentTitle: doc.title,
            documentId: doc.id,
          });
        }
      });
    }
  });

  return deadlines.sort((a, b) => new Date(a.date) - new Date(b.date));
}
