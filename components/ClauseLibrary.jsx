"use client";

import { useState, useEffect } from "react";
import { getClauses, saveClause, updateClause, deleteClause } from "../lib/storage";
import CustomSelect from "./CustomSelect";

const CATEGORIES = [
  "Termination",
  "Indemnification",
  "Confidentiality",
  "Force Majeure",
  "Payment",
  "Liability",
  "Intellectual Property",
  "Governing Law",
  "Dispute Resolution",
  "General",
];

export default function ClauseLibrary({ onInsert }) {
  const [clauses, setClauses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "General",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    setClauses(getClauses());
  }, []);

  const refreshClauses = () => setClauses(getClauses());

  const handleSave = () => {
    if (!formData.title.trim() || !formData.content.trim()) return;

    if (editingId) {
      updateClause(editingId, formData);
    } else {
      saveClause(formData);
    }

    setFormData({ title: "", content: "", category: "General", tags: [] });
    setEditingId(null);
    setShowForm(false);
    refreshClauses();
  };

  const handleEdit = (clause) => {
    setFormData({
      title: clause.title,
      content: clause.content,
      category: clause.category,
      tags: clause.tags || [],
    });
    setEditingId(clause.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this clause?")) return;
    deleteClause(id);
    refreshClauses();
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
    setTagInput("");
  };

  const removeTag = (idx) => {
    setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== idx) });
  };

  const filteredClauses = clauses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || c.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="record-header">
        <h3 className="record-title" style={{ fontFamily: "var(--font-header)" }}>PRECEDENT & CLAUSE ARCHIVE</h3>
        <button
          className="record-primary-btn"
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ title: "", content: "", category: "General", tags: [] });
          }}
        >
          {showForm ? "CANCEL" : "+ FILE PRECEDENT"}
        </button>
      </div>

      {showForm && (
        <div className="panel" style={{ marginBottom: "20px", background: "var(--panel-2)" }}>
          <div className="field-group">
            <label className="field-label">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Termination for Convenience"
              className="record-search"
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
            <label className="field-label">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Paste the clause text here..."
              rows={5}
              className="editor-textarea"
              style={{ minHeight: "120px" }}
            />
          </div>
          <div className="field-group">
            <label className="field-label">Tags</label>
            <div className="tags-input">
              {formData.tags.map((tag, idx) => (
                <span key={idx} className="tag">
                  {tag}
                  <button onClick={() => removeTag(idx)}>×</button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add tag..."
              />
            </div>
          </div>
          <button className="record-primary-btn" onClick={handleSave}>
            {editingId ? "Update Clause" : "Save Clause"}
          </button>
        </div>
      )}

      <div className="record-controls">
        <input
          type="text"
          className="record-search"
          placeholder="Search clauses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <CustomSelect
          options={[{ value: "all", label: "All Categories" }, ...CATEGORIES.map(cat => ({ value: cat, label: cat }))]}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        />
      </div>

      <div className="clause-library">
        {filteredClauses.length === 0 ? (
          <p className="record-muted" style={{ padding: "20px", textAlign: "center" }}>
            No clauses in library. Add your first clause above.
          </p>
        ) : (
          filteredClauses.map((clause) => (
            <div key={clause.id} className="clause-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div className="clause-card-title">{clause.title}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--gold)", marginBottom: "8px" }}>
                    {clause.category}
                  </div>
                  <div className="clause-card-content">{clause.content}</div>
                  {clause.tags && clause.tags.length > 0 && (
                    <div className="clause-card-tags">
                      {clause.tags.map((tag, idx) => (
                        <span key={idx} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="record-actions">
                  {onInsert && (
                    <button className="record-primary-btn" onClick={() => onInsert(clause.content)}>
                      Insert
                    </button>
                  )}
                  <button className="record-clear-btn" onClick={() => handleEdit(clause)}>
                    Edit
                  </button>
                  <button className="record-delete-btn" onClick={() => handleDelete(clause.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
