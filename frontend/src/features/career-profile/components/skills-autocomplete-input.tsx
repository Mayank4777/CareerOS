import React, { useEffect, useRef, useState } from "react";
import { Check, Plus, Sparkles, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  getSkillSuggestions,
  normalizeSkillName,
} from "@/features/career-profile/constants/it-skills";

export interface SkillItem {
  id: string;
  name: string;
  category?: string;
  proficiency_level?: string;
  years_of_experience?: number;
}

interface SkillsAutocompleteInputProps {
  existingSkills: SkillItem[];
  onAddSkill: (skillName: string) => Promise<void>;
  onRemoveSkill?: (skillId: string) => Promise<void>;
  isAdding?: boolean;
}

export function SkillsAutocompleteInput({
  existingSkills,
  onAddSkill,
  onRemoveSkill,
  isAdding = false,
}: SkillsAutocompleteInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const suggestions = getSkillSuggestions(inputValue);

  // Keep active index in bounds when suggestions list changes
  useEffect(() => {
    setActiveIndex(0);
  }, [inputValue]);

  // Handle clicking outside to close suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAdd = async (rawName: string) => {
    const normalized = normalizeSkillName(rawName);
    if (!normalized) return;

    // Case-insensitive duplicate check
    const isDuplicate = existingSkills.some(
      (s) => s.name.trim().toLowerCase() === normalized.toLowerCase()
    );

    if (isDuplicate) {
      toast.info(
        "Skill already added",
        `"${normalized}" is already in your career profile skills.`
      );
      setInputValue("");
      setIsOpen(false);
      setActiveIndex(0);
      inputRef.current?.focus();
      return;
    }

    setInputValue("");
    setIsOpen(false);
    setActiveIndex(0);
    inputRef.current?.focus();

    try {
      await onAddSkill(normalized);
    } catch (err: any) {
      toast.error("Failed to add skill", err.message || "Could not add skill.");
    } finally {
      // Ensure input remains focused after API call completes
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      if (suggestions.length > 0) {
        setActiveIndex((prev) => (prev + 1) % suggestions.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      if (suggestions.length > 0) {
        setActiveIndex(
          (prev) => (prev - 1 + suggestions.length) % suggestions.length
        );
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (isOpen && suggestions.length > 0 && activeIndex >= 0 && activeIndex < suggestions.length) {
        void handleAdd(suggestions[activeIndex]);
      } else if (inputValue.trim()) {
        void handleAdd(inputValue);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (val.trim()) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleInputFocus = () => {
    if (inputValue.trim()) {
      setIsOpen(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Autocomplete Input Bar */}
      <div className="relative w-full">
        <div className="relative flex items-center">
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder="Type a skill (e.g., p for Python, py for PyTorch, or any custom skill)..."
            className="pr-12 h-11 text-sm bg-background border-border/80 focus:border-brand-500 rounded-xl shadow-sm transition-all"
            disabled={isAdding}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={isOpen}
          />
          <Button
            type="button"
            size="sm"
            onClick={() => {
              if (inputValue.trim()) {
                void handleAdd(inputValue);
              }
            }}
            disabled={!inputValue.trim() || isAdding}
            className="absolute right-1.5 h-8 px-3 text-xs font-semibold rounded-lg"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
        </div>

        {/* Autocomplete Suggestions Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-[100] left-0 right-0 mt-2 max-h-96 overflow-y-auto rounded-xl border border-border/90 bg-popover/95 p-2 shadow-2xl backdrop-blur-xl transition-all animate-in fade-in-50 zoom-in-95 ring-1 ring-black/5"
          >
            <div className="px-2.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border/50 mb-1.5">
              <Sparkles className="h-3.5 w-3.5 text-brand-400" />
              IT Skills Suggestions ({suggestions.length})
            </div>
            {suggestions.map((skill, index) => {
              const isSelected = index === activeIndex;
              const isAlreadyAdded = existingSkills.some(
                (s) => s.name.trim().toLowerCase() === skill.toLowerCase()
              );

              return (
                <div
                  key={skill}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevents input blur before click fires
                    void handleAdd(skill);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex items-center justify-between px-3.5 py-2.5 text-sm rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? "bg-brand-500/20 text-brand-300 font-bold shadow-xs"
                      : "text-foreground hover:bg-accent/80 font-medium"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className={`h-2 w-2 rounded-full ${isSelected ? "bg-brand-400" : "bg-brand-400/50"}`} />
                    {skill}
                  </span>

                  {isAlreadyAdded && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <Check className="h-3 w-3" />
                      Added
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Added Skills Badge Flow */}
      {existingSkills.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your Profile Skills ({existingSkills.length})
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {existingSkills.map((skill) => (
              <Badge
                key={skill.id}
                tone="info"
                className="group relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-brand-500/10 text-brand-300 border border-brand-500/20 hover:border-brand-500/40 transition-all shadow-sm"
              >
                <span>{skill.name}</span>
                {onRemoveSkill && (
                  <button
                    type="button"
                    onClick={() => void onRemoveSkill(skill.id)}
                    className="ml-0.5 rounded-md p-0.5 text-brand-400/70 hover:bg-brand-500/20 hover:text-brand-200 transition-colors focus:outline-none"
                    title={`Remove ${skill.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
