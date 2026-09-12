/* =====================================================================
   DRONAGIRI TRADERS — Dry Fruits storefront logic
   ---------------------------------------------------------------------
   ✏️  TO UPDATE PRODUCTS / RATES / QUANTITIES:
       Edit the DRY_FRUITS array below. Each item:
         en      : English name
         mr      : Marathi name
         baseQty : pack size in grams (e.g. 250)
         baseRate: price per pack in ₹ (e.g. 250)
         icon    : emoji shown on the card
       Adding/removing items here automatically updates the page,
       the cart, and the WhatsApp order message. CSS stays untouched.
   ✏️  TO CHANGE THE WHATSAPP / CONTACT NUMBER:
       Edit WHATSAPP below (include country code, no +).
   ===================================================================== */

const WHATSAPP = "918007657370"; // <-- business WhatsApp number (91 + 8007657370)

const DRY_FRUITS = [
  { en: "Cashew Nuts",      mr: "काजू",         baseQty: 250, baseRate: 250, icon: "🥜" },
  { en: "Almonds",          mr: "बदाम",         baseQty: 250, baseRate: 275, icon: "🌰" },
  { en: "Figs",             mr: "अंजीर",        baseQty: 250, baseRate: 300, icon: "🍈" },
  { en: "Walnuts",          mr: "अखरोट",       baseQty: 200, baseRate: 300, icon: "🌰" },
  { en: "Pistachios",       mr: "पिस्ता",       baseQty: 200, baseRate: 320, icon: "🟢" },
  { en: "Apricot",          mr: "जर्दाळू",      baseQty: 250, baseRate: 160, icon: "🟠" },
  { en: "Black Raisins",    mr: "काळी मनुका",  baseQty: 250, baseRate: 130, icon: "🟣" },
  { en: "Golden Raisins",   mr: "सोना मनुका",  baseQty: 250, baseRate: 130, icon: "🟡" },
  { en: "Royal Kalmi Dates",mr: "रॉयल कलमी खजूर", baseQty: 250, baseRate: 170, icon: "🌴" },
  { en: "Blue Berries",     mr: "ब्लू बेरी",   baseQty: 200, baseRate: 280, icon: "🔵" },
  { en: "Yellow Dry Dates", mr: "पिवळा खारीक", baseQty: 250, baseRate: 100, icon: "🟡" },
  { en: "Black Dry Dates",  mr: "काळा खारीक",  baseQty: 250, baseRate: 100, icon: "⚫" },
  { en: "Mix Seeds",        mr: "मिक्स बीज",   baseQty: 250, baseRate: 140, icon: "🌱" },
  { en: "Masala Kaju",      mr: "मसाला काजू",  baseQty: 200, baseRate: 240, icon: "🥨" },
  { en: "Salted Kaju",      mr: "सॉल्टेड काजू", baseQty: 200, baseRate: 240, icon: "🥜" },
  { en: "Roasted Badam",    mr: "रोस्टेड बदाम", baseQty: 200, baseRate: 240, icon: "🔥" },
];

/* ---------- App state ---------- */
const cart = new Map(); // key = index in DRY_FRUITS -> packs (integer >= 1)

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");
const inr = (n) => Number(n).toLocaleString("en-IN");

/* ---------- Render rate cards ---------- */
const grid = document.getElementById("grid");
DRY_FRUITS.forEach((d, i) => {
  const perGm = d.baseRate / d.baseQty;
  const el = document.createElement("article");
  el.className = "card reveal";
  el.style.setProperty("--d", (i % 4) * 0.06 + "s");
  el.dataset.i = i;
  el.innerHTML = `
    <div class="card__top">
      <div class="card__icon">${d.icon}</div>
      <div class="card__names">
        <span class="card__en">${d.en}</span>
        <span class="card__mr" lang="mr">${d.mr}</span>
      </div>
    </div>
    <div class="card__price">
      <span class="card__rate">${fmt(d.baseRate)}</span>
      <span class="card__pack">${d.baseQty}gm</span>
    </div>
    <div class="card__pergm">Rate: ${fmt(perGm.toFixed(2))} / gm</div>
    <div class="stepper">
      <button class="step-btn" data-act="dec" aria-label="Decrease ${d.en}">−</button>
      <div class="qty-box">
        <div class="qty-box__n" data-n="0">0</div>
        <div class="qty-box__gm" data-gm>0 gm</div>
        <div class="qty-box__amt" data-amt>${fmt(0)}</div>
      </div>
      <button class="step-btn" data-act="inc" aria-label="Add ${d.en}">+</button>
    </div>`;
  grid.appendChild(el);
});

