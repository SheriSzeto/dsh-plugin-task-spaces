/**
 * Task-spaces stylesheet.
 *
 * Injected once at plugin materialization (tagged with data-plugin so the
 * client module system owns it). Everything is expressed with the DSH theme
 * tokens, so the surface follows light/dark and theme swaps without local
 * colour literals — except the space icon palette, which is content.
 */

const TASK_SPACES_CSS = `
[data-dsh-task-spaces] {
  --ts-radius-lg: 16px;
  --ts-radius-md: var(--dsw-radius-md, 10px);
  --ts-radius-sm: var(--dsw-radius-sm, 8px);
  --ts-hover: color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent);
  --ts-hover-strong: color-mix(in srgb, var(--dsw-alias-label-primary) 10%, transparent);
  --ts-soft: color-mix(in srgb, var(--dsw-alias-label-primary) 4%, transparent);
  --ts-border: var(--dsw-alias-border-l1);
  --ts-border-strong: var(--dsw-alias-border-l2, var(--dsw-alias-border-l1));
  --ts-focus: var(--dsw-alias-brand-primary);
  --ts-accent: var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary));
  --ts-accent-soft: color-mix(in srgb, var(--ts-accent) 14%, transparent);
  --ts-accent-border: color-mix(in srgb, var(--ts-accent) 62%, transparent);
  height: 100%;
  min-height: 0;
  overflow: auto;
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-base);
  font-size: 14px;
  line-height: 1.55;
}

[data-dsh-task-spaces] * { box-sizing: border-box; }

/* ------------------------------------------------------------ page shell */

.ts-page { min-height: 100%; padding: 40px 48px 64px; }
.ts-page-inner { max-width: 1080px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }

.ts-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; }
.ts-title { margin: 0; font-size: 24px; line-height: 32px; font-weight: 650; letter-spacing: -0.01em; }
.ts-sub { margin: 8px 0 0; max-width: 640px; color: var(--dsw-alias-label-secondary); font-size: 13.5px; }

.ts-toolbar { display: flex; align-items: center; gap: 12px; }
.ts-count { color: var(--dsw-alias-label-secondary); font-size: 12.5px; }

.ts-seg {
  display: inline-flex; align-items: center; gap: 2px; padding: 3px;
  border-radius: 999px; background: var(--ts-soft);
  border: 0.5px solid var(--ts-border);
}
.ts-seg-item {
  appearance: none; border: 0; background: transparent; color: var(--dsw-alias-label-secondary);
  height: 28px; padding: 0 12px; border-radius: 999px; cursor: pointer;
  font-size: 12.5px; font-family: inherit; transition: background 120ms ease, color 120ms ease;
}
.ts-seg-item:hover { color: var(--dsw-alias-label-primary); }
.ts-seg-item[data-active="true"] {
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  box-shadow: 0 1px 2px color-mix(in srgb, #000 18%, transparent);
}

/* ----------------------------------------------------------------- cards */

.ts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }

.ts-card {
  position: relative; display: flex; flex-direction: column; gap: 14px; height: 100%;
  padding: 18px; border-radius: var(--ts-radius-lg);
  background: var(--dsw-alias-bg-layer-1);
  border: 0.5px solid var(--ts-border);
  transition: border-color 140ms ease, transform 140ms ease, box-shadow 140ms ease;
}
.ts-card:hover {
  border-color: var(--ts-border-strong);
  transform: translateY(-1px);
  box-shadow: 0 8px 24px color-mix(in srgb, #000 14%, transparent);
}
.ts-card[data-flash="true"] { animation: ts-card-flash 1.6s ease-out 1; }
@keyframes ts-card-flash {
  0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--dsw-alias-brand-primary) 55%, transparent); }
  45% { box-shadow: 0 0 0 4px color-mix(in srgb, var(--dsw-alias-brand-primary) 26%, transparent); }
  100% { box-shadow: 0 0 0 0 transparent; }
}

.ts-card-head { display: flex; align-items: flex-start; gap: 12px; }
.ts-card-main { min-width: 0; flex: 1; }
.ts-card-title {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  font-size: 15px; font-weight: 600; line-height: 22px;
}
.ts-card-sub { margin-top: 2px; color: var(--dsw-alias-label-secondary); font-size: 12.5px; }

.ts-icon-badge {
  flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center;
  width: 40px; height: 40px; border-radius: 12px; font-size: 20px; line-height: 1;
  color: #fff; box-shadow: inset 0 0 0 0.5px color-mix(in srgb, #fff 22%, transparent);
}
.ts-icon-badge[data-size="sm"] { width: 26px; height: 26px; border-radius: 8px; font-size: 14px; }
.ts-icon-badge[data-size="lg"] { width: 48px; height: 48px; border-radius: 14px; font-size: 24px; }

.ts-id-badge {
  display: inline-flex; align-items: center; gap: 4px; height: 20px; padding: 0 7px;
  border-radius: 6px; font-size: 11px; font-weight: 600; letter-spacing: 0.04em;
  color: var(--dsw-alias-label-secondary);
  background: var(--ts-soft); border: 0.5px solid var(--ts-border);
}

.ts-card-menu { position: relative; flex: 0 0 auto; }
.ts-icon-btn {
  appearance: none; display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; padding: 0; border: 0; border-radius: 8px;
  background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer;
  transition: background 120ms ease, color 120ms ease;
}
.ts-icon-btn:hover { background: var(--ts-hover); color: var(--dsw-alias-label-primary); }
.ts-icon-btn[data-danger="true"]:hover { color: var(--dsw-alias-state-error-primary); }

.ts-menu {
  position: absolute; right: 0; top: 32px; z-index: 20; min-width: 168px; padding: 4px;
  border-radius: 10px; background: var(--dsw-alias-bg-layer-1);
  border: 0.5px solid var(--ts-border-strong);
  box-shadow: 0 12px 30px color-mix(in srgb, #000 28%, transparent);
}
.ts-menu-item {
  appearance: none; display: flex; align-items: center; gap: 8px; width: 100%;
  height: 32px; padding: 0 10px; border: 0; border-radius: 7px; background: transparent;
  color: var(--dsw-alias-label-primary); font-size: 13px; font-family: inherit;
  cursor: pointer; text-align: left;
}
.ts-menu-item:hover { background: var(--ts-hover); }
.ts-menu-item[data-danger="true"] { color: var(--dsw-alias-state-error-primary); }

.ts-card-section { display: flex; flex-direction: column; gap: 7px; }
.ts-section-label {
  font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--dsw-alias-label-secondary); opacity: 0.85;
}
.ts-chip-row { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
.ts-chip {
  display: inline-flex; align-items: center; gap: 5px; height: 22px; padding: 0 8px;
  border-radius: 6px; font-size: 12px; color: var(--dsw-alias-label-secondary);
  background: var(--ts-soft); border: 0.5px solid var(--ts-border);
}
.ts-chip[data-tone="accent"] {
  color: var(--dsw-alias-label-primary);
  background: var(--ts-accent-soft);
  border-color: var(--ts-accent-border);
}
.ts-dot { width: 7px; height: 7px; border-radius: 50%; flex: 0 0 auto; }

.ts-card-foot {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding-top: 12px; border-top: 0.5px dashed var(--ts-border);
  color: var(--dsw-alias-label-secondary); font-size: 12px;
}
.ts-card-foot-left { display: inline-flex; align-items: center; gap: 6px; }

/* ------------------------------------------------------------- empty state */

.ts-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px;
  padding: 56px 24px; text-align: center; border-radius: var(--ts-radius-lg);
  border: 1px dashed var(--ts-border-strong); background: var(--ts-soft);
}
.ts-empty-badge {
  display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px;
  border-radius: 18px; color: var(--dsw-alias-brand-primary);
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, transparent);
}
.ts-empty-title { font-size: 16px; font-weight: 600; }
.ts-empty-desc { max-width: 460px; color: var(--dsw-alias-label-secondary); font-size: 13px; }

/* ------------------------------------------------------------- primitives */

.ts-btn {
  appearance: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  height: 34px; padding: 0 14px; border-radius: var(--ts-radius-sm);
  border: 0.5px solid transparent; background: transparent;
  color: var(--dsw-alias-label-primary); font-family: inherit; font-size: 13px; font-weight: 500;
  cursor: pointer; transition: background 120ms ease, border-color 120ms ease, opacity 120ms ease;
  white-space: nowrap;
}
.ts-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.ts-btn[data-kind="primary"] {
  background: var(--dsw-alias-button-primary-fill, var(--dsw-alias-brand-primary));
  color: var(--dsw-alias-label-primary-foreground, #fff);
}
.ts-btn[data-kind="primary"]:hover:not(:disabled) {
  background: var(--dsw-alias-button-primary-hover, var(--dsw-alias-brand-primary));
}
.ts-btn[data-kind="outline"] { border-color: var(--ts-border-strong); }
.ts-btn[data-kind="outline"]:hover:not(:disabled) { background: var(--ts-hover); }
.ts-btn[data-kind="ghost"] { color: var(--dsw-alias-label-secondary); }
.ts-btn[data-kind="ghost"]:hover:not(:disabled) { background: var(--ts-hover); color: var(--dsw-alias-label-primary); }
.ts-btn[data-kind="danger"] { color: var(--dsw-alias-state-error-primary); border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 40%, transparent); }
.ts-btn[data-kind="danger"]:hover:not(:disabled) { background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent); }

.ts-input {
  width: 100%; height: 36px; padding: 0 11px; border-radius: var(--ts-radius-sm);
  border: 0.5px solid var(--ts-border-strong); background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary); font-family: inherit; font-size: 13.5px;
  transition: border-color 120ms ease, box-shadow 120ms ease;
}
.ts-input::placeholder { color: var(--dsw-alias-label-secondary); opacity: 0.75; }
.ts-input:focus {
  outline: none; border-color: var(--ts-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ts-accent) 20%, transparent);
}
.ts-input[data-invalid="true"] { border-color: var(--dsw-alias-state-error-primary); }

.ts-field { display: flex; flex-direction: column; gap: 7px; }
.ts-field-label { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 13px; font-weight: 550; }
.ts-field-hint { color: var(--dsw-alias-label-secondary); font-size: 12px; }
.ts-field-error { color: var(--dsw-alias-state-error-primary); font-size: 12px; }
.ts-counter { color: var(--dsw-alias-label-secondary); font-size: 12px; font-variant-numeric: tabular-nums; }

.ts-switch {
  position: relative; flex: 0 0 auto; width: 36px; height: 20px; padding: 2px;
  border: 0; border-radius: 999px; background: var(--ts-border-strong); cursor: pointer;
  transition: background 140ms ease;
}
.ts-switch[aria-checked="true"] { background: var(--dsw-alias-brand-primary); }
.ts-switch:disabled { opacity: 0.5; cursor: default; }
.ts-switch-thumb {
  display: block; width: 16px; height: 16px; border-radius: 50%;
  background: var(--dsw-alias-label-primary-foreground, #fff);
  transition: transform 140ms ease;
}
.ts-switch[aria-checked="true"] .ts-switch-thumb { transform: translateX(16px); }

.ts-radio {
  appearance: none; flex: 0 0 auto; width: 16px; height: 16px; margin: 0;
  border-radius: 50%; border: 1.5px solid var(--ts-border-strong); background: transparent;
  cursor: pointer; position: relative;
}
.ts-radio:checked { border-color: var(--ts-accent); }
.ts-radio:checked::after {
  content: ""; position: absolute; inset: 2.5px; border-radius: 50%;
  background: var(--ts-accent);
}

/* --------------------------------------------------------- overlay + shell */

.ts-overlay { position: fixed; inset: 0; z-index: 1200; display: flex; align-items: center; justify-content: center; padding: 32px; }
.ts-mask {
  position: absolute; inset: 0;
  background: color-mix(in srgb, #000 52%, transparent);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  animation: ts-fade-in 160ms ease-out 1;
}
.ts-dialog {
  position: relative; display: flex; width: min(1060px, 94vw); height: min(740px, 90vh);
  border-radius: 20px; overflow: hidden;
  background: var(--dsw-alias-bg-layer-1);
  border: 0.5px solid var(--ts-border-strong);
  box-shadow: 0 32px 80px color-mix(in srgb, #000 42%, transparent);
  animation: ts-pop-in 180ms cubic-bezier(0.2, 0.9, 0.3, 1) 1;
}
@keyframes ts-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes ts-pop-in { from { opacity: 0; transform: translateY(10px) scale(0.985); } to { opacity: 1; transform: none; } }

.ts-rail {
  flex: 0 0 268px; display: flex; flex-direction: column;
  padding: 26px 20px 20px; gap: 22px;
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 3.5%, transparent);
  border-right: 0.5px solid var(--ts-border);
  overflow: auto;
}
.ts-rail-eyebrow { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dsw-alias-label-secondary); }
.ts-rail-title { margin: 4px 0 0; font-size: 19px; font-weight: 650; letter-spacing: -0.01em; }
.ts-rail-progress { margin-top: 6px; color: var(--dsw-alias-label-secondary); font-size: 12.5px; }
.ts-steps { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
.ts-step {
  appearance: none; display: flex; align-items: flex-start; gap: 10px; width: 100%;
  padding: 9px 10px; border: 0; border-radius: 10px; background: transparent;
  color: var(--dsw-alias-label-secondary); font-family: inherit; text-align: left;
  cursor: default; transition: background 120ms ease, color 120ms ease;
}
.ts-step[data-status="done"], .ts-step[data-status="current"] { cursor: pointer; color: var(--dsw-alias-label-primary); }
.ts-step:hover[data-status="done"], .ts-step:hover[data-status="current"] { background: var(--ts-hover); }
.ts-step[data-status="current"] { background: var(--ts-hover-strong); }
.ts-step-num {
  flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; margin-top: 1px; border-radius: 50%;
  border: 1px solid var(--ts-border-strong); font-size: 11.5px; font-weight: 600;
  color: var(--dsw-alias-label-secondary);
}
.ts-step[data-status="done"] .ts-step-num {
  border-color: transparent; color: var(--dsw-alias-bg-base);
  background: var(--dsw-alias-state-success-primary, #3fa56e);
}
.ts-step[data-status="current"] .ts-step-num {
  border-color: transparent; color: var(--dsw-alias-bg-base);
  background: var(--ts-accent);
}
.ts-step-text { min-width: 0; display: flex; flex-direction: column; }
.ts-step-label { display: block; font-size: 13px; font-weight: 550; line-height: 22px; }
.ts-step-caption { display: block; font-size: 11.5px; color: var(--dsw-alias-label-secondary); line-height: 1.45; }
.ts-rail-foot {
  margin-top: auto; display: flex; gap: 8px; padding: 12px;
  border-radius: 10px; border: 0.5px dashed var(--ts-border);
  color: var(--dsw-alias-label-secondary); font-size: 11.5px; line-height: 1.5;
}

.ts-content { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.ts-content-head { padding: 26px 32px 14px; }
.ts-content-title { margin: 0; font-size: 18px; font-weight: 650; letter-spacing: -0.01em; }
.ts-content-desc { margin: 5px 0 0; color: var(--dsw-alias-label-secondary); font-size: 13px; }
.ts-content-body { flex: 1; min-height: 0; overflow: auto; padding: 6px 32px 24px; }
.ts-footer {
  display: flex; align-items: center; gap: 8px; padding: 16px 32px;
  border-top: 0.5px solid var(--ts-border);
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 2%, transparent);
}
.ts-footer-spacer { flex: 1; }

/* ------------------------------------------------------------ step content */

.ts-stack { display: flex; flex-direction: column; gap: 20px; }
.ts-split { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }

.ts-cat-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.ts-cat {
  display: flex; align-items: flex-start; gap: 12px; padding: 13px 14px; text-align: left;
  border-radius: 12px; border: 0.5px solid var(--ts-border); background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary); font-family: inherit; font-size: 13px; cursor: pointer;
  transition: border-color 120ms ease, background 120ms ease, transform 120ms ease;
}
.ts-cat:hover { border-color: var(--ts-border-strong); background: var(--ts-soft); }
.ts-cat[aria-checked="true"] {
  border-color: var(--ts-accent-border);
  background: var(--ts-accent-soft);
}
.ts-cat-emoji { font-size: 20px; line-height: 1.2; }
.ts-cat-text { min-width: 0; flex: 1; }
.ts-cat-name { display: block; font-weight: 600; font-size: 13.5px; }
.ts-cat-desc { display: block; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 1.45; }
.ts-cat-check {
  flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; margin-top: 2px; border-radius: 50%;
  border: 1px solid var(--ts-border-strong); color: transparent;
}
.ts-cat[aria-checked="true"] .ts-cat-check {
  border-color: transparent; color: var(--dsw-alias-bg-base); background: var(--ts-accent);
}

.ts-block { display: flex; flex-direction: column; gap: 10px; }
.ts-block-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.ts-block-title { font-size: 13.5px; font-weight: 600; }
.ts-block-hint { color: var(--dsw-alias-label-secondary); font-size: 12px; }

.ts-checkcards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.ts-checkcard {
  display: flex; align-items: flex-start; gap: 10px; padding: 11px 12px; text-align: left;
  border-radius: 10px; border: 0.5px solid var(--ts-border); background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary); font-family: inherit; font-size: 13px; cursor: pointer;
  transition: border-color 120ms ease, background 120ms ease;
}
.ts-checkcard:hover { border-color: var(--ts-border-strong); background: var(--ts-soft); }
.ts-checkcard[aria-checked="true"] {
  border-color: var(--ts-accent-border);
  background: var(--ts-accent-soft);
}
.ts-checkcard[data-locked="true"] { cursor: default; }
.ts-box {
  flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center;
  width: 17px; height: 17px; margin-top: 1px; border-radius: 5px;
  border: 1px solid var(--ts-border-strong); color: transparent; background: transparent;
}
.ts-checkcard[aria-checked="true"] .ts-box {
  border-color: transparent; color: var(--dsw-alias-bg-base);
  background: var(--ts-accent);
}
.ts-checkcard[data-locked="true"] .ts-box { opacity: 0.7; }
.ts-checkcard-text { min-width: 0; }
.ts-checkcard-name { display: block; font-weight: 550; line-height: 20px; }
.ts-checkcard-desc { display: block; color: var(--dsw-alias-label-secondary); font-size: 11.5px; line-height: 1.4; }

.ts-module-list { display: flex; flex-direction: column; border: 0.5px solid var(--ts-border); border-radius: 12px; overflow: hidden; }
.ts-module { display: flex; gap: 12px; padding: 13px 14px; align-items: flex-start; background: var(--dsw-alias-bg-base); }
.ts-module + .ts-module { border-top: 0.5px solid var(--ts-border); }
.ts-module-icon {
  flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border-radius: 9px; color: var(--dsw-alias-label-secondary);
  background: var(--ts-soft); border: 0.5px solid var(--ts-border);
}
.ts-module-body { flex: 1; min-width: 0; }
.ts-module-name { display: flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 600; }
.ts-module-desc { margin-top: 2px; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 1.5; }

.ts-inline-note {
  display: flex; align-items: flex-start; gap: 8px; padding: 10px 12px;
  border-radius: 10px; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 1.5;
  background: var(--ts-soft); border: 0.5px dashed var(--ts-border);
}
.ts-inline-note svg { flex: 0 0 auto; margin-top: 2px; opacity: 0.8; }

.ts-sprint-modes { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 12px 14px; background: color-mix(in srgb, var(--dsw-alias-label-primary) 3%, transparent); }
.ts-radio-card {
  display: flex; align-items: flex-start; gap: 9px; padding: 10px 11px; text-align: left;
  border-radius: 10px; border: 0.5px solid var(--ts-border); background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary); font-family: inherit; font-size: 12.5px; cursor: pointer;
}
.ts-radio-card[aria-checked="true"] {
  border-color: var(--ts-accent-border);
  background: var(--ts-accent-soft);
}
.ts-radio-card-name { display: block; font-weight: 550; line-height: 1.4; }
.ts-radio-card-desc { display: block; margin-top: 2px; color: var(--dsw-alias-label-secondary); font-size: 11.5px; line-height: 1.45; }

/* -------------------------------------------------------------- icon edit */

.ts-icon-editor {
  display: flex; gap: 16px; padding: 16px;
  border-radius: 14px; border: 0.5px solid var(--ts-border);
  background: var(--dsw-alias-bg-base);
}
.ts-icon-preview {
  flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center;
  width: 64px; height: 64px; border-radius: 18px; font-size: 30px; line-height: 1; color: #fff;
  box-shadow: inset 0 0 0 0.5px color-mix(in srgb, #fff 22%, transparent);
}
.ts-icon-picker { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 10px; }
.ts-swatches { display: flex; flex-wrap: wrap; gap: 7px; }
.ts-swatch {
  appearance: none; width: 20px; height: 20px; padding: 0; border-radius: 50%;
  border: 2px solid transparent; cursor: pointer; position: relative;
  box-shadow: inset 0 0 0 0.5px color-mix(in srgb, #fff 28%, transparent);
}
.ts-swatch[aria-checked="true"] { border-color: var(--dsw-alias-bg-base); box-shadow: 0 0 0 2px currentColor; }
.ts-emoji-grid { display: flex; flex-wrap: wrap; gap: 3px; }
.ts-emoji {
  appearance: none; width: 30px; height: 30px; padding: 0; border-radius: 8px;
  border: 0.5px solid transparent; background: transparent; font-size: 16px; line-height: 1;
  cursor: pointer; transition: background 100ms ease, border-color 100ms ease;
}
.ts-emoji:hover { background: var(--ts-hover); }
.ts-emoji[aria-checked="true"] { border-color: var(--ts-accent-border); background: var(--ts-accent-soft); }

.ts-preview-card {
  display: flex; align-items: center; gap: 10px; padding: 10px 12px;
  border-radius: 10px; border: 0.5px dashed var(--ts-border);
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 2.5%, transparent);
  font-size: 12px; color: var(--dsw-alias-label-secondary);
}
.ts-preview-name { color: var(--dsw-alias-label-primary); font-weight: 600; font-size: 13px; }

.ts-identifier-wrap { display: flex; align-items: center; gap: 8px; }
.ts-identifier-wrap .ts-input { text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
.ts-task-id {
  display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 12px;
  border-radius: var(--ts-radius-sm); border: 0.5px solid var(--ts-border);
  background: var(--ts-soft); color: var(--dsw-alias-label-secondary);
  font-size: 12px; white-space: nowrap; font-variant-numeric: tabular-nums;
}

/* --------------------------------------------------------------- workflow */

.ts-method { display: inline-flex; padding: 3px; gap: 2px; border-radius: 10px; background: var(--ts-soft); border: 0.5px solid var(--ts-border); }
.ts-method button {
  appearance: none; border: 0; background: transparent; color: var(--dsw-alias-label-secondary);
  height: 28px; padding: 0 12px; border-radius: 7px; font-family: inherit; font-size: 12.5px; cursor: pointer;
}
.ts-method button:disabled { opacity: 0.4; cursor: not-allowed; }
.ts-method button[data-active="true"] { background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); }

.ts-preset-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.ts-preset {
  display: flex; flex-direction: column; gap: 9px; padding: 13px 14px; text-align: left;
  border-radius: 12px; border: 0.5px solid var(--ts-border); background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary); font-family: inherit; cursor: pointer;
  transition: border-color 120ms ease, background 120ms ease;
}
.ts-preset:hover { border-color: var(--ts-border-strong); background: var(--ts-soft); }
.ts-preset[aria-checked="true"] {
  border-color: var(--ts-accent-border);
  background: var(--ts-accent-soft);
}
.ts-preset-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.ts-preset-check {
  flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; border-radius: 50%; border: 1px solid var(--ts-border-strong); color: transparent;
}
.ts-preset[aria-checked="true"] .ts-preset-check { border-color: transparent; color: var(--dsw-alias-bg-base); background: var(--ts-accent); }
.ts-preset-name { display: block; font-size: 13.5px; font-weight: 600; }
.ts-preset-sub { display: block; color: var(--dsw-alias-label-secondary); font-size: 11.5px; margin-top: 1px; }
.ts-status-chain { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }
.ts-status-pill {
  display: inline-flex; align-items: center; gap: 5px; height: 20px; padding: 0 7px;
  border-radius: 5px; font-size: 11px; color: var(--dsw-alias-label-secondary);
  background: var(--ts-soft); border: 0.5px solid var(--ts-border);
}
.ts-preset-labels { display: flex; flex-wrap: wrap; gap: 4px; }
.ts-label-chip {
  display: inline-flex; align-items: center; gap: 4px; height: 20px; padding: 0 7px;
  border-radius: 999px; font-size: 11px; color: var(--dsw-alias-label-secondary);
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 10%, transparent);
}

.ts-editor { display: flex; flex-direction: column; gap: 8px; padding: 14px; border-radius: 12px; border: 0.5px solid var(--ts-border); background: var(--dsw-alias-bg-base); }
.ts-editor-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
.ts-editor-title { font-size: 13px; font-weight: 600; }
.ts-editor-hint { color: var(--dsw-alias-label-secondary); font-size: 11.5px; }
.ts-status-rows, .ts-label-rows { display: flex; flex-direction: column; gap: 4px; }
.ts-status-row { display: flex; align-items: center; gap: 8px; padding: 3px 4px; border-radius: 7px; }
.ts-status-row:hover { background: var(--ts-soft); }
.ts-status-name {
  flex: 1; min-width: 0; height: 28px; padding: 0 8px; border: 0.5px solid transparent;
  border-radius: 6px; background: transparent; color: var(--dsw-alias-label-primary);
  font-family: inherit; font-size: 12.5px;
}
.ts-status-name:hover { border-color: var(--ts-border); }
.ts-status-name:focus { outline: none; border-color: var(--dsw-alias-brand-primary); background: var(--dsw-alias-bg-base); }
.ts-status-actions { display: inline-flex; align-items: center; gap: 2px; opacity: 0.5; transition: opacity 120ms ease; }
.ts-status-row:hover .ts-status-actions { opacity: 1; }
.ts-star-btn {
  appearance: none; border: 0; background: transparent; color: var(--dsw-alias-label-secondary);
  width: 24px; height: 24px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer;
}
.ts-star-btn:hover { background: var(--ts-hover); }
.ts-star-btn[data-default="true"] { color: var(--dsw-alias-state-warn-primary, #e0a03c); }
.ts-label-rows { flex-direction: row; flex-wrap: wrap; }
.ts-label-tag {
  display: inline-flex; align-items: center; gap: 5px; height: 24px; padding: 0 8px 0 9px;
  border-radius: 999px; font-size: 11.5px; color: var(--dsw-alias-label-secondary);
  background: var(--ts-soft); border: 0.5px solid var(--ts-border);
}
.ts-label-tag button {
  appearance: none; border: 0; background: transparent; color: inherit; padding: 0;
  display: inline-flex; cursor: pointer; opacity: 0.65; border-radius: 50%;
}
.ts-label-tag button:hover { opacity: 1; }
.ts-add-inline { display: flex; align-items: center; gap: 6px; padding-top: 4px; }
.ts-add-inline input {
  width: 150px; height: 28px; padding: 0 9px; border-radius: 7px;
  border: 0.5px dashed var(--ts-border-strong); background: transparent;
  color: var(--dsw-alias-label-primary); font-family: inherit; font-size: 12px;
}
.ts-add-inline input:focus { outline: none; border-style: solid; border-color: var(--dsw-alias-brand-primary); }
.ts-add-inline button {
  appearance: none; height: 28px; padding: 0 10px; border-radius: 7px; border: 0;
  background: var(--ts-hover); color: var(--dsw-alias-label-primary); font-family: inherit;
  font-size: 12px; cursor: pointer;
}
.ts-add-inline button:disabled { opacity: 0.4; cursor: not-allowed; }

/* ------------------------------------------------------------ access + sum */

.ts-access-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ts-access-card {
  display: flex; align-items: flex-start; gap: 10px; padding: 13px 14px; text-align: left;
  border-radius: 12px; border: 0.5px solid var(--ts-border); background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary); font-family: inherit; font-size: 13px; cursor: pointer;
}
.ts-access-card[aria-checked="true"] {
  border-color: var(--ts-accent-border);
  background: var(--ts-accent-soft);
}
.ts-access-body { flex: 1; min-width: 0; }
.ts-access-name { display: flex; align-items: center; gap: 7px; font-weight: 600; }
.ts-access-hint { display: block; margin-top: 3px; color: var(--dsw-alias-label-secondary); font-size: 11.5px; line-height: 1.5; }
.ts-access-check {
  flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; border-radius: 50%; border: 1px solid var(--ts-border-strong); color: transparent;
}
.ts-access-card[aria-checked="true"] .ts-access-check { border-color: transparent; color: var(--dsw-alias-bg-base); background: var(--ts-accent); }

.ts-summary {
  display: flex; flex-direction: column; gap: 0; border-radius: 14px;
  border: 0.5px solid var(--ts-border); overflow: hidden;
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 2%, transparent);
}
.ts-summary-head { display: flex; align-items: center; gap: 12px; padding: 15px 16px; background: var(--dsw-alias-bg-base); }
.ts-summary-name { font-size: 15px; font-weight: 650; }
.ts-summary-sub { color: var(--dsw-alias-label-secondary); font-size: 12px; }
.ts-summary-row { display: flex; align-items: flex-start; gap: 16px; padding: 10px 16px; border-top: 0.5px solid var(--ts-border); }
.ts-summary-key { flex: 0 0 84px; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 22px; }
.ts-summary-val { flex: 1; min-width: 0; display: flex; flex-wrap: wrap; gap: 5px; align-items: center; font-size: 12.5px; }

/* ---------------------------------------------------------------- overlays */

.ts-toast {
  position: fixed; left: 50%; bottom: 34px; transform: translateX(-50%); z-index: 1400;
  display: flex; align-items: center; gap: 9px; height: 40px; padding: 0 16px;
  border-radius: 999px; font-size: 13px;
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-overlay, var(--dsw-alias-bg-layer-1));
  border: 0.5px solid var(--ts-border-strong);
  box-shadow: 0 14px 36px color-mix(in srgb, #000 32%, transparent);
  animation: ts-toast-in 200ms cubic-bezier(0.2, 0.9, 0.3, 1) 1;
}
@keyframes ts-toast-in { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }
.ts-toast-icon { color: var(--dsw-alias-state-success-primary, #3fa56e); display: inline-flex; }

.ts-confirm {
  position: relative; width: min(440px, 92vw); padding: 22px;
  border-radius: 16px; background: var(--dsw-alias-bg-layer-1);
  border: 0.5px solid var(--ts-border-strong);
  box-shadow: 0 30px 70px color-mix(in srgb, #000 40%, transparent);
  animation: ts-pop-in 160ms cubic-bezier(0.2, 0.9, 0.3, 1) 1;
}
.ts-confirm-title { margin: 0; font-size: 16px; font-weight: 650; }
.ts-confirm-desc { margin: 8px 0 0; color: var(--dsw-alias-label-secondary); font-size: 13px; line-height: 1.6; }
.ts-confirm-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }

/* --------------------------------------------------- assignees + attachments */

.ts-avatars { display: inline-flex; align-items: center; }
.ts-avatar {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 50%; color: #fff;
  font-size: 10.5px; font-weight: 600; line-height: 1; letter-spacing: 0.02em;
  box-shadow: inset 0 0 0 0.5px color-mix(in srgb, #fff 28%, transparent);
}
.ts-avatars .ts-avatar + .ts-avatar { margin-left: -6px; border: 1.5px solid var(--dsw-alias-bg-layer-1); }
.ts-avatar-more { margin-left: -6px; }
.ts-avatar-more .ts-avatar { background: var(--ts-hover-strong); color: var(--dsw-alias-label-secondary); }
.ts-assignee-missing { color: var(--dsw-alias-label-secondary); font-size: 11.5px; opacity: 0.8; }

.ts-attach-count {
  display: inline-flex; align-items: center; gap: 3px; color: var(--dsw-alias-label-secondary); font-size: 11px;
}

.ts-assignee-box {
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap; min-height: 34px; padding: 4px 8px;
  border-radius: var(--ts-radius-sm); border: 0.5px solid var(--ts-border-strong);
  background: var(--dsw-alias-bg-base);
}
.ts-assignee-box:focus-within { border-color: var(--ts-accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--ts-accent) 16%, transparent); }
.ts-assignee-box input {
  flex: 1; min-width: 110px; height: 24px; padding: 0; border: 0; background: transparent;
  color: var(--dsw-alias-label-primary); font-family: inherit; font-size: 12.5px;
}
.ts-assignee-box input:focus { outline: none; }
.ts-assignee-chip {
  display: inline-flex; align-items: center; gap: 5px; height: 24px; padding: 0 6px 0 3px;
  border-radius: 999px; font-size: 12px; color: var(--dsw-alias-label-primary);
  background: var(--ts-soft); border: 0.5px solid var(--ts-border);
}
.ts-assignee-chip button {
  appearance: none; border: 0; background: transparent; color: inherit; padding: 0;
  display: inline-flex; cursor: pointer; opacity: 0.6; border-radius: 50%;
}
.ts-assignee-chip button:hover { opacity: 1; }

.ts-attach-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ts-attach-list { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
.ts-attach-item {
  display: flex; align-items: center; gap: 9px; padding: 7px 9px;
  border-radius: 9px; border: 0.5px solid var(--ts-border); background: var(--dsw-alias-bg-base);
}
.ts-attach-thumb {
  flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; border-radius: 7px; overflow: hidden;
  background: var(--ts-soft); color: var(--dsw-alias-label-secondary);
}
.ts-attach-thumb img { width: 100%; height: 100%; object-fit: cover; }
.ts-attach-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.ts-attach-name { font-size: 12.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ts-attach-size { color: var(--dsw-alias-label-secondary); font-size: 11px; }
.ts-attach-open {
  appearance: none; border: 0; background: transparent; color: var(--dsw-alias-label-secondary);
  padding: 0 4px; font-family: inherit; font-size: 12px; cursor: pointer;
}
.ts-attach-open:hover { color: var(--dsw-alias-label-primary); }
.ts-file-input { display: none; }
.ts-attach-error { color: var(--dsw-alias-state-error-primary); font-size: 12px; margin-top: 6px; }

.ts-board-card-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.ts-board-card-foot .ts-attach-count { gap: 3px; }

/* -------------------------------------------------------- space workspace */

.ts-space-head { display: flex; align-items: flex-start; gap: 14px; }
.ts-back {
  appearance: none; flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; margin-top: 3px; padding: 0; border: 0; border-radius: 8px;
  background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer;
}
.ts-back:hover { background: var(--ts-hover); color: var(--dsw-alias-label-primary); }
.ts-space-identity { flex: 1; min-width: 0; }
.ts-space-title { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; margin: 0; font-size: 22px; line-height: 30px; font-weight: 650; letter-spacing: -0.01em; }
.ts-space-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 5px; color: var(--dsw-alias-label-secondary); font-size: 12.5px; }
.ts-head-actions { display: flex; align-items: center; gap: 8px; flex: 0 0 auto; }

.ts-space-toolbar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.ts-toolbar-spacer { flex: 1; }

.ts-task-list {
  display: flex; flex-direction: column; border-radius: var(--ts-radius-lg);
  border: 0.5px solid var(--ts-border); overflow: hidden; background: var(--dsw-alias-bg-layer-1);
}
.ts-task-row {
  display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px 16px;
  border: 0; background: transparent; color: var(--dsw-alias-label-primary);
  font-family: inherit; text-align: left; cursor: pointer;
}
.ts-task-row + .ts-task-row { border-top: 0.5px solid var(--ts-border); }
.ts-task-row:hover { background: var(--ts-soft); }
.ts-task-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.ts-task-title { font-size: 13.5px; font-weight: 550; line-height: 20px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ts-task-sub { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; color: var(--dsw-alias-label-secondary); font-size: 11.5px; }
.ts-task-side { flex: 0 0 auto; display: flex; align-items: center; gap: 8px; }
.ts-task-time { color: var(--dsw-alias-label-secondary); font-size: 11.5px; white-space: nowrap; }

.ts-priority {
  display: inline-flex; align-items: center; gap: 4px; height: 20px; padding: 0 7px;
  border-radius: 5px; font-size: 11px; color: var(--dsw-alias-label-secondary);
  background: var(--ts-soft); border: 0.5px solid var(--ts-border);
}
.ts-priority[data-priority="urgent"] { color: var(--dsw-alias-state-error-primary); border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 45%, transparent); }
.ts-priority[data-priority="high"] { color: #e0783c; border-color: color-mix(in srgb, #e0783c 45%, transparent); }
.ts-priority[data-priority="medium"] { color: var(--dsw-alias-state-warn-primary, #e0a03c); border-color: color-mix(in srgb, var(--dsw-alias-state-warn-primary, #e0a03c) 45%, transparent); }
.ts-priority[data-priority="low"] { color: var(--dsw-alias-state-business-primary, #5b8def); border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary, #5b8def) 45%, transparent); }
.ts-priority-dot { width: 6px; height: 6px; border-radius: 50%; }

.ts-board { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(190px, 1fr); gap: 10px; overflow-x: auto; padding-bottom: 8px; }
.ts-board-col {
  display: flex; flex-direction: column; gap: 8px; min-width: 0;
  padding: 10px; border-radius: 13px; background: color-mix(in srgb, var(--dsw-alias-label-primary) 3%, transparent);
  border: 0.5px solid var(--ts-border);
}
.ts-board-head { display: flex; align-items: center; gap: 7px; padding: 2px 4px 6px; }
.ts-board-name { font-size: 12.5px; font-weight: 600; color: var(--dsw-alias-label-secondary); }
.ts-board-count { color: var(--dsw-alias-label-secondary); font-size: 11px; opacity: 0.8; }
.ts-board-add { margin-left: auto; }
.ts-board-cards { display: flex; flex-direction: column; gap: 8px; }
.ts-board-card {
  display: flex; flex-direction: column; gap: 7px; width: 100%; padding: 11px 12px; text-align: left;
  border-radius: 10px; border: 0.5px solid var(--ts-border); background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary); font-family: inherit; font-size: 13px; cursor: pointer;
  transition: border-color 120ms ease, background 120ms ease;
}
.ts-board-card:hover { border-color: var(--ts-border-strong); background: var(--ts-hover); }
.ts-board-card-title { font-size: 13px; font-weight: 550; line-height: 19px; }
.ts-board-card-meta { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
.ts-board-empty {
  padding: 14px 10px; text-align: center; color: var(--dsw-alias-label-secondary); font-size: 11.5px;
  border-radius: 9px; border: 0.5px dashed var(--ts-border);
}

.ts-empty-tasks {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
  padding: 48px 24px; text-align: center; border-radius: var(--ts-radius-lg);
  border: 1px dashed var(--ts-border-strong); background: var(--ts-soft);
}

/* ------------------------------------------------------------ board drag */

.ts-board-card[draggable="true"] { cursor: grab; }
.ts-board-card[draggable="true"]:active { cursor: grabbing; }
.ts-board-card[data-dragging="true"] { opacity: 0.45; }
.ts-board-col[data-drop="true"] {
  border-color: var(--ts-accent-border);
  background: var(--ts-accent-soft);
}
.ts-board-col[data-drop="true"] .ts-board-empty { border-color: var(--ts-accent-border); }

/* -------------------------------------------------------------- filters */

.ts-filterbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ts-search {
  display: inline-flex; align-items: center; gap: 7px; height: 30px; padding: 0 10px;
  border-radius: var(--ts-radius-sm); border: 0.5px solid var(--ts-border-strong);
  background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-secondary);
  min-width: 220px;
}
.ts-search:focus-within { border-color: var(--ts-accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--ts-accent) 16%, transparent); }
.ts-search input {
  flex: 1; min-width: 0; height: 100%; padding: 0; border: 0; background: transparent;
  color: var(--dsw-alias-label-primary); font-family: inherit; font-size: 12.5px;
}
.ts-search input:focus { outline: none; }
.ts-search input::placeholder { color: var(--dsw-alias-label-secondary); opacity: 0.8; }
.ts-filterbar .ts-filter-select {
  width: auto; min-width: 108px; flex: 0 0 auto; height: 30px; padding: 0 8px; font-size: 12.5px;
}
.ts-filter-clear { height: 30px; padding: 0 10px; font-size: 12px; }

/* ------------------------------------------------------------ task editor */

.ts-task-dialog {
  position: relative; display: flex; flex-direction: column; width: min(600px, 92vw); max-height: 88vh; overflow: hidden;
  padding: 22px; border-radius: 18px; background: var(--dsw-alias-bg-layer-1);
  border: 0.5px solid var(--ts-border-strong);
  box-shadow: 0 32px 80px color-mix(in srgb, #000 42%, transparent);
  animation: ts-pop-in 170ms cubic-bezier(0.2, 0.9, 0.3, 1) 1;
}
.ts-task-dialog-head { flex: 0 0 auto; display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.ts-task-dialog-title { margin: 0; font-size: 17px; font-weight: 650; }
.ts-task-dialog-sub { margin-top: 3px; color: var(--dsw-alias-label-secondary); font-size: 12px; }
.ts-task-form { flex: 1; min-height: 0; overflow: auto; display: flex; flex-direction: column; gap: 14px; padding-right: 2px; }
.ts-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.ts-textarea {
  width: 100%; min-height: 76px; resize: vertical; padding: 9px 11px;
  border-radius: var(--ts-radius-sm); border: 0.5px solid var(--ts-border-strong);
  background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary);
  font-family: inherit; font-size: 13px; line-height: 1.55;
}
.ts-textarea::placeholder { color: var(--dsw-alias-label-secondary); opacity: 0.75; }
.ts-textarea:focus { outline: none; border-color: var(--ts-accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--ts-accent) 20%, transparent); }
.ts-select {
  width: 100%; height: 34px; padding: 0 9px; border-radius: var(--ts-radius-sm);
  border: 0.5px solid var(--ts-border-strong); background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary); font-family: inherit; font-size: 13px; cursor: pointer;
}
.ts-select:focus { outline: none; border-color: var(--ts-accent); }
.ts-label-toggle { cursor: pointer; }
.ts-label-toggle[aria-pressed="true"] {
  color: var(--dsw-alias-label-primary);
  background: var(--ts-accent-soft);
  border-color: var(--ts-accent-border);
}
.ts-task-dialog-foot { flex: 0 0 auto; display: flex; align-items: center; gap: 8px; margin-top: 14px; padding-top: 12px; border-top: 0.5px solid var(--ts-border); }

/* -------------------------------------------------------------- responsive */

@media (max-width: 900px) {
  .ts-page { padding: 24px 20px 48px; }
  .ts-dialog { flex-direction: column; width: 96vw; height: 92vh; }
  .ts-rail { flex: 0 0 auto; flex-direction: row; align-items: center; gap: 10px; padding: 14px 16px; overflow-x: auto; border-right: 0; border-bottom: 0.5px solid var(--ts-border); }
  .ts-rail-head, .ts-rail-foot { display: none; }
  .ts-steps { flex-direction: row; }
  .ts-step { width: auto; padding: 6px 8px; }
  .ts-step-caption { display: none; }
  .ts-content-head { padding: 18px 20px 10px; }
  .ts-content-body { padding: 4px 20px 18px; }
  .ts-footer { padding: 12px 20px; }
  .ts-cat-grid, .ts-checkcards, .ts-preset-grid, .ts-access-grid, .ts-split, .ts-sprint-modes, .ts-form-row { grid-template-columns: 1fr; }
  .ts-board { grid-auto-columns: minmax(220px, 80vw); }
}
`

/** Inject the stylesheet once (idempotent across reloads and HMR remounts). */
function installStyles() {
  if (typeof document === 'undefined') return
  const selector = 'style[data-plugin-css=' + JSON.stringify(CSS_TAG_ID) + ']'
  if (document.querySelector(selector) !== null) return
  const tag = document.createElement('style')
  tag.dataset.plugin = 'dsh-plugin-task-spaces'
  tag.dataset.pluginCss = CSS_TAG_ID
  tag.textContent = TASK_SPACES_CSS
  document.head.appendChild(tag)
}
