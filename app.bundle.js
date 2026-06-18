var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// data/constants.js
var PREFIX, STORAGE_KEYS, SEED_VERSION, ROUTES, POPULAR_SEARCHES;
var init_constants = __esm({
  "data/constants.js"() {
    PREFIX = "turistando_";
    STORAGE_KEYS = {
      ENTITIES: "entities",
      USERS: "users",
      SESSION: "session",
      FAVORITES: "favorites",
      WISHLIST: "wishlist",
      HISTORY: "history",
      ITINERARIES: "itineraries",
      REVIEWS: "reviews",
      PREFERENCES: "preferences",
      THEME: "theme",
      A11Y: "a11y",
      SEED_VERSION: "seed_version"
    };
    SEED_VERSION = "2.0.0";
    ROUTES = {
      HOME: "/",
      SEARCH: "/busca",
      CITY: "/cidade/:slug",
      BEACH: "/praia/:slug",
      HOTEL: "/hotel/:slug",
      RESTAURANT: "/restaurante/:slug",
      TOUR: "/passeio/:slug",
      EVENT: "/evento/:slug",
      MAP: "/mapa",
      PLANNER: "/planejar",
      PROFILE: "/perfil",
      REGISTER: "/cadastrar",
      ABOUT: "/sobre"
    };
    POPULAR_SEARCHES = [
      "Fortaleza",
      "Jericoacoara",
      "Praia",
      "Hotel beira-mar",
      "Gastronomia",
      "Canoa Quebrada",
      "Passeio buggy"
    ];
  }
});

// scripts/event-bus.js
var EventBus, eventBus, EVENTS;
var init_event_bus = __esm({
  "scripts/event-bus.js"() {
    EventBus = class {
      constructor() {
        this._listeners = /* @__PURE__ */ new Map();
      }
      on(event, callback) {
        if (!this._listeners.has(event)) this._listeners.set(event, /* @__PURE__ */ new Set());
        this._listeners.get(event).add(callback);
        return () => this.off(event, callback);
      }
      off(event, callback) {
        this._listeners.get(event)?.delete(callback);
      }
      emit(event, data) {
        this._listeners.get(event)?.forEach((cb) => cb(data));
        window.dispatchEvent(new CustomEvent(event, { detail: data }));
      }
    };
    eventBus = new EventBus();
    EVENTS = {
      STORAGE_UPDATED: "turistando:storage-updated",
      FAVORITE_TOGGLED: "turistando:favorite-toggled",
      AUTH_CHANGED: "turistando:auth-changed",
      THEME_CHANGED: "turistando:theme-changed",
      ROUTE_CHANGED: "turistando:route-changed"
    };
  }
});

// scripts/router.js
var router_exports = {};
__export(router_exports, {
  router: () => router
});
var routeDefinitions, Router, router;
var init_router = __esm({
  "scripts/router.js"() {
    init_constants();
    init_event_bus();
    routeDefinitions = [
      { path: ROUTES.HOME, name: "home" },
      { path: ROUTES.SEARCH, name: "search" },
      { path: ROUTES.CITY, name: "city" },
      { path: ROUTES.BEACH, name: "beach" },
      { path: ROUTES.HOTEL, name: "hotel" },
      { path: ROUTES.RESTAURANT, name: "restaurant" },
      { path: ROUTES.TOUR, name: "tour" },
      { path: ROUTES.EVENT, name: "event" },
      { path: ROUTES.MAP, name: "map" },
      { path: ROUTES.PLANNER, name: "planner" },
      { path: ROUTES.PROFILE, name: "profile" },
      { path: ROUTES.REGISTER, name: "register" },
      { path: ROUTES.ABOUT, name: "about" }
    ];
    Router = class {
      constructor() {
        this._routes = routeDefinitions;
        this._handlers = /* @__PURE__ */ new Map();
        this._current = null;
        this._guards = [];
      }
      register(name, handler) {
        this._handlers.set(name, handler);
      }
      addGuard(guard) {
        this._guards.push(guard);
      }
      init() {
        window.addEventListener("popstate", () => this.resolve());
        document.addEventListener("click", (e) => {
          const link = e.target.closest("a[data-nav]");
          if (link) {
            e.preventDefault();
            this.navigate(link.getAttribute("href"));
          }
        });
        this.resolve();
      }
      navigate(path, replace = false) {
        const url = path.startsWith("/") ? path : `/${path}`;
        if (replace) {
          history.replaceState(null, "", url);
        } else {
          history.pushState(null, "", url);
        }
        this.resolve();
      }
      getParams() {
        return this._current?.params || {};
      }
      getQuery() {
        return this._current?.query || {};
      }
      getPath() {
        return this._current?.path || "/";
      }
      getRouteName() {
        return this._current?.name || "notFound";
      }
      match(pathname) {
        let clean = pathname.split("?")[0].replace(/\/$/, "") || "/";
        if (clean.includes("/index.html")) {
          clean = "/";
        }
        for (const route of this._routes) {
          const pattern = route.path.replace(/:\w+/g, "([^/]+)");
          const regex = new RegExp(`^${pattern}$`);
          const match = clean.match(regex);
          if (match) {
            const paramNames = [...route.path.matchAll(/:(\w+)/g)].map((m) => m[1]);
            const params = {};
            paramNames.forEach((name, i) => {
              params[name] = match[i + 1];
            });
            const queryStr = pathname.includes("?") ? pathname.split("?")[1] : window.location.search.slice(1);
            const query = Object.fromEntries(new URLSearchParams(queryStr));
            return { ...route, params, query, path: clean };
          }
        }
        return { name: "notFound", path: clean, params: {}, query: {} };
      }
      async resolve() {
        const pathname = window.location.pathname + window.location.search;
        const matched = this.match(pathname);
        for (const guard of this._guards) {
          const result = await guard(matched);
          if (result === false) return;
          if (typeof result === "string") {
            this.navigate(result, true);
            return;
          }
        }
        this._current = matched;
        const handler = this._handlers.get(matched.name) || this._handlers.get("notFound");
        if (handler) {
          eventBus.emit(EVENTS.ROUTE_CHANGED, matched);
          await handler(matched);
        }
      }
      link(path) {
        return path;
      }
    };
    router = new Router();
  }
});

// scripts/components/toast.js
var toast_exports = {};
__export(toast_exports, {
  initToast: () => initToast,
  showToast: () => showToast
});
function initToast() {
  toastContainer = document.getElementById("toast-root");
}
function showToast(message, type = "info", duration = 3500) {
  if (!toastContainer) initToast();
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
var toastContainer;
var init_toast = __esm({
  "scripts/components/toast.js"() {
    toastContainer = null;
  }
});

// scripts/utils/dom.js
var dom_exports = {};
__export(dom_exports, {
  bindRevealAnimations: () => bindRevealAnimations,
  createElement: () => createElement,
  delegate: () => delegate,
  html: () => html,
  mount: () => mount,
  qs: () => qs,
  qsa: () => qsa
});
function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === "className") el.className = value;
    else if (key === "textContent") el.textContent = value;
    else if (key === "innerHTML") el.innerHTML = value;
    else if (key.startsWith("on") && typeof value === "function") {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === "dataset") {
      Object.entries(value).forEach(([k, v]) => {
        el.dataset[k] = v;
      });
    } else if (value !== null && value !== void 0) {
      el.setAttribute(key, value);
    }
  });
  const childList = Array.isArray(children) ? children : [children];
  childList.forEach((child) => {
    if (child == null) return;
    if (typeof child === "string") el.appendChild(document.createTextNode(child));
    else el.appendChild(child);
  });
  return el;
}
function html(strings, ...values) {
  return strings.reduce((acc, str, i) => acc + str + (values[i] ?? ""), "");
}
function qs(selector, parent = document) {
  return parent.querySelector(selector);
}
function qsa(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}
function delegate(parent, event, selector, handler) {
  parent.addEventListener(event, (e) => {
    const target = e.target.closest(selector);
    if (target && parent.contains(target)) handler(e, target);
  });
}
function mount(container, content) {
  container.innerHTML = "";
  if (typeof content === "string") {
    container.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    container.appendChild(content);
  }
}
function bindRevealAnimations(root = document) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  qsa(".reveal", root).forEach((el) => observer.observe(el));
}
var init_dom = __esm({
  "scripts/utils/dom.js"() {
  }
});

// scripts/storage/storage-manager.js
init_constants();

