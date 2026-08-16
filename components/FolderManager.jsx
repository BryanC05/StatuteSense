"use client";

import { useState, useEffect } from "react";
import { getFolders, saveFolder, updateFolder, deleteFolder } from "../lib/storage";
import CustomSelect from "./CustomSelect";

const COLORS = ["#f4c04f", "#c72f2f", "#2b5f9f", "#22c55e", "#74d8f5", "#f97316", "#a855f7"];

export default function FolderManager({ selectedFolderId, onSelectFolder }) {
  const [folders, setFolders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", color: COLORS[0] });

  useEffect(() => {
    setFolders(getFolders());
  }, []);

  const refreshFolders = () => setFolders(getFolders());

  const handleSave = () => {
    if (!formData.name.trim()) return;

    if (editingId) {
      updateFolder(editingId, formData);
    } else {
      saveFolder(formData);
    }

    setFormData({ name: "", color: COLORS[0] });
    setEditingId(null);
    setShowForm(false);
    refreshFolders();
  };

  const handleEdit = (folder) => {
    setFormData({ name: folder.name, color: folder.color });
    setEditingId(folder.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this folder? Documents will be moved to root.")) return;
    deleteFolder(id);
    if (selectedFolderId === id) onSelectFolder?.(null);
    refreshFolders();
  };

  return (
    <div>
      <div className="record-header">
        <span className="field-label">
          CASE DOSSIER BINDERS
        </span>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: "", color: COLORS[0] });
          }}
          className="record-clear-btn"
        >
          {showForm ? "CANCEL" : "+ NEW BINDER"}
        </button>
      </div>

      {showForm && (
        <div className="record-controls">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Folder name"
            className="record-search"
          />
          <CustomSelect
            compact
            options={COLORS.map((c) => ({ value: c, label: c }))}
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          />
          <button className="record-primary-btn" onClick={handleSave}>
            {editingId ? "Update" : "Add"}
          </button>
        </div>
      )}

      <div className="folder-list">
        <div
          className={`folder-chip ${selectedFolderId === null ? "active" : ""}`}
          onClick={() => onSelectFolder?.(null)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectFolder?.(null); } }}
        >
          <span>All Documents</span>
        </div>
        {folders.map((folder) => (
          <div
            key={folder.id}
            className={`folder-chip ${selectedFolderId === folder.id ? "active" : ""}`}
            onClick={() => onSelectFolder?.(folder.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectFolder?.(folder.id); } }}
          >
            <span className="folder-chip-color" style={{ background: folder.color }} />
            <span>{folder.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(folder);
              }}
            >
              ✎
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(folder.id);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
