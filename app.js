/* Flores Manik Travel — interactions
   Language toggle (ID/EN), mobile nav, reveal, booking-form states. */
(function () {
  "use strict";

  var html = document.documentElement;
  var status = document.getElementById("formStatus");

  /* --------------------------------------------------- status text -- */
  function statusMessage(state, lang) {
    var en = lang === "en";
    switch (state) {
      case "pending":
        return en ? "Sending your request…" : "Mengirim permintaan Anda…";
      case "success":
        return en
          ? "Request received in this demo. This form is not connected yet — please contact us via WhatsApp or email for a real booking."
          : "Permintaan diterima pada demo ini. Form belum terhubung — silakan hubungi kami via WhatsApp atau email untuk pemesanan nyata.";
      case "error":
        return en
          ? "Some fields need attention. Please review the highlighted fields."
          : "Ada isian yang perlu diperbaiki. Mohon periksa kolom yang ditandai.";
      default:
        return en
          ? "This form is not yet connected to a sending service. This is a demonstration interface."
          : "Form ini belum terhubung ke layanan pengiriman. Ini contoh antarmuka.";
    }
  }

  function renderStatus(lang) {
    if (!status) return;
    status.textContent = statusMessage(status.getAttribute("data-state") || "", lang);
  }

  /* ------------------------------------------------------ i18n ----- */
  function applyLang(lang) {
    html.lang = lang;
    html.setAttribute("data-lang", lang);

    document.querySelectorAll("[data-id][data-en]").forEach(function (el) {
      el.textContent = el.getAttribute("data-" + lang);
    });
    document.querySelectorAll("[data-ph-id][data-ph-en]").forEach(function (el) {
      el.setAttribute("placeholder", el.getAttribute("data-ph-" + lang));
    });

    var id = document.getElementById("langId");
    var en = document.getElementById("langEn");
    if (id && en) {
      id.classList.toggle("on", lang === "id");
      en.classList.toggle("on", lang === "en");
    }

    var toggle = document.getElementById("langToggle");
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(lang === "en"));
      toggle.setAttribute(
        "aria-label",
        lang === "en"
          ? "Switch to Indonesian / Ganti ke Bahasa Indonesia"
          : "Switch to English / Ganti ke Bahasa Inggris"
      );
    }

    document.title = lang === "en"
      ? "Flores Manik Travel — Labuan Bajo Travel Guide"
      : "Flores Manik Travel — Panduan Wisata Labuan Bajo";

    renderStatus(lang);
    try { localStorage.setItem("fmt-lang", lang); } catch (e) {}
  }

  var langToggle = document.getElementById("langToggle");
  if (langToggle) {
    langToggle.addEventListener("click", function () {
      applyLang(html.getAttribute("data-lang") === "id" ? "en" : "id");
    });
  }

  var saved = null;
  try { saved = localStorage.getItem("fmt-lang"); } catch (e) {}
  if (saved === "en") applyLang("en");

  /* --------------------------------------------------- mobile nav --- */
  var navToggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");

  function closeNav() {
    if (!nav) return;
    nav.classList.remove("open");
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        closeNav();
        navToggle.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (!nav.classList.contains("open")) return;
      if (!nav.contains(e.target) && !navToggle.contains(e.target)) closeNav();
    });
  }

  /* ------------------------------------------- header + hero video --- */
  var header = document.getElementById("siteHeader");
  var heroVideo = document.getElementById("heroVideo");

  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (heroVideo) {
    var reduceMotion = window.matchMedia
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      heroVideo.removeAttribute("autoplay");
      heroVideo.pause();
    } else {
      var playPromise = heroVideo.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () { /* poster remains until user interacts */ });
      }
    }
  }

  /* ------------------------------------------------------- reveal --- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* --------------------------------------------------- form state --- */
  var form = document.getElementById("bookingForm");
  var btn = document.getElementById("submitBtn");

  function setError(name, message) {
    var field = form.querySelector('[name="' + name + '"]');
    var slot = form.querySelector('[data-error-for="' + name + '"]');
    if (!field || !slot) return;
    var wrap = field.closest(".field");
    if (message) {
      slot.textContent = message;
      slot.hidden = false;
      field.setAttribute("aria-invalid", "true");
      wrap.setAttribute("data-invalid", "true");
    } else {
      slot.textContent = "";
      slot.hidden = true;
      field.removeAttribute("aria-invalid");
      wrap.removeAttribute("data-invalid");
    }
  }

  function validate() {
    var firstInvalid = null;
    var checks = [
      { name: "name", ok: function (v) { return v.trim().length >= 2; },
        msg: html.lang === "en" ? "Please enter your name." : "Mohon isi nama Anda." },
      { name: "wa", ok: function (v) { return v.replace(/[^0-9+]/g, "").length >= 7; },
        msg: html.lang === "en" ? "Enter a reachable number (min 7 digits)." : "Masukkan nomor yang bisa dihubungi (min. 7 angka)." },
      { name: "email", ok: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); },
        msg: html.lang === "en" ? "Enter a valid email, e.g. name@example.com." : "Masukkan email yang valid, mis. nama@contoh.com." }
    ];

    checks.forEach(function (c) {
      var field = form.querySelector('[name="' + c.name + '"]');
      var ok = c.ok(field.value);
      setError(c.name, ok ? "" : c.msg);
      if (!ok && !firstInvalid) firstInvalid = field;
    });
    return firstInvalid;
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstInvalid = validate();
      if (firstInvalid) {
        firstInvalid.focus();
        status.setAttribute("data-state", "error");
        renderStatus(html.lang);
        return;
      }

      btn.setAttribute("aria-busy", "true");
      btn.disabled = true;
      status.setAttribute("data-state", "pending");
      renderStatus(html.lang);

      window.setTimeout(function () {
        btn.removeAttribute("aria-busy");
        btn.disabled = false;
        status.setAttribute("data-state", "success");
        renderStatus(html.lang);
      }, 900);
    });

    ["name", "wa", "email"].forEach(function (name) {
      var field = form.querySelector('[name="' + name + '"]');
      if (field) field.addEventListener("blur", function () { validate(); });
    });
  }

  /* ----------------------------------------------------------- year - */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
