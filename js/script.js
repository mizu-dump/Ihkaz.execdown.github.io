// ===================================
// CARD RENDERING FROM JSON
// ===================================
let downloadCounts = JSON.parse(localStorage.getItem('downloadCounts') || '{}'); // Persist counts

function createScriptCard(script) {
  const tagsHtml = (script.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('');

  // Card icon by category
  let icon = "fa-code";
  if (script.category && script.category.toLowerCase().includes("utility")) icon = "fa-earth-americas";
  if (script.category && script.category.toLowerCase().includes("helper")) icon = "fa-tools";
  if (script.category && script.category.toLowerCase().includes("creative")) icon = "fa-palette";

  // Platform icons with spacing
  const platformIcons = (script.platforms || []).map(p => {
    if (p.toLowerCase() === "pc") return `<i class="fas fa-desktop" title="PC" style="margin-right:5px;"></i>`;
    if (p.toLowerCase() === "android") return `<i class="fab fa-android" title="Android" style="margin-right:5px;"></i>`;
    if (p.toLowerCase() === "ios") return `<i class="fab fa-apple" title="iOS" style="margin-right:5px;"></i>`;
    return "";
  }).join(" ");

  // Architecture / VNG label with spacing
  const archInfo = script.arch ? `<span class="arch-label" style="margin-right:5px;">${script.arch}</span>` : "";
  const vngLabel = script.vng ? `<span class="vng-label" style="margin-right:5px;">VNG</span>` : "";

  // Status circles with proper text colors
  const statusCircle = `<span class="status-circle ${script.Status === 'Online' ? 'online' : 'offline'}"></span> <span class="status-text ${script.Status === 'Online' ? 'online-text' : 'offline-text'}">${script.Status || "---"}</span>`;
  const vngStatusCircle = `<span class="status-circle ${script.VngStatus === 'Online' ? 'online' : 'offline'}"></span> <span class="status-text ${script.VngStatus === 'Online' ? 'online-text' : 'offline-text'}">${script.VngStatus || "---"}</span>`;

  // Initialize download counter
  if (!downloadCounts[script.id]) downloadCounts[script.id] = 0;

  return `
<article class="script-card" data-animate="fade-up" data-category="${script.category ? script.category.toLowerCase() : ''}">
  <div class="card-glow"></div>
  <div class="card-content">
    <div class="card-header">
      <div class="card-icon"><i class="fas ${icon}"></i></div>
      <span class="card-badge">${script.category || ""}</span>
    </div>

    <div class="card-image-wrapper">
      <img
        alt="${script.title} Preview"
        class="card-image"
        loading="lazy"
        onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 400 300\\'%3E%3Crect fill=\\'%23111\\' width=\\'400\\' height=\\'300\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' text-anchor=\\'middle\\' dy=\\'.3em\\' fill=\\'%23666\\' font-family=\\'monospace\\' font-size=\\'14\\'%3EImage Loading...%3C/text%3E%3C/svg%3E';"
        src="${script.image || ''}" />
      <div class="card-image-overlay"></div>
    </div>

    <h3 class="card-title" data-text="${script.title}">
      <span class="typing-wrapper"></span>
    </h3>
    <p class="card-description">${script.description || ""}</p>
    <div class="card-tags">${tagsHtml}</div>

    <div class="card-platforms" style="margin-bottom:15px;">
      ${platformIcons} ${archInfo} ${vngLabel}
    </div>

    <div class="card-status" style="margin-bottom:15px; display:flex; flex-direction:column; gap:5px;">
      <div>Version: ${script.Version || "-"}</div>
      <div>VNG Version: ${script.VngVer || "-"}</div>
      <div>Status: ${statusCircle}</div>
      <div>VNG Status: ${vngStatusCircle}</div>
      <div>Downloads: <span id="downloads-${script.id}">${downloadCounts[script.id]}</span></div>
    </div>

    <div class="card-actions" style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
      <button class="btn-card discord-btn" data-discord="${script.discord || '#'}">
        <i class="fab fa-discord"></i> Discord
      </button>
      <button class="btn-card download" data-id="${script.id}">
        <i class="fas fa-download"></i> Download
      </button>
      ${script.vng ? `<button class="btn-card vng-btn" data-id="${script.id}"><i class="fas fa-bolt"></i> VNG</button>` : ""}
    </div>
  </div>
</article>
`;
}

// ===================================
// RENDER CARDS
// ===================================
function renderScriptCards() {
  const container = document.getElementById('scriptCards');
  if (!container) return;
  if (!window.scriptData || !Array.isArray(window.scriptData)) {
    container.innerHTML = '<p style="text-align:center;color:white;">No scripts available</p>';
    return;
  }
  container.innerHTML = window.scriptData.map(createScriptCard).join('');
  updateDynamicButtons();
}

// ===================================
// PLATFORM POPUP
// ===================================
let selectedPlatform = null;
let currentScriptLinks = null;

function openPlatformPopup(script) {
  const popup = document.getElementById("platformPopup");
  const list = document.getElementById("popupPlatforms");
  list.innerHTML = "";
  selectedPlatform = null;
  currentScriptLinks = {};

  // Map each supported platform to its download URL
  (script.platforms || []).forEach(p => {
    const platformKey = p.toLowerCase();
    currentScriptLinks[platformKey] = script.downloadLinks?.[platformKey] || script.download || '#';

    const li = document.createElement("li");
    li.textContent = p;
    li.addEventListener("click", () => {
      selectedPlatform = platformKey;
      [...list.children].forEach(c => c.classList.remove("selected"));
      li.classList.add("selected");
    });
    list.appendChild(li);
  });

  popup.style.display = "flex";
}

document.getElementById("popupCancelBtn").addEventListener("click", () => {
  document.getElementById("platformPopup").style.display = "none";
});

document.getElementById("popupDownloadBtn").addEventListener("click", () => {
  if (!selectedPlatform) return alert("Please select a platform first!");
  const url = currentScriptLinks[selectedPlatform];
  if (url) window.open(url, "_blank");
  document.getElementById("platformPopup").style.display = "none";
});

// ===================================
// DYNAMIC BUTTONS
// ===================================
function updateDynamicButtons() {
  document.querySelectorAll('.discord-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-discord');
      if (url && url !== '#') window.open(url, '_blank');
    });
  });

  document.querySelectorAll('.download, .vng-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const script = (window.scriptData || []).find(s => s.id === id);
      if (!script) return;

      if (script.platforms && script.platforms.length) {
        openPlatformPopup(script);
        downloadCounts[id] = (downloadCounts[id] || 0) + 1;
        localStorage.setItem('downloadCounts', JSON.stringify(downloadCounts));
        document.getElementById(`downloads-${id}`).textContent = downloadCounts[id];
      } else {
        const url = btn.getAttribute('data-url') || script.download;
        if (url && url !== '#') window.open(url, '_blank');
      }
    });
  });
}