// data/seed.js
var IMG = {
  fortaleza: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80",
  jeri: "https://images.unsplash.com/photo-1596484552834-0650573cbe53?w=800&q=80",
  canoa: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
  beach: "https://images.unsplash.com/photo-1506953823976-d39a0b8e8b8e?w=800&q=80",
  hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099925?w=800&q=80",
  food: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
  tour: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
  serra: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  event: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
  cumbuco: "https://images.unsplash.com/photo-1473496166314-89c7a43e2581?w=800&q=80"
};
function entity(base) {
  return {
    rating: 4.5,
    reviewCount: 0,
    images: [base.coverImage],
    tags: [],
    amenities: [],
    schedule: null,
    metadata: {},
    ...base
  };
}
var seedEntities = [
  // === CIDADES (8) ===
  entity({ id: "city-fortaleza", slug: "fortaleza", type: "city", name: "Fortaleza", cityId: "city-fortaleza", cityName: "Fortaleza", category: "Capital", tags: ["praia", "gastronomia", "cultural", "noite"], coverImage: IMG.fortaleza, rating: 4.6, reviewCount: 342, description: "Capital do Cear\xE1, Fortaleza combina praias urbanas, vida noturna vibrante e rica cultura nordestina. A cidade \xE9 porta de entrada para o turismo cearense.", summary: "Capital vibrante com praias urbanas e cultura nordestina.", location: { lat: -3.7319, lng: -38.5267, address: "Fortaleza, CE" }, metadata: { bestSeason: "Junho a Janeiro", climate: "Tropical \xFAmido, 28\xB0C m\xE9dia", howToArrive: "Aeroporto Pinto Martins (FOR). \xD4nibus na rodovi\xE1ria central.", history: "Fundada em 1726, Fortaleza cresceu como importante porto e centro comercial do Nordeste.", curiosities: ["Ber\xE7o do humor cearense", "Maior destino tur\xEDstico do estado"], usefulInfo: { hospitals: ["Hospital Geral Dr. C\xE9sar Cals", "Hospital S\xE3o Carlos"], pharmacies: ["Drogasil Beira Mar", "Pague Menos Centro"], gasStations: ["Posto Ipiranga Aldeota", "Shell Meireles"] } } }),
  entity({ id: "city-jeri", slug: "jericoacoara", type: "city", name: "Jericoacoara", cityId: "city-jeri", cityName: "Jericoacoara", category: "Para\xEDso", tags: ["praia", "aventura", "natureza", "romantico"], coverImage: IMG.jeri, rating: 4.9, reviewCount: 521, description: "Jeri \xE9 um dos destinos mais desejados do Brasil. Dunas, lagoas cristalinas e p\xF4r do sol na Duna do P\xF4r do Sol.", summary: "Para\xEDso entre dunas, lagoas e mar cristalino.", location: { lat: -2.7951, lng: -40.5175, address: "Jericoacoara, CE" }, metadata: { bestSeason: "Julho a Dezembro", climate: "Tropical, ventos constantes", howToArrive: "4h de Fortaleza at\xE9 Jijoca + transfer 4x4 (30min)." } }),
  entity({ id: "city-canoa", slug: "canoa-quebrada", type: "city", name: "Canoa Quebrada", cityId: "city-canoa", cityName: "Canoa Quebrada", category: "Praia", tags: ["praia", "aventura", "noite", "casal"], coverImage: IMG.canoa, rating: 4.7, reviewCount: 289, description: "Vila de pescadores transformada em destino internacional. Fal\xE9sias coloridas, buggy e vida noturna na Broadway.", summary: "Fal\xE9sias, buggy e vida noturna \xE0 beira-mar.", location: { lat: -4.4889, lng: -37.7608, address: "Canoa Quebrada, CE" }, metadata: { bestSeason: "Agosto a Janeiro", climate: "Tropical, 27\xB0C" } }),
  entity({ id: "city-cumbuco", slug: "cumbuco", type: "city", name: "Cumbuco", cityId: "city-cumbuco", cityName: "Cumbuco", category: "Praia", tags: ["praia", "aventura", "kitesurf"], coverImage: IMG.cumbuco, rating: 4.5, reviewCount: 178, description: "Para\xEDso do kitesurf a 35km de Fortaleza. Dunas, lagoas e ventos perfeitos.", summary: "Capital do kitesurf cearense.", location: { lat: -3.6261, lng: -38.72, address: "Cumbuco, CE" } }),
  entity({ id: "city-guaramiranga", slug: "guaramiranga", type: "city", name: "Guaramiranga", cityId: "city-guaramiranga", cityName: "Guaramiranga", category: "Serra", tags: ["serra", "natureza", "frio", "gastronomia"], coverImage: IMG.serra, rating: 4.4, reviewCount: 156, description: "A Su\xED\xE7a Cearense. Clima ameno, gastronomia \xFAnica e trilhas na serra.", summary: "Clima ameno e gastronomia de serra.", location: { lat: -4.105, lng: -38.93, address: "Guaramiranga, CE" }, metadata: { bestSeason: "Junho a Agosto", climate: "Subtropical de altitude, 18-24\xB0C" } }),
  entity({ id: "city-sobral", slug: "sobral", type: "city", name: "Sobral", cityId: "city-sobral", cityName: "Sobral", category: "Hist\xF3rica", tags: ["cultural", "historico"], coverImage: IMG.serra, rating: 4.3, reviewCount: 98, description: "Cidade hist\xF3rica do interior com arquitetura colonial e o famoso eclipse solar de 1919.", summary: "Hist\xF3ria, ci\xEAncia e cultura no interior.", location: { lat: -3.6886, lng: -40.3497, address: "Sobral, CE" } }),
  entity({ id: "city-aquiraz", slug: "aquiraz", type: "city", name: "Aquiraz", cityId: "city-aquiraz", cityName: "Aquiraz", category: "Hist\xF3rica", tags: ["praia", "historico", "familia"], coverImage: IMG.beach, rating: 4.2, reviewCount: 87, description: "Uma das cidades mais antigas do Cear\xE1, com praias tranquilas e parque aqu\xE1tico.", summary: "Hist\xF3ria colonial e Beach Park.", location: { lat: -3.9014, lng: -38.3911, address: "Aquiraz, CE" } }),
  entity({ id: "city-crato", slug: "crato", type: "city", name: "Crato", cityId: "city-crato", cityName: "Crato", category: "Serra", tags: ["serra", "cultural", "natureza"], coverImage: IMG.serra, rating: 4.1, reviewCount: 76, description: "Portal da Chapada do Araripe com museus, gastronomia e ecoturismo.", summary: "Portal da Chapada do Araripe.", location: { lat: -7.234, lng: -39.4094, address: "Crato, CE" } }),
  // === PRAIAS (12) ===
  entity({ id: "beach-iracema", slug: "praia-de-iracema", type: "beach", name: "Praia de Iracema", cityId: "city-fortaleza", cityName: "Fortaleza", category: "Urbana", tags: ["praia", "cultural", "noite"], coverImage: IMG.beach, rating: 4.4, reviewCount: 210, description: "Praia urbana ic\xF4nica com Ponte dos Ingleses, bares e vida noturna.", summary: "\xCDcone de Fortaleza com ponte e bares.", location: { lat: -3.7186, lng: -38.5164, address: "Praia de Iracema, Fortaleza" } }),
  entity({ id: "beach-futuro", slug: "praia-do-futuro", type: "beach", name: "Praia do Futuro", cityId: "city-fortaleza", cityName: "Fortaleza", category: "Urbana", tags: ["praia", "gastronomia", "familia"], coverImage: IMG.beach, rating: 4.5, reviewCount: 189, description: "Famosa pelos barracas com frutos do mar frescos e \xE1guas calmas.", summary: "Barracas de frutos do mar \xE0 beira-mar.", location: { lat: -3.7428, lng: -38.4708, address: "Praia do Futuro, Fortaleza" } }),
  entity({ id: "beach-jeri-main", slug: "praia-principal-jeri", type: "beach", name: "Praia Principal de Jeri", cityId: "city-jeri", cityName: "Jericoacoara", category: "Paradis\xEDaca", tags: ["praia", "aventura", "romantico"], coverImage: IMG.jeri, rating: 4.9, reviewCount: 445, description: "Areia branca, mar azul-turquesa e ventos perfeitos para esportes.", summary: "Mar cristalino e dunas ao fundo.", location: { lat: -2.793, lng: -40.515, address: "Jericoacoara, CE" } }),
  entity({ id: "beach-pre\xE1", slug: "praia-do-pre\xE1", type: "beach", name: "Praia do Pre\xE1", cityId: "city-jeri", cityName: "Jericoacoara", category: "Kitesurf", tags: ["praia", "aventura", "kitesurf"], coverImage: IMG.beach, rating: 4.7, reviewCount: 167, description: "Uma das melhores praias do mundo para kitesurf.", summary: "Para\xEDso mundial do kitesurf.", location: { lat: -2.85, lng: -40.43, address: "Pre\xE1, CE" } }),
  entity({ id: "beach-canoa-main", slug: "praia-canoa-quebrada", type: "beach", name: "Praia de Canoa Quebrada", cityId: "city-canoa", cityName: "Canoa Quebrada", category: "Fal\xE9sias", tags: ["praia", "aventura"], coverImage: IMG.canoa, rating: 4.6, reviewCount: 234, description: "Praia ampla com fal\xE9sias coloridas e passeios de buggy.", summary: "Fal\xE9sias vermelhas e mar azul.", location: { lat: -4.49, lng: -37.758, address: "Canoa Quebrada, CE" } }),
  entity({ id: "beach-cumbuco-main", slug: "praia-cumbuco", type: "beach", name: "Praia de Cumbuco", cityId: "city-cumbuco", cityName: "Cumbuco", category: "Kitesurf", tags: ["praia", "aventura"], coverImage: IMG.cumbuco, rating: 4.5, reviewCount: 145, description: "Ventos constantes e dunas gigantes.", summary: "Dunas e kitesurf.", location: { lat: -3.624, lng: -38.718, address: "Cumbuco, CE" } }),
  entity({ id: "beach-lagoinha", slug: "lagoinha", type: "beach", name: "Lagoinha", cityId: "city-canoa", cityName: "Paraipaba", category: "Lagoa", tags: ["praia", "natureza", "familia"], coverImage: IMG.beach, rating: 4.6, reviewCount: 112, description: "Lagoa de \xE1guas calmas ideal para fam\xEDlias.", summary: "Lagoa cristalina entre dunas.", location: { lat: -3.43, lng: -39.03, address: "Lagoinha, CE" } }),
  entity({ id: "beach-morro-branco", slug: "morro-branco", type: "beach", name: "Morro Branco", cityId: "city-aquiraz", cityName: "Beberibe", category: "Fal\xE9sias", tags: ["praia", "natureza"], coverImage: IMG.beach, rating: 4.4, reviewCount: 198, description: "Fal\xE9sias multicoloridas esculpidas pela natureza.", summary: "Fal\xE9sias coloridas \xFAnicas.", location: { lat: -4.22, lng: -37.85, address: "Morro Branco, CE" } }),
  entity({ id: "beach-pacoti", slug: "praia-pacoti", type: "beach", name: "Praia de Pacoti", cityId: "city-guaramiranga", cityName: "Pacoti", category: "Tranquila", tags: ["praia", "natureza", "economico"], coverImage: IMG.beach, rating: 4.2, reviewCount: 67, description: "Praia tranquila e pouco explorada.", summary: "Ref\xFAgio tranquilo na costa.", location: { lat: -3.98, lng: -38.92, address: "Pacoti, CE" } }),
  entity({ id: "beach-meireles", slug: "praia-de-meireles", type: "beach", name: "Praia de Meireles", cityId: "city-fortaleza", cityName: "Fortaleza", category: "Urbana", tags: ["praia", "luxo"], coverImage: IMG.beach, rating: 4.3, reviewCount: 156, description: "Praia nobre com hot\xE9is de luxo e cal\xE7ad\xE3o.", summary: "Eleg\xE2ncia \xE0 beira-mar.", location: { lat: -3.7267, lng: -38.5, address: "Meireles, Fortaleza" } }),
  entity({ id: "beach-barrinha", slug: "barrinha", type: "beach", name: "Barrinha", cityId: "city-jeri", cityName: "Jericoacoara", category: "Lagoa", tags: ["praia", "natureza", "romantico"], coverImage: IMG.jeri, rating: 4.8, reviewCount: 134, description: "Lagoa escondida entre dunas com \xE1guas cristalinas.", summary: "Lagoa secreta de Jeri.", location: { lat: -2.81, lng: -40.49, address: "Barrinha, CE" } }),
  entity({ id: "beach-pontanegra", slug: "ponta-negra", type: "beach", name: "Ponta Negra", cityId: "city-canoa", cityName: "Natal", category: "Fam\xEDlia", tags: ["praia", "familia"], coverImage: IMG.beach, rating: 4, reviewCount: 45, description: "Praia familiar pr\xF3xima ao litoral leste.", summary: "Praia familiar tranquila.", location: { lat: -4.55, lng: -37.78, address: "Ponta Negra, CE" } }),
  // === HOTÉIS (16) ===
  entity({ id: "hotel-ocean", slug: "hotel-ocean-fortaleza", type: "hotel", name: "Hotel Ocean Fortaleza", cityId: "city-fortaleza", cityName: "Fortaleza", category: "Hotel", tags: ["luxo", "praia", "familia"], coverImage: IMG.hotel, rating: 4.7, reviewCount: 234, priceRange: { min: 350, max: 650, currency: "BRL" }, description: "Hotel 5 estrelas na Beira Mar com vista panor\xE2mica para o mar.", summary: "Luxo \xE0 beira-mar em Meireles.", location: { lat: -3.728, lng: -38.498, address: "Av. Beira Mar, 3000, Meireles" }, amenities: ["Piscina", "Spa", "Wi-Fi", "Estacionamento", "Academia", "Restaurante"] }),
  entity({ id: "hotel-blue-tree", slug: "blue-tree-premium", type: "hotel", name: "Blue Tree Premium Fortaleza", cityId: "city-fortaleza", cityName: "Fortaleza", category: "Hotel", tags: ["luxo", "casal"], coverImage: IMG.hotel, rating: 4.6, reviewCount: 189, priceRange: { min: 280, max: 520, currency: "BRL" }, description: "Rede premium com quartos amplos e caf\xE9 da manh\xE3 completo.", summary: "Conforto premium no Meireles.", location: { lat: -3.735, lng: -38.502, address: "Av. Beira Mar, 2500" }, amenities: ["Piscina", "Wi-Fi", "Caf\xE9 da manh\xE3", "Academia"] }),
  entity({ id: "hotel-holiday", slug: "holiday-inn-fortaleza", type: "hotel", name: "Holiday Inn Fortaleza", cityId: "city-fortaleza", cityName: "Fortaleza", category: "Hotel", tags: ["familia", "praia"], coverImage: IMG.hotel, rating: 4.4, reviewCount: 156, priceRange: { min: 220, max: 400, currency: "BRL" }, description: "Internacional com estrutura completa para fam\xEDlias.", summary: "Ideal para fam\xEDlias na Beira Mar.", location: { lat: -3.73, lng: -38.505, address: "Av. Hist. Raimundo Gir\xE3o, 800" }, amenities: ["Piscina", "Kids Club", "Wi-Fi", "Restaurante"] }),
  entity({ id: "hotel-essenza", slug: "essenza-hotel", type: "hotel", name: "Essenza Hotel", cityId: "city-fortaleza", cityName: "Fortaleza", category: "Boutique", tags: ["luxo", "casal", "romantico"], coverImage: IMG.hotel, rating: 4.8, reviewCount: 98, priceRange: { min: 450, max: 800, currency: "BRL" }, description: "Boutique hotel com design contempor\xE2neo e rooftop.", summary: "Boutique rom\xE2ntico no Aldeota.", location: { lat: -3.74, lng: -38.49, address: "R. Prof. Dias da Rocha, 610" }, amenities: ["Rooftop", "Spa", "Wi-Fi", "Room Service"] }),
  entity({ id: "hotel-jeri-pousada", slug: "pousada-vila-bela-jeri", type: "hotel", name: "Pousada Vila Bela", cityId: "city-jeri", cityName: "Jericoacoara", category: "Pousada", tags: ["romantico", "praia", "casal"], coverImage: IMG.hotel, rating: 4.8, reviewCount: 312, priceRange: { min: 400, max: 750, currency: "BRL" }, description: "Pousada charmosa a 200m da praia principal de Jeri.", summary: "Charme r\xFAstico-chic em Jeri.", location: { lat: -2.794, lng: -40.516, address: "Rua do Forr\xF3, Jericoacoara" }, amenities: ["Piscina", "Caf\xE9 da manh\xE3", "Wi-Fi", "Jardim"] }),
  entity({ id: "hotel-mosquito", slug: "hotel-mosquito-jeri", type: "hotel", name: "Hotel Mosquito", cityId: "city-jeri", cityName: "Jericoacoara", category: "Hotel", tags: ["luxo", "praia"], coverImage: IMG.hotel, rating: 4.9, reviewCount: 267, priceRange: { min: 600, max: 1200, currency: "BRL" }, description: "Refer\xEAncia de luxo em Jeri com villas privativas.", summary: "Luxo exclusivo em Jericoacoara.", location: { lat: -2.792, lng: -40.514, address: "Jericoacoara" }, amenities: ["Piscina privativa", "Spa", "Wi-Fi", "Transfer"] }),
  entity({ id: "hotel-canoa-pousada", slug: "pousada-canoa-paradise", type: "hotel", name: "Pousada Canoa Paradise", cityId: "city-canoa", cityName: "Canoa Quebrada", category: "Pousada", tags: ["praia", "economico", "casal"], coverImage: IMG.hotel, rating: 4.5, reviewCount: 178, priceRange: { min: 180, max: 350, currency: "BRL" }, description: "Pousada familiar com vista para as fal\xE9sias.", summary: "Vista para fal\xE9sias com pre\xE7o justo.", location: { lat: -4.489, lng: -37.759, address: "Broadway, Canoa Quebrada" }, amenities: ["Piscina", "Caf\xE9 da manh\xE3", "Wi-Fi"] }),
  entity({ id: "hotel-cumbuco-resort", slug: "cumbuco-beach-resort", type: "hotel", name: "Cumbuco Beach Resort", cityId: "city-cumbuco", cityName: "Cumbuco", category: "Resort", tags: ["praia", "familia", "aventura"], coverImage: IMG.hotel, rating: 4.4, reviewCount: 134, priceRange: { min: 300, max: 550, currency: "BRL" }, description: "Resort all-inclusive na praia de Cumbuco.", summary: "All-inclusive no para\xEDso do kitesurf.", location: { lat: -3.625, lng: -38.719, address: "Cumbuco, CE" }, amenities: ["All-inclusive", "Piscina", "Kitesurf", "Wi-Fi"] }),
  entity({ id: "hotel-guaramiranga", slug: "pousada-serra-verde", type: "hotel", name: "Pousada Serra Verde", cityId: "city-guaramiranga", cityName: "Guaramiranga", category: "Pousada", tags: ["serra", "natureza", "romantico"], coverImage: IMG.hotel, rating: 4.6, reviewCount: 89, priceRange: { min: 200, max: 380, currency: "BRL" }, description: "Pousada aconchegante na serra com lareira.", summary: "Aconchego na Su\xED\xE7a Cearense.", location: { lat: -4.104, lng: -38.929, address: "Guaramiranga, CE" }, amenities: ["Lareira", "Caf\xE9 da manh\xE3", "Wi-Fi", "Trilhas"] }),
  entity({ id: "hotel-ibis", slug: "ibis-fortaleza", type: "hotel", name: "Ibis Fortaleza Centro", cityId: "city-fortaleza", cityName: "Fortaleza", category: "Hotel", tags: ["economico"], coverImage: IMG.hotel, rating: 4.1, reviewCount: 245, priceRange: { min: 150, max: 250, currency: "BRL" }, description: "Op\xE7\xE3o econ\xF4mica e bem localizada no centro.", summary: "Praticidade e pre\xE7o no centro.", location: { lat: -3.727, lng: -38.528, address: "R. Pedro Borges, 280" }, amenities: ["Wi-Fi", "Ar-condicionado"] }),
  entity({ id: "hotel-luzeiros", slug: "luzeiros-fortaleza", type: "hotel", name: "Luzeiros Hot\xE9is", cityId: "city-fortaleza", cityName: "Fortaleza", category: "Hotel", tags: ["praia", "familia"], coverImage: IMG.hotel, rating: 4.3, reviewCount: 167, priceRange: { min: 200, max: 380, currency: "BRL" }, description: "Rede cearense com tradi\xE7\xE3o na Beira Mar.", summary: "Tradi\xE7\xE3o cearense na orla.", location: { lat: -3.729, lng: -38.501, address: "Av. Beira Mar, 2200" }, amenities: ["Piscina", "Wi-Fi", "Restaurante"] }),
  entity({ id: "hotel-pet-friendly", slug: "hotel-pet-friendly-fortaleza", type: "hotel", name: "Hotel Pet Friendly Beira Mar", cityId: "city-fortaleza", cityName: "Fortaleza", category: "Hotel", tags: ["pet-friendly", "praia"], coverImage: IMG.hotel, rating: 4.5, reviewCount: 78, priceRange: { min: 250, max: 420, currency: "BRL" }, description: "Hotel que aceita pets com \xE1rea pet exclusiva.", summary: "Seu pet \xE9 bem-vindo aqui.", location: { lat: -3.731, lng: -38.497, address: "Meireles, Fortaleza" }, amenities: ["Pet area", "Piscina", "Wi-Fi"] }),
  entity({ id: "hotel-aquiraz-resort", slug: "aquiraz-riviera", type: "hotel", name: "Aquiraz Riviera Resort", cityId: "city-aquiraz", cityName: "Aquiraz", category: "Resort", tags: ["luxo", "familia", "praia"], coverImage: IMG.hotel, rating: 4.7, reviewCount: 198, priceRange: { min: 500, max: 900, currency: "BRL" }, description: "Resort de luxo com parque aqu\xE1tico integrado.", summary: "Luxo com Beach Park ao lado.", location: { lat: -3.9, lng: -38.39, address: "Aquiraz, CE" }, amenities: ["Parque aqu\xE1tico", "Spa", "All-inclusive", "Wi-Fi"] }),
  entity({ id: "hotel-sobral", slug: "hotel-sobral-plaza", type: "hotel", name: "Sobral Plaza Hotel", cityId: "city-sobral", cityName: "Sobral", category: "Hotel", tags: ["economico", "cultural"], coverImage: IMG.hotel, rating: 4, reviewCount: 56, priceRange: { min: 120, max: 220, currency: "BRL" }, description: "Hotel confort\xE1vel no centro hist\xF3rico de Sobral.", summary: "Conforto no interior.", location: { lat: -3.689, lng: -40.35, address: "Centro, Sobral" }, amenities: ["Wi-Fi", "Caf\xE9 da manh\xE3"] }),
  entity({ id: "hotel-crato", slug: "hotel-chapada-crato", type: "hotel", name: "Hotel Chapada Crato", cityId: "city-crato", cityName: "Crato", category: "Hotel", tags: ["serra", "natureza", "economico"], coverImage: IMG.hotel, rating: 4.2, reviewCount: 45, priceRange: { min: 130, max: 240, currency: "BRL" }, description: "Base para explorar a Chapada do Araripe.", summary: "Base para a Chapada.", location: { lat: -7.235, lng: -39.41, address: "Crato, CE" }, amenities: ["Wi-Fi", "Estacionamento", "Caf\xE9 da manh\xE3"] }),
  entity({ id: "hotel-jeri-economico", slug: "hostel-jeri-backpackers", type: "hotel", name: "Jeri Backpackers Hostel", cityId: "city-jeri", cityName: "Jericoacoara", category: "Hostel", tags: ["economico", "aventura"], coverImage: IMG.hotel, rating: 4.3, reviewCount: 134, priceRange: { min: 80, max: 180, currency: "BRL" }, description: "Hostel animado para mochileiros e aventureiros.", summary: "Mochileiros bem-vindos em Jeri.", location: { lat: -2.796, lng: -40.518, address: "Jericoacoara" }, amenities: ["Wi-Fi", "Cozinha compartilhada", "Tours"] }),
  // === RESTAURANTES (20) ===
  entity({ id: "rest-coco-bambu", slug: "coco-bambu-fortaleza", type: "restaurant", name: "Coco Bambu Fortaleza", cityId: "city-fortaleza", cityName: "Fortaleza", category: "Frutos do Mar", tags: ["gastronomia", "luxo", "familia"], coverImage: IMG.food, rating: 4.8, reviewCount: 567, priceRange: 3, description: "Rede ic\xF4nica de frutos do mar com ambiente sofisticado.", summary: "Frutos do mar premium na Beira Mar.", location: { lat: -3.7285, lng: -38.499, address: "Av. Beira Mar, 2890" }, schedule: "Seg-Dom 11h-23h", metadata: { cuisine: "Frutos do mar", menu: "Camar\xE3o internacional - R$89\nMoqueca de peixe - R$75\nCasquinha de siri - R$45\nSobremesa coco - R$32", instagram: "@cocobambu", phone: "(85) 3261-0000" } }),
  entity({ id: "rest-mucuripe", slug: "mercado-mucuripe", type: "restaurant", name: "Mercado do Peixe Mucuripe", cityId: "city-fortaleza", cityName: "Fortaleza", category: "Frutos do Mar", tags: ["gastronomia", "economico", "cultural"], coverImage: IMG.food, rating: 4.5, reviewCount: 423, priceRange: 2, description: "Experi\xEAncia aut\xEAntica: escolha o peixe e coma na hora.", summary: "Peixe fresco direto do barco.", location: { lat: -3.72, lng: -38.51, address: "Mucuripe, Fortaleza" }, schedule: "Ter-Dom 10h-16h", metadata: { cuisine: "Frutos do mar", menu: "Peixe do dia - R$35/kg\nCamar\xE3o - R$55/kg\nLagosta - consulte", phone: "(85) 3254-0000" } }),
  entity({ id: "rest-origem", slug: "origem-restaurante", type: "restaurant", name: "Origem Restaurante", cityId: "city-fortaleza", cityName: "Fortaleza", category: "Contempor\xE2nea", tags: ["gastronomia", "luxo"], coverImage: IMG.food, rating: 4.9, reviewCount: 234, priceRange: 4, description: "Alta gastronomia cearense com ingredientes locais.", summary: "Alta gastronomia cearense.", location: { lat: -3.738, lng: -38.488, address: "Aldeota, Fortaleza" }, schedule: "Ter-S\xE1b 19h-23h", metadata: { cuisine: "Contempor\xE2nea cearense", menu: "Menu degusta\xE7\xE3o 7 tempos - R$280\nHarmoniza\xE7\xE3o vinhos - R$120", instagram: "@origemfortaleza" } }),
  entity({ id: "rest-barraca-futuro", slug: "barraca-cabana-futuro", type: "restaurant", name: "Barraca Cabana do Futuro", cityId: "city-fortaleza", cityName: "Fortaleza", category: "Barraca", tags: ["gastronomia", "praia", "familia"], coverImage: IMG.food, rating: 4.4, reviewCount: 312, priceRange: 2, description: "Barraca tradicional na Praia do Futuro com lagosta grelhada.", summary: "Lagosta na Praia do Futuro.", location: { lat: -3.743, lng: -38.471, address: "Praia do Futuro" }, schedule: "Qua-Dom 10h-18h", metadata: { cuisine: "Frutos do mar", menu: "Lagosta grelhada - R$95\nCamar\xE3o na moranga - R$68\n\xC1gua de coco - R$8" } }),
  entity({ id: "rest-jeri-forro", slug: "restaurante-do-forro", type: "restaurant", name: "Restaurante do Forr\xF3", cityId: "city-jeri", cityName: "Jericoacoara", category: "Regional", tags: ["gastronomia", "cultural", "economico"], coverImage: IMG.food, rating: 4.6, reviewCount: 289, priceRange: 2, description: "Comida t\xEDpica nordestina com m\xFAsica ao vivo.", summary: "Forr\xF3 e comida t\xEDpica em Jeri.", location: { lat: -2.7945, lng: -40.5165, address: "Rua do Forr\xF3, Jeri" }, schedule: "Todos os dias 18h-00h", metadata: { cuisine: "Nordestina", menu: "Bai\xE3o de dois - R$35\nCarne de sol - R$42\nTapioca - R$15" } }),
  entity({ id: "rest-jeri-tamara", slug: "tamara-jeri", type: "restaurant", name: "Tamara Jeri", cityId: "city-jeri", cityName: "Jericoacoara", category: "Internacional", tags: ["gastronomia", "romantico", "casal"], coverImage: IMG.food, rating: 4.7, reviewCount: 198, priceRange: 3, description: "Restaurante sofisticado com vista para o p\xF4r do sol.", summary: "Jantar rom\xE2ntico com p\xF4r do sol.", location: { lat: -2.7935, lng: -40.5145, address: "Jericoacoara" }, schedule: "Ter-Dom 17h-23h", metadata: { cuisine: "Internacional", menu: "Risoto de camar\xE3o - R$78\nPeixe grelhado - R$85\nSobremesa - R$28" } }),
  entity({ id: "rest-canoa-broadway", slug: "broadway-grill", type: "restaurant", name: "Broadway Grill", cityId: "city-canoa", cityName: "Canoa Quebrada", category: "Grill", tags: ["gastronomia", "noite"], coverImage: IMG.food, rating: 4.3, reviewCount: 167, priceRange: 2, description: "Na famosa Broadway de Canoa, carnes e frutos do mar.", summary: "Grill na Broadway.", location: { lat: -4.4895, lng: -37.7595, address: "Broadway, Canoa" }, schedule: "Todos os dias 11h-01h", metadata: { cuisine: "Grill", menu: "Picanha - R$65\nPeixe frito - R$48\nCaipirinha - R$18" } }),
  entity({ id: "rest-guaramiranga", slug: "sabores-da-serra", type: "restaurant", name: "Sabores da Serra", cityId: "city-guaramiranga", cityName: "Guaramiranga", category: "Regional", tags: ["gastronomia", "serra"], coverImage: IMG.food, rating: 4.5, reviewCount: 89, priceRange: 2, description: "Gastronomia de serra com temperos locais.", summary: "Sabores \xFAnicos da serra.", location: { lat: -4.1045, lng: -38.9295, address: "Guaramiranga" }, schedule: "Sex-Dom 11h-22h", metadata: { cuisine: "Serra", menu: "Galinhada - R$38\nQueijo coalho - R$22\nDoce de leite - R$15" } }),
  entity({ id: "rest-acai-jeri", slug: "acai-do-ponto", type: "restaurant", name: "A\xE7a\xED do Ponto", cityId: "city-jeri", cityName: "Jericoacoara", category: "Lanches", tags: ["economico", "praia"], coverImage: IMG.food, rating: 4.4, reviewCount: 145, priceRange: 1, description: "Melhor a\xE7a\xED de Jeri com toppings variados.", summary: "A\xE7a\xED refrescante em Jeri.", location: { lat: -2.7955, lng: -40.517, address: "Centro, Jeri" }, metadata: { cuisine: "A\xE7a\xED", menu: "A\xE7a\xED 500ml - R$18\nA\xE7a\xED 1L - R$28" } }),
  entity({ id: "rest-pizza-fortaleza", slug: "pizza-na-brasa", type: "restaurant", name: "Pizza na Brasa", cityId: "city-fortaleza", cityName: "Fortaleza", category: "Pizzaria", tags: ["familia", "economico"], coverImage: IMG.food, rating: 4.2, reviewCount: 234, priceRange: 2, description: "Pizzaria artesanal com forno a lenha.", summary: "Pizza artesanal no Aldeota.", location: { lat: -3.741, lng: -38.487, address: "Aldeota" }, schedule: "Ter-Dom 18h-23h30", metadata: { cuisine: "Pizza", menu: "Margherita - R$45\nCalabresa - R$48\nPortuguesa - R$52" } }),
  entity({ id: "rest-vegan-fortaleza", slug: "verde-vida", type: "restaurant", name: "Verde Vida", cityId: "city-fortaleza", cityName: "Fortaleza", category: "Vegetariana", tags: ["gastronomia", "natureza"], coverImage: IMG.food, rating: 4.6, reviewCount: 98, priceRange: 2, description: "Restaurante vegetariano/vegano com op\xE7\xF5es criativas.", summary: "Culin\xE1ria vegana criativa.", location: { lat: -3.736, lng: -38.492, address: "Meireles" }, metadata: { cuisine: "Vegetariana", menu: "Bowl tropical - R$38\nHamb\xFArguer vegano - R$35" } }),
  entity({ id: "rest-cumbuco", slug: "peixe-fresco-cumbuco", type: "restaurant", name: "Peixe Fresco Cumbuco", cityId: "city-cumbuco", cityName: "Cumbuco", category: "Frutos do Mar", tags: ["gastronomia", "praia", "economico"], coverImage: IMG.food, rating: 4.3, reviewCount: 112, priceRange: 2, description: "Peixe fresco na beira da praia de Cumbuco.", summary: "Peixe na praia de Cumbuco.", location: { lat: -3.6245, lng: -38.7185, address: "Cumbuco" }, metadata: { cuisine: "Frutos do mar", menu: "Peixe frito - R$42\nCamar\xE3o - R$55" } }),
  entity({ id: "rest-sobral", slug: "panela-de-barro-sobral", type: "restaurant", name: "Panela de Barro", cityId: "city-sobral", cityName: "Sobral", category: "Regional", tags: ["gastronomia", "cultural"], coverImage: IMG.food, rating: 4.4, reviewCount: 67, priceRange: 2, description: "Comida caseira do interior cearense.", summary: "Comida caseira aut\xEAntica.", location: { lat: -3.688, lng: -40.349, address: "Sobral" }, metadata: { cuisine: "Caseira", menu: "Feij\xE3o verde - R$28\nCarne de sol - R$38" } }),
  entity({ id: "rest-aquiraz", slug: "restaurante-beach-park", type: "restaurant", name: "Restaurante Beach Park", cityId: "city-aquiraz", cityName: "Aquiraz", category: "Internacional", tags: ["familia", "praia"], coverImage: IMG.food, rating: 4.1, reviewCount: 189, priceRange: 3, description: "Restaurante dentro do parque aqu\xE1tico.", summary: "Refei\xE7\xE3o no Beach Park.", location: { lat: -3.901, lng: -38.391, address: "Beach Park" }, metadata: { cuisine: "Internacional", menu: "Buffet - R$65\nLanche - R$25" } }),
  entity({ id: "rest-cafe-fortaleza", slug: "cafe-ceara", type: "restaurant", name: "Caf\xE9 Cear\xE1", cityId: "city-fortaleza", cityName: "Fortaleza", category: "Caf\xE9", tags: ["casal", "cultural"], coverImage: IMG.food, rating: 4.5, reviewCount: 156, priceRange: 2, description: "Caf\xE9 especial com doces regionais no centro.", summary: "Caf\xE9 e doces cearenses.", location: { lat: -3.726, lng: -38.527, address: "Centro, Fortaleza" }, metadata: { cuisine: "Caf\xE9", menu: "Caf\xE9 especial - R$12\nCuscuz com queijo - R$18\nBolo de rolo - R$15" } }),
  entity({ id: "rest-churrasco", slug: "churrascaria-gaucha", type: "restaurant", name: "Churrascaria Ga\xFAcha", cityId: "city-fortaleza", cityName: "Fortaleza", category: "Churrascaria", tags: ["gastronomia", "familia"], coverImage: IMG.food, rating: 4.3, reviewCount: 278, priceRange: 3, description: "Rod\xEDzio de carnes premium.", summary: "Rod\xEDzio premium.", location: { lat: -3.739, lng: -38.486, address: "Aldeota" }, metadata: { cuisine: "Churrasco", menu: "Rod\xEDzio - R$89\nRod\xEDzio + sobremesa - R$99" } }),
  entity({ id: "rest-japones", slug: "sushi-ceara", type: "restaurant", name: "Sushi Cear\xE1", cityId: "city-fortaleza", cityName: "Fortaleza", category: "Japonesa", tags: ["gastronomia", "luxo"], coverImage: IMG.food, rating: 4.6, reviewCount: 134, priceRange: 3, description: "Sushi premium com peixe fresco do litoral.", summary: "Sushi com peixe local.", location: { lat: -3.732, lng: -38.496, address: "Meireles" }, metadata: { cuisine: "Japonesa", menu: "Combinado 30 pe\xE7as - R$95\nHot roll - R$42" } }),
  entity({ id: "rest-canoa-massas", slug: "massas-da-falesia", type: "restaurant", name: "Massas da Fal\xE9sia", cityId: "city-canoa", cityName: "Canoa Quebrada", category: "Italiana", tags: ["casal", "romantico"], coverImage: IMG.food, rating: 4.4, reviewCount: 98, priceRange: 2, description: "Massas artesanais com vista para o mar.", summary: "Massas com vista mar.", location: { lat: -4.4905, lng: -37.7585, address: "Canoa" }, metadata: { cuisine: "Italiana", menu: "Lasanha - R$48\nRavioli - R$52" } }),
  entity({ id: "rest-crato", slug: "cantina-chapada", type: "restaurant", name: "Cantina da Chapada", cityId: "city-crato", cityName: "Crato", category: "Regional", tags: ["gastronomia", "serra", "economico"], coverImage: IMG.food, rating: 4.2, reviewCount: 45, priceRange: 1, description: "Comida simples e saborosa da regi\xE3o.", summary: "Sabores da Chapada.", location: { lat: -7.2345, lng: -39.4095, address: "Crato" }, metadata: { cuisine: "Regional", menu: "Mingau de milho - R$15\nGalinha caipira - R$35" } }),
  entity({ id: "rest-petiscaria", slug: "petiscaria-boemia", type: "restaurant", name: "Petiscaria Bo\xEAmia", cityId: "city-fortaleza", cityName: "Fortaleza", category: "Petiscaria", tags: ["noite", "casal"], coverImage: IMG.food, rating: 4.4, reviewCount: 189, priceRange: 2, description: "Petiscos e drinks na Praia de Iracema.", summary: "Drinks e petiscos em Iracema.", location: { lat: -3.719, lng: -38.516, address: "Iracema" }, schedule: "Qui-S\xE1b 17h-02h", metadata: { cuisine: "Petiscos", menu: "Isca de peixe - R$38\nCaipirinha - R$16" } }),
  // === PASSEIOS (15) ===
  entity({ id: "tour-buggy-canoa", slug: "buggy-falesias-canoa", type: "tour", name: "Buggy nas Fal\xE9sias de Canoa", cityId: "city-canoa", cityName: "Canoa Quebrada", category: "Buggy", tags: ["aventura", "praia"], coverImage: IMG.tour, rating: 4.7, reviewCount: 345, priceRange: { min: 120, max: 200, currency: "BRL" }, description: "Passeio de buggy pelas fal\xE9sias, praias desertas e lagoas.", summary: "Aventura pelas fal\xE9sias coloridas.", location: { lat: -4.489, lng: -37.76, address: "Canoa Quebrada" }, metadata: { duration: "3 horas", difficulty: "F\xE1cil", company: "Buggy Adventure Canoa" } }),
  entity({ id: "tour-lagoa-paraiso", slug: "lagoa-do-paraiso", type: "tour", name: "Lagoa do Para\xEDso", cityId: "city-jeri", cityName: "Jericoacoara", category: "Lagoa", tags: ["natureza", "familia", "praia"], coverImage: IMG.tour, rating: 4.9, reviewCount: 512, priceRange: { min: 80, max: 150, currency: "BRL" }, description: "\xC1guas cristalinas e redes na \xE1gua na famosa Lagoa do Para\xEDso.", summary: "Redes na \xE1gua cristalina.", location: { lat: -2.87, lng: -40.45, address: "Lagoa do Para\xEDso, CE" }, metadata: { duration: "4 horas", difficulty: "F\xE1cil", company: "Jeri Tours" } }),
  entity({ id: "tour-por-do-sol", slug: "por-do-sol-duna-jeri", type: "tour", name: "P\xF4r do Sol na Duna", cityId: "city-jeri", cityName: "Jericoacoara", category: "Natureza", tags: ["romantico", "natureza"], coverImage: IMG.jeri, rating: 4.9, reviewCount: 678, priceRange: { min: 0, max: 0, currency: "BRL" }, description: "O p\xF4r do sol mais famoso do Brasil na Duna do P\xF4r do Sol.", summary: "P\xF4r do sol inesquec\xEDvel.", location: { lat: -2.791, lng: -40.513, address: "Duna do P\xF4r do Sol" }, metadata: { duration: "2 horas", difficulty: "F\xE1cil", company: "Auto-guiado" } }),
  entity({ id: "tour-mergulho", slug: "mergulho-paracuru", type: "tour", name: "Mergulho em Paracuru", cityId: "city-fortaleza", cityName: "Paracuru", category: "Mergulho", tags: ["aventura", "praia"], coverImage: IMG.tour, rating: 4.5, reviewCount: 123, priceRange: { min: 200, max: 350, currency: "BRL" }, description: "Mergulho com cilindro em recifes de corais.", summary: "Mergulho em recifes.", location: { lat: -3.41, lng: -39.03, address: "Paracuru, CE" }, metadata: { duration: "3 horas", difficulty: "M\xE9dio", company: "Dive Cear\xE1" } }),
  entity({ id: "tour-city-tour", slug: "city-tour-fortaleza", type: "tour", name: "City Tour Fortaleza", cityId: "city-fortaleza", cityName: "Fortaleza", category: "Urbano", tags: ["cultural", "familia"], coverImage: IMG.tour, rating: 4.3, reviewCount: 234, priceRange: { min: 60, max: 100, currency: "BRL" }, description: "Conhe\xE7a os principais pontos tur\xEDsticos da capital.", summary: "Fortaleza em um dia.", location: { lat: -3.7319, lng: -38.5267, address: "Fortaleza" }, metadata: { duration: "5 horas", difficulty: "F\xE1cil", company: "Fortaleza Tours" } }),
  entity({ id: "tour-kitesurf", slug: "aula-kitesurf-cumbuco", type: "tour", name: "Aula de Kitesurf", cityId: "city-cumbuco", cityName: "Cumbuco", category: "Esporte", tags: ["aventura", "praia"], coverImage: IMG.tour, rating: 4.6, reviewCount: 167, priceRange: { min: 250, max: 400, currency: "BRL" }, description: "Aula particular de kitesurf com instrutor certificado.", summary: "Aprenda kitesurf em Cumbuco.", location: { lat: -3.625, lng: -38.719, address: "Cumbuco" }, metadata: { duration: "2 horas", difficulty: "M\xE9dio", company: "Kite Point Cumbuco" } }),
  entity({ id: "tour-trilha-serra", slug: "trilha-guaramiranga", type: "tour", name: "Trilha na Serra", cityId: "city-guaramiranga", cityName: "Guaramiranga", category: "Trilha", tags: ["natureza", "serra", "aventura"], coverImage: IMG.serra, rating: 4.4, reviewCount: 89, priceRange: { min: 50, max: 80, currency: "BRL" }, description: "Trilha guiada pela mata atl\xE2ntica da serra.", summary: "Ecoturismo na serra.", location: { lat: -4.105, lng: -38.93, address: "Guaramiranga" }, metadata: { duration: "4 horas", difficulty: "M\xE9dio", company: "Serra Eco Tours" } }),
  entity({ id: "tour-barco", slug: "passeio-barco-mucuripe", type: "tour", name: "Passeio de Barco Mucuripe", cityId: "city-fortaleza", cityName: "Fortaleza", category: "Barco", tags: ["praia", "familia"], coverImage: IMG.tour, rating: 4.2, reviewCount: 145, priceRange: { min: 40, max: 70, currency: "BRL" }, description: "Passeio de barco pela ba\xEDa de Mucuripe.", summary: "Barco pela ba\xEDa.", location: { lat: -3.72, lng: -38.51, address: "Mucuripe" }, metadata: { duration: "1h30", difficulty: "F\xE1cil", company: "Marina Mucuripe" } }),
  entity({ id: "tour-quadriciclo", slug: "quadriciclo-dunas", type: "tour", name: "Quadriciclo nas Dunas", cityId: "city-cumbuco", cityName: "Cumbuco", category: "Quadriciclo", tags: ["aventura"], coverImage: IMG.tour, rating: 4.5, reviewCount: 198, priceRange: { min: 150, max: 250, currency: "BRL" }, description: "Aventura de quadriciclo pelas dunas de Cumbuco.", summary: "Adrenalina nas dunas.", location: { lat: -3.626, lng: -38.72, address: "Cumbuco" }, metadata: { duration: "2 horas", difficulty: "M\xE9dio", company: "Duna Quad" } }),
  entity({ id: "tour-canoa-arrai", slug: "arrai\xE1-canoa", type: "tour", name: "Passeio de Jangada", cityId: "city-canoa", cityName: "Canoa Quebrada", category: "Jangada", tags: ["cultural", "praia"], coverImage: IMG.tour, rating: 4.4, reviewCount: 112, priceRange: { min: 30, max: 50, currency: "BRL" }, description: "Passeio tradicional de jangada ao nascer do sol.", summary: "Jangada ao amanhecer.", location: { lat: -4.49, lng: -37.758, address: "Canoa" }, metadata: { duration: "1 hora", difficulty: "F\xE1cil", company: "Jangadeiros de Canoa" } }),
  entity({ id: "tour-beach-park", slug: "ingresso-beach-park", type: "tour", name: "Beach Park", cityId: "city-aquiraz", cityName: "Aquiraz", category: "Parque", tags: ["familia", "aventura"], coverImage: IMG.tour, rating: 4.6, reviewCount: 456, priceRange: { min: 120, max: 200, currency: "BRL" }, description: "Maior parque aqu\xE1tico da Am\xE9rica Latina.", summary: "Divers\xE3o para toda fam\xEDlia.", location: { lat: -3.901, lng: -38.391, address: "Beach Park, Aquiraz" }, metadata: { duration: "Dia inteiro", difficulty: "F\xE1cil", company: "Beach Park" } }),
  entity({ id: "tour-rafting", slug: "rafting-salitre", type: "tour", name: "Rafting no Salitre", cityId: "city-crato", cityName: "Crato", category: "Rafting", tags: ["aventura", "serra"], coverImage: IMG.tour, rating: 4.3, reviewCount: 67, priceRange: { min: 180, max: 280, currency: "BRL" }, description: "Rafting no Rio Salitre na Chapada do Araripe.", summary: "Aventura na Chapada.", location: { lat: -7.24, lng: -39.42, address: "Chapada do Araripe" }, metadata: { duration: "3 horas", difficulty: "Dif\xEDcil", company: "Chapada Adventure" } }),
  entity({ id: "tour-fortaleza-cultural", slug: "tour-cultural-centro", type: "tour", name: "Tour Cultural Centro", cityId: "city-fortaleza", cityName: "Fortaleza", category: "Cultural", tags: ["cultural", "historico"], coverImage: IMG.tour, rating: 4.4, reviewCount: 98, priceRange: { min: 45, max: 75, currency: "BRL" }, description: "Centro Drag\xE3o do Mar, Mercado Central e arte urbana.", summary: "Arte e hist\xF3ria no centro.", location: { lat: -3.727, lng: -38.528, address: "Centro" }, metadata: { duration: "3 horas", difficulty: "F\xE1cil", company: "Cultura CE" } }),
  entity({ id: "tour-jeri-downwind", slug: "downwind-jeri-pre\xE1", type: "tour", name: "Downwind Jeri ao Pre\xE1", cityId: "city-jeri", cityName: "Jericoacoara", category: "Kitesurf", tags: ["aventura", "praia"], coverImage: IMG.tour, rating: 4.8, reviewCount: 134, priceRange: { min: 300, max: 500, currency: "BRL" }, description: "Downwind de kitesurf de Jeri at\xE9 o Pre\xE1.", summary: "Kitesurf entre Jeri e Pre\xE1.", location: { lat: -2.82, lng: -40.47, address: "Jericoacoara" }, metadata: { duration: "4 horas", difficulty: "Dif\xEDcil", company: "Wind Riders" } }),
  entity({ id: "tour-morro-branco", slug: "tour-morro-branco", type: "tour", name: "Tour Morro Branco", cityId: "city-aquiraz", cityName: "Beberibe", category: "Natureza", tags: ["natureza", "familia"], coverImage: IMG.tour, rating: 4.5, reviewCount: 234, priceRange: { min: 90, max: 140, currency: "BRL" }, description: "Visita \xE0s fal\xE9sias multicoloridas de Morro Branco.", summary: "Fal\xE9sias de cores \xFAnicas.", location: { lat: -4.22, lng: -37.85, address: "Morro Branco" }, metadata: { duration: "4 horas", difficulty: "F\xE1cil", company: "Fal\xE9sias Tour" } }),
  // === EVENTOS (10) ===
  entity({ id: "event-forro", slug: "festival-forro-jeri", type: "event", name: "Festival de Forr\xF3 de Jeri", cityId: "city-jeri", cityName: "Jericoacoara", category: "M\xFAsica", tags: ["cultural", "noite"], coverImage: IMG.event, rating: 4.8, reviewCount: 234, priceRange: { min: 50, max: 150, currency: "BRL" }, description: "O maior festival de forr\xF3 do litoral cearense.", summary: "Forr\xF3 p\xE9 de serra em Jeri.", location: { lat: -2.794, lng: -40.516, address: "Jericoacoara" }, metadata: { date: "2026-07-15", endDate: "2026-07-20", ticket: "A partir de R$50" } }),
  entity({ id: "event-carnaval-fortaleza", slug: "carnaval-fortaleza", type: "event", name: "Carnaval de Fortaleza", cityId: "city-fortaleza", cityName: "Fortaleza", category: "Festa", tags: ["cultural", "noite", "familia"], coverImage: IMG.event, rating: 4.5, reviewCount: 345, priceRange: { min: 0, max: 80, currency: "BRL" }, description: "Blocos de rua, trios el\xE9tricos e festa na Praia de Iracema.", summary: "Folia na capital cearense.", location: { lat: -3.7186, lng: -38.5164, address: "Praia de Iracema" }, metadata: { date: "2027-02-10", endDate: "2027-02-17", ticket: "Gratuito (blocos)" } }),
  entity({ id: "event-reggae", slug: "reggae-beach-festival", type: "event", name: "Reggae Beach Festival", cityId: "city-canoa", cityName: "Canoa Quebrada", category: "M\xFAsica", tags: ["noite", "praia"], coverImage: IMG.event, rating: 4.6, reviewCount: 189, priceRange: { min: 80, max: 200, currency: "BRL" }, description: "Festival de reggae na praia de Canoa Quebrada.", summary: "Reggae \xE0 beira-mar.", location: { lat: -4.49, lng: -37.758, address: "Canoa Quebrada" }, metadata: { date: "2026-08-20", endDate: "2026-08-22", ticket: "R$80" } }),
  entity({ id: "event-gastronomia", slug: "festival-gastronomia-fortaleza", type: "event", name: "Festival Gastron\xF4mico Fortaleza", cityId: "city-fortaleza", cityName: "Fortaleza", category: "Gastronomia", tags: ["gastronomia", "cultural"], coverImage: IMG.event, rating: 4.7, reviewCount: 156, priceRange: { min: 30, max: 100, currency: "BRL" }, description: "Degusta\xE7\xE3o dos melhores chefs cearenses.", summary: "Sabores do Cear\xE1.", location: { lat: -3.728, lng: -38.498, address: "Beira Mar" }, metadata: { date: "2026-09-05", endDate: "2026-09-07", ticket: "R$30 entrada" } }),
  entity({ id: "event-sao-joao", slug: "sao-joao-guaramiranga", type: "event", name: "S\xE3o Jo\xE3o de Guaramiranga", cityId: "city-guaramiranga", cityName: "Guaramiranga", category: "Festa Junina", tags: ["cultural", "serra", "familia"], coverImage: IMG.event, rating: 4.4, reviewCount: 98, priceRange: { min: 0, max: 30, currency: "BRL" }, description: "Festa junina na serra com clima ameno.", summary: "Junina na Su\xED\xE7a Cearense.", location: { lat: -4.105, lng: -38.93, address: "Guaramiranga" }, metadata: { date: "2026-06-24", endDate: "2026-06-24", ticket: "Gratuito" } }),
  entity({ id: "event-kite", slug: "cumbuco-kite-festival", type: "event", name: "Cumbuco Kite Festival", cityId: "city-cumbuco", cityName: "Cumbuco", category: "Esporte", tags: ["aventura", "praia"], coverImage: IMG.event, rating: 4.7, reviewCount: 112, priceRange: { min: 0, max: 0, currency: "BRL" }, description: "Campeonato internacional de kitesurf.", summary: "Kitesurf de elite.", location: { lat: -3.625, lng: -38.719, address: "Cumbuco" }, metadata: { date: "2026-11-10", endDate: "2026-11-15", ticket: "Gratuito" } }),
  entity({ id: "event-arte", slug: "bienal-arte-fortaleza", type: "event", name: "Bienal de Arte Fortaleza", cityId: "city-fortaleza", cityName: "Fortaleza", category: "Arte", tags: ["cultural"], coverImage: IMG.event, rating: 4.3, reviewCount: 67, priceRange: { min: 20, max: 40, currency: "BRL" }, description: "Exposi\xE7\xE3o de arte contempor\xE2nea cearense.", summary: "Arte cearense contempor\xE2nea.", location: { lat: -3.727, lng: -38.528, address: "Drag\xE3o do Mar" }, metadata: { date: "2026-10-01", endDate: "2026-11-30", ticket: "R$20" } }),
  entity({ id: "event-maratona", slug: "maratona-fortaleza", type: "event", name: "Maratona de Fortaleza", cityId: "city-fortaleza", cityName: "Fortaleza", category: "Esporte", tags: ["aventura", "praia"], coverImage: IMG.event, rating: 4.5, reviewCount: 89, priceRange: { min: 80, max: 150, currency: "BRL" }, description: "Corrida de rua pela orla de Fortaleza.", summary: "Corra pela Beira Mar.", location: { lat: -3.729, lng: -38.501, address: "Beira Mar" }, metadata: { date: "2026-12-06", endDate: "2026-12-06", ticket: "R$80 inscri\xE7\xE3o" } }),
  entity({ id: "event-canoa-fest", slug: "canoa-fest", type: "event", name: "Canoa Fest", cityId: "city-canoa", cityName: "Canoa Quebrada", category: "M\xFAsica", tags: ["noite", "praia"], coverImage: IMG.event, rating: 4.4, reviewCount: 78, priceRange: { min: 60, max: 120, currency: "BRL" }, description: "Festival de m\xFAsica na Broadway.", summary: "M\xFAsica na Broadway.", location: { lat: -4.4895, lng: -37.7595, address: "Broadway" }, metadata: { date: "2026-01-15", endDate: "2026-01-18", ticket: "R$60" } }),
  entity({ id: "event-vinhos", slug: "festival-vinhos-serra", type: "event", name: "Festival de Vinhos da Serra", cityId: "city-guaramiranga", cityName: "Guaramiranga", category: "Gastronomia", tags: ["gastronomia", "serra", "casal"], coverImage: IMG.event, rating: 4.6, reviewCount: 56, priceRange: { min: 100, max: 250, currency: "BRL" }, description: "Degusta\xE7\xE3o de vinhos e queijos na serra.", summary: "Vinhos na serra cearense.", location: { lat: -4.104, lng: -38.929, address: "Guaramiranga" }, metadata: { date: "2026-05-20", endDate: "2026-05-22", ticket: "R$100" } })
];
seedEntities.forEach((e) => {
  if (!e.reviewCount) e.reviewCount = Math.floor(Math.random() * 200) + 20;
});

