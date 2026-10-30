"use strict";

const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primary-nav");
const navLinks = document.querySelectorAll(".primary-nav a");
const appointmentForm = document.querySelector("#appointment-form");
const appointmentDate = document.querySelector("#preferred-date");
const formResult = document.querySelector("#form-result");
const toast = document.querySelector("#toast");

// Keep the year current without needing to edit the HTML each January.
const yearEl = document.querySelector("#current-year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Prevent users from choosing a date in the past.
if (appointmentDate) {
  const localToday = new Date();
  localToday.setMinutes(
    localToday.getMinutes() - localToday.getTimezoneOffset(),
  );
  appointmentDate.min = localToday.toISOString().slice(0, 10);
}

function setMenuOpen(isOpen) {
  if (!menuToggle || !primaryNav) return;
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Close navigation menu" : "Open navigation menu",
  );
  primaryNav.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
}

if (menuToggle && primaryNav) {
  menuToggle.addEventListener("click", () => {
    const currentlyOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setMenuOpen(!currentlyOpen);
  });

  navLinks.forEach((link) =>
    link.addEventListener("click", () => setMenuOpen(false)),
  );

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") { setMenuOpen(false); menuToggle.focus(); }
  });

  document.addEventListener("click", (event) => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    const clickedOnMenuBackdrop = event.target === primaryNav;
    const clickedInsideNav =
      primaryNav.contains(event.target) && !clickedOnMenuBackdrop;
    const clickedToggle = menuToggle.contains(event.target);
    if (
      isOpen &&
      (clickedOnMenuBackdrop || (!clickedInsideNav && !clickedToggle))
    )
      setMenuOpen(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 800) setMenuOpen(false);
  });
}

// Small entrance animations; content remains visible when reduced motion is preferred.
const revealItems = document.querySelectorAll(".reveal");
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
if ("IntersectionObserver" in window && !reducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

// Update the active navigation item as the visitor moves through major sections.
const observedSections = document.querySelectorAll(
  "main section[id], main section.hero, #top",
);
if ("IntersectionObserver" in window) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const sectionId = entry.target.id || "top";
        document.querySelectorAll(".nav-link").forEach((link) => {
          const isActive = link.getAttribute("href") === `#${sectionId}`;
          link.classList.toggle("active", isActive);
        });
      });
    },
    { rootMargin: "-28% 0px -60% 0px", threshold: 0 },
  );
  observedSections.forEach((section) => navObserver.observe(section));
}

function showFormResult(message, isError = false) {
  if (!formResult) return;
  formResult.textContent = message;
  formResult.classList.toggle("error", isError);
  formResult.hidden = false;
  formResult.scrollIntoView({
    behavior: reducedMotion ? "auto" : "smooth",
    block: "nearest",
  });
}

// This is intentionally a front-end demo: it never transmits or stores patient data.
if (appointmentForm) {
  appointmentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formResult.hidden = true;
    formResult.classList.remove("error");

    if (!appointmentForm.reportValidity()) return;

    const dateValue = appointmentDate.value;
    const [year, month, day] = dateValue.split("-").map(Number);
    const requestedDate = new Date(year, month - 1, day);
    const formattedDate = requestedDate.toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    showFormResult(
      `Thanks, ${appointmentForm.elements.fullName.value.trim()}! Your appointment request has been prepared for ${formattedDate}. This is a demo only, so your request has not been sent to the clinic. Please call the clinic to confirm a real appointment.`,
    );

    appointmentForm.reset();
    // Reapply the minimum date after the form reset.
    if (appointmentDate) {
      const today = new Date();
      today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
      appointmentDate.min = today.toISOString().slice(0, 10);
    }
  });
}

// Give the privacy note link a small, accessible inline confirmation.
const privacyLink = document.querySelector("#privacy-link");
if (privacyLink && toast) {
  privacyLink.addEventListener("click", () => {
    toast.textContent =
      "Privacy note: this demo form does not send or store submitted details.";
    toast.hidden = false;
    window.setTimeout(() => {
      toast.hidden = true;
    }, 4500);
  });
}

// The footer control scrolls to the actual document top, not just the sticky header anchor.
const backToTop = document.querySelector("#back-to-top");
if (backToTop) {
  backToTop.addEventListener("click", (event) => {
    event.preventDefault();
    if (menuToggle && menuToggle.getAttribute("aria-expanded") === "true")
      setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  });
}

// Carry the chosen service into the appointment request.
document.querySelectorAll(".service-card .card-link").forEach((link, index) => {
 link.addEventListener("click", () => {
  const service = document.querySelector("#service");
  if (service) service.selectedIndex = index + 1;
 });
});
