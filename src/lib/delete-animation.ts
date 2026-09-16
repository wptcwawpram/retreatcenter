// Cohesive "row rolls into the recycle bin" animation.
// Clones the actual row so the user sees exactly what is being removed strip
// away (right -> left) and fly into the bin.

function binTarget(binEl: HTMLElement | null) {
  if (binEl) {
    const r = binEl.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  return { x: window.innerWidth - 44, y: window.innerHeight - 44 };
}

export function animateRowToBin(rowEl: HTMLElement, binEl: HTMLElement | null, onLanded?: () => void) {
  try {
    const rect = rowEl.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) { onLanded?.(); return; }

    // Faithful clone of the row, kept renderable by wrapping it in a table
    const clone = rowEl.cloneNode(true) as HTMLElement;
    const origCells = rowEl.querySelectorAll("td");
    const cloneCells = clone.querySelectorAll("td");
    origCells.forEach((c, i) => {
      const cc = cloneCells[i] as HTMLElement | undefined;
      if (cc) cc.style.width = `${(c as HTMLElement).getBoundingClientRect().width}px`;
    });

    const wrap = document.createElement("div");
    wrap.style.cssText = [
      "position:fixed", `left:${rect.left}px`, `top:${rect.top}px`,
      `width:${rect.width}px`, `height:${rect.height}px`, "z-index:60",
      "overflow:hidden", "border-radius:10px", "pointer-events:none",
      "background:var(--color-card, #1b1917)", "box-shadow:0 12px 34px rgba(0,0,0,.4)",
      "transform-origin:left center", "will-change:transform,clip-path,opacity",
    ].join(";");

    const table = document.createElement("table");
    table.style.cssText = `width:${rect.width}px;table-layout:fixed;border-collapse:collapse`;
    const tbody = document.createElement("tbody");
    tbody.appendChild(clone);
    table.appendChild(tbody);
    wrap.appendChild(table);
    document.body.appendChild(wrap);

    const target = binTarget(binEl);
    const dx = target.x - rect.left;
    const dy = target.y - rect.top;

    const anim = wrap.animate(
      [
        { clipPath: "inset(0 0 0 0)", transform: "translate(0,0) scale(1) rotate(0deg)", opacity: 1, offset: 0 },
        // strip away from the right, collapsing to a nub on the left
        { clipPath: "inset(0 78% 0 0)", transform: "translate(-4px,0) scale(0.98)", opacity: 1, offset: 0.34 },
        // lift and arc toward the bin
        { clipPath: "inset(0 80% 0 0)", transform: `translate(${dx}px, ${dy - 50}px) scale(0.45) rotate(10deg)`, opacity: 0.9, offset: 0.7 },
        // drop into the bin
        { clipPath: "inset(0 88% 0 0)", transform: `translate(${dx}px, ${dy}px) scale(0.08) rotate(24deg)`, opacity: 0.1, offset: 1 },
      ],
      { duration: 760, easing: "cubic-bezier(0.5,-0.15,0.35,1.15)", fill: "forwards" },
    );
    anim.onfinish = () => { wrap.remove(); onLanded?.(); };
    anim.oncancel = () => { wrap.remove(); onLanded?.(); };
  } catch {
    onLanded?.();
  }
}

// A small chip pops back out of the bin when an item is restored.
export function animateRestoreFromBin(binEl: HTMLElement | null) {
  try {
    const target = binTarget(binEl);
    const chip = document.createElement("div");
    chip.style.cssText = [
      "position:fixed", `left:${target.x}px`, `top:${target.y}px`, "z-index:60",
      "width:30px", "height:30px", "margin:-15px 0 0 -15px", "border-radius:9999px",
      "display:flex", "align-items:center", "justify-content:center",
      "background:#14b8a6", "color:#fff", "box-shadow:0 8px 24px rgba(0,0,0,.3)", "pointer-events:none",
    ].join(";");
    chip.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.7 3"/><path d="M3 3v5h5"/></svg>`;
    document.body.appendChild(chip);
    const anim = chip.animate(
      [
        { transform: "translate(0,0) scale(0.4)", opacity: 0.2 },
        { transform: "translate(0,-46px) scale(1.1)", opacity: 1, offset: 0.6 },
        { transform: "translate(0,-70px) scale(0.9)", opacity: 0 },
      ],
      { duration: 620, easing: "cubic-bezier(0.2,0.8,0.3,1)" },
    );
    anim.onfinish = () => chip.remove();
    anim.oncancel = () => chip.remove();
  } catch {}
}