// scripts/storage/storage-manager.js
init_event_bus();
var StorageManager = class {
  get(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
  set(key, value) {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    eventBus.emit(EVENTS.STORAGE_UPDATED, { key, value });
  }
  remove(key) {
    localStorage.removeItem(PREFIX + key);
    eventBus.emit(EVENTS.STORAGE_UPDATED, { key });
  }
  setIfEmpty(key, value) {
    if (!this.get(key)) this.set(key, value);
  }
  init() {
    const currentVersion = this.get(STORAGE_KEYS.SEED_VERSION);
    if (currentVersion !== SEED_VERSION) {
      this.set(STORAGE_KEYS.ENTITIES, seedEntities);
      this.set(STORAGE_KEYS.SEED_VERSION, SEED_VERSION);
      if (!this.get(STORAGE_KEYS.FAVORITES)) this.set(STORAGE_KEYS.FAVORITES, []);
      if (!this.get(STORAGE_KEYS.WISHLIST)) this.set(STORAGE_KEYS.WISHLIST, []);
      if (!this.get(STORAGE_KEYS.HISTORY)) this.set(STORAGE_KEYS.HISTORY, []);
      if (!this.get(STORAGE_KEYS.ITINERARIES)) this.set(STORAGE_KEYS.ITINERARIES, []);
      if (!this.get(STORAGE_KEYS.REVIEWS)) this.set(STORAGE_KEYS.REVIEWS, []);
      if (!this.get(STORAGE_KEYS.USERS)) this.set(STORAGE_KEYS.USERS, []);
      if (!this.get(STORAGE_KEYS.PREFERENCES)) this.set(STORAGE_KEYS.PREFERENCES, { interests: [], profile: "" });
    } else {
      this.ensureCollections();
    }
    this.applyTheme();
  }
  ensureCollections() {
    const entities = this.get(STORAGE_KEYS.ENTITIES);
    if (!entities || entities.length === 0) {
      this.set(STORAGE_KEYS.ENTITIES, seedEntities);
    }
    ["FAVORITES", "WISHLIST", "HISTORY", "ITINERARIES", "REVIEWS", "USERS"].forEach((k) => {
      if (!this.get(STORAGE_KEYS[k])) this.set(STORAGE_KEYS[k], []);
    });
    if (!this.get(STORAGE_KEYS.PREFERENCES)) {
      this.set(STORAGE_KEYS.PREFERENCES, { interests: [], profile: "" });
    }
  }
  resetDemo() {
    this.set(STORAGE_KEYS.ENTITIES, seedEntities);
    this.set(STORAGE_KEYS.SEED_VERSION, SEED_VERSION);
    this.set(STORAGE_KEYS.FAVORITES, []);
    this.set(STORAGE_KEYS.HISTORY, []);
    this.set(STORAGE_KEYS.ITINERARIES, []);
    this.set(STORAGE_KEYS.REVIEWS, []);
    eventBus.emit(EVENTS.STORAGE_UPDATED, { key: "reset" });
  }
  getTheme() {
    return this.get(STORAGE_KEYS.THEME) || "light";
  }
  setTheme(theme) {
    this.set(STORAGE_KEYS.THEME, theme);
    document.documentElement.dataset.theme = theme;
    eventBus.emit(EVENTS.THEME_CHANGED, theme);
  }
  applyTheme() {
    document.documentElement.dataset.theme = this.getTheme();
  }
  toggleTheme() {
    const next = this.getTheme() === "dark" ? "light" : "dark";
    this.setTheme(next);
    return next;
  }
};
var storage = new StorageManager();

// scripts/app.js
init_router();

// scripts/utils/a11y.js
function initA11y() {
  const saved = JSON.parse(localStorage.getItem("turistando_a11y") || "{}");
  if (saved.fontScale) document.documentElement.style.setProperty("--font-scale", saved.fontScale);
  if (saved.highContrast) document.documentElement.dataset.highContrast = "true";
}
function setFontScale(delta) {
  const current = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--font-scale")) || 1;
  const next = Math.min(1.4, Math.max(0.8, current + delta));
  document.documentElement.style.setProperty("--font-scale", next);
  saveA11y({ fontScale: next });
  return next;
}
function toggleHighContrast() {
  const isOn = document.documentElement.dataset.highContrast === "true";
  document.documentElement.dataset.highContrast = isOn ? "false" : "true";
  saveA11y({ highContrast: !isOn });
  return !isOn;
}
function speakText(text) {
  if (!("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "pt-BR";
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
  return true;
}
function stopSpeaking() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}
function saveA11y(partial) {
  const current = JSON.parse(localStorage.getItem("turistando_a11y") || "{}");
  localStorage.setItem("turistando_a11y", JSON.stringify({ ...current, ...partial }));
}
function trapFocus(container) {
  const focusable = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  container.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
  first?.focus();
}

// scripts/app.js
init_toast();

// scripts/components/modal.js
var modalRoot = null;
function initModal() {
  modalRoot = document.getElementById("modal-root");
}
function openModal({ title, content, size = "", onClose }) {
  if (!modalRoot) initModal();
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal ${size ? `modal--${size}` : ""}" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal__header">
        <h2 class="modal__title" id="modal-title">${title}</h2>
        <button class="modal__close" aria-label="Fechar">&times;</button>
      </div>
      <div class="modal__body">${typeof content === "string" ? content : ""}</div>
    </div>
  `;
  if (content instanceof HTMLElement) {
    overlay.querySelector(".modal__body").appendChild(content);
  }
  const close = () => {
    overlay.classList.remove("is-open");
    setTimeout(() => overlay.remove(), 250);
    document.body.style.overflow = "";
    onClose?.();
  };
  overlay.querySelector(".modal__close").addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener("keydown", function esc(e) {
    if (e.key === "Escape") {
      close();
      document.removeEventListener("keydown", esc);
    }
  });
  modalRoot.appendChild(overlay);
  document.body.style.overflow = "hidden";
  requestAnimationFrame(() => {
    overlay.classList.add("is-open");
    trapFocus(overlay.querySelector(".modal"));
  });
  return { close, overlay };
}

// scripts/services/auth-service.js
init_constants();

// scripts/storage/repositories/entity-repository.js
init_constants();
var EntityRepository = class {
  getAll() {
    return storage.get(STORAGE_KEYS.ENTITIES) || [];
  }
  getById(id) {
    return this.getAll().find((e) => e.id === id) || null;
  }
  getBySlug(slug) {
    return this.getAll().find((e) => e.slug === slug) || null;
  }
  getByType(type) {
    return this.getAll().filter((e) => e.type === type);
  }
  getByCityId(cityId) {
    return this.getAll().filter((e) => e.cityId === cityId && e.type !== "city");
  }
  getByCitySlug(citySlug) {
    const city = this.getAll().find((e) => e.type === "city" && e.slug === citySlug);
    if (!city) return { city: null, items: [] };
    return { city, items: this.getByCityId(city.id) };
  }
  add(entity2) {
    const all = this.getAll();
    all.push(entity2);
    storage.set(STORAGE_KEYS.ENTITIES, all);
    return entity2;
  }
  update(id, updates) {
    const all = this.getAll();
    const idx = all.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...updates };
    storage.set(STORAGE_KEYS.ENTITIES, all);
    return all[idx];
  }
  remove(id) {
    const all = this.getAll().filter((e) => e.id !== id);
    storage.set(STORAGE_KEYS.ENTITIES, all);
  }
  getByOwner(ownerId) {
    return this.getAll().filter((e) => e.ownerId === ownerId);
  }
};
var entityRepo = new EntityRepository();

// scripts/utils/slug.js
function slugify(text) {
  return normalizeText(text).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function normalizeText(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// scripts/services/auth-service.js
init_event_bus();
var AuthService = class {
  getUsers() {
    return storage.get(STORAGE_KEYS.USERS) || [];
  }
  getSession() {
    return storage.get(STORAGE_KEYS.SESSION);
  }
  getCurrentUser() {
    const session = this.getSession();
    if (!session) return null;
    return this.getUsers().find((u) => u.id === session.userId) || null;
  }
  isLoggedIn() {
    return !!this.getSession();
  }
  isPartner() {
    const user = this.getCurrentUser();
    return user?.role === "parceiro";
  }
  register({ name, email, password, role = "turista" }) {
    const users = this.getUsers();
    if (users.some((u) => u.email === email)) {
      throw new Error("E-mail j\xE1 cadastrado");
    }
    const user = {
      id: generateId("user"),
      name,
      email,
      password,
      role,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    users.push(user);
    storage.set(STORAGE_KEYS.USERS, users);
    this.login(email, password);
    return user;
  }
  login(email, password) {
    const user = this.getUsers().find((u) => u.email === email && u.password === password);
    if (!user) throw new Error("E-mail ou senha incorretos");
    storage.set(STORAGE_KEYS.SESSION, { userId: user.id, loginAt: (/* @__PURE__ */ new Date()).toISOString() });
    eventBus.emit(EVENTS.AUTH_CHANGED, user);
    return user;
  }
  logout() {
    storage.remove(STORAGE_KEYS.SESSION);
    eventBus.emit(EVENTS.AUTH_CHANGED, null);
  }
};
var EstablishmentService = class {
  register(data, ownerId) {
    const entity2 = {
      id: generateId(data.type),
      slug: slugify(data.name) + "-" + Date.now().toString(36),
      type: data.type,
      name: data.name,
      cityId: data.cityId,
      cityName: data.cityName,
      category: data.category || data.type,
      tags: data.tags || [],
      coverImage: data.coverImage || "https://images.unsplash.com/photo-1566073771259-6a8506099925?w=800&q=80",
      images: data.images || [],
      rating: 0,
      reviewCount: 0,
      priceRange: data.priceRange || 2,
      description: data.description || "",
      summary: data.description?.slice(0, 120) || "",
      location: data.location || { lat: -3.73, lng: -38.52, address: data.address || "" },
      amenities: data.amenities || [],
      schedule: data.schedule || null,
      metadata: data.metadata || {},
      ownerId,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    return entityRepo.add(entity2);
  }
  update(id, data, ownerId) {
    const entity2 = entityRepo.getById(id);
    if (!entity2 || entity2.ownerId !== ownerId) throw new Error("Sem permiss\xE3o");
    return entityRepo.update(id, data);
  }
  remove(id, ownerId) {
    const entity2 = entityRepo.getById(id);
    if (!entity2 || entity2.ownerId !== ownerId) throw new Error("Sem permiss\xE3o");
    entityRepo.remove(id);
  }
  getByOwner(ownerId) {
    return entityRepo.getByOwner(ownerId);
  }
};
var authService = new AuthService();
var establishmentService = new EstablishmentService();

// scripts/components/header.js
init_router();

// scripts/utils/debounce.js
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
function normalizeText2(text) {
  if (!text) return "";
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// scripts/services/search-service.js
init_constants();
init_event_bus();
var SearchService = class {
  search({ query = "", type = "", cityId = "", tags = [], priceMin = 0, priceMax = Infinity, sort = "relevance" } = {}) {
    const includeCities = Boolean(query || type === "city" || tags.length || cityId);
    let results = entityRepo.getAll().filter((e) => e.type !== "city" || includeCities);
    if (query) {
      const queryWords = normalizeText2(query).split(/\s+/).filter(Boolean);
      const exactMatches = results.map((entity2) => ({ entity: entity2, score: this._getRelevanceScore(entity2, queryWords) })).filter((item) => item.score > 0);
      if (exactMatches.length > 0) {
        results = exactMatches.sort((a, b) => b.score - a.score).map((item) => item.entity);
      } else {
        const fuzzyMatches = results.map((entity2) => ({ entity: entity2, score: this._getFallbackScore(entity2, queryWords) })).filter((item) => item.score > 0).sort((a, b) => b.score - a.score);
        results = fuzzyMatches.map((item) => item.entity);
      }
    }
    if (type) {
      results = results.filter((e) => e.type === type);
    }
    if (cityId) {
      results = results.filter((e) => e.cityId === cityId);
    }
    if (tags.length) {
      results = results.filter((e) => tags.every((t) => (e.tags || []).includes(t)));
    }
    if (priceMin > 0 || priceMax < Infinity) {
      results = results.filter((e) => {
        const price = this._getPrice(e);
        return price >= priceMin && price <= priceMax;
      });
    }
    results = this._sort(results, sort);
    return results;
  }
  _getPrice(entity2) {
    if (typeof entity2.priceRange === "number") return entity2.priceRange * 50;
    if (entity2.priceRange?.min != null) return entity2.priceRange.min;
    return 0;
  }
  _sort(results, sort) {
    const sorted = [...results];
    switch (sort) {
      case "price-asc":
        return sorted.sort((a, b) => this._getPrice(a) - this._getPrice(b));
      case "price-desc":
        return sorted.sort((a, b) => this._getPrice(b) - this._getPrice(a));
      case "rating":
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return sorted.sort((a, b) => (b.rating || 0) * (b.reviewCount || 1) - (a.rating || 0) * (a.reviewCount || 1));
    }
  }
  _getRelevanceScore(entity2, queryWords) {
    const haystack = normalizeText2([
      entity2.name,
      entity2.slug,
      entity2.cityName,
      entity2.category,
      entity2.description,
      entity2.summary,
      entity2.schedule,
      entity2.location?.address,
      entity2.metadata?.cuisine,
      entity2.metadata?.company,
      entity2.metadata?.menu,
      ...entity2.tags || [],
      ...entity2.amenities || []
    ].join(" "));
    return queryWords.reduce((score, word) => {
      if (!word) return score;
      const count = (haystack.match(new RegExp(word, "g")) || []).length;
      return score + count * 10 + (haystack.startsWith(word) ? 50 : 0);
    }, 0);
  }
  _getFallbackScore(entity2, queryWords) {
    const haystack = normalizeText2([
      entity2.name,
      entity2.slug,
      entity2.cityName,
      entity2.category,
      entity2.description,
      entity2.summary,
      entity2.schedule,
      entity2.location?.address,
      entity2.metadata?.cuisine,
      entity2.metadata?.company,
      entity2.metadata?.menu,
      ...entity2.tags || [],
      ...entity2.amenities || []
    ].join(" "));
    return queryWords.reduce((score, word) => {
      if (!word) return score;
      if (haystack.includes(word)) {
        const count = (haystack.match(new RegExp(word, "g")) || []).length;
        return score + count * 5;
      }
      const partial = word.slice(0, Math.max(3, Math.floor(word.length / 2)));
      if (partial && haystack.includes(partial)) {
        return score + 2;
      }
      return score;
    }, 0);
  }
  groupByType(results) {
    const groups = {};
    results.forEach((e) => {
      if (!groups[e.type]) groups[e.type] = [];
      groups[e.type].push(e);
    });
    return groups;
  }
  autocomplete(query, limit = 8) {
    if (!query || query.length < 2) return [];
    return this.search({ query }).slice(0, limit);
  }
  getCities() {
    return entityRepo.getByType("city");
  }
};
var searchService = new SearchService();

// scripts/components/search-bar.js
init_router();
function renderSearchBar({ variant = "hero", placeholder = "Para onde voc\xEA quer ir?", value = "", showButton = true } = {}) {
  return `
    <div class="search-bar search-bar--${variant}" data-search-bar>
      <div class="search-bar__inner">
        <div class="search-bar__input-wrap">
          <span class="search-bar__icon" aria-hidden="true">\u{1F50D}</span>
          <input type="search" class="search-bar__input" placeholder="${placeholder}"
            value="${value}" aria-label="Buscar destinos, hot\xE9is, restaurantes..." autocomplete="off">
          <div class="search-suggestions hidden" data-suggestions></div>
        </div>
        ${showButton ? '<button type="button" class="btn btn--primary btn--lg" data-search-submit>Buscar</button>' : ""}
      </div>
    </div>
  `;
}
function bindSearchBar(container, { onSubmit } = {}) {
  const bar = container.querySelector("[data-search-bar]");
  if (!bar) return;
  const input = bar.querySelector(".search-bar__input");
  const suggestions = bar.querySelector("[data-suggestions]");
  const submitBtn = bar.querySelector("[data-search-submit]");
  const doSearch = () => {
    const q = input.value.trim();
    if (onSubmit) onSubmit(q);
    else router.navigate(`/busca?q=${encodeURIComponent(q)}`);
    suggestions?.classList.add("hidden");
  };
  submitBtn?.addEventListener("click", doSearch);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      doSearch();
    }
    if (e.key === "Escape") suggestions?.classList.add("hidden");
  });
  const showSuggestions = debounce((q) => {
    if (!q || q.length < 2) {
      suggestions?.classList.add("hidden");
      return;
    }
    const results = searchService.autocomplete(q);
    if (!results.length) {
      suggestions?.classList.add("hidden");
      return;
    }
    suggestions.innerHTML = results.map((r) => `
      <div class="search-suggestions__item" data-suggest-slug="${r.slug}" data-suggest-type="${r.type}">
        <span>\u{1F4CD}</span>
        <div>
          <strong>${r.name}</strong>
          <div class="search-suggestions__type">${r.type} \xB7 ${r.cityName || ""}</div>
        </div>
      </div>
    `).join("");
    suggestions.classList.remove("hidden");
    suggestions.querySelectorAll(".search-suggestions__item").forEach((item) => {
      item.addEventListener("click", () => {
        const typeRoutes = { city: "cidade", beach: "praia", hotel: "hotel", restaurant: "restaurante", tour: "passeio", event: "evento" };
        const route = typeRoutes[item.dataset.suggestType] || "busca";
        if (route === "busca") router.navigate(`/busca?q=${encodeURIComponent(input.value)}`);
        else router.navigate(`/${route}/${item.dataset.suggestSlug}`);
      });
    });
  }, 200);
  input.addEventListener("input", () => showSuggestions(input.value.trim()));
  document.addEventListener("click", (e) => {
    if (!bar.contains(e.target)) suggestions?.classList.add("hidden");
  });
}

// scripts/components/header.js
init_toast();
init_event_bus();
var NAV_ITEMS = [
  { label: "Destinos", href: "/#destinos" },
  { label: "Praias", href: "/#praias" },
  { label: "Hot\xE9is", href: "/#hoteis" },
  { label: "Gastronomia", href: "/#gastronomia" },
  { label: "Passeios", href: "/#passeios" },
  { label: "Eventos", href: "/#eventos" },
  { label: "Mapa", href: "/mapa" }
];
function renderHeader() {
  const user = authService.getCurrentUser();
  const theme = storage.getTheme();
  const initials = user ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "";
  return `
    <header class="site-header" role="banner">
      <div class="container site-header__inner">
        <a href="/" data-nav class="site-header__logo">
          <span class="site-header__logo-icon" aria-hidden="true">\u{1F334}</span>
          <span>Turistando <strong>CE</strong></span>
        </a>

        <nav class="site-nav" aria-label="Principal">
          ${NAV_ITEMS.map((item) => `<a href="${item.href}" data-nav class="site-nav__link">${item.label}</a>`).join("")}
        </nav>

        <div class="site-header__search-compact hide-mobile">
          ${renderSearchBar({ variant: "compact", showButton: false })}
        </div>

        <div class="site-header__actions">
          <a href="/planejar" data-nav class="btn btn--secondary btn--sm hide-mobile">Planejar viagem</a>
          <button class="theme-toggle" data-theme-toggle aria-label="Alternar tema">${theme === "dark" ? "\u2600\uFE0F" : "\u{1F319}"}</button>
          ${user ? `
            <div class="profile-dropdown" data-profile-dropdown>
              <button class="profile-avatar" aria-label="Menu do perfil">${initials}</button>
              <div class="profile-dropdown__menu">
                <span class="profile-dropdown__item text-muted" style="pointer-events:none">${user.name}</span>
                <a href="/perfil" data-nav class="profile-dropdown__item">Meu perfil</a>
                <a href="/perfil" data-nav class="profile-dropdown__item">Favoritos</a>
                ${user.role === "parceiro" ? '<a href="/cadastrar" data-nav class="profile-dropdown__item">Cadastrar</a>' : ""}
                <button class="profile-dropdown__item" data-logout>Sair</button>
              </div>
            </div>
          ` : `
            <button class="btn btn--ghost btn--sm" data-auth-open>Entrar</button>
          `}
          <button class="mobile-menu-btn" data-mobile-menu aria-label="Menu">\u2630</button>
        </div>
      </div>

      <nav class="mobile-nav" data-mobile-nav aria-label="Menu mobile">
        ${NAV_ITEMS.map((item) => `<a href="${item.href}" data-nav class="mobile-nav__link">${item.label}</a>`).join("")}
        <a href="/planejar" data-nav class="mobile-nav__link">Planejar viagem</a>
        <a href="/perfil" data-nav class="mobile-nav__link">Perfil</a>
        <a href="/sobre" data-nav class="mobile-nav__link">Sobre</a>
      </nav>
    </header>
  `;
}
function bindHeader(container) {
  container.querySelector("[data-theme-toggle]")?.addEventListener("click", () => {
    const theme = storage.toggleTheme();
    container.querySelector("[data-theme-toggle]").textContent = theme === "dark" ? "\u2600\uFE0F" : "\u{1F319}";
  });
  container.querySelector("[data-mobile-menu]")?.addEventListener("click", () => {
    container.querySelector("[data-mobile-nav]")?.classList.toggle("is-open");
  });
  container.querySelector("[data-mobile-nav]")?.addEventListener("click", () => {
    container.querySelector("[data-mobile-nav]")?.classList.remove("is-open");
  });
  const dropdown = container.querySelector("[data-profile-dropdown]");
  dropdown?.querySelector(".profile-avatar")?.addEventListener("click", () => {
    dropdown.classList.toggle("is-open");
  });
  container.querySelector("[data-logout]")?.addEventListener("click", () => {
    authService.logout();
    showToast("Voc\xEA saiu da conta", "info");
    router.navigate("/");
  });
  container.querySelector("[data-auth-open]")?.addEventListener("click", () => {
    openAuthModal();
  });
  bindSearchBar(container);
  eventBus.on(EVENTS.AUTH_CHANGED, () => {
    const headerEl = document.querySelector(".site-header");
    if (headerEl) {
      headerEl.outerHTML = renderHeader();
      bindHeader(document.getElementById("app-root"));
    }
  });
}
function openAuthModal() {
  let mode = "login";
  const content = document.createElement("div");
  const render = () => {
    content.innerHTML = `
      <div class="auth-tabs">
        <button class="${mode === "login" ? "is-active" : ""}" data-mode="login">Entrar</button>
        <button class="${mode === "register" ? "is-active" : ""}" data-mode="register">Cadastrar</button>
      </div>
      <form data-auth-form>
        ${mode === "register" ? `
          <div class="form-group">
            <label class="form-label">Nome</label>
            <input class="input" name="name" required>
          </div>
          <div class="form-group">
            <label class="form-label">Perfil</label>
            <select class="select" name="role">
              <option value="turista">Turista</option>
              <option value="parceiro">Parceiro (hotel/restaurante)</option>
            </select>
          </div>
        ` : ""}
        <div class="form-group">
          <label class="form-label">E-mail</label>
          <input class="input" type="email" name="email" required>
        </div>
        <div class="form-group">
          <label class="form-label">Senha</label>
          <input class="input" type="password" name="password" required minlength="4">
        </div>
        <button type="submit" class="btn btn--primary btn--block">${mode === "login" ? "Entrar" : "Criar conta"}</button>
      </form>
    `;
    content.querySelectorAll("[data-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        mode = btn.dataset.mode;
        render();
      });
    });
    content.querySelector("[data-auth-form]")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        if (mode === "login") {
          authService.login(fd.get("email"), fd.get("password"));
          showToast("Bem-vindo de volta!", "success");
        } else {
          authService.register({
            name: fd.get("name"),
            email: fd.get("email"),
            password: fd.get("password"),
            role: fd.get("role")
          });
          showToast("Conta criada com sucesso!", "success");
        }
        modal.close();
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  };
  const modal = openModal({ title: "Acesse sua conta", content });
  render();
}

// scripts/components/footer.js
function renderFooter() {
  return `
    <footer class="site-footer" role="contentinfo">
      <div class="container">
        <div class="site-footer__grid">
          <div class="site-footer__brand">
            <a href="/" data-nav class="site-header__logo" style="color:white">
              <span class="site-header__logo-icon">\u{1F334}</span>
              <span>Turistando <strong>CE</strong></span>
            </a>
            <p>A plataforma completa de turismo do Cear\xE1. Descubra, planeje e viva experi\xEAncias inesquec\xEDveis.</p>
            <div class="site-footer__social">
              <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram">\u{1F4F7}</a>
              <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook">\u{1F4D8}</a>
              <a href="https://youtube.com" target="_blank" rel="noopener" aria-label="YouTube">\u25B6\uFE0F</a>
            </div>
          </div>
          <div>
            <h4 class="site-footer__title">Explorar</h4>
            <ul class="site-footer__links">
              <li><a href="/busca?tipo=city" data-nav>Destinos</a></li>
              <li><a href="/busca?tipo=beach" data-nav>Praias</a></li>
              <li><a href="/busca?tipo=hotel" data-nav>Hot\xE9is</a></li>
              <li><a href="/busca?tipo=restaurant" data-nav>Restaurantes</a></li>
              <li><a href="/mapa" data-nav>Mapa</a></li>
            </ul>
          </div>
          <div>
            <h4 class="site-footer__title">Plataforma</h4>
            <ul class="site-footer__links">
              <li><a href="/planejar" data-nav>Planejar viagem</a></li>
              <li><a href="/perfil" data-nav>Meu perfil</a></li>
              <li><a href="/cadastrar" data-nav>Cadastrar estabelecimento</a></li>
              <li><a href="/sobre" data-nav>Sobre n\xF3s</a></li>
            </ul>
          </div>
          <div>
            <h4 class="site-footer__title">Newsletter</h4>
            <p class="text-sm" style="opacity:0.8">Receba dicas e ofertas do Cear\xE1</p>
            <form class="newsletter-form" data-newsletter>
              <input type="email" placeholder="Seu e-mail" aria-label="E-mail para newsletter">
              <button type="submit" class="btn btn--secondary btn--sm">OK</button>
            </form>
          </div>
        </div>
        <div class="site-footer__bottom">
          <span>\xA9 2026 Turistando CE. Todos os direitos reservados.</span>
          <button data-a11y-open class="btn btn--ghost btn--sm" style="color:rgba(255,255,255,0.8);border-color:rgba(255,255,255,0.3)">\u267F Acessibilidade</button>
        </div>
      </div>
    </footer>
  `;
}
function bindFooter(container) {
  container.querySelector("[data-newsletter]")?.addEventListener("submit", (e) => {
    e.preventDefault();
    Promise.resolve().then(() => (init_toast(), toast_exports)).then(({ showToast: showToast2 }) => showToast2("Inscri\xE7\xE3o realizada! Obrigado.", "success"));
    e.target.reset();
  });
}

// scripts/components/accessibility-toolbar.js
function renderAccessibilityToolbar() {
  return `
    <div class="a11y-toolbar" data-a11y-toolbar>
      <div class="a11y-toolbar__panel">
        <button class="a11y-toolbar__btn" data-a11y-font-up>\u{1F524} A+ Aumentar fonte</button>
        <button class="a11y-toolbar__btn" data-a11y-font-down>\u{1F521} A- Diminuir fonte</button>
        <button class="a11y-toolbar__btn" data-a11y-contrast>\u25D0 Alto contraste</button>
        <button class="a11y-toolbar__btn" data-a11y-speak>\u{1F50A} Leitura por voz</button>
        <button class="a11y-toolbar__btn" data-a11y-stop>\u23F9 Parar leitura</button>
      </div>
      <button class="a11y-toolbar__toggle" aria-label="Ferramentas de acessibilidade">\u267F</button>
    </div>
  `;
}
function bindAccessibilityToolbar(container) {
  const toolbar = container.querySelector("[data-a11y-toolbar]");
  if (!toolbar) return;
  toolbar.querySelector(".a11y-toolbar__toggle")?.addEventListener("click", () => {
    toolbar.classList.toggle("is-open");
  });
  toolbar.querySelector("[data-a11y-font-up]")?.addEventListener("click", () => setFontScale(0.1));
  toolbar.querySelector("[data-a11y-font-down]")?.addEventListener("click", () => setFontScale(-0.1));
  toolbar.querySelector("[data-a11y-contrast]")?.addEventListener("click", () => toggleHighContrast());
  toolbar.querySelector("[data-a11y-speak]")?.addEventListener("click", () => {
    const main = document.getElementById("main-content");
    if (main) speakText(main.innerText.slice(0, 2e3));
  });
  toolbar.querySelector("[data-a11y-stop]")?.addEventListener("click", stopSpeaking);
  document.querySelector("[data-a11y-open]")?.addEventListener("click", () => {
    toolbar.classList.add("is-open");
  });
}

// scripts/components/map-widget.js
var TYPE_COLORS = {
  hotel: "#1B4D3E",
  restaurant: "#A67C52",
  beach: "#5B9BD5",
  tour: "#4CAF7D",
  event: "#D97706",
  city: "#2D7A5F",
  establishment: "#6B7280"
};
var activeMap = null;
function createMap(container, { center = [-3.73, -38.52], zoom = 8, entities = [], onMarkerClick } = {}) {
  if (activeMap) {
    activeMap.remove();
    activeMap = null;
  }
  if (!window.L) {
    container.innerHTML = '<p class="text-muted">Mapa indispon\xEDvel. Verifique sua conex\xE3o.</p>';
    return null;
  }
  const map = L.map(container, { scrollWheelZoom: true }).setView(center, zoom);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "\xA9 OpenStreetMap"
  }).addTo(map);
  const markers = [];
  entities.forEach((entity2) => {
    if (!entity2.location?.lat || !entity2.location?.lng) return;
    const color = TYPE_COLORS[entity2.type] || "#1B4D3E";
    const icon = L.divIcon({
      className: "map-marker",
      html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
    const marker = L.marker([entity2.location.lat, entity2.location.lng], { icon }).addTo(map).bindPopup(`
        <div class="map-popup">
          <h4>${entity2.name}</h4>
          <p>${entity2.cityName || ""} \xB7 ${entity2.type}</p>
          <a href="#" data-map-nav="${entity2.slug}" data-map-type="${entity2.type}">Ver detalhes \u2192</a>
        </div>
      `);
    marker.entity = entity2;
    markers.push(marker);
    marker.on("click", () => onMarkerClick?.(entity2));
  });
  if (markers.length > 1) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.1));
  }
  activeMap = map;
  container.addEventListener("click", (e) => {
    const link = e.target.closest("[data-map-nav]");
    if (link) {
      e.preventDefault();
      const routes2 = { city: "cidade", beach: "praia", hotel: "hotel", restaurant: "restaurante", tour: "passeio", event: "evento" };
      const route = routes2[link.dataset.mapType] || "busca";
      Promise.resolve().then(() => (init_router(), router_exports)).then(({ router: router2 }) => router2.navigate(`/${route}/${link.dataset.mapNav}`));
    }
  });
  return { map, markers };
}
function destroyMap() {
  if (activeMap) {
    activeMap.remove();
    activeMap = null;
  }
}
function flyToMarker(map, entity2) {
  if (map && entity2?.location) {
    map.flyTo([entity2.location.lat, entity2.location.lng], 14);
  }
}

// scripts/services/history-service.js
init_constants();
var MAX_HISTORY = 50;
var HistoryService = class {
  getAll() {
    return storage.get(STORAGE_KEYS.HISTORY) || [];
  }
  add(entity2) {
    let history2 = this.getAll().filter((h) => h.entityId !== entity2.id);
    history2.unshift({
      entityId: entity2.id,
      entityType: entity2.type,
      name: entity2.name,
      slug: entity2.slug,
      coverImage: entity2.coverImage,
      cityName: entity2.cityName,
      viewedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    history2 = history2.slice(0, MAX_HISTORY);
    storage.set(STORAGE_KEYS.HISTORY, history2);
  }
  getRecent(limit = 10) {
    return this.getAll().slice(0, limit);
  }
  getEntities(allEntities, limit = 10) {
    const history2 = this.getRecent(limit);
    return history2.map((h) => allEntities.find((e) => e.id === h.entityId)).filter(Boolean);
  }
};
var historyService = new HistoryService();

// scripts/services/reviews-service.js
init_constants();
var ReviewsService = class {
  getAll() {
    return storage.get(STORAGE_KEYS.REVIEWS) || [];
  }
  getByEntity(entityId) {
    return this.getAll().filter((r) => r.entityId === entityId);
  }
  getByUser(userId) {
    return this.getAll().filter((r) => r.userId === userId);
  }
  add({ entityId, userId, userName, rating, text }) {
    const reviews = this.getAll();
    const review = {
      id: generateId("review"),
      entityId,
      userId,
      userName,
      rating,
      text,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    reviews.unshift(review);
    storage.set(STORAGE_KEYS.REVIEWS, reviews);
    return review;
  }
  getRecent(limit = 5) {
    return this.getAll().slice(0, limit);
  }
  getAverageRating(entityId) {
    const reviews = this.getByEntity(entityId);
    if (!reviews.length) return null;
    return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  }
};
var reviewsService = new ReviewsService();

// data/categories.js
var CATEGORIES = [
  { id: "destinos", label: "Destinos", icon: "\u{1F4CD}", type: "city" },
  { id: "praias", label: "Praias", icon: "\u{1F3D6}\uFE0F", type: "beach" },
  { id: "hoteis", label: "Hot\xE9is", icon: "\u{1F3E8}", type: "hotel" },
  { id: "gastronomia", label: "Gastronomia", icon: "\u{1F37D}\uFE0F", type: "restaurant" },
  { id: "passeios", label: "Passeios", icon: "\u{1F690}", type: "tour" },
  { id: "eventos", label: "Eventos", icon: "\u{1F389}", type: "event" },
  { id: "serras", label: "Serras", icon: "\u26F0\uFE0F", tag: "serra" },
  { id: "aventura", label: "Aventura", icon: "\u{1FA82}", tag: "aventura" }
];
var TAGS = [
  { id: "luxo", label: "Luxo" },
  { id: "pet-friendly", label: "Pet Friendly" },
  { id: "familia", label: "Fam\xEDlia" },
  { id: "casal", label: "Casal" },
  { id: "natureza", label: "Natureza" },
  { id: "gastronomia", label: "Gastronomia" },
  { id: "aventura", label: "Aventura" },
  { id: "serra", label: "Serra" },
  { id: "praia", label: "Praia" },
  { id: "cultural", label: "Cultural" },
  { id: "romantico", label: "Rom\xE2ntico" },
  { id: "economico", label: "Econ\xF4mico" }
];
var INTERESTS = [
  { id: "praias", label: "Praias e mar" },
  { id: "gastronomia", label: "Gastronomia local" },
  { id: "cultura", label: "Cultura e hist\xF3ria" },
  { id: "aventura", label: "Aventura e esportes" },
  { id: "natureza", label: "Natureza e ecoturismo" },
  { id: "noite", label: "Vida noturna" },
  { id: "compras", label: "Compras e artesanato" },
  { id: "relaxamento", label: "Relaxamento e spa" }
];
var PROFILES = [
  { id: "familia", label: "Fam\xEDlia com crian\xE7as" },
  { id: "casal", label: "Casal rom\xE2ntico" },
  { id: "amigos", label: "Grupo de amigos" },
  { id: "aventureiro", label: "Aventureiro solo" },
  { id: "luxo", label: "Experi\xEAncia premium" }
];

// scripts/pages/home-page.js
init_constants();

// scripts/services/wishlist-service.js
init_constants();
init_event_bus();
var WishlistService = class {
  getAll() {
    return storage.get(STORAGE_KEYS.WISHLIST) || [];
  }
  isWished(entityId) {
    return this.getAll().some((w) => w.entityId === entityId);
  }
  toggle(entity2) {
    const list = this.getAll();
    const idx = list.findIndex((w) => w.entityId === entity2.id);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.unshift({
        entityId: entity2.id,
        entityType: entity2.type,
        name: entity2.name,
        slug: entity2.slug,
        coverImage: entity2.coverImage,
        cityName: entity2.cityName,
        addedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    storage.set(STORAGE_KEYS.WISHLIST, list);
    eventBus.emit(EVENTS.STORAGE_UPDATED, { key: STORAGE_KEYS.WISHLIST });
    return idx < 0;
  }
  getEntities(allEntities) {
    const ids = new Set(this.getAll().map((w) => w.entityId));
    return allEntities.filter((e) => ids.has(e.id));
  }
};
var wishlistService = new WishlistService();

// scripts/services/itinerary-engine.js
init_constants();
var ItineraryEngine = class {
  generate({ days = 3, budget = 3e3, cityId, interests = [], profile = "familia" }) {
    const city = entityRepo.getById(cityId);
    if (!city) throw new Error("Cidade n\xE3o encontrada");
    const dailyBudget = budget / days;
    const pool = searchService.search({ cityId });
    const scored = pool.map((e) => ({
      entity: e,
      score: this._score(e, interests, profile)
    })).sort((a, b) => b.score - a.score);
    const itinerary = [];
    const used = /* @__PURE__ */ new Set();
    for (let d = 0; d < days; d++) {
      const dayActivities = [];
      let dayCost = 0;
      const slots = [
        { time: "08:00", types: ["tour", "beach"] },
        { time: "12:30", types: ["restaurant"] },
        { time: "14:30", types: ["tour", "beach", "event"] },
        { time: "19:30", types: ["restaurant", "event"] }
      ];
      for (const slot of slots) {
        const candidate = scored.find(({ entity: entity2 }) => {
          if (used.has(entity2.id)) return false;
          if (!slot.types.includes(entity2.type)) return false;
          const cost = this._getCost(entity2);
          return dayCost + cost <= dailyBudget * 1.2;
        });
        if (candidate) {
          const cost = this._getCost(candidate.entity);
          dayActivities.push({
            time: slot.time,
            entity: candidate.entity,
            cost
          });
          dayCost += cost;
          used.add(candidate.entity.id);
        }
      }
      itinerary.push({
        day: d + 1,
        date: this._addDays(/* @__PURE__ */ new Date(), d),
        activities: dayActivities,
        estimatedCost: dayCost
      });
    }
    const totalCost = itinerary.reduce((s, d) => s + d.estimatedCost, 0);
    return {
      id: generateId("itinerary"),
      cityId,
      cityName: city.name,
      days,
      budget,
      interests,
      profile,
      itinerary,
      totalCost,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  _score(entity2, interests, profile) {
    let score = entity2.rating || 4;
    const tags = entity2.tags || [];
    interests.forEach((i) => {
      const map = { praias: "praia", gastronomia: "gastronomia", cultura: "cultural", aventura: "aventura", natureza: "natureza", noite: "noite" };
      if (tags.includes(map[i] || i)) score += 2;
    });
    const profileTags = { familia: "familia", casal: "casal", amigos: "aventura", aventureiro: "aventura", luxo: "luxo" };
    if (tags.includes(profileTags[profile])) score += 1.5;
    return score;
  }
  _getCost(entity2) {
    if (typeof entity2.priceRange === "number") return entity2.priceRange * 40;
    if (entity2.priceRange?.min) return entity2.priceRange.min;
    return 50;
  }
  _addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  }
  save(itinerary) {
    const all = storage.get(STORAGE_KEYS.ITINERARIES) || [];
    all.unshift(itinerary);
    storage.set(STORAGE_KEYS.ITINERARIES, all);
    return itinerary;
  }
  getAll() {
    return storage.get(STORAGE_KEYS.ITINERARIES) || [];
  }
  remove(id) {
    const all = this.getAll().filter((i) => i.id !== id);
    storage.set(STORAGE_KEYS.ITINERARIES, all);
  }
};
var itineraryEngine = new ItineraryEngine();

// scripts/utils/format.js
function formatPrice(value, currency = "BRL") {
  if (value == null) return "Consulte";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value);
}
function formatPriceRange(range) {
  if (typeof range === "number") {
    if (range <= 0) return "Gratuito";
    return Array(range).fill("R$").join(" ");
  }
  if (range?.min != null && range?.max != null) {
    if (range.min === 0 && range.max === 0) return "Gratuito";
    return `${formatPrice(range.min)} - ${formatPrice(range.max)}`;
  }
  if (range?.min != null) return `A partir de ${formatPrice(range.min)}`;
  return "Consulte";
}
function formatRating(rating) {
  return Number(rating).toFixed(1);
}
function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(dateStr));
}
function formatRelativeDate(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 864e5);
  if (days === 0) return "Hoje";
  if (days === 1) return "Ontem";
  if (days < 7) return `${days} dias atr\xE1s`;
  if (days < 30) return `${Math.floor(days / 7)} semanas atr\xE1s`;
  return formatDate(dateStr);
}
function pluralize(count, singular, plural) {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural || singular + "s"}`;
}

// scripts/components/rating.js
function renderRating(rating, reviewCount) {
  return `
    <span class="rating" aria-label="Avalia\xE7\xE3o ${rating} de 5">
      <span class="rating__star">\u2605</span>
      <span>${formatRating(rating)}</span>
      ${reviewCount ? `<span class="text-muted">(${reviewCount})</span>` : ""}
    </span>
  `;
}
function renderRatingInput(name = "rating", value = 5) {
  return `
    <div class="rating rating--input" data-rating-input="${name}">
      ${[1, 2, 3, 4, 5].map((n) => `
        <span class="rating__star" data-value="${n}" role="button" tabindex="0"
          aria-label="${n} estrelas" style="color: ${n <= value ? "#F59E0B" : "#D1D5DB"}">\u2605</span>
      `).join("")}
      <input type="hidden" name="${name}" value="${value}">
    </div>
  `;
}
function bindRatingInput(container) {
  container.querySelectorAll("[data-rating-input]").forEach((wrap) => {
    const input = wrap.querySelector('input[type="hidden"]');
    wrap.querySelectorAll(".rating__star").forEach((star) => {
      star.addEventListener("click", () => {
        const val = parseInt(star.dataset.value);
        input.value = val;
        wrap.querySelectorAll(".rating__star").forEach((s) => {
          s.style.color = parseInt(s.dataset.value) <= val ? "#F59E0B" : "#D1D5DB";
        });
      });
    });
  });
}

// scripts/services/favorites-service.js
init_constants();
init_event_bus();
var FavoritesService = class {
  getAll() {
    return storage.get(STORAGE_KEYS.FAVORITES) || [];
  }
  isFavorite(entityId) {
    return this.getAll().some((f) => f.entityId === entityId);
  }
  toggle(entity2) {
    const favorites = this.getAll();
    const idx = favorites.findIndex((f) => f.entityId === entity2.id);
    if (idx >= 0) {
      favorites.splice(idx, 1);
    } else {
      favorites.unshift({
        entityId: entity2.id,
        entityType: entity2.type,
        name: entity2.name,
        slug: entity2.slug,
        coverImage: entity2.coverImage,
        cityName: entity2.cityName,
        addedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    storage.set(STORAGE_KEYS.FAVORITES, favorites);
    eventBus.emit(EVENTS.FAVORITE_TOGGLED, { entityId: entity2.id, isFavorite: idx < 0 });
    return idx < 0;
  }
  getEntities(allEntities) {
    const ids = new Set(this.getAll().map((f) => f.entityId));
    return allEntities.filter((e) => ids.has(e.id));
  }
};
var favoritesService = new FavoritesService();

// scripts/components/favorite-button.js
init_event_bus();
function renderFavoriteButton(entity2, className = "") {
  const isActive = favoritesService.isFavorite(entity2.id);
  return `
    <button class="entity-card__favorite ${isActive ? "is-active" : ""} ${className}"
      data-favorite-id="${entity2.id}" aria-label="${isActive ? "Remover dos favoritos" : "Adicionar aos favoritos"}"
      aria-pressed="${isActive}">
      ${isActive ? "\u2665" : "\u2661"}
    </button>
  `;
}
function bindFavoriteButtons(container, entities) {
  container.querySelectorAll("[data-favorite-id]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const entity2 = entities.find((en) => en.id === btn.dataset.favoriteId);
      if (!entity2) return;
      const isNow = favoritesService.toggle(entity2);
      btn.classList.toggle("is-active", isNow);
      btn.textContent = isNow ? "\u2665" : "\u2661";
      btn.setAttribute("aria-pressed", isNow);
    });
  });
}

// scripts/components/entity-card.js
init_router();
var TYPE_ROUTES = {
  city: "/cidade",
  beach: "/praia",
  hotel: "/hotel",
  restaurant: "/restaurante",
  tour: "/passeio",
  event: "/evento",
  establishment: "/hotel"
};
function getEntityUrl(entity2) {
  const base = TYPE_ROUTES[entity2.type] || "/busca";
  return `${base}/${entity2.slug}`;
}
function renderEntityCard(entity2) {
  const url = getEntityUrl(entity2);
  const price = entity2.priceRange != null ? formatPriceRange(entity2.priceRange) : "";
  const badge = entity2.type === "event" ? '<span class="badge badge--new">Evento</span>' : "";
  return `
    <article class="entity-card reveal" data-entity-id="${entity2.id}">
      <div class="entity-card__media aspect-4-3 overflow-hidden">
        <a href="${url}" data-nav>
          <img src="${entity2.coverImage}" alt="${entity2.name}" loading="lazy" class="object-cover">
        </a>
        ${badge ? `<div class="entity-card__badge">${badge}</div>` : ""}
        ${renderFavoriteButton(entity2)}
      </div>
      <a href="${url}" data-nav class="entity-card__body">
        <div class="entity-card__meta">
          <span>${entity2.cityName || ""}</span>
          ${entity2.category ? `<span>${entity2.category}</span>` : ""}
        </div>
        <h3 class="entity-card__title">${entity2.name}</h3>
        <p class="entity-card__summary line-clamp-2">${entity2.summary || ""}</p>
        <div class="entity-card__footer">
          ${renderRating(entity2.rating, entity2.reviewCount)}
          ${price ? `<span class="entity-card__price">${price}</span>` : ""}
        </div>
      </a>
    </article>
  `;
}
function renderEntityGrid(entities) {
  if (!entities.length) return "";
  return `<div class="grid grid--2 grid--3 grid--4">${entities.map(renderEntityCard).join("")}</div>`;
}
function renderSectionBlock({ title, subtitle, entities, viewAllLink, anchorId }) {
  return `
    <section ${anchorId ? `id="${anchorId}"` : ""} class="section reveal">
      <div class="container">
        <div class="section-header">
          <div>
            <h2 class="section-title">${title}</h2>
            ${subtitle ? `<p class="section-subtitle">${subtitle}</p>` : ""}
          </div>
          ${viewAllLink ? `<a href="${viewAllLink}" data-nav class="btn btn--ghost">Ver todos \u2192</a>` : ""}
        </div>
        ${renderEntityGrid(entities)}
      </div>
    </section>
  `;
}
function renderEmptyState({ icon = "\u{1F50D}", title, message, ctaText, ctaLink }) {
  return `
    <div class="empty-state">
      <div class="empty-state__icon">${icon}</div>
      <h3>${title}</h3>
      <p>${message}</p>
      ${ctaText ? `<a href="${ctaLink || "/"}" data-nav class="btn btn--primary">${ctaText}</a>` : ""}
    </div>
  `;
}

// scripts/pages/home-page.js
init_dom();
function renderHomePage() {
  const cities = entityRepo.getByType("city").slice(0, 8);
  const beaches = entityRepo.getByType("beach").slice(0, 4);
  const hotels = entityRepo.getByType("hotel").sort((a, b) => b.rating - a.rating).slice(0, 4);
  const restaurants = entityRepo.getByType("restaurant").sort((a, b) => b.rating - a.rating).slice(0, 4);
  const tours = entityRepo.getByType("tour").slice(0, 4);
  const events = entityRepo.getByType("event").slice(0, 4);
  const serras = cities.filter((c) => (c.tags || []).includes("serra"));
  const recent = historyService.getRecent(4);
  const recentEntities = recent.map((h) => entityRepo.getById(h.entityId)).filter(Boolean);
  const reviews = reviewsService.getRecent(3);
  const wishlist = wishlistService.getEntities(entityRepo.getAll()).slice(0, 4);
  const savedRoutes = itineraryEngine.getAll().slice(0, 3);
  const news = [
    { title: "Festival de Forr\xF3 de Jeri", desc: "Julho 2026 \u2014 m\xFAsica, cultura e p\xF4r do sol", image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80", link: "/busca?tipo=event" },
    { title: "Nova rota ecoturismo na Chapada", desc: "Trilhas guiadas no Crato", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80", link: "/busca?tag=natureza" },
    { title: "Hot\xE9is pet friendly em Fortaleza", desc: "Viaje com seu pet pela orla", image: "https://images.unsplash.com/photo-1566073771259-6a8506099925?w=400&q=80", link: "/busca?tipo=hotel&tag=pet-friendly" }
  ];
  return `
    <section class="hero">
      <div class="hero__bg">
        <img src="https://images.unsplash.com/photo-1596484552834-0650573cbe53?w=1920&q=80" alt="Praia do Cear\xE1 ao p\xF4r do sol">
      </div>
      <div class="hero__overlay"></div>
      <div class="hero__content container">
        <h1 class="hero__title">Descubra o melhor do Cear\xE1</h1>
        <p class="hero__subtitle">Hot\xE9is, praias, gastronomia, passeios e roteiros \u2014 tudo em um s\xF3 lugar.</p>
        <div class="hero__search">${renderSearchBar({ variant: "hero" })}</div>
        <div class="hero__actions" style="margin-top:var(--space-4)">
          <a href="/busca" data-nav class="btn btn--primary btn--lg">Buscar mais op\xE7\xF5es</a>
        </div>
        <div class="hero__popular chip-group" style="margin-top:var(--space-4)">
          ${POPULAR_SEARCHES.map((q) => `
            <a href="/busca?q=${encodeURIComponent(q)}" data-nav class="chip chip--category">${q}</a>
          `).join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title reveal">Explore por categoria</h2>
        <div class="categories-scroll reveal">
          ${CATEGORIES.map((cat) => `
            <a href="/busca?tipo=${cat.type || ""}&tag=${cat.tag || ""}" data-nav class="category-card">
              <span class="category-card__icon">${cat.icon}</span>
              <span class="font-semibold">${cat.label}</span>
            </a>
          `).join("")}
        </div>
      </div>
    </section>

    ${renderSectionBlock({ title: "Destinos populares", subtitle: "As cidades mais visitadas do Cear\xE1", entities: cities, viewAllLink: "/busca?tipo=city", anchorId: "destinos" })}
    ${renderSectionBlock({ title: "Praias imperd\xEDveis", subtitle: "Do litoral urbano ao para\xEDso de Jeri", entities: beaches, viewAllLink: "/busca?tipo=beach", anchorId: "praias" })}
    ${serras.length ? renderSectionBlock({ title: "Serras e interior", subtitle: "Clima ameno e natureza exuberante", entities: serras, viewAllLink: "/busca?tag=serra" }) : ""}
    ${renderSectionBlock({ title: "Hot\xE9is em destaque", subtitle: "Hospedagens bem avaliadas", entities: hotels, viewAllLink: "/busca?tipo=hotel", anchorId: "hoteis" })}
    ${renderSectionBlock({ title: "Gastronomia", subtitle: "Sabores aut\xEAnticos do Cear\xE1", entities: restaurants, viewAllLink: "/busca?tipo=restaurant", anchorId: "gastronomia" })}
    ${renderSectionBlock({ title: "Passeios e experi\xEAncias", subtitle: "Aventuras inesquec\xEDveis", entities: tours, viewAllLink: "/busca?tipo=tour", anchorId: "passeios" })}
    ${renderSectionBlock({ title: "Eventos", subtitle: "Festivais e celebra\xE7\xF5es", entities: events, viewAllLink: "/busca?tipo=event", anchorId: "eventos" })}

    ${recentEntities.length ? renderSectionBlock({ title: "Vistos recentemente", subtitle: "Continue de onde parou", entities: recentEntities }) : ""}

    ${wishlist.length ? renderSectionBlock({ title: "Quero conhecer", subtitle: "Lugares que voc\xEA marcou para visitar", entities: wishlist }) : ""}

    <section class="section section--alt reveal">
      <div class="container">
        <div class="section-header">
          <div>
            <h2 class="section-title">Novidades</h2>
            <p class="section-subtitle">O que h\xE1 de novo no turismo cearense</p>
          </div>
        </div>
        <div class="grid grid--2 grid--3">
          ${news.map((n) => `
            <a href="${n.link}" data-nav class="news-card">
              <div class="news-card__image aspect-4-3 overflow-hidden">
                <img src="${n.image}" alt="" class="object-cover" loading="lazy">
              </div>
              <div class="news-card__body">
                <h3 class="font-semibold">${n.title}</h3>
                <p class="text-sm text-muted">${n.desc}</p>
              </div>
            </a>
          `).join("")}
        </div>
      </div>
    </section>

    ${savedRoutes.length ? `
      <section class="section reveal">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">Roteiros salvos</h2>
            <a href="/perfil?tab=roteiros" data-nav class="btn btn--ghost">Ver todos</a>
          </div>
          <div class="grid grid--2 grid--3">
            ${savedRoutes.map((r) => `
              <div class="info-card">
                <h3>${r.cityName}</h3>
                <p class="text-muted">${r.days} dias \xB7 ${r.itinerary?.length || 0} dias planejados</p>
                <a href="/planejar" data-nav class="btn btn--ghost btn--sm" style="margin-top:var(--space-3)">Ver roteiro</a>
              </div>
            `).join("")}
          </div>
        </div>
      </section>
    ` : ""}

    <section class="section section--alt reveal">
      <div class="container">
        <div class="section-header">
          <div>
            <h2 class="section-title">Avalia\xE7\xF5es recentes</h2>
            <p class="section-subtitle">O que os viajantes est\xE3o dizendo</p>
          </div>
        </div>
        <div class="reviews-carousel">
          ${reviews.length ? reviews.map((r) => {
    const entity2 = entityRepo.getById(r.entityId);
    return `
              <div class="review-card">
                <p class="review-card__text">"${r.text}"</p>
                <div class="flex items-center gap-4">
                  ${renderRating(r.rating)}
                  <span class="text-sm text-muted">${r.userName} \xB7 ${entity2?.name || ""}</span>
                </div>
              </div>
            `;
  }).join("") : `
            <div class="review-card">
              <p class="review-card__text">"Jericoacoara superou todas as expectativas. O p\xF4r do sol na duna \xE9 m\xE1gico!"</p>
              ${renderRating(5)} <span class="text-sm text-muted">Maria \xB7 Jericoacoara</span>
            </div>
            <div class="review-card">
              <p class="review-card__text">"Fortaleza tem uma gastronomia incr\xEDvel. O Coco Bambu \xE9 imperd\xEDvel!"</p>
              ${renderRating(5)} <span class="text-sm text-muted">Jo\xE3o \xB7 Fortaleza</span>
            </div>
          `}
        </div>
      </div>
    </section>

    <section class="section reveal">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Monte seu roteiro</h2>
          <a href="/planejar" data-nav class="btn btn--primary">Planejar viagem \u2192</a>
        </div>
        <p class="section-subtitle">Informe seus dias, or\xE7amento e interesses \u2014 n\xF3s criamos o roteiro perfeito para voc\xEA.</p>
      </div>
    </section>
  `;
}
function bindHomePage(container) {
  bindSearchBar(container);
  const allEntities = entityRepo.getAll();
  bindFavoriteButtons(container, allEntities);
  bindRevealAnimations(container);
}

// scripts/components/filter-panel.js
function renderFilterPanel({ activeFilters = {} } = {}) {
  const cities = searchService.getCities();
  const types = [
    { id: "", label: "Todos" },
    { id: "city", label: "Cidades" },
    { id: "beach", label: "Praias" },
    { id: "hotel", label: "Hot\xE9is" },
    { id: "restaurant", label: "Restaurantes" },
    { id: "tour", label: "Passeios" },
    { id: "event", label: "Eventos" }
  ];
  return `
    <div class="search-filters" data-filter-panel>
      <div class="search-filters__group">
        <label>Tipo</label>
        <div class="chip-group" data-filter-type>
          ${types.map((t) => `
            <button class="chip ${activeFilters.type === t.id ? "is-active" : ""}"
              data-value="${t.id}">${t.label}</button>
          `).join("")}
        </div>
      </div>
      <div class="search-filters__group">
        <label>Cidade</label>
        <select class="select" data-filter-city style="min-width:160px">
          <option value="">Todas</option>
          ${cities.map((c) => `<option value="${c.id}" ${activeFilters.cityId === c.id ? "selected" : ""}>${c.name}</option>`).join("")}
        </select>
      </div>
      <div class="search-filters__group">
        <label>Tags</label>
        <div class="chip-group" data-filter-tags>
          ${TAGS.slice(0, 8).map((t) => `
            <button class="chip ${(activeFilters.tags || []).includes(t.id) ? "is-active" : ""}"
              data-value="${t.id}">${t.label}</button>
          `).join("")}
        </div>
      </div>
      <div class="search-filters__group">
        <label>Pre\xE7o m\xE1ximo</label>
        <input type="range" data-filter-price min="0" max="2000" step="100" value="2000">
        <span class="text-sm text-muted" data-price-label>Qualquer pre\xE7o</span>
      </div>
      <div class="search-filters__group">
        <label>Ordenar</label>
        <select class="select" data-filter-sort style="min-width:140px">
          <option value="relevance" ${activeFilters.sort === "relevance" ? "selected" : ""}>Relev\xE2ncia</option>
          <option value="rating" ${activeFilters.sort === "rating" ? "selected" : ""}>Avalia\xE7\xE3o</option>
          <option value="price-asc" ${activeFilters.sort === "price-asc" ? "selected" : ""}>Menor pre\xE7o</option>
          <option value="price-desc" ${activeFilters.sort === "price-desc" ? "selected" : ""}>Maior pre\xE7o</option>
        </select>
      </div>
    </div>
  `;
}
function bindFilterPanel(container, onChange) {
  const panel = container.querySelector("[data-filter-panel]");
  if (!panel) return;
  const state = {
    type: panel.querySelector("[data-filter-type] .chip.is-active")?.dataset.value || "",
    cityId: panel.querySelector("[data-filter-city]")?.value || "",
    tags: [...panel.querySelectorAll("[data-filter-tags] .chip.is-active")].map((c) => c.dataset.value),
    sort: panel.querySelector("[data-filter-sort]")?.value || "relevance",
    priceMax: parseInt(panel.querySelector("[data-filter-price]")?.value) || 2e3
  };
  const emit = () => onChange({ ...state });
  panel.querySelector("[data-filter-type]")?.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    panel.querySelectorAll("[data-filter-type] .chip").forEach((c) => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    state.type = chip.dataset.value;
    emit();
  });
  panel.querySelector("[data-filter-city]")?.addEventListener("change", (e) => {
    state.cityId = e.target.value;
    emit();
  });
  panel.querySelector("[data-filter-tags]")?.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    chip.classList.toggle("is-active");
    const tag = chip.dataset.value;
    if (chip.classList.contains("is-active")) {
      if (!state.tags.includes(tag)) state.tags.push(tag);
    } else {
      state.tags = state.tags.filter((t) => t !== tag);
    }
    emit();
  });
  panel.querySelector("[data-filter-sort]")?.addEventListener("change", (e) => {
    state.sort = e.target.value;
    emit();
  });
  panel.querySelector("[data-filter-price]")?.addEventListener("input", (e) => {
    state.priceMax = parseInt(e.target.value);
    const label = panel.querySelector("[data-price-label]");
    if (label) label.textContent = state.priceMax >= 2e3 ? "Qualquer pre\xE7o" : `At\xE9 R$ ${state.priceMax.toLocaleString("pt-BR")}`;
    emit();
  });
  return state;
}

// scripts/pages/search-page.js
init_router();
init_dom();
var TYPE_LABELS = {
  city: "Cidades",
  beach: "Praias",
  hotel: "Hot\xE9is",
  restaurant: "Restaurantes",
  tour: "Passeios",
  event: "Eventos"
};
function renderSearchPage(route) {
  const query = route.query.q || "";
  const type = route.query.tipo || route.query.type || "";
  const tag = route.query.tag || "";
  const tags = tag ? [tag, ...route.query.tags?.split(",") || []].filter(Boolean) : [];
  const filters = { query, type, cityId: route.query.cidade || "", tags, sort: route.query.ordenar || "relevance" };
  const results = searchService.search(filters);
  return `
    <div class="search-page">
      <div class="container">
        <div class="search-page__header">
          <h1>Buscar no Cear\xE1</h1>
          <p class="text-muted">Encontre destinos, hot\xE9is, restaurantes e muito mais</p>
          <div style="margin-top:var(--space-4)">${renderSearchBar({ value: query })}</div>
        </div>

        ${renderFilterPanel({ activeFilters: { type, cityId: filters.cityId, tags, sort: filters.sort } })}

        <div class="search-results-tabs" data-result-tabs>
          <button class="${!type ? "is-active" : ""}" data-tab-type="">Todos (${results.length})</button>
          ${Object.entries(TYPE_LABELS).map(([t, label]) => {
    const count = results.filter((r) => r.type === t).length;
    if (!count && type !== t) return "";
    return `<button class="${type === t ? "is-active" : ""}" data-tab-type="${t}">${label} (${count})</button>`;
  }).join("")}
        </div>

        <p class="search-page__count" data-result-count>
          ${pluralize(results.length, "resultado encontrado", "resultados encontrados")}
          ${query ? ` para "${query}"` : ""}
        </p>

        <div data-search-results>
          ${results.length ? renderEntityGrid(results) : renderEmptyState({
    icon: "\u{1F50D}",
    title: "Nenhum resultado",
    message: "Tente outros termos ou remova alguns filtros.",
    ctaText: "Ver todos os destinos",
    ctaLink: "/busca"
  })}
        </div>
      </div>
    </div>
  `;
}
function bindSearchPage(container, route) {
  let currentFilters = {
    query: route.query.q || "",
    type: route.query.tipo || route.query.type || "",
    cityId: route.query.cidade || "",
    tags: route.query.tag ? [route.query.tag] : [],
    sort: route.query.ordenar || "relevance",
    priceMax: route.query.preco ? parseInt(route.query.preco) : 2e3
  };
  const updateResults = () => {
    const results = searchService.search(currentFilters);
    const resultsEl = container.querySelector("[data-search-results]");
    const countEl = container.querySelector("[data-result-count]");
    if (resultsEl) {
      resultsEl.innerHTML = results.length ? renderEntityGrid(results) : renderEmptyState({ icon: "\u{1F50D}", title: "Nenhum resultado", message: "Tente outros termos.", ctaText: "Limpar busca", ctaLink: "/busca" });
      bindFavoriteButtons(resultsEl, results);
      bindRevealAnimations(resultsEl);
      resultsEl.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
    }
    if (countEl) {
      countEl.textContent = `${pluralize(results.length, "resultado encontrado", "resultados encontrados")}${currentFilters.query ? ` para "${currentFilters.query}"` : ""}`;
    }
    const params = new URLSearchParams();
    if (currentFilters.query) params.set("q", currentFilters.query);
    if (currentFilters.type) params.set("tipo", currentFilters.type);
    if (currentFilters.cityId) params.set("cidade", currentFilters.cityId);
    if (currentFilters.tags.length) params.set("tag", currentFilters.tags[0]);
    if (currentFilters.sort !== "relevance") params.set("ordenar", currentFilters.sort);
    if (currentFilters.priceMax < 2e3) params.set("preco", currentFilters.priceMax);
    history.replaceState(null, "", `/busca?${params.toString()}`);
  };
  bindSearchBar(container, {
    onSubmit: (q) => {
      currentFilters.query = q;
      updateResults();
    }
  });
  bindFilterPanel(container, (filters) => {
    currentFilters = { ...currentFilters, ...filters };
    updateResults();
  });
  bindRevealAnimations(container);
  container.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
  container.querySelector("[data-result-tabs]")?.addEventListener("click", (e) => {
    const tab = e.target.closest("[data-tab-type]");
    if (!tab) return;
    container.querySelectorAll("[data-result-tabs] button").forEach((b) => b.classList.remove("is-active"));
    tab.classList.add("is-active");
    currentFilters.type = tab.dataset.tabType;
    updateResults();
  });
  bindFavoriteButtons(container, entityRepo.getAll());
}

// scripts/components/gallery.js
function renderGallery(images, alt = "") {
  if (!images?.length) return "";
  const [main, ...rest] = images;
  return `
    <div class="gallery gallery--grid">
      <div class="gallery__main gallery__item" data-lightbox="${main}">
        <img src="${main}" alt="${alt}" class="object-cover aspect-4-3">
      </div>
      ${rest.slice(0, 2).map((img, i) => `
        <div class="gallery__item" data-lightbox="${img}">
          <img src="${img}" alt="${alt} ${i + 2}" class="object-cover" style="height:100%">
          ${i === 1 && rest.length > 2 ? `<div class="gallery__more">+${rest.length - 1} fotos</div>` : ""}
        </div>
      `).join("")}
    </div>
  `;
}
function bindGallery(container) {
  container.querySelectorAll("[data-lightbox]").forEach((item) => {
    item.addEventListener("click", () => {
      const src = item.dataset.lightbox;
      const lb = document.createElement("div");
      lb.className = "lightbox";
      lb.innerHTML = `<button class="lightbox__close" aria-label="Fechar">&times;</button><img src="${src}" alt="">`;
      lb.querySelector(".lightbox__close").addEventListener("click", () => lb.remove());
      lb.addEventListener("click", (e) => {
        if (e.target === lb) lb.remove();
      });
      document.body.appendChild(lb);
    });
  });
}

// scripts/utils/share.js
async function shareContent({ title, text, url }) {
  const shareUrl = url || window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url: shareUrl });
      return true;
    } catch {
    }
  }
  try {
    await navigator.clipboard.writeText(shareUrl);
    return "copied";
  } catch {
    return false;
  }
}

