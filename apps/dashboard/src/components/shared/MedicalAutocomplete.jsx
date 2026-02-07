import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  CONDITIONS,
  ALLERGIES,
  DIETARY_RESTRICTIONS,
  MEDICAL_EVENTS,
  filterMedicalTerms,
} from '@/lib/medical-data';

const LISTS = {
  condition: CONDITIONS,
  allergy: ALLERGIES,
  dietary: DIETARY_RESTRICTIONS,
  medical_event: MEDICAL_EVENTS,
};

export default function MedicalAutocomplete({
  type = 'condition',
  value = '',
  onChange,
  placeholder = '',
  id,
  className = '',
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  const list = LISTS[type] || CONDITIONS;

  // Sync external value changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (query.length >= 1) {
      // For comma-separated fields (allergies), only search on the last term
      const lastTerm = query.includes(',')
        ? query.split(',').pop().trim()
        : query;
      setSuggestions(filterMedicalTerms(list, lastTerm));
    } else {
      setSuggestions([]);
    }
  }, [query, list]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    let newValue;
    // For comma-separated fields, append to existing values
    if (query.includes(',')) {
      const parts = query.split(',').map(p => p.trim()).filter(Boolean);
      parts.pop(); // Remove the partial term being searched
      parts.push(item);
      newValue = parts.join(', ') + ', ';
    } else {
      newValue = item;
    }
    setQuery(newValue);
    onChange(newValue);
    setShowSuggestions(false);
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    if (val.length >= 1) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <Input
          id={id}
          value={query}
          onChange={handleChange}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          placeholder={placeholder}
          className={className}
        />
        {query.length >= 1 && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full text-left px-4 py-2.5 hover:bg-blue-50 border-b border-slate-100 last:border-b-0 transition-colors text-sm text-slate-800"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
