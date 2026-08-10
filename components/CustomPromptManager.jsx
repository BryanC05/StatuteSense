'use client';

import { useState, useEffect } from 'react';
import { getPrompts, savePrompt, deletePrompt } from '../lib/storage';

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
    if (!confirm('Delete this prompt?')) return;
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
    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f0e6d2' }}>Custom Prompts</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '0.5rem 1rem',
            background: 'linear-gradient(135deg, rgba(255,179,127,0.2), rgba(255,140,84,0.2))',
            border: '1px solid rgba(255,179,127,0.4)',
            color: '#ffb37f',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          {showForm ? 'Cancel' : '+ New Prompt'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#ccc' }}>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#ccc' }}>Category</label>
            <span className="select-frame">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="select-input"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </span>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#ccc' }}>Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#ccc' }}>Prompt Template</label>
            <textarea
              value={formData.prompt}
              onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              required
              rows={4}
              style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff', fontFamily: 'monospace', fontSize: '0.85rem' }}
              placeholder="Analyze the following {document_type} and identify..."
            />
          </div>
          <button type="submit" style={{ padding: '0.5rem 1.5rem', background: 'linear-gradient(135deg, #ffb37f, #ff8c54)', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontWeight: '600' }}>
            Save Prompt
          </button>
        </form>
      )}

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilterCategory('all')}
          style={{
            padding: '0.25rem 0.75rem',
            background: filterCategory === 'all' ? 'rgba(255,179,127,0.3)' : 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,179,127,0.3)',
            color: filterCategory === 'all' ? '#ffb37f' : '#aaa',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '0.75rem',
          }}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            style={{
              padding: '0.25rem 0.75rem',
              background: filterCategory === cat ? 'rgba(255,179,127,0.3)' : 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,179,127,0.3)',
              color: filterCategory === cat ? '#ffb37f' : '#aaa',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '0.75rem',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>Loading prompts...</p>
      ) : filteredPrompts.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>No prompts yet. Create your first custom prompt!</p>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {filteredPrompts.map((p) => (
            <div key={p.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#f0e6d2', marginBottom: '0.25rem' }}>{p.name}</div>
                  {p.description && <div style={{ fontSize: '0.8rem', color: '#999', marginBottom: '0.5rem' }}>{p.description}</div>}
                  <div style={{ fontSize: '0.75rem', color: '#ffb37f', background: 'rgba(255,179,127,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'inline-block' }}>
                    {p.category}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => onSelectPrompt && onSelectPrompt(p.prompt)}
                    title="Use this prompt"
                    style={{ padding: '0.25rem 0.5rem', background: 'rgba(255,179,127,0.2)', border: '1px solid rgba(255,179,127,0.3)', borderRadius: '4px', color: '#ffb37f', cursor: 'pointer', fontSize: '0.75rem' }}
                  >
                    Use
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    title="Delete"
                    style={{ padding: '0.25rem 0.5rem', background: 'rgba(255,100,100,0.2)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: '4px', color: '#ff6464', cursor: 'pointer', fontSize: '0.75rem' }}
                  >
                    Delete
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