// scripts/pages/detail-shared.js
init_toast();
init_router();
function renderReviews(entityId) {
  const reviews = reviewsService.getByEntity(entityId);
  return `
    <div class="info-card">
      <h3>Avalia\xE7\xF5es (${reviews.length})</h3>
      ${reviews.length ? reviews.map((r) => `
        <div class="review-item">
          <div class="review-item__header">
            <span class="review-item__author">${r.userName}</span>
            ${renderRating(r.rating)}
          </div>
          <p class="review-item__text">${r.text}</p>
          <span class="review-item__date">${formatDate(r.createdAt)}</span>
        </div>
      `).join("") : '<p class="text-muted">Seja o primeiro a avaliar!</p>'}
      <div class="review-form" data-review-form>
        <h4>Deixe sua avalia\xE7\xE3o</h4>
        ${renderRatingInput("rating", 5)}
        <div class="form-group" style="margin-top:var(--space-3)">
          <textarea class="textarea" name="text" placeholder="Conte sua experi\xEAncia..." required></textarea>
        </div>
        <button class="btn btn--primary" data-submit-review>Enviar avalia\xE7\xE3o</button>
      </div>
    </div>
  `;
}
function renderDetailActions(entity2) {
  const wished = wishlistService.isWished(entity2.id);
  return `
    <div class="detail-actions">
      <button class="btn btn--ghost" data-favorite-id="${entity2.id}" aria-pressed="${favoritesService.isFavorite(entity2.id)}">
        ${favoritesService.isFavorite(entity2.id) ? "\u2665 Favorito" : "\u2661 Favoritar"}
      </button>
      <button class="btn btn--ghost" data-wishlist-id="${entity2.id}" aria-pressed="${wished}">
        ${wished ? "\u2713 Quero conhecer" : "+ Quero conhecer"}
      </button>
      <button class="btn btn--ghost" data-share>Compartilhar</button>
      <a href="/mapa?focus=${entity2.id}" data-nav class="btn btn--ghost">Ver no mapa</a>
      <a href="/planejar?cidade=${entity2.cityId}" data-nav class="btn btn--ocean">Adicionar ao roteiro</a>
    </div>
  `;
}
function renderSidebar(entity2) {
  const price = entity2.priceRange ? formatPriceRange(entity2.priceRange) : "";
  return `
    <div class="info-panel">
      ${price ? `<div class="info-panel__price">${price}</div>` : ""}
      ${renderRating(entity2.rating, entity2.reviewCount)}
      <div class="info-panel__actions">
        ${entity2.type === "hotel" ? '<button class="btn btn--primary btn--block">Reservar agora</button>' : ""}
        ${entity2.type === "restaurant" ? '<button class="btn btn--primary btn--block">Ver card\xE1pio</button>' : ""}
        ${entity2.type === "tour" ? '<button class="btn btn--primary btn--block">Reservar passeio</button>' : ""}
        <button class="btn btn--ghost btn--block" data-share>Compartilhar</button>
      </div>
      <div class="mini-map" id="detail-mini-map"></div>
    </div>
  `;
}
function renderDetailPage(entity2, { breadcrumbs = [], extraSections = "" } = {}) {
  if (!entity2) return "";
  return `
    <div class="container detail-layout">
      <div class="detail-layout__main">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="/" data-nav>Home</a> <span class="breadcrumb__sep">\u203A</span>
          ${breadcrumbs.map((b) => `<a href="${b.href}" data-nav>${b.label}</a> <span class="breadcrumb__sep">\u203A</span>`).join("")}
          <span>${entity2.name}</span>
        </nav>

        <h1>${entity2.name}</h1>
        <p class="text-muted">${entity2.cityName} \xB7 ${entity2.category || entity2.type}</p>
        ${renderDetailActions(entity2)}

        ${renderGallery(entity2.images || [entity2.coverImage], entity2.name)}

        <div class="detail-info-grid" style="margin-top:var(--space-6)">
          <div class="info-card">
            <h3>Sobre</h3>
            <p>${entity2.description || entity2.summary}</p>
          </div>
          ${extraSections}
        </div>

        <div class="detail-map" id="detail-map"></div>
        ${renderReviews(entity2.id)}
      </div>
      <aside class="detail-layout__sidebar">
        ${renderSidebar(entity2)}
      </aside>
    </div>
  `;
}
function bindDetailPage(container, entity2) {
  if (!entity2) return;
  historyService.add(entity2);
  bindGallery(container);
  bindFavoriteButtons(container, [entity2]);
  container.querySelector("[data-wishlist-id]")?.addEventListener("click", (e) => {
    const btn = e.currentTarget;
    const isNow = wishlistService.toggle(entity2);
    btn.textContent = isNow ? "\u2713 Quero conhecer" : "+ Quero conhecer";
    btn.setAttribute("aria-pressed", isNow);
    showToast(isNow ? 'Adicionado \xE0 lista "Quero conhecer"' : "Removido da lista", "success");
  });
  bindRatingInput(container);
  container.querySelector("[data-share]")?.addEventListener("click", async () => {
    const result = await shareContent({ title: entity2.name, text: entity2.summary });
    showToast(result === "copied" ? "Link copiado!" : result ? "Compartilhado!" : "N\xE3o foi poss\xEDvel compartilhar", result ? "success" : "error");
  });
  container.querySelector("[data-submit-review]")?.addEventListener("click", () => {
    const user = authService.getCurrentUser();
    if (!user) {
      showToast("Fa\xE7a login para avaliar", "info");
      return;
    }
    const form = container.querySelector("[data-review-form]");
    const rating = parseInt(form.querySelector('input[name="rating"]').value);
    const text = form.querySelector("textarea").value.trim();
    if (!text) {
      showToast("Escreva um coment\xE1rio", "error");
      return;
    }
    reviewsService.add({ entityId: entity2.id, userId: user.id, userName: user.name, rating, text });
    showToast("Avalia\xE7\xE3o enviada!", "success");
    router.resolve();
  });
  const mapEntities = [entity2];
  createMap(container.querySelector("#detail-mini-map"), {
    center: [entity2.location.lat, entity2.location.lng],
    zoom: 14,
    entities: mapEntities
  });
  createMap(container.querySelector("#detail-map"), {
    center: [entity2.location.lat, entity2.location.lng],
    zoom: 13,
    entities: mapEntities
  });
}
function renderRelatedSection(title, entities) {
  if (!entities.length) return "";
  return `
    <section class="section">
      <div class="container">
        <h2 class="section-title">${title}</h2>
        ${renderEntityGrid(entities.slice(0, 4))}
      </div>
    </section>
  `;
}

