"use client";

interface SystemPromptPanelProps {
  value: string;
  onChange: (value: string) => void;
  defaultPrompt: string;
  isOpen: boolean;
  onToggle: () => void;
}

export default function SystemPromptPanel({
  value,
  onChange,
  defaultPrompt,
  isOpen,
  onToggle,
}: SystemPromptPanelProps) {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-white/70 shadow-sm backdrop-blur-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-[var(--color-blush)]/30"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <span aria-hidden className="text-lg">
            ✦
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-glossy-black)]">
            System Prompt
          </span>
        </span>
        <span className="text-xs text-[var(--color-muted)]">
          {isOpen ? "Hide" : "Customize"}
        </span>
      </button>

      {isOpen && (
        <div className="space-y-3 border-t border-[var(--color-border)] px-4 py-4">
          <p className="text-xs leading-relaxed text-[var(--color-muted)]">
            Optional. Leave blank to use the default mental-coach persona.
          </p>
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={defaultPrompt}
            rows={3}
            className="input-glossy w-full resize-none text-sm"
          />
          {value.trim() && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs font-semibold text-[var(--color-hot-pink)] transition hover:text-[var(--color-electric-blue)]"
            >
              Reset to default
            </button>
          )}
        </div>
      )}
    </section>
  );
}