// ===================================
// ANIMATION & TYPING
// ===================================
function animateTypingTitles() {
  document.querySelectorAll('.card-title').forEach(title => {
    const text = title.getAttribute('data-text') || '';
    const wrapper = title.querySelector('.typing-wrapper');
    if (!wrapper || !text) return;
    wrapper.innerHTML = '';
    text.split('').forEach((char, index) => {
      const span = document.createElement('span');
      span.className = 'typing-char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.setAttribute('aria-hidden', 'true');
      wrapper.appendChild(span);
      setTimeout(() => span.classList.add('visible'), index * 50);
    });
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animated');
      animateTypingTitles();
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

function animateCounters() {
  document.querySelectorAll('.stat-number').forEach(counter => {
    const target = parseInt(counter.getAttribute('data-count')) || 0;
    const current = parseInt(counter.textContent) || 0;
    if (current !== target && target > 0) {
      const increment = Math.max(1, Math.ceil(target / 50));
      const timer = setInterval(() => {
        const currentValue = parseInt(counter.textContent) || 0;
        if (currentValue < target) {
          counter.textContent = Math.min(currentValue + increment, target);
        } else {
          counter.textContent = target;
          clearInterval(timer);
        }
      }, 50);
    }
  });
}

function initializeAnimations() {
  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
}

// ===================================
// IMAGE ERROR HANDLING
// ===================================
function handleImageErrors() {
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', (e) => {
      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23111' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23666' font-family='monospace' font-size='14'%3EImage not found%3C/text%3E%3C/svg%3E";
    });
  });
}

// ===================================
// INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', () => {
  renderScriptCards();
  updateDynamicButtons();
  initializeAnimations();
  handleImageErrors();
  setTimeout(() => showNotification('Welcome Back Anonymous! 🔥'), 1000);
});