// scripts/pages/city-page.js
function renderCityPage(route) {
  const { city, items } = entityRepo.getByCitySlug(route.params.slug);
  if (!city) return null;
  const hotels = items.filter((i) => i.type === "hotel");
  const restaurants = items.filter((i) => i.type === "restaurant");
  const tours = items.filter((i) => i.type === "tour");
  const beaches = items.filter((i) => i.type === "beach");
  const events = items.filter((i) => i.type === "event");
  const meta = city.metadata || {};
  const extra = `
    <div class="info-card">
      <h3>Informa\xE7\xF5es \xFAteis</h3>
      <ul>
        <li><strong>Melhor \xE9poca:</strong> ${meta.bestSeason || "Junho a Janeiro"}</li>
        <li><strong>Clima:</strong> ${meta.climate || "Tropical"}</li>
        <li><strong>Como chegar:</strong> ${meta.howToArrive || "Consulte voos para Fortaleza"}</li>
      </ul>
    </div>
    ${meta.history ? `<div class="info-card"><h3>Hist\xF3ria</h3><p>${meta.history}</p></div>` : ""}
    ${meta.curiosities ? `<div class="info-card"><h3>Curiosidades</h3><ul>${meta.curiosities.map((c) => `<li>${c}</li>`).join("")}</ul></div>` : ""}
    ${meta.usefulInfo ? `
      <div class="info-card">
        <h3>Servi\xE7os</h3>
        <ul>
          ${meta.usefulInfo.hospitals ? `<li><strong>Hospitais:</strong> ${meta.usefulInfo.hospitals.join(", ")}</li>` : ""}
          ${meta.usefulInfo.pharmacies ? `<li><strong>Farm\xE1cias:</strong> ${meta.usefulInfo.pharmacies.join(", ")}</li>` : ""}
        </ul>
      </div>
    ` : ""}
  `;
  return `
    ${renderDetailPage(city, { breadcrumbs: [{ label: "Destinos", href: "/busca?tipo=city" }], extraSections: extra })}
    <div class="city-stats container">
      <div class="city-stat"><div class="city-stat__value">${hotels.length}</div><div class="city-stat__label">Hot\xE9is</div></div>
      <div class="city-stat"><div class="city-stat__value">${restaurants.length}</div><div class="city-stat__label">Restaurantes</div></div>
      <div class="city-stat"><div class="city-stat__value">${tours.length}</div><div class="city-stat__label">Passeios</div></div>
      <div class="city-stat"><div class="city-stat__value">${beaches.length}</div><div class="city-stat__label">Praias</div></div>
    </div>
    ${renderRelatedSection("Onde ficar", hotels)}
    ${renderRelatedSection("Onde comer", restaurants)}
    ${renderRelatedSection("Passeios", tours)}
    ${renderRelatedSection("Praias", beaches)}
    ${renderRelatedSection("Eventos", events)}
  `;
}
function bindCityPage(container, route) {
  const city = entityRepo.getBySlug(route.params.slug);
  if (city) bindDetailPage(container, city);
  bindFavoriteButtons(container, entityRepo.getAll());
}
function renderEntityDetailPage(route, type) {
  const entity2 = entityRepo.getBySlug(route.params.slug);
  if (!entity2 || entity2.type !== type) return null;
  const breadcrumbs = [
    { label: "Destinos", href: "/busca?tipo=city" },
    { label: entity2.cityName, href: `/cidade/${entityRepo.getById(entity2.cityId)?.slug || ""}` }
  ];
  let extra = "";
  if (type === "hotel") {
    extra = `<div class="info-card"><h3>Comodidades</h3><div class="amenity-list">${(entity2.amenities || []).map((a) => `<span class="amenity-item">\u2713 ${a}</span>`).join("")}</div></div>`;
  }
  if (type === "restaurant") {
    const meta = entity2.metadata || {};
    extra = `
      <div class="info-card"><h3>Card\xE1pio</h3><div class="menu-preview">${meta.menu || "Consulte o restaurante"}</div></div>
      <div class="info-card"><h3>Informa\xE7\xF5es</h3>
        <ul>
          <li><strong>Culin\xE1ria:</strong> ${meta.cuisine || entity2.category}</li>
          <li><strong>Hor\xE1rio:</strong> ${entity2.schedule || "Consulte"}</li>
          ${meta.instagram ? `<li><strong>Instagram:</strong> ${meta.instagram}</li>` : ""}
          ${meta.phone ? `<li><strong>Telefone:</strong> ${meta.phone}</li>` : ""}
        </ul>
      </div>`;
  }
  if (type === "tour") {
    const meta = entity2.metadata || {};
    extra = `<div class="info-card"><h3>Detalhes do passeio</h3><ul>
      <li><strong>Dura\xE7\xE3o:</strong> ${meta.duration || "\u2014"}</li>
      <li><strong>Dificuldade:</strong> ${meta.difficulty || "\u2014"}</li>
      <li><strong>Empresa:</strong> ${meta.company || "\u2014"}</li>
    </ul></div>`;
  }
  if (type === "event") {
    const meta = entity2.metadata || {};
    extra = `<div class="info-card"><h3>Informa\xE7\xF5es do evento</h3><ul>
      <li><strong>Data:</strong> ${meta.date ? formatDate(meta.date) : "\u2014"}</li>
      <li><strong>Ingresso:</strong> ${meta.ticket || "\u2014"}</li>
    </ul></div>`;
  }
  const related = entityRepo.getByCityId(entity2.cityId).filter((e) => e.id !== entity2.id && e.type === type);
  return renderDetailPage(entity2, { breadcrumbs, extraSections: extra }) + renderRelatedSection("Voc\xEA tamb\xE9m pode gostar", related);
}
function bindEntityDetailPage(container, route, type) {
  const entity2 = entityRepo.getBySlug(route.params.slug);
  if (entity2) bindDetailPage(container, entity2);
  bindFavoriteButtons(container, entityRepo.getAll());
}