/* ---------- Stepper interaction ---------- */
grid.addEventListener("click", (e) => {
  const btn = e.target.closest(".step-btn");
  if (!btn) return;
  const card = btn.closest(".card");
  const i = +card.dataset.i;
  const act = btn.dataset.act;
  let packs = cart.get(i) || 0;
  packs = act === "inc" ? packs + 1 : Math.max(0, packs - 1);
  if (packs > 0) cart.set(i, packs); else cart.delete(i);
  syncCard(i);
  bumpBadge();
  renderCart();
});

function syncCard(i) {
  const card = grid.querySelector(`[data-i="${i}"]`);
  const d = DRY_FRUITS[i];
  const packs = cart.get(i) || 0;
  const grams = packs * d.baseQty;
  const amt = packs * d.baseRate;
  card.querySelector("[data-n]").textContent = packs;
  card.querySelector("[data-gm]").textContent = grams ? `${grams} gm` : "0 gm";
  card.querySelector("[data-amt]").textContent = fmt(amt);
  card.classList.toggle("is-in", packs > 0);
  card.querySelector('[data-act="dec"]').disabled = packs === 0;
}
function bumpBadge() {
  const b = document.getElementById("cartBadge");
  const n = totalPacks();
  b.textContent = n;
  b.classList.toggle("is-on", n > 0);
  b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump");
}

/* ---------- Cart helpers ---------- */
function totalPacks() { let t = 0; for (const v of cart.values()) t += v; return t; }
function grandTotal() {
  let t = 0; cart.forEach((packs, i) => t += packs * DRY_FRUITS[i].baseRate); return t;
}

/* ---------- Render cart drawer ---------- */
const cartBody = document.getElementById("cartBody");
const cartEmpty = document.getElementById("cartEmpty");
const cartFoot = document.getElementById("cartFoot");
const grandTotalEl = document.getElementById("grandTotal");
const minibar = document.getElementById("minibar");
const minibarCount = document.getElementById("minibarCount");
const minibarTotal = document.getElementById("minibarTotal");

