// LaTeX Resume Tailor
// Two model calls per run:
//   1. Select + reword: reads the job posting and experience bank, returns JSON
//      describing which entries to use and the reworded bullets.
//   2. Regenerate: reads the LaTeX template and the JSON from step 1, returns the full .tex file.
(() => {
  "use strict";

  const API_URL = "https://api.anthropic.com/v1/messages";
  const $ = (s) => document.querySelector(s);
  const els = {
    settingsBtn: $("#settingsBtn"), settings: $("#settings"),
    apiKey: $("#apiKey"), model: $("#model"), rememberKey: $("#rememberKey"),
    job: $("#job"), exp: $("#exp"), tpl: $("#tpl"),
    maxEntries: $("#maxEntries"), maxBullets: $("#maxBullets"), strength: $("#strength"), onePage: $("#onePage"),
    runBtn: $("#runBtn"), stopBtn: $("#stopBtn"), status: $("#status"),
    loadExample: $("#loadExample"), clearAll: $("#clearAll"),
    picks: $("#picks"), latex: $("#latex"), exampleBadge: $("#exampleBadge"),
    copyBtn: $("#copyBtn"), downloadBtn: $("#downloadBtn"), overleafBtn: $("#overleafBtn"), copyNote: $("#copyNote"),
    overleafForm: $("#overleafForm"), overleafSnip: $("#overleafSnip"),
  };

  // ---------- storage (all local to this browser) ----------
  const store = {
    get(k, area = localStorage) { try { return area.getItem(k); } catch { return null; } },
    set(k, v, area = localStorage) { try { area.setItem(k, v); } catch {} },
    del(k, area = localStorage) { try { area.removeItem(k); } catch {} },
  };
  const FIELDS = ["job", "exp", "tpl", "maxEntries", "maxBullets", "strength", "model"];
  const K = (name) => "rt." + name;

  function saveInputs() {
    for (const f of FIELDS) store.set(K(f), els[f].value);
    store.set(K("onePage"), els.onePage.checked ? "1" : "0");
  }
  function saveKey() {
    const key = els.apiKey.value.trim();
    const remember = els.rememberKey.checked;
    store.set(K("remember"), remember ? "1" : "0");
    if (remember) { store.set(K("key"), key); store.del(K("key"), sessionStorage); }
    else { store.set(K("key"), key, sessionStorage); store.del(K("key")); }
  }
  function saveOutput(result, latex) {
    store.set(K("result"), JSON.stringify(result));
    store.set(K("latex"), latex);
  }

  function loadExample() {
    els.job.value = EXAMPLES.job;
    els.exp.value = EXAMPLES.experiences;
    els.tpl.value = EXAMPLES.template;
    showResult(EXAMPLES.result, EXAMPLES.latex, true);
    saveInputs();
  }

  function init() {
    const hasSaved = store.get(K("tpl")) !== null;
    if (hasSaved) {
      for (const f of FIELDS) { const v = store.get(K(f)); if (v !== null && v !== "") els[f].value = v; }
      els.onePage.checked = store.get(K("onePage")) !== "0";
      let result = null;
      try { result = JSON.parse(store.get(K("result")) || "null"); } catch {}
      const latex = store.get(K("latex"));
      if (result && latex) showResult(result, latex, false);
      else showEmpty();
    } else {
      loadExample();
    }
    els.rememberKey.checked = store.get(K("remember")) === "1";
    els.apiKey.value = store.get(K("key")) || store.get(K("key"), sessionStorage) || "";
    if (!els.apiKey.value) toggleSettings(true);
  }

  // ---------- tabs ----------
  document.querySelectorAll(".tabs").forEach((bar) => {
    bar.addEventListener("click", (e) => {
      const tab = e.target.closest(".tab");
      if (tab) selectTab(bar, tab.dataset.tab);
    });
  });
  function selectTab(barOrGroup, name) {
    const bar = typeof barOrGroup === "string" ? document.querySelector(`.tabs[data-group="${barOrGroup}"]`) : barOrGroup;
    const panel = bar.closest(".panel");
    bar.querySelectorAll(".tab").forEach((t) => t.setAttribute("aria-selected", String(t.dataset.tab === name)));
    panel.querySelectorAll(".tabpane").forEach((p) => { p.hidden = p.dataset.pane !== name; });
  }

  function toggleSettings(force) {
    const open = force ?? els.settings.hidden;
    els.settings.hidden = !open;
    els.settingsBtn.setAttribute("aria-expanded", String(open));
  }

  // ---------- rendering ----------
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function showEmpty() {
    els.picks.innerHTML = `<p class="empty">Fill in the three inputs and press <strong>Tailor resume</strong>. The chosen experiences and reworded bullets appear here; the full LaTeX is under the LaTeX tab.</p>`;
    els.latex.value = "";
    els.exampleBadge.hidden = true;
  }

  function showResult(result, latex, isExample) {
    renderPicks(result);
    els.latex.value = latex || "";
    els.exampleBadge.hidden = !isExample;
  }

  function renderPicks(r) {
    if (!r || !Array.isArray(r.selected)) { showEmpty(); return; }
    const kw = Array.isArray(r.keywords) ? r.keywords : [];
    const parts = [];

    if (kw.length) {
      parts.push(`<div><h3>Posting keywords</h3><div class="chips">${
        kw.map((k) => `<span class="chip ${k.covered ? "hit" : "miss"}">${esc(k.term)}</span>`).join("")
      }</div><p class="legend">Solid: shown in your resume. Dashed: asked for but not found in your experience bank.</p></div>`);
    }

    parts.push(`<div><h3>Included (${r.selected.length})</h3>${r.selected.map((e) => `
      <article class="entry">
        <div class="entry-head">
          <div><span class="entry-title">${esc(e.title)}</span>${e.org ? ` <span class="entry-org">· ${esc(e.org)}</span>` : ""}</div>
          <span class="entry-dates">${esc(e.dates)}</span>
        </div>
        ${e.why ? `<p class="why">${esc(e.why)}</p>` : ""}
        <ul class="bullets">${(e.bullets || []).map((b) => {
          const changed = b.original && b.tailored && norm(b.original) !== norm(b.tailored);
          return `<li>${changed ? `<span class="orig">${esc(b.original)}</span><span class="new">${esc(b.tailored)}</span>`
                                : `<span class="same">${esc(b.tailored || b.original)}</span>`}</li>`;
        }).join("")}</ul>
      </article>`).join("")}</div>`);

    if (Array.isArray(r.skipped) && r.skipped.length) {
      parts.push(`<details class="skipped"><summary>Left out (${r.skipped.length})</summary><ul>${
        r.skipped.map((s) => `<li><strong>${esc(s.title)}</strong>: ${esc(s.why)}</li>`).join("")
      }</ul></details>`);
    }
    if (r.notes) parts.push(`<p class="hint"><strong>Note:</strong> ${esc(r.notes)}</p>`);
    els.picks.innerHTML = parts.join("");
  }
  const norm = (s) => String(s).toLowerCase().replace(/\W+/g, " ").trim();

  function setStatus(text, kind = "") {
    els.status.textContent = text;
    els.status.className = "status" + (kind ? " " + kind : "");
  }

  // ---------- prompts ----------
  const STRENGTH = {
    light: "Light rewording: keep each bullet close to the original. Mostly swap in the posting's terminology where it truthfully applies and tighten wording.",
    moderate: "Moderate rewording: restructure bullets to lead with what this posting cares about, using its key phrases where truthful. You may merge two related bullets from the same entry.",
    strong: "Strong rewording: rewrite bullets freely to foreground the posting's priorities and vocabulary, merging related bullets from the same entry where useful, while staying strictly truthful.",
  };

  function selectPrompt() {
    const n = clampInt(els.maxEntries.value, 1, 10, 4);
    const b = clampInt(els.maxBullets.value, 1, 6, 3);
    return `You are an expert technical recruiter tailoring a resume to one job posting.

<job_posting>
${els.job.value.trim()}
</job_posting>

<experience_bank>
${els.exp.value.trim()}
</experience_bank>

<current_resume_template>
${els.tpl.value.trim()}
</current_resume_template>

Task:
1. Extract the 6-12 most important skills/keywords from the posting. Mark each "covered": true only if something in the experience bank genuinely supports it.
2. Choose at most ${n} entries from the experience bank that best fit the posting. Prefer direct relevance, then impact and recency. Assign each to the resume section it belongs in (use the section names in the template, e.g. "Experience" or "Projects").
3. For each chosen entry, write at most ${b} bullets. ${STRENGTH[els.strength.value] || STRENGTH.moderate}
4. Bullets start with a strong past-tense verb (present tense for current roles), keep numbers, and stay under about 30 words.${els.onePage.checked ? " The result must fit on one page alongside the template's other sections, so be economical." : ""}

Hard rules: never invent employers, titles, dates, tools, technologies, numbers or results that are not in the experience bank. Only rephrase, reorder, combine, and emphasize what is there. Copy title, org, dates and location exactly from the bank.

Reply with only a JSON object, no prose, in exactly this shape:
{"keywords":[{"term":"React","covered":true}],
 "selected":[{"section":"Experience","title":"","org":"","dates":"","location":"","why":"one short sentence on why it fits",
   "bullets":[{"original":"closest original bullet from the bank","tailored":"the new bullet"}]}],
 "skipped":[{"title":"","why":"one short sentence"}],
 "skills_order":"one or two sentences on which skills from the template's skills section to move to the front for this posting",
 "notes":"optional: one sentence flagging important posting requirements the bank doesn't cover, or empty string"}`;
  }

  function latexPrompt(sel) {
    return `Regenerate this LaTeX resume using the tailored content below.

<template>
${els.tpl.value.trim()}
</template>

<tailored_content>
${JSON.stringify(sel, null, 2)}
</tailored_content>

Instructions:
- Output the COMPLETE .tex file, from \\documentclass to \\end{document}.
- Keep the preamble, packages, custom macros, header/contact block, education and any other sections not covered below exactly as in the template.
- Replace the contents of the experience and project sections with the selected entries, in the order given, under the section named in each entry's "section" field. Use the template's own macros and list style for each entry (copy the pattern of the template's example entries). Remove placeholder entries.
- If a section ends up with no entries, remove that section.
- In the skills section, reorder items following "skills_order". Do not add skills that are not in the template or the tailored content.
- Escape LaTeX special characters in content (& % $ # _ { } ~ ^), and use -- for date ranges.
- The document must compile with pdflatex.

Reply with only the raw LaTeX source. No Markdown code fences, no commentary.`;
  }

  // ---------- API ----------
  class ApiError extends Error {
    constructor(status, message) { super(message || `Request failed (${status})`); this.status = status; }
  }

  async function callClaude({ prompt, maxTokens, signal, onText }) {
    const key = els.apiKey.value.trim();
    const res = await fetch(API_URL, {
      method: "POST",
      signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: els.model.value,
        max_tokens: maxTokens,
        stream: true,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) {
      let msg = "";
      try { msg = (await res.json())?.error?.message || ""; } catch {}
      throw new ApiError(res.status, msg);
    }

    // Read the server-sent event stream.
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "", text = "", stopReason = null;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf("\n\n")) >= 0) {
        const chunk = buf.slice(0, i);
        buf = buf.slice(i + 2);
        const data = chunk.split("\n").filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim()).join("");
        if (!data) continue;
        let ev;
        try { ev = JSON.parse(data); } catch { continue; }
        if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta") {
          text += ev.delta.text;
          onText?.(text);
        } else if (ev.type === "message_delta") {
          stopReason = ev.delta?.stop_reason ?? stopReason;
        } else if (ev.type === "error") {
          throw new ApiError(0, ev.error?.message || "The API reported an error mid-response.");
        }
      }
    }
    return { text, truncated: stopReason === "max_tokens" };
  }

  function parseJson(text) {
    const tryParse = (s) => { try { return JSON.parse(s); } catch { return undefined; } };
    let v = tryParse(text.trim());
    if (v !== undefined) return v;
    const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) { v = tryParse(fence[1]); if (v !== undefined) return v; }
    const a = text.indexOf("{"), b = text.lastIndexOf("}");
    if (a >= 0 && b > a) { v = tryParse(text.slice(a, b + 1)); if (v !== undefined) return v; }
    throw new Error("The model's selection wasn't valid JSON. Try again, or switch to a stronger model.");
  }

  function cleanLatex(text) {
    let t = text.replace(/^\s*```(?:latex|tex)?\s*\n?/i, "").replace(/\n?```\s*$/, "");
    const start = t.indexOf("\\documentclass");
    if (start > 0) t = t.slice(start);
    return t.trim() + "\n";
  }

  function friendlyError(e) {
    if (e?.name === "AbortError") return "Stopped.";
    if (e instanceof ApiError) {
      if (e.status === 401) return "The API key was rejected. Check it under API settings.";
      if (e.status === 403) return "This key doesn't have permission for that model. " + e.message;
      if (e.status === 404) return "Model not found. Pick another model under API settings.";
      if (e.status === 429) return "Rate limited or out of credit. Wait a minute, or check your Anthropic console billing.";
      if (e.status === 529 || e.status >= 500) return "The API is busy right now. Try again in a moment.";
      return e.message;
    }
    if (e instanceof TypeError) return "Couldn't reach the API. Check your connection (and any ad-blocker blocking api.anthropic.com).";
    return e?.message || String(e);
  }

  // ---------- run ----------
  let ctl = null;

  async function run() {
    const missing = [];
    if (!els.job.value.trim()) missing.push("job posting");
    if (!els.exp.value.trim()) missing.push("experience bank");
    if (!els.tpl.value.trim()) missing.push("LaTeX template");
    if (missing.length) { setStatus("Add your " + missing.join(", ") + " first.", "err"); return; }
    if (!els.apiKey.value.trim()) { toggleSettings(true); els.apiKey.focus(); setStatus("Add your Anthropic API key first.", "err"); return; }

    saveInputs(); saveKey();
    ctl = new AbortController();
    setBusy(true);
    try {
      setStatus("Reading the posting and choosing experiences…", "busy");
      const step1 = await callClaude({ prompt: selectPrompt(), maxTokens: 6000, signal: ctl.signal });
      const sel = parseJson(step1.text);
      if (!Array.isArray(sel.selected) || !sel.selected.length) throw new Error("No experiences were selected. Check that the experience bank has content.");
      renderPicks(sel);
      els.exampleBadge.hidden = true;
      selectTab("out", "picks");

      setStatus("Writing the LaTeX…", "busy");
      els.latex.value = "";
      const step2 = await callClaude({
        prompt: latexPrompt(sel), maxTokens: 12000, signal: ctl.signal,
        onText: (t) => { els.latex.value = t; },
      });
      const tex = cleanLatex(step2.text);
      els.latex.value = tex;
      saveOutput(sel, tex);
      selectTab("out", "latex");
      if (step2.truncated) setStatus("The LaTeX was cut off before \\end{document}. Try fewer entries or bullets.", "err");
      else if (!/\\end\{document\}/.test(tex)) setStatus("Done, but the file has no \\end{document}. Check the end before compiling.", "err");
      else setStatus("Done. Review the wording, then copy, download or open in Overleaf.");
    } catch (e) {
      setStatus(friendlyError(e), e?.name === "AbortError" ? "" : "err");
    } finally {
      setBusy(false);
      ctl = null;
    }
  }

  function setBusy(busy) {
    els.runBtn.disabled = busy;
    els.stopBtn.hidden = !busy;
    els.runBtn.textContent = busy ? "Tailoring…" : "Tailor resume";
  }

  function clampInt(v, lo, hi, dflt) {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : dflt;
  }

  // ---------- output actions ----------
  function flash(msg) {
    els.copyNote.textContent = msg;
    clearTimeout(flash.t);
    flash.t = setTimeout(() => { els.copyNote.textContent = ""; }, 2500);
  }

  els.copyBtn.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(els.latex.value); flash("Copied."); }
    catch { els.latex.select(); flash("Selected. Press Ctrl/Cmd+C to copy."); }
  });

  els.downloadBtn.addEventListener("click", () => {
    if (!els.latex.value.trim()) { flash("Nothing to download yet."); return; }
    const blob = new Blob([els.latex.value], { type: "application/x-tex" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "resume.tex";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  els.overleafBtn.addEventListener("click", () => {
    if (!els.latex.value.trim()) { flash("Nothing to open yet."); return; }
    els.overleafSnip.value = encodeURIComponent(els.latex.value);
    els.overleafForm.submit();
  });

  // ---------- wiring ----------
  els.settingsBtn.addEventListener("click", () => toggleSettings());
  els.apiKey.addEventListener("change", saveKey);
  els.rememberKey.addEventListener("change", saveKey);
  els.runBtn.addEventListener("click", run);
  els.stopBtn.addEventListener("click", () => ctl?.abort());
  els.loadExample.addEventListener("click", loadExample);
  els.clearAll.addEventListener("click", () => {
    els.job.value = ""; els.exp.value = ""; els.tpl.value = "";
    store.del(K("result")); store.del(K("latex"));
    saveInputs(); showEmpty(); setStatus("");
  });
  let saveTimer;
  for (const f of ["job", "exp", "tpl", "maxEntries", "maxBullets", "strength", "model", "onePage"]) {
    els[f].addEventListener("input", () => { clearTimeout(saveTimer); saveTimer = setTimeout(saveInputs, 400); });
  }

  init();
})();
