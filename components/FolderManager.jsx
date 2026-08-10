"use client";

import { useState, useEffect } from "react";
import { getFolders, saveFolder, updateFolder, deleteFolder } from "../lib/storage";

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
    <div style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <span style={{ color: "var(--gold)", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase" }}>
          Folders
        </span>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: "", color: COLORS[0] });
          }}
          style={{
            padding: "4px 10px",
            background: "var(--panel-2)",
            border: "1px solid var(--line)",
            color: "var(--text)",
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          {showForm ? "Cancel" : "+ New"}
        </button>
      </div>

      {showForm && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Folder name"
            style={{ flex: 1, padding: "6px 10px", background: "var(--panel)", border: "1px solid var(--line)", color: "var(--text)" }}
          />
          <select
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            style={{ padding: "6px", background: "var(--panel)", border: "1px solid var(--line)", color: "var(--text)" }}
          >
            {COLORS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button className="record-primary-btn" onClick={handleSave} style={{ padding: "6px 12px" }}>
            {editingId ? "Update" : "Add"}
          </button>
        </div>
      )}

      <div className="folder-list">
        <div
          className={`folder-chip ${selectedFolderId === null ? "active" : ""}`}
          onClick={() => onSelectFolder?.(null)}
        >
          <span>All Documents</span>
        </div>
        {folders.map((folder) => (
          <div
            key={folder.id}
            className={`folder-chip ${selectedFolderId === folder.id ? "active" : ""}`}
            onClick={() => onSelectFolder?.(folder.id)}
          >
            <span className="folder-chip-color" style={{ background: folder.color }} />
            <span>{folder.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(folder);
              }}
              style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}
            >
              ✎
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(folder.id);
              }}
              style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
