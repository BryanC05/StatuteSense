'use client';

import { useState, useEffect, useMemo } from 'react';
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

  const filteredPrompts = useMemo(() => prompts.filter((p) => {
    return filterCategory === 'all' || p.category === filterCategory;
  }), [prompts, filterCategory]);

  return (
    <div>
      <div className="record-header">
        <h3 className="record-title">
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
        <form onSubmit={handleSubmit} className="panel">
          <div className="field-group">
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
          <div className="field-group">
            <label className="field-label">Category</label>
            <CustomSelect
              options={CATEGORIES}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>
          <div className="field-group">
            <label className="field-label">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="record-search"
              placeholder="Short strategy summary..."
            />
          </div>
          <div className="field-group">
            <label className="field-label">Prompt Template Directive</label>
            <textarea
              value={formData.prompt}
              onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              required
              rows={4}
              className="editor-textarea"
              placeholder="Interrogate the following clause and extract all obligations..."
            />
          </div>
          <button type="submit" className="run-btn">
            SAVE DIRECTIVE
          </button>
        </form>
      )}

      <div className="record-controls">
        <button
          onClick={() => setFilterCategory('all')}
          className={`tab-btn ${filterCategory === 'all' ? 'active' : ''}`}
        >
          ALL
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`tab-btn ${filterCategory === cat ? 'active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="record-muted">Loading directives archive...</p>
      ) : filteredPrompts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">
            NO CUSTOM DIRECTIVES REGISTERED
          </div>
          <p className="empty-state-desc">Create custom directives to streamline courtroom cross-examination prompts.</p>
        </div>
      ) : (
        <div className="record-list">
          {filteredPrompts.map((p) => (
            <div key={p.id} className="record-item">
              <div className="record-item-main">
                <div className="record-item-title">{p.name}</div>
                {p.description && <div className="record-meta">{p.description}</div>}
                <span className="court-speaker-badge badge-defense">
                  {p.category}
                </span>
              </div>
              <div className="record-actions">
                <button
                  onClick={() => onSelectPrompt && onSelectPrompt(p.prompt)}
                  className="record-primary-btn"
                >
                  DEPLOY
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="record-delete-btn"
                >
                  DELETE
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