function renderCart() {
  cartBody.innerHTML = "";
  const hasItems = cart.size > 0;
  cartEmpty.style.display = hasItems ? "none" : "flex";
  cartFoot.hidden = !hasItems;

  cart.forEach((packs, i) => {
    const d = DRY_FRUITS[i];
    const grams = packs * d.baseQty;
    const amt = packs * d.baseRate;
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div class="cart-item__icon">${d.icon}</div>
      <div class="cart-item__info">
        <div class="cart-item__name">${d.en} <span lang="mr">${d.mr}</span></div>
        <div class="cart-item__meta">${packs} × ${d.baseQty}gm = ${grams}gm</div>
      </div>
      <div class="stepper">
        <button class="step-btn" data-cdec="${i}" aria-label="Decrease">−</button>
        <div class="qty-box"><div class="qty-box__n">${packs}</div><div class="cart-item__amt">${fmt(amt)}</div></div>
        <button class="step-btn" data-cinc="${i}" aria-label="Increase">+</button>
      </div>`;
    cartBody.appendChild(row);
  });

  grandTotalEl.textContent = fmt(grandTotal());

  // mini bar (mobile)
  const n = totalPacks();
  minibarCount.textContent = `${n} item${n === 1 ? "" : "s"}`;
  minibarTotal.textContent = fmt(grandTotal());
  minibar.hidden = n === 0 || window.innerWidth >= 980;
}

cartBody.addEventListener("click", (e) => {
  const inc = e.target.closest("[data-cinc]");
  const dec = e.target.closest("[data-cdec]");
  if (inc) { const i = +inc.dataset.cinc; cart.set(i, (cart.get(i)||0)+1); }
  else if (dec) { const i = +dec.dataset.cdec; let p = (cart.get(i)||0)-1; if (p<=0) cart.delete(i); else cart.set(i,p); }
  else return;
  syncCard(inc ? +inc.dataset.cinc : +dec.dataset.cdec);
  bumpBadge(); renderCart();
});

/* ---------- Drawer open/close ---------- */
const drawer = document.getElementById("drawer");
const overlay = document.getElementById("overlay");
function openCart() { drawer.classList.add("open"); overlay.classList.add("open"); drawer.setAttribute("aria-hidden","false"); document.body.style.overflow = "hidden"; }
function closeCart() { drawer.classList.remove("open"); overlay.classList.remove("open"); drawer.setAttribute("aria-hidden","true"); document.body.style.overflow = ""; }
document.getElementById("cartBtn").addEventListener("click", openCart);
document.getElementById("minibarBtn").addEventListener("click", openCart);
document.getElementById("closeDrawer").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

/* ---------- Clear cart ---------- */
document.getElementById("clearBtn").addEventListener("click", () => {
  if (!cart.size) return;
  if (!confirm("Clear all items from the cart?")) return;
  cart.clear();
  DRY_FRUITS.forEach((_, i) => syncCard(i));
  bumpBadge(); renderCart();
});

/* ---------- Checkout modal ---------- */
const modal = document.getElementById("modal");
const checkoutBtn = document.getElementById("checkoutBtn");
const orderForm = document.getElementById("orderForm");
const orderSummary = document.getElementById("orderSummary");

checkoutBtn.addEventListener("click", () => {
  if (!cart.size) return;
  orderSummary.innerHTML = buildSummaryHTML();
  modal.classList.add("open");
  modal.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
});
function closeModal() { modal.classList.remove("open"); modal.setAttribute("aria-hidden","true"); document.body.style.overflow = ""; }
document.getElementById("closeModal").addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

function buildSummaryHTML() {
  let html = "<strong>Order Summary</strong><br>";
  cart.forEach((packs, i) => {
    const d = DRY_FRUITS[i];
    html += `${d.en} (${d.mr}) — ${packs}×${d.baseQty}gm = <strong>${fmt(packs*d.baseRate)}</strong><br>`;
  });
  html += `<br><strong>Grand Total: ${fmt(grandTotal())}</strong>`;
  return html;
}

/* ---------- Submit → WhatsApp ---------- */
orderForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!cart.size) return;
  const fd = new FormData(orderForm);
  const name = (fd.get("name")||"").toString().trim();
  const phone = (fd.get("phone")||"").toString().trim();
  const address = (fd.get("address")||"").toString().trim();

  const lines = [];
  lines.push("🛒 *DRONAGIRI TRADERS — New Order*");
  lines.push("द्रोणागिरी ट्रेडर्स");
  lines.push("");
  lines.push(`👤 Name: ${name}`);
  lines.push(`📞 Phone: ${phone}`);
  lines.push(`📍 Address: ${address}`);
  lines.push("");
  lines.push("📦 *Order Details:*");
  let idx = 1;
  cart.forEach((packs, i) => {
    const d = DRY_FRUITS[i];
    const grams = packs * d.baseQty;
    const amt = packs * d.baseRate;
    lines.push(`${idx}. ${d.en} (${d.mr})`);
    lines.push(`   ${packs} × ${d.baseQty}gm = ${grams}gm  →  ${fmt(amt)}`);
    idx++;
  });
  lines.push("");
  lines.push(`💰 *Grand Total: ${fmt(grandTotal())}*`);
  lines.push("");
  lines.push("🚚 Free Home Delivery in Dronagiri");
  lines.push("🙏 Thank you for your order!");

  const text = encodeURIComponent(lines.join("\n"));
  const url = `https://wa.me/${WHATSAPP}?text=${text}`;
  window.open(url, "_blank");
  closeModal();
});

/* ---------- Reveal on scroll ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

/* ---------- Misc ---------- */
document.getElementById("year").textContent = new Date().getFullYear();
window.addEventListener("resize", () => { minibar.hidden = cart.size === 0 || window.innerWidth >= 980; });

// initial paint
renderCart();