// scripts/pages/beach-page.js
function renderBeachPage(route) {
  const entity2 = entityRepo.getBySlug(route.params.slug);
  if (!entity2 || entity2.type !== "beach") return null;
  const breadcrumbs = [
    { label: "Praias", href: "/busca?tipo=beach" },
    { label: entity2.cityName, href: `/cidade/${entityRepo.getById(entity2.cityId)?.slug || ""}` }
  ];
  const related = entityRepo.getByType("beach").filter((e) => e.id !== entity2.id && e.cityId === entity2.cityId);
  return renderDetailPage(entity2, { breadcrumbs }) + renderRelatedSection("Outras praias", related);
}
function bindBeachPage(container, route) {
  const entity2 = entityRepo.getBySlug(route.params.slug);
  if (entity2) bindDetailPage(container, entity2);
}

// scripts/pages/hotel-page.js
function renderHotelPage(route) {
  return renderEntityDetailPage(route, "hotel");
}
function bindHotelPage(container, route) {
  bindEntityDetailPage(container, route, "hotel");
}

// scripts/pages/restaurant-page.js
function renderRestaurantPage(route) {
  return renderEntityDetailPage(route, "restaurant");
}
function bindRestaurantPage(container, route) {
  bindEntityDetailPage(container, route, "restaurant");
}

