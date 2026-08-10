'use client';

import { useState, useEffect } from 'react';
import { getPrompts, savePrompt, deletePrompt } from '../lib/storage';
import CustomSelect from './CustomSelect';

const CATEGORIES = ['Summarize', 'Risk Analysis', 'Compliance', 'Extraction', 'Comparison', 'Custom'];

export default function CustomPromptManager({ onSelectPrompt }) {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prompt: '',
    category: 'Custom',
  });

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = () => {
    setLoading(true);
    const allPrompts = getPrompts();
    setPrompts(allPrompts);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      savePrompt(formData);
      setFormData({ name: '', description: '', prompt: '', category: 'Custom' });
      setShowForm(false);
      fetchPrompts();
    } catch (error) {
      console.error('Failed to create prompt:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this court directive template?')) return;
    try {
      deletePrompt(id);
      fetchPrompts();
    } catch (error) {
      console.error('Failed to delete prompt:', error);
    }
  };

  const filteredPrompts = prompts.filter((p) => {
    return filterCategory === 'all' || p.category === filterCategory;
  });

  return (
    <div style={{ padding: '0.5rem 0' }}>
      <div className="record-header">
        <h3 className="record-title" style={{ fontFamily: 'var(--font-header)', letterSpacing: '0.5px' }}>
          DEFENSE DIRECTIVE TEMPLATES
        </h3>
        <button
          className="record-primary-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'CANCEL' : '+ NEW DIRECTIVE'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem', padding: '1.25rem', background: 'linear-gradient(180deg, #0e1526, #070b15)', border: '3px solid var(--gold)', boxShadow: '4px 4px 0 #000000' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="field-label">Directive Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="record-search"
              placeholder="e.g. Cross-Examine Indemnity Clause"
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label className="field-label">Category</label>
            <CustomSelect
              options={CATEGORIES}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label className="field-label">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="record-search"
              placeholder="Short strategy summary..."
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label className="field-label">Prompt Template Directive</label>
            <textarea
              value={formData.prompt}
              onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              required
              rows={4}
              className="editor-textarea"
              style={{ minHeight: '100px' }}
              placeholder="Interrogate the following clause and extract all obligations..."
            />
          </div>
          <button type="submit" className="run-btn" style={{ minHeight: '44px', fontSize: '1.1rem' }}>
            SAVE DIRECTIVE
          </button>
        </form>
      )}

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilterCategory('all')}
          className={`tab-btn ${filterCategory === 'all' ? 'active' : ''}`}
          style={{ minHeight: '34px', fontSize: '0.95rem', padding: '4px 12px' }}
        >
          ALL
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`tab-btn ${filterCategory === cat ? 'active' : ''}`}
            style={{ minHeight: '34px', fontSize: '0.95rem', padding: '4px 12px' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem' }}>Loading directives archive...</p>
      ) : filteredPrompts.length === 0 ? (
        <div className="empty-state" style={{ minHeight: "180px", border: "2px dashed var(--gold)" }}>
          <div className="empty-state-title" style={{ fontFamily: "var(--font-action)", fontSize: "1.2rem", letterSpacing: "1px" }}>
            NO CUSTOM DIRECTIVES REGISTERED
          </div>
          <p className="empty-state-desc">Create custom directives to streamline courtroom cross-examination prompts.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {filteredPrompts.map((p) => (
            <div key={p.id} style={{ padding: '16px', background: 'linear-gradient(180deg, #0e1526, #070b15)', border: '2px solid var(--gold)', boxShadow: '3px 3px 0 #000000' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-action)', fontSize: '1.2rem', color: 'var(--paper)', letterSpacing: '0.5px' }}>{p.name}</div>
                  {p.description && <div style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: '4px 0' }}>{p.description}</div>}
                  <span className="court-speaker-badge badge-defense" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                    {p.category}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => onSelectPrompt && onSelectPrompt(p.prompt)}
                    className="record-primary-btn"
                    style={{ fontSize: '0.85rem', padding: '4px 12px' }}
                  >
                    DEPLOY
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="record-delete-btn"
                    style={{ fontSize: '0.85rem', padding: '4px 12px' }}
                  >
                    DELETE
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
