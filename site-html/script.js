// ===== Données du catalogue =====
const products = [
  {
    id: "photobooth-360",
    name: "Photobooth 360°",
    category: "Visuel & Souvenirs",
    grid: "grid-visuel",
    icon: "🎥",
    desc: "Vidéos immersives à 360° pour des souvenirs uniques.",
    price: "450 €",
    deposit: "Acompte : 30%",
    totalQuantity: 2,
    available: true,
  },
  {
    id: "photobooth-normal",
    name: "Photobooth normal / Box photo",
    category: "Visuel & Souvenirs",
    grid: "grid-visuel",
    icon: "📸",
    desc: "Impression instantanée pour le plaisir de vos invités.",
    price: "350 €",
    deposit: "Acompte : 30%",
    totalQuantity: 3,
    available: true,
  },
  {
    id: "livre-or-audio",
    name: "Livre d'or audio",
    category: "Visuel & Souvenirs",
    grid: "grid-visuel",
    icon: "🎙️",
    desc: "Enregistrement de messages vocaux, un souvenir précieux.",
    price: "150 €",
    deposit: "Acompte : 50 €",
    totalQuantity: 4,
    available: true,
  },
  {
    id: "photo-video",
    name: "Prestations Photos & Vidéos",
    category: "Visuel & Souvenirs",
    grid: "grid-visuel",
    icon: "🎬",
    desc: "Photographe et vidéaste professionnels sur votre événement.",
    price: "800 €",
    deposit: "Acompte : 30%",
    totalQuantity: 2,
    available: true,
  },
  {
    id: "fontaine-bienvenue",
    name: "Fontaine de bienvenue",
    category: "Animation & Bars",
    grid: "grid-bars",
    icon: "🍾",
    desc: "Fontaine spectaculaire pour accueillir vos invités.",
    price: "250 €",
    deposit: "Acompte : 30%",
    totalQuantity: 1,
    available: true,
  },
  {
    id: "bar-halal",
    name: "Bar Halal",
    category: "Animation & Bars",
    grid: "grid-bars",
    icon: "🍹",
    desc: "Mocktails et boissons sans alcool préparés sur place.",
    price: "600 €",
    deposit: "Acompte : 30%",
    totalQuantity: 2,
    available: true,
  },
  {
    id: "bar-personnalise",
    name: "Bar personnalisé",
    category: "Animation & Bars",
    grid: "grid-bars",
    icon: "🥂",
    desc: "Bar sur mesure : logos, prénoms, thématique à votre image.",
    price: "700 €",
    deposit: "Acompte : 30%",
    totalQuantity: 1,
    available: true,
  },
  {
    id: "planche-cocktails",
    name: "Planche de cocktails",
    category: "Animation & Bars",
    grid: "grid-bars",
    icon: "🍸",
    desc: "Présentation et dégustation de cocktails raffinés.",
    price: "400 €",
    deposit: "Acompte : 30%",
    totalQuantity: 2,
    available: true,
  },
  {
    id: "plexiglas-personnalise",
    name: "Plexiglas personnalisé",
    category: "Signalétique",
    grid: "grid-signaletique",
    icon: "🪧",
    desc: "Panneaux de bienvenue, menus et plans de table sur mesure.",
    price: "200 €",
    deposit: "Acompte : 80 €",
    totalQuantity: 3,
    available: true,
  },
  { id: "decorations", name: "Décorations", grid: "grid-soon", icon: "🌸", desc: "Décoration complète sur mesure.", available: false },
  { id: "petits-fours", name: "Petits fours", grid: "grid-soon", icon: "🍢", desc: "Service traiteur pour vos invités.", available: false },
  { id: "location-vaisselle", name: "Location de vaisselle", grid: "grid-soon", icon: "🍽️", desc: "Vaisselle haut de gamme pour votre table.", available: false },
  { id: "barnum", name: "Barnum", grid: "grid-soon", icon: "⛺", desc: "Tentes et tonnelles pour vos événements en extérieur.", available: false },
];

// ===== Stock réservé (simulation locale, persistée dans le navigateur) =====
const BOOKINGS_KEY = "yalm_bookings";

function getBookings() {
  try {
    return JSON.parse(localStorage.getItem(BOOKINGS_KEY)) || {};
  } catch {
    return {};
  }
}

function getReservedCount(productId, dateStr) {
  const bookings = getBookings();
  return bookings[productId]?.[dateStr] || 0;
}

function reserveDate(productId, dateStr) {
  const bookings = getBookings();
  bookings[productId] = bookings[productId] || {};
  bookings[productId][dateStr] = (bookings[productId][dateStr] || 0) + 1;
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

function getRemaining(product, dateStr) {
  return Math.max(0, product.totalQuantity - getReservedCount(product.id, dateStr));
}

// ===== Rendu des cartes =====
function renderCatalogue() {
  products.forEach((p) => {
    const container = document.getElementById(p.grid);
    if (!container) return;

    const card = document.createElement("div");
    card.className = p.available ? "card card--clickable" : "card card--soon";

    card.innerHTML = p.available
      ? `
        <div class="card__icon">${p.icon}</div>
        <h4>${p.name}</h4>
        <p class="desc">${p.desc}</p>
        <div class="card__footer">
          <span class="card__price">${p.price}</span>
          <span class="card__deposit">${p.deposit}</span>
        </div>
      `
      : `
        <div class="card__icon">${p.icon}</div>
        <h4>${p.name}</h4>
        <p class="desc">${p.desc}</p>
        <span class="badge">Bientôt de retour</span>
      `;

    if (p.available) {
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.addEventListener("click", () => openModal(p));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal(p);
        }
      });
    }

    container.appendChild(card);
  });

  // Remplir le select du formulaire avec les prestations disponibles
  const select = document.getElementById("service");
  products
    .filter((p) => p.available)
    .forEach((p) => {
      const option = document.createElement("option");
      option.value = p.name;
      option.textContent = p.name;
      select.appendChild(option);
    });
}