// scripts/pages/tour-page.js
function renderTourPage(route) {
  return renderEntityDetailPage(route, "tour");
}
function bindTourPage(container, route) {
  bindEntityDetailPage(container, route, "tour");
}

// scripts/pages/event-page.js
function renderEventPage(route) {
  return renderEntityDetailPage(route, "event");
}
function bindEventPage(container, route) {
  bindEntityDetailPage(container, route, "event");
}

// scripts/pages/map-page.js
var LEAFLET_ASSETS = {
  css: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  js: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
  integrity: "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
};
async function ensureLeaflet() {
  if (window.L) return;
  if (!document.getElementById("leaflet-css")) {
    const link = document.createElement("link");
    link.id = "leaflet-css";
    link.rel = "stylesheet";
    link.href = LEAFLET_ASSETS.css;
    link.integrity = LEAFLET_ASSETS.integrity;
    link.crossOrigin = "";
    document.head.appendChild(link);
  }
  if (!document.getElementById("leaflet-js")) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = LEAFLET_ASSETS.js;
      script.integrity = LEAFLET_ASSETS.integrity;
      script.crossOrigin = "";
      script.onload = resolve;
      script.onerror = () => reject(new Error("Falha ao carregar Leaflet"));
      document.body.appendChild(script);
    });
  }
}
var LAYER_TYPES = [
  { id: "hotel", label: "Hot\xE9is", icon: "\u{1F3E8}" },
  { id: "restaurant", label: "Restaurantes", icon: "\u{1F37D}\uFE0F" },
  { id: "beach", label: "Praias", icon: "\u{1F3D6}\uFE0F" },
  { id: "tour", label: "Passeios", icon: "\u{1F690}" },
  { id: "event", label: "Eventos", icon: "\u{1F389}" }
];
function renderMapPage(route) {
  return `
    <div class="map-page">
      <div class="container">
        <h1 style="margin-bottom:var(--space-4)">Mapa do Cear\xE1</h1>
        <div class="map-page__layout">
          <aside class="map-sidebar">
            <div class="map-filter-bar" data-map-filters>
              ${LAYER_TYPES.map((l) => `
                <button class="chip is-active" data-layer="${l.id}">${l.icon} ${l.label}</button>
              `).join("")}
            </div>
            <div data-map-list></div>
          </aside>
          <div class="map-container" id="main-map"></div>
        </div>
      </div>
    </div>
  `;
}
async function bindMapPage(container, route) {
  let activeLayers = new Set(LAYER_TYPES.map((l) => l.id));
  let mapInstance = null;
  const renderList = (entities) => {
    const list = container.querySelector("[data-map-list]");
    list.innerHTML = entities.slice(0, 20).map((e) => `
      <div class="map-list-item" data-map-item="${e.id}">
        <strong>${e.name}</strong>
        <p class="text-sm text-muted">${e.cityName} \xB7 ${e.type}</p>
      </div>
    `).join("");
  };
  const updateMap = async () => {
    const entities = entityRepo.getAll().filter(
      (e) => e.type !== "city" && activeLayers.has(e.type) && e.location?.lat
    );
    try {
      await ensureLeaflet();
      mapInstance = createMap(container.querySelector("#main-map"), {
        entities,
        onMarkerClick: (entity2) => {
          container.querySelectorAll(".map-list-item").forEach((el) => {
            el.classList.toggle("is-active", el.dataset.mapItem === entity2.id);
          });
        }
      });
    } catch (error) {
      container.querySelector("#main-map").innerHTML = '<p class="text-muted">N\xE3o foi poss\xEDvel carregar o mapa. Tente novamente mais tarde.</p>';
    }
    renderList(entities);
    const focusId = route.query.focus;
    if (focusId) {
      const focus = entityRepo.getById(focusId);
      if (focus) flyToMarker(mapInstance?.map, focus);
    }
  };
  container.querySelector("[data-map-filters]")?.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-layer]");
    if (!chip) return;
    chip.classList.toggle("is-active");
    const layer = chip.dataset.layer;
    if (chip.classList.contains("is-active")) activeLayers.add(layer);
    else activeLayers.delete(layer);
    updateMap();
  });
  container.querySelector("[data-map-list]")?.addEventListener("click", (e) => {
    const item = e.target.closest("[data-map-item]");
    if (!item) return;
    const entity2 = entityRepo.getById(item.dataset.mapItem);
    if (entity2) {
      flyToMarker(mapInstance?.map, entity2);
      container.querySelectorAll(".map-list-item").forEach((el) => el.classList.remove("is-active"));
      item.classList.add("is-active");
    }
  });
  updateMap();
  return () => destroyMap();
}

