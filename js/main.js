// Shared behaviour across all pages: ticker tape + active nav highlighting

function buildTicker() {
  const track = document.getElementById("tickerTrack");
  if (!track) return;

  // Pick a rotating sample of terms, render twice back-to-back for a seamless loop
  const sample = TERMS.slice(0, 24);
  const html = sample
    .map(t => `<span class="ticker-item"><span class="tk-term">${t.term}</span><span class="tk-def">${t.definition.split(".")[0]}.</span></span>`)
    .join("");
  track.innerHTML = html + html;
}

function highlightNav() {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a").forEach(a => {
    const href = a.getAttribute("href");
    if (href === path) a.classList.add("active");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  buildTicker();
  highlightNav();
});
