// ===================================
// CARD RENDERING FROM JSON
// ===================================
function createScriptCard(script) {
  const tagsHtml = (script.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('');

  // card icon by category
  let icon = "fa-code";
  if (script.category && script.category.toLowerCase().includes("utility")) icon = "fa-earth-americas";
  if (script.category && script.category.toLowerCase().includes("helper")) icon = "fa-tools";
  if (script.category && script.category.toLowerCase().includes("creative")) icon = "fa-palette";

  // platform icons
  const platformIcons = (script.platforms || []).map(p => {
    if (p.toLowerCase() === "pc") return `<i class="fas fa-desktop" title="PC"></i>`;
    if (p.toLowerCase() === "android") return `<i class="fab fa-android" title="Android"></i>`;
    if (p.toLowerCase() === "ios") return `<i class="fab fa-apple" title="iOS"></i>`;
    return "";
  }).join(" ");

  // architecture / global / VNG
  const archInfo = script.arch ? `<span class="arch-label">${script.arch}</span>` : "";
  const vngLabel = script.vng ? `<span class="vng-label">VNG</span>` : "";

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

    <div class="card-platforms">
      ${platformIcons} ${archInfo} ${vngLabel}
    </div>

    <div class="card-actions">
      <button class="btn-card discord-btn" data-discord="${script.discord || '#'}">
        <i class="fab fa-discord"></i>
        <span>Discord</span>
      </button>
      <button class="btn-card download" data-url="${script.download || '#'}">
        <i class="fas fa-download"></i>
        <span>Download</span>
      </button>
      ${script.vng ? `<button class="btn-card vng-btn">VNG</button>` : ""}
    </div>
  </div>
</article>
`;
}

function renderScriptCards() {
  const container = document.getElementById('scriptCards');
  if (!container) {
    console.error('Script cards container not found!');
    return;
  }
  if (!window.scriptData || !Array.isArray(window.scriptData)) {
    console.error('Script data not found or invalid!');
    container.innerHTML = '<p style="text-align: center; color: white;">No scripts available</p>';
    return;
  }
  container.innerHTML = window.scriptData.map(createScriptCard).join('');
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

function initializeAnimations() {
  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
}

// ===================================
// EVENT LISTENERS
// ===================================
function initializeEventListeners() {
  // scroll button
  document.getElementById('exploreBtn')?.addEventListener('click', () => {
    document.getElementById('scriptCards')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Update dynamic buttons
  updateDynamicButtons();

  // mobile menu
  const menuToggleBtn = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  menuToggleBtn?.addEventListener('click', () => {
    menuToggleBtn.classList.toggle('active');
    mobileMenu.classList.toggle('show');
  });
}

// Update buttons after rendering
function updateDynamicButtons() {
  // Discord buttons
  document.querySelectorAll('.discord-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-discord');
      if (url && url !== '#') window.open(url, '_blank');
    });
  });

  // Download buttons
  document.querySelectorAll('.download').forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-url');
      if (url && url !== '#') window.open(url, '_blank');
    });
  });

  // VNG buttons (optional, show alert)
  document.querySelectorAll('.vng-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showNotification('This executor supports VNG!', 'success');
    });
  });
}

// ===================================
// NOTIFICATION
// ===================================
function showNotification(message, type = 'success') {
  document.querySelectorAll('.notification').forEach(n => n.remove());
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${type === 'success' ? 'fa-check' : 'fa-exclamation-circle'}"></i>
      <span>${message}</span>
    </div>
  `;
  document.body.appendChild(notification);
  requestAnimationFrame(() => notification.style.transform = 'translateX(0)');
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
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
  initializeEventListeners();
  initializeAnimations();
  handleImageErrors();
  setTimeout(() => showNotification('Welcome Back Anonymous! 🔥'), 1000);
});