// scripts/pages/planner-page.js
init_toast();
function renderPlannerPage(route) {
  const cities = searchService.getCities();
  const preCity = route.query.cidade || "";
  return `
    <div class="planner-page">
      <div class="container">
        <h1>Planeje sua viagem</h1>
        <p class="text-muted section-subtitle">Informe suas prefer\xEAncias e receba um roteiro personalizado</p>

        <div class="planner-layout">
          <div class="planner-form-card">
            <form data-planner-form>
              <div class="form-group">
                <label class="form-label">Cidade base</label>
                <select class="select" name="cityId" required>
                  ${cities.map((c) => `<option value="${c.id}" ${c.id === preCity ? "selected" : ""}>${c.name}</option>`).join("")}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Quantos dias?</label>
                <input class="input" type="number" name="days" min="1" max="14" value="3" required>
              </div>
              <div class="form-group">
                <label class="form-label">Or\xE7amento total (R$)</label>
                <input class="input" type="number" name="budget" min="500" step="100" value="3000" required>
              </div>
              <div class="form-group">
                <label class="form-label">Perfil da viagem</label>
                <select class="select" name="profile">
                  ${PROFILES.map((p) => `<option value="${p.id}">${p.label}</option>`).join("")}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Interesses</label>
                <div class="checkbox-group">
                  ${INTERESTS.map((i) => `
                    <label class="checkbox-label">
                      <input type="checkbox" name="interests" value="${i.id}"> ${i.label}
                    </label>
                  `).join("")}
                </div>
              </div>
              <button type="submit" class="btn btn--primary btn--block">Gerar roteiro</button>
            </form>
          </div>

          <div class="planner-result" data-planner-result>
            <div class="empty-state">
              <div class="empty-state__icon">\u{1F5FA}\uFE0F</div>
              <h3>Seu roteiro aparecer\xE1 aqui</h3>
              <p>Preencha o formul\xE1rio e clique em gerar roteiro</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
function renderItinerary(result) {
  return `
    <div class="itinerary-summary">
      <div class="itinerary-summary__item"><span>Cidade</span><strong>${result.cityName}</strong></div>
      <div class="itinerary-summary__item"><span>Dias</span><strong>${result.days}</strong></div>
      <div class="itinerary-summary__item"><span>Or\xE7amento</span><strong>${formatPrice(result.budget)}</strong></div>
      <div class="itinerary-summary__item"><span>Custo estimado</span><strong>${formatPrice(result.totalCost)}</strong></div>
    </div>
    ${result.itinerary.map((day) => `
      <div class="itinerary-day">
        <div class="itinerary-day__header">
          <span class="itinerary-day__title">Dia ${day.day}</span>
          <span class="itinerary-day__cost">${formatPrice(day.estimatedCost)}</span>
        </div>
        ${day.activities.map((a) => `
          <div class="itinerary-activity">
            <span class="itinerary-activity__time">${a.time}</span>
            <span class="itinerary-activity__icon">${{ hotel: "\u{1F3E8}", restaurant: "\u{1F37D}\uFE0F", tour: "\u{1F690}", beach: "\u{1F3D6}\uFE0F", event: "\u{1F389}" }[a.entity.type] || "\u{1F4CD}"}</span>
            <div class="itinerary-activity__info">
              <h4>${a.entity.name}</h4>
              <p>${a.entity.cityName} \xB7 ${formatPrice(a.cost)}</p>
            </div>
          </div>
        `).join("")}
      </div>
    `).join("")}
    <button class="btn btn--primary btn--block" data-save-itinerary style="margin-top:var(--space-4)">Salvar roteiro</button>
  `;
}
function bindPlannerPage(container) {
  let lastResult = null;
  container.querySelector("[data-planner-form]")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const interests = fd.getAll("interests");
    const resultEl = container.querySelector("[data-planner-result]");
    resultEl.innerHTML = '<div class="loading-overlay" style="position:relative;min-height:200px"><div class="spinner"></div></div>';
    setTimeout(() => {
      try {
        lastResult = itineraryEngine.generate({
          days: parseInt(fd.get("days")),
          budget: parseInt(fd.get("budget")),
          cityId: fd.get("cityId"),
          interests,
          profile: fd.get("profile")
        });
        resultEl.innerHTML = renderItinerary(lastResult);
        resultEl.querySelector("[data-save-itinerary]")?.addEventListener("click", () => {
          itineraryEngine.save(lastResult);
          showToast("Roteiro salvo no seu perfil!", "success");
        });
      } catch (err) {
        resultEl.innerHTML = `<p class="text-muted">${err.message}</p>`;
      }
    }, 600);
  });
}

// scripts/pages/profile-page.js
init_constants();
init_toast();
function renderProfilePage(route) {
  const user = authService.getCurrentUser();
  const tab = route.query.tab || "favoritos";
  if (!user) {
    return `
      <div class="profile-page container">
        <div class="empty-state">
          <div class="empty-state__icon">\u{1F464}</div>
          <h2>Fa\xE7a login para acessar seu perfil</h2>
          <p>Salve favoritos, roteiros e prefer\xEAncias</p>
          <button class="btn btn--primary" data-auth-open>Entrar ou cadastrar</button>
        </div>
      </div>
    `;
  }
  const favorites = favoritesService.getEntities(entityRepo.getAll());
  const wishlist = wishlistService.getEntities(entityRepo.getAll());
  const history2 = historyService.getAll();
  const itineraries = itineraryEngine.getAll();
  const myReviews = reviewsService.getByUser(user.id);
  const prefs = storage.get(STORAGE_KEYS.PREFERENCES) || { interests: [], profile: "" };
  const myEstablishments = user.role === "parceiro" ? establishmentService.getByOwner(user.id) : [];
  return `
    <div class="profile-page">
      <div class="container">
        <div class="profile-header">
          <div class="profile-header__avatar">${user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}</div>
          <div class="profile-header__info">
            <h1>${user.name}</h1>
            <p class="profile-header__role">${user.role === "parceiro" ? "Parceiro" : "Turista"} \xB7 ${user.email}</p>
          </div>
          <button class="btn btn--ghost" data-reset-demo>Restaurar dados demo</button>
        </div>

        <div class="tabs" data-profile-tabs>
          <button class="tabs__btn ${tab === "favoritos" ? "is-active" : ""}" data-tab="favoritos">Favoritos (${favorites.length})</button>
          <button class="tabs__btn ${tab === "quero-conhecer" ? "is-active" : ""}" data-tab="quero-conhecer">Quero conhecer (${wishlist.length})</button>
          <button class="tabs__btn ${tab === "historico" ? "is-active" : ""}" data-tab="historico">Hist\xF3rico</button>
          <button class="tabs__btn ${tab === "roteiros" ? "is-active" : ""}" data-tab="roteiros">Roteiros (${itineraries.length})</button>
          <button class="tabs__btn ${tab === "avaliacoes" ? "is-active" : ""}" data-tab="avaliacoes">Avalia\xE7\xF5es</button>
          <button class="tabs__btn ${tab === "preferencias" ? "is-active" : ""}" data-tab="preferencias">Prefer\xEAncias</button>
        </div>

        <div class="tab-panel ${tab === "favoritos" ? "is-active" : ""}" data-panel="favoritos">
          ${favorites.length ? renderEntityGrid(favorites) : renderEmptyState({ icon: "\u2661", title: "Nenhum favorito", message: "Explore e salve seus lugares favoritos", ctaText: "Explorar", ctaLink: "/busca" })}
        </div>

        <div class="tab-panel ${tab === "quero-conhecer" ? "is-active" : ""}" data-panel="quero-conhecer">
          ${wishlist.length ? renderEntityGrid(wishlist) : renderEmptyState({ icon: "\u{1F4CD}", title: "Lista vazia", message: 'Marque lugares com "Quero conhecer"', ctaText: "Explorar", ctaLink: "/busca" })}
        </div>

        <div class="tab-panel ${tab === "historico" ? "is-active" : ""}" data-panel="historico">
          ${history2.length ? history2.map((h) => `
            <a href="#" data-nav data-history-slug="${h.slug}" data-history-type="${h.entityType}" class="history-item">
              <div class="history-item__image"><img src="${h.coverImage}" alt="" class="object-cover"></div>
              <div>
                <strong>${h.name}</strong>
                <p class="history-item__date">${h.cityName} \xB7 ${formatRelativeDate(h.viewedAt)}</p>
              </div>
            </a>
          `).join("") : renderEmptyState({ icon: "\u{1F550}", title: "Sem hist\xF3rico", message: "Seus lugares visitados aparecer\xE3o aqui" })}
        </div>

        <div class="tab-panel ${tab === "roteiros" ? "is-active" : ""}" data-panel="roteiros">
          ${itineraries.length ? itineraries.map((it) => `
            <div class="info-card" style="margin-bottom:var(--space-4)">
              <div class="flex justify-between items-center">
                <div>
                  <h3>${it.cityName} \xB7 ${it.days} dias</h3>
                  <p class="text-muted">${formatPrice(it.totalCost)} estimado \xB7 ${formatRelativeDate(it.createdAt)}</p>
                </div>
                <button class="btn btn--ghost btn--sm" data-delete-itinerary="${it.id}">Excluir</button>
              </div>
            </div>
          `).join("") : renderEmptyState({ icon: "\u{1F5FA}\uFE0F", title: "Nenhum roteiro", message: "Crie seu primeiro roteiro", ctaText: "Planejar viagem", ctaLink: "/planejar" })}
        </div>

        <div class="tab-panel ${tab === "avaliacoes" ? "is-active" : ""}" data-panel="avaliacoes">
          ${myReviews.length ? myReviews.map((r) => {
    const entity2 = entityRepo.getById(r.entityId);
    return `<div class="review-item"><strong>${entity2?.name || ""}</strong> \u2014 ${"\u2605".repeat(r.rating)}<p>${r.text}</p></div>`;
  }).join("") : '<p class="text-muted">Voc\xEA ainda n\xE3o fez avalia\xE7\xF5es.</p>'}
        </div>

        <div class="tab-panel ${tab === "preferencias" ? "is-active" : ""}" data-panel="preferencias">
          <form data-prefs-form class="info-card">
            <div class="form-group">
              <label class="form-label">Perfil de viagem</label>
              <select class="select" name="profile">
                <option value="">Selecione</option>
                ${PROFILES.map((p) => `<option value="${p.id}" ${prefs.profile === p.id ? "selected" : ""}>${p.label}</option>`).join("")}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Interesses</label>
              <div class="checkbox-group">
                ${INTERESTS.map((i) => `
                  <label class="checkbox-label">
                    <input type="checkbox" name="interests" value="${i.id}" ${(prefs.interests || []).includes(i.id) ? "checked" : ""}> ${i.label}
                  </label>
                `).join("")}
              </div>
            </div>
            <button type="submit" class="btn btn--primary">Salvar prefer\xEAncias</button>
          </form>
        </div>

        ${myEstablishments.length ? `
          <div class="my-establishments">
            <h2 class="section-title">Meus estabelecimentos</h2>
            ${myEstablishments.map((e) => `
              <div class="establishment-item">
                <div><strong>${e.name}</strong><p class="text-sm text-muted">${e.type} \xB7 ${e.cityName}</p></div>
                <div class="establishment-item__actions">
                  <button class="btn btn--ghost btn--sm" data-delete-est="${e.id}">Excluir</button>
                </div>
              </div>
            `).join("")}
          </div>
        ` : ""}
      </div>
    </div>
  `;
}
function bindProfilePage(container) {
  container.querySelector("[data-auth-open]")?.addEventListener("click", openAuthModal);
  container.querySelector("[data-profile-tabs]")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-tab]");
    if (!btn) return;
    container.querySelectorAll(".tabs__btn").forEach((b) => b.classList.remove("is-active"));
    container.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("is-active"));
    btn.classList.add("is-active");
    container.querySelector(`[data-panel="${btn.dataset.tab}"]`)?.classList.add("is-active");
  });
  container.querySelector("[data-prefs-form]")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    storage.set(STORAGE_KEYS.PREFERENCES, {
      profile: fd.get("profile"),
      interests: fd.getAll("interests")
    });
    showToast("Prefer\xEAncias salvas!", "success");
  });
  container.querySelector("[data-reset-demo]")?.addEventListener("click", () => {
    if (confirm("Restaurar dados demo? Favoritos e roteiros ser\xE3o apagados.")) {
      storage.resetDemo();
      showToast("Dados demo restaurados", "success");
      Promise.resolve().then(() => (init_router(), router_exports)).then(({ router: router2 }) => router2.resolve());
    }
  });
  container.querySelectorAll("[data-delete-itinerary]").forEach((btn) => {
    btn.addEventListener("click", () => {
      itineraryEngine.remove(btn.dataset.deleteItinerary);
      showToast("Roteiro exclu\xEDdo", "info");
      Promise.resolve().then(() => (init_router(), router_exports)).then(({ router: router2 }) => router2.resolve());
    });
  });
  const user = authService.getCurrentUser();
  container.querySelectorAll("[data-delete-est]").forEach((btn) => {
    btn.addEventListener("click", () => {
      try {
        establishmentService.remove(btn.dataset.deleteEst, user.id);
        showToast("Estabelecimento removido", "info");
        Promise.resolve().then(() => (init_router(), router_exports)).then(({ router: router2 }) => router2.resolve());
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  });
  container.querySelectorAll("[data-history-slug]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const routes2 = { city: "cidade", beach: "praia", hotel: "hotel", restaurant: "restaurante", tour: "passeio", event: "evento" };
      const route = routes2[link.dataset.historyType] || "busca";
      Promise.resolve().then(() => (init_router(), router_exports)).then(({ router: router2 }) => router2.navigate(`/${route}/${link.dataset.historySlug}`));
    });
  });
}

// scripts/pages/register-page.js
init_toast();
init_router();
var STEPS = ["Tipo", "Dados", "Localiza\xE7\xE3o", "Confirmar"];
function renderRegisterPage() {
  const user = authService.getCurrentUser();
  if (!user) {
    return `
      <div class="container" style="padding:var(--space-16) 0;text-align:center">
        <h2>Cadastro de estabelecimentos</h2>
        <p class="text-muted">Fa\xE7a login como parceiro para cadastrar seu neg\xF3cio</p>
        <button class="btn btn--primary" data-auth-open>Entrar como parceiro</button>
      </div>
    `;
  }
  if (user.role !== "parceiro") {
    return `
      <div class="container" style="padding:var(--space-16) 0;text-align:center">
        <h2>Acesso restrito</h2>
        <p class="text-muted">Apenas parceiros podem cadastrar estabelecimentos. Crie uma conta parceiro.</p>
        <button class="btn btn--primary" data-auth-open>Criar conta parceiro</button>
      </div>
    `;
  }
  const cities = searchService.getCities();
  return `
    <div class="planner-page">
      <div class="container">
        <h1>Cadastrar estabelecimento</h1>
        <p class="text-muted">Seu neg\xF3cio aparecer\xE1 automaticamente na busca e no mapa</p>

        <div class="register-steps" data-steps>
          ${STEPS.map((s, i) => `<div class="register-step ${i === 0 ? "is-active" : ""}" data-step-indicator="${i}"></div>`).join("")}
        </div>

        <div class="planner-form-card" style="max-width:600px;margin:0 auto">
          <form data-register-form>
            <div data-step="0" class="tab-panel is-active">
              <h3>Tipo de estabelecimento</h3>
              <div class="form-group">
                <select class="select" name="type" required>
                  <option value="hotel">Hotel / Pousada</option>
                  <option value="restaurant">Restaurante</option>
                  <option value="tour">Passeio / Experi\xEAncia</option>
                  <option value="establishment">Loja / Ag\xEAncia / Guia</option>
                </select>
              </div>
              <button type="button" class="btn btn--primary" data-next-step>Pr\xF3ximo</button>
            </div>

            <div data-step="1" class="tab-panel">
              <h3>Dados do estabelecimento</h3>
              <div class="form-group">
                <label class="form-label">Nome</label>
                <input class="input" name="name" required>
              </div>
              <div class="form-group">
                <label class="form-label">Cidade</label>
                <select class="select" name="cityId" required>
                  ${cities.map((c) => `<option value="${c.id}" data-name="${c.name}">${c.name}</option>`).join("")}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Endere\xE7o</label>
                <input class="input" name="address" required>
              </div>
              <div class="form-group">
                <label class="form-label">Telefone</label>
                <input class="input" name="phone">
              </div>
              <div class="form-group">
                <label class="form-label">Instagram</label>
                <input class="input" name="instagram" placeholder="@seuinstagram">
              </div>
              <div class="form-group">
                <label class="form-label">Descri\xE7\xE3o</label>
                <textarea class="textarea" name="description" required></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Faixa de pre\xE7o (1-4)</label>
                <input class="input" type="number" name="priceRange" min="1" max="4" value="2">
              </div>
              <div class="flex gap-4">
                <button type="button" class="btn btn--ghost" data-prev-step>Voltar</button>
                <button type="button" class="btn btn--primary" data-next-step>Pr\xF3ximo</button>
              </div>
            </div>

            <div data-step="2" class="tab-panel">
              <h3>Localiza\xE7\xE3o</h3>
              <div class="form-group">
                <label class="form-label">Latitude</label>
                <input class="input" name="lat" type="number" step="any" value="-3.73">
              </div>
              <div class="form-group">
                <label class="form-label">Longitude</label>
                <input class="input" name="lng" type="number" step="any" value="-38.52">
              </div>
              <div class="form-group">
                <label class="form-label">Hor\xE1rio de funcionamento</label>
                <input class="input" name="schedule" placeholder="Seg-Sex 11h-22h">
              </div>
              <div class="flex gap-4">
                <button type="button" class="btn btn--ghost" data-prev-step>Voltar</button>
                <button type="button" class="btn btn--primary" data-next-step>Pr\xF3ximo</button>
              </div>
            </div>

            <div data-step="3" class="tab-panel">
              <h3>Confirmar cadastro</h3>
              <p class="text-muted">Revise os dados e confirme. Seu estabelecimento ficar\xE1 vis\xEDvel imediatamente.</p>
              <div data-preview></div>
              <div class="flex gap-4" style="margin-top:var(--space-4)">
                <button type="button" class="btn btn--ghost" data-prev-step>Voltar</button>
                <button type="submit" class="btn btn--primary">Cadastrar</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}
function bindRegisterPage(container) {
  container.querySelector("[data-auth-open]")?.addEventListener("click", openAuthModal);
  const form = container.querySelector("[data-register-form]");
  if (!form) return;
  let currentStep = 0;
  const showStep = (n) => {
    currentStep = n;
    form.querySelectorAll("[data-step]").forEach((el, i) => {
      el.classList.toggle("is-active", i === n);
    });
    container.querySelectorAll("[data-step-indicator]").forEach((el, i) => {
      el.classList.toggle("is-active", i === n);
      el.classList.toggle("is-done", i < n);
    });
    if (n === 3) {
      const fd = new FormData(form);
      container.querySelector("[data-preview]").innerHTML = `
        <div class="info-card">
          <p><strong>${fd.get("name")}</strong></p>
          <p class="text-muted">${fd.get("type")} \xB7 ${form.querySelector(`[name="cityId"] option:checked`)?.textContent}</p>
          <p>${fd.get("description")}</p>
        </div>
      `;
    }
  };
  container.querySelectorAll("[data-next-step]").forEach((btn) => {
    btn.addEventListener("click", () => showStep(currentStep + 1));
  });
  container.querySelectorAll("[data-prev-step]").forEach((btn) => {
    btn.addEventListener("click", () => showStep(currentStep - 1));
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = authService.getCurrentUser();
    const fd = new FormData(form);
    const cityOption = form.querySelector(`[name="cityId"] option:checked`);
    try {
      establishmentService.register({
        type: fd.get("type"),
        name: fd.get("name"),
        cityId: fd.get("cityId"),
        cityName: cityOption?.dataset.name || cityOption?.textContent,
        description: fd.get("description"),
        priceRange: parseInt(fd.get("priceRange")) || 2,
        schedule: fd.get("schedule"),
        location: {
          lat: parseFloat(fd.get("lat")),
          lng: parseFloat(fd.get("lng")),
          address: fd.get("address")
        },
        metadata: {
          phone: fd.get("phone"),
          instagram: fd.get("instagram")
        }
      }, user.id);
      showToast("Estabelecimento cadastrado com sucesso!", "success");
      router.navigate("/perfil");
    } catch (err) {
      showToast(err.message, "error");
    }
  });
}

// scripts/pages/about-page.js
function renderAboutPage() {
  return `
    <div class="about-page">
      <div class="page-hero">
        <div class="container page-hero__inner">
          <h1>Sobre o Turistando CE</h1>
          <p>A plataforma completa de turismo do Cear\xE1 \u2014 feita para quem ama viajar.</p>
        </div>
      </div>

      <div class="container">
        <section class="about-section">
          <h2>Nossa miss\xE3o</h2>
          <p class="section-subtitle">Facilitar o planejamento de viagens no Cear\xE1 atrav\xE9s de tecnologia, organiza\xE7\xE3o e informa\xE7\xF5es confi\xE1veis. Queremos que voc\xEA encontre tudo em um s\xF3 lugar \u2014 sem precisar pesquisar em dezenas de sites diferentes.</p>
        </section>

        <section class="about-section">
          <h2>Por que existimos</h2>
          <p>Hoje quem deseja conhecer o Cear\xE1 enfrenta informa\xE7\xF5es espalhadas no Google, Booking, TripAdvisor, Instagram e blogs. O Turistando CE centraliza destinos, hot\xE9is, restaurantes, passeios, eventos e roteiros em uma experi\xEAncia moderna e intuitiva.</p>
        </section>

        <section class="about-section">
          <h2>Nossos valores</h2>
          <div class="about-values">
            <div class="about-value-card reveal">
              <div class="about-value-card__icon">\u{1F6E1}\uFE0F</div>
              <h3>Confiabilidade</h3>
              <p>Informa\xE7\xF5es verificadas e atualizadas por nossa equipe e parceiros locais.</p>
            </div>
            <div class="about-value-card reveal">
              <div class="about-value-card__icon">\u2728</div>
              <h3>Simplicidade</h3>
              <p>Navega\xE7\xE3o intuitiva inspirada nas melhores plataformas do mundo.</p>
            </div>
            <div class="about-value-card reveal">
              <div class="about-value-card__icon">\u267F</div>
              <h3>Acessibilidade</h3>
              <p>Modo escuro, ajuste de fonte, alto contraste e leitura por voz.</p>
            </div>
            <div class="about-value-card reveal">
              <div class="about-value-card__icon">\u{1F33F}</div>
              <h3>Sustentabilidade</h3>
              <p>Valoriza\xE7\xE3o do turismo respons\xE1vel e da cultura cearense.</p>
            </div>
            <div class="about-value-card reveal">
              <div class="about-value-card__icon">\u{1F5FA}\uFE0F</div>
              <h3>Inova\xE7\xE3o</h3>
              <p>Roteiros inteligentes, mapas interativos e busca avan\xE7ada.</p>
            </div>
            <div class="about-value-card reveal">
              <div class="about-value-card__icon">\u2764\uFE0F</div>
              <h3>Cultura local</h3>
              <p>Feito por cearenses, para quem quer viver o melhor do nosso estado.</p>
            </div>
          </div>
        </section>

        <section class="about-section text-center">
          <h2>Pronto para explorar?</h2>
          <p class="section-subtitle" style="margin:0 auto var(--space-6)">Comece sua jornada pelo Cear\xE1 agora mesmo.</p>
          <a href="/busca" data-nav class="btn btn--primary btn--lg">Explorar destinos</a>
        </section>
      </div>
    </div>
  `;
}
function bindAboutPage(container) {
  Promise.resolve().then(() => (init_dom(), dom_exports)).then(({ bindRevealAnimations: bindRevealAnimations2 }) => bindRevealAnimations2(container));
}

// scripts/pages/not-found-page.js
function renderNotFoundPage() {
  const suggestions = entityRepo.getByType("city").slice(0, 4);
  return `
    <div class="not-found container">
      <h1>404</h1>
      <h2>P\xE1gina n\xE3o encontrada</h2>
      <p class="text-muted" style="margin-bottom:var(--space-8)">O destino que voc\xEA procura n\xE3o existe ou foi movido.</p>
      <a href="/" data-nav class="btn btn--primary">Voltar ao in\xEDcio</a>
      <section style="margin-top:var(--space-16)">
        <h3 class="section-title">Destinos populares</h3>
        ${renderEntityGrid(suggestions)}
      </section>
    </div>
  `;
}
function bindNotFoundPage() {
}

// scripts/utils/seo.js
var DEFAULT_META = {
  title: "Turistando CE \u2014 Turismo no Cear\xE1",
  description: "Explore Jericoacoara, Canoa Quebrada e Fortaleza. O guia completo para sua viagem ao Cear\xE1.",
  image: "https://turistandoce.vercel.app/assets/images/og-image.jpg",
  url: window.location.href
};
function updateMeta(options = {}) {
  const { title, description, image, url } = { ...DEFAULT_META, ...options };
  document.title = title;
  setMeta("description", description);
  setMetaProperty("og:title", title);
  setMetaProperty("og:description", description);
  setMetaProperty("og:image", image);
  setMetaProperty("og:url", url || window.location.href);
  setMetaProperty("twitter:title", title);
  setMetaProperty("twitter:description", description);
  setMetaProperty("twitter:image", image);
}
function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}
function setMetaProperty(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.property = property;
    document.head.appendChild(el);
  }
  el.content = content;
}

// scripts/app.js
var routes = [
  { name: "home", render: renderHomePage, bind: bindHomePage },
  { name: "search", render: renderSearchPage, bind: bindSearchPage },
  { name: "city", render: renderCityPage, bind: bindCityPage },
  { name: "beach", render: renderBeachPage, bind: bindBeachPage },
  { name: "hotel", render: renderHotelPage, bind: bindHotelPage },
  { name: "restaurant", render: renderRestaurantPage, bind: bindRestaurantPage },
  { name: "tour", render: renderTourPage, bind: bindTourPage },
  { name: "event", render: renderEventPage, bind: bindEventPage },
  { name: "map", render: renderMapPage, bind: bindMapPage },
  { name: "planner", render: renderPlannerPage, bind: bindPlannerPage },
  { name: "profile", render: renderProfilePage, bind: bindProfilePage },
  { name: "register", render: renderRegisterPage, bind: bindRegisterPage },
  { name: "about", render: renderAboutPage, bind: bindAboutPage },
  { name: "notFound", render: renderNotFoundPage, bind: bindNotFoundPage }
];
var cleanupFn = null;
function updateSEO(route) {
  const { name, params } = route;
  if (["city", "beach", "hotel", "restaurant", "tour", "event"].includes(name) && params.slug) {
    const entity2 = entityRepo.getBySlug(params.slug);
    if (entity2) {
      updateMeta({
        title: `${entity2.name} \u2014 Turistando CE`,
        description: entity2.summary || entity2.description,
        image: entity2.coverImage,
        url: window.location.href
      });
      return;
    }
  }
  const titles = {
    home: "Turistando CE \u2014 Turismo no Cear\xE1",
    search: "Buscar \u2014 Turistando CE",
    map: "Mapa \u2014 Turistando CE",
    planner: "Planejar viagem \u2014 Turistando CE",
    profile: "Meu perfil \u2014 Turistando CE",
    register: "Cadastrar \u2014 Turistando CE",
    about: "Sobre \u2014 Turistando CE"
  };
  updateMeta({
    title: titles[name] || "Turistando CE",
    url: window.location.href
  });
}
async function renderApp(route) {
  if (cleanupFn) {
    cleanupFn();
    cleanupFn = null;
  }
  destroyMap();
  let routeConfig = routes.find((r) => r.name === route.name) || routes.find((r) => r.name === "notFound");
  let pageModule = null;
  let content = null;
  if (routeConfig.module) {
    pageModule = await import(routeConfig.module);
    content = pageModule[routeConfig.render](route);
  } else if (typeof routeConfig.render === "function") {
    content = routeConfig.render(route);
  } else if (typeof routeConfig.render === "string" && pageModule && typeof pageModule[routeConfig.render] === "function") {
    content = pageModule[routeConfig.render](route);
  }
  if (content === null) {
    routeConfig = routes.find((r) => r.name === "notFound");
    if (pageModule && typeof pageModule[routeConfig.render] === "function") {
      content = pageModule[routeConfig.render](route);
    } else if (typeof routeConfig.render === "function") {
      content = routeConfig.render(route);
    }
  }
  const appRoot = document.getElementById("app-root");
  appRoot.innerHTML = `
    ${renderHeader()}
    <main id="main-content" role="main">${content}</main>
    ${renderFooter()}
    ${renderAccessibilityToolbar()}
  `;
  updateSEO(route);
  bindHeader(appRoot);
  bindFooter(appRoot);
  bindAccessibilityToolbar(appRoot);
  if (routeConfig.bind) {
    const binder = pageModule && typeof pageModule[routeConfig.bind] === "function" ? pageModule[routeConfig.bind] : (typeof routeConfig.bind === "function" ? routeConfig.bind : null);
    if (typeof binder === "function") {
      const cleanup = await binder(appRoot, route);
      if (typeof cleanup === "function") cleanupFn = cleanup;
    }
  }
  if (route.name === "home" && window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
  }
  window.scrollTo(0, 0);
}
function init() {
  storage.init();
  initA11y();
  initToast();
  initModal();
  routes.forEach(({ name }) => {
    router.register(name, (route) => renderApp(route));
  });
  router.init();
}
function showBootError(error) {
  const root = document.getElementById("app-root");
  if (!root) return;
  root.innerHTML = `
    <div class="app-error">
      <h2>N\xE3o foi poss\xEDvel iniciar o Turistando CE</h2>
      <p>Abra o projeto com um servidor local (Live Server ou <code>npx serve .</code>), n\xE3o abrindo o arquivo HTML diretamente.</p>
      <code>${error?.message || error}</code>
      <p style="margin-top:1rem"><button class="btn btn--primary" onclick="location.reload()">Tentar novamente</button></p>
    </div>
  `;
}
document.addEventListener("DOMContentLoaded", () => {
  try {
    init();
  } catch (error) {
    console.error(error);
    showBootError(error);
  }
});
window.addEventListener("error", (e) => {
  if (e.message?.includes("module") || e.message?.includes("import")) {
    showBootError(e.error || { message: e.message });
  }
});
window.addEventListener("unhandledrejection", (e) => {
  showBootError(e.reason);
});