// ===== Modale de sélection de date =====
let currentProduct = null;

function openModal(product) {
  currentProduct = product;

  document.getElementById("modal-icon").textContent = product.icon;
  document.getElementById("modal-title").textContent = product.name;
  document.getElementById("modal-desc").textContent = product.desc;
  document.getElementById("modal-price").textContent = product.price;
  document.getElementById("modal-deposit").textContent = product.deposit;

  const dateInput = document.getElementById("modal-date");
  const today = new Date().toISOString().split("T")[0];
  dateInput.min = today;
  dateInput.value = "";

  const hint = document.getElementById("modal-hint");
  hint.textContent = "Sélectionnez une date pour vérifier la disponibilité.";
  hint.className = "modal__hint";

  const confirmBtn = document.getElementById("modal-confirm");
  confirmBtn.disabled = true;
  confirmBtn.textContent = "Vérifier & demander cette date";

  document.getElementById("modal-overlay").classList.add("is-open");
  document.body.style.overflow = "hidden";
  setTimeout(() => dateInput.focus(), 100);
}

function closeModal() {
  document.getElementById("modal-overlay").classList.remove("is-open");
  document.body.style.overflow = "";
  currentProduct = null;
}

function checkAvailability() {
  const dateInput = document.getElementById("modal-date");
  const hint = document.getElementById("modal-hint");
  const confirmBtn = document.getElementById("modal-confirm");

  if (!dateInput.value || !currentProduct) {
    hint.textContent = "Sélectionnez une date pour vérifier la disponibilité.";
    hint.className = "modal__hint";
    confirmBtn.disabled = true;
    return;
  }

  const remaining = getRemaining(currentProduct, dateInput.value);
  const formattedDate = new Date(dateInput.value).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (remaining > 0) {
    hint.textContent =
      currentProduct.totalQuantity > 1
        ? `Disponible le ${formattedDate} (${remaining} unité${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}).`
        : `Disponible le ${formattedDate}.`;
    hint.className = "modal__hint is-available";
    confirmBtn.disabled = false;
  } else {
    hint.textContent = `Complet le ${formattedDate}. Merci de choisir une autre date.`;
    hint.className = "modal__hint is-unavailable";
    confirmBtn.disabled = true;
  }
}

function confirmBooking() {
  const dateInput = document.getElementById("modal-date");
  if (!currentProduct || !dateInput.value) return;

  reserveDate(currentProduct.id, dateInput.value);

  // Pré-remplit le formulaire de contact avec la prestation et la date choisies
  document.getElementById("service").value = currentProduct.name;
  document.getElementById("date").value = dateInput.value;

  closeModal();

  const contactSection = document.getElementById("contact");
  contactSection.scrollIntoView({ behavior: "smooth" });

  const note = document.getElementById("form-note");
  note.textContent = `Date présélectionnée pour "${currentProduct.name}". Complétez vos coordonnées pour confirmer votre demande.`;
}

function setupModal() {
  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("modal-overlay").addEventListener("click", (e) => {
    if (e.target.id === "modal-overlay") closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
  document.getElementById("modal-date").addEventListener("change", checkAvailability);
  document.getElementById("modal-confirm").addEventListener("click", confirmBooking);
}

// ===== Animation au scroll =====
function setupScrollReveal() {
  const cards = document.querySelectorAll(".card");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  cards.forEach((card) => observer.observe(card));
}

// ===== Menu mobile =====
function setupMobileMenu() {
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  burger.addEventListener("click", () => {
    nav.classList.toggle("is-open");
  });
  nav.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => nav.classList.remove("is-open"))
  );
}

// ===== Formulaire de contact =====
function setupContactForm() {
  const form = document.getElementById("contact-form");
  const note = document.getElementById("form-note");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const date = document.getElementById("date").value;
    const service = document.getElementById("service").value;
    const message = document.getElementById("message").value.trim();

    const subject = encodeURIComponent(`Demande de devis — ${service || "Événement"}`);
    const body = encodeURIComponent(
      `Nom : ${name}\nEmail : ${email}\nDate envisagée : ${date || "non précisée"}\nPrestation : ${service || "à définir"}\n\nMessage :\n${message}`
    );

    window.location.href = `mailto:contact@yalm-events.fr?subject=${subject}&body=${body}`;

    note.textContent = "Votre client email va s'ouvrir pour finaliser l'envoi de votre demande.";
    form.reset();
  });
}

// ===== Init =====
document.getElementById("year").textContent = new Date().getFullYear();
renderCatalogue();
setupModal();
setupScrollReveal();
setupMobileMenu();
setupContactForm();
