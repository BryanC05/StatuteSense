"use client";

import { useState, useRef, useEffect } from "react";

export default function CustomSelect({
  options = [],
  value,
  onChange,
  placeholder = "Select option",
  className = "",
  style = {},
  compact = false,
  disabled = false,
  id,
  name,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef(null);

  // Normalize options to array of { value, label }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "object" && opt !== null) {
      return {
        value: opt.value ?? opt.id,
        label: opt.label ?? opt.name ?? String(opt.value ?? opt.id),
      };
    }
    return { value: opt, label: String(opt) };
  });

  const selectedOption =
    normalizedOptions.find((opt) => String(opt.value) === String(value)) || null;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue) => {
    if (disabled) return;
    setIsOpen(false);
    if (onChange) {
      const eventObj = {
        target: { value: optionValue, name: name || id },
      };
      onChange(eventObj);
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else if (focusedIndex >= 0 && focusedIndex < normalizedOptions.length) {
        handleSelect(normalizedOptions[focusedIndex].value);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setFocusedIndex(0);
      } else {
        setFocusedIndex((prev) =>
          prev < normalizedOptions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setFocusedIndex(normalizedOptions.length - 1);
      } else {
        setFocusedIndex((prev) =>
          prev > 0 ? prev - 1 : normalizedOptions.length - 1
        );
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`custom-select-container ${compact ? "compact" : ""} ${
        isOpen ? "open" : ""
      } ${disabled ? "disabled" : ""} ${className}`}
      style={style}
    >
      <button
        type="button"
        id={id}
        className="custom-select-trigger"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <span className="custom-select-label">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="custom-select-arrow">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="custom-select-dropdown" role="listbox">
          {normalizedOptions.map((opt, index) => {
            const isSelected = String(opt.value) === String(value);
            const isFocused = index === focusedIndex;
            return (
              <div
                key={String(opt.value) + index}
                role="option"
                aria-selected={isSelected}
                className={`custom-select-option ${isSelected ? "selected" : ""} ${
                  isFocused ? "focused" : ""
                }`}
                onClick={() => handleSelect(opt.value)}
                onMouseEnter={() => setFocusedIndex(index)}
              >
                <span className="option-label">{opt.label}</span>
                {isSelected && (
                  <span className="option-checkmark">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
