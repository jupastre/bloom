/* ============================================
   BLOOM — Main JavaScript
   Pure Vanilla JS
   Refactored with accessibility improvements
   ============================================ */

(function () {
  "use strict";

  /* ============================================
     Helpers
     ============================================ */

  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call(
      (scope || document).querySelectorAll(selector),
    );
  }

  function on(el, event, handler, options) {
    if (el) el.addEventListener(event, handler, options || false);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function announceToScreenReader(message) {
    var liveRegion = qs("#sr-live-region");

    if (!liveRegion) {
      liveRegion = document.createElement("div");
      liveRegion.id = "sr-live-region";
      liveRegion.setAttribute("role", "status");
      liveRegion.setAttribute("aria-live", "polite");
      liveRegion.className = "visually-hidden";
      document.body.appendChild(liveRegion);
    }

    liveRegion.textContent = "";
    setTimeout(function () {
      liveRegion.textContent = message;
    }, 100);
  }

  /* ============================================
     AOS
     ============================================ */

  function initAOS() {
    if (typeof AOS === "undefined") return;

    var reduceMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.body.classList.contains("a11y-reduce-motion");

    AOS.init({
      duration: 600,
      easing: "ease-out-cubic",
      once: true,
      offset: 80,
      disable: function () {
        return reduceMotion;
      },
    });
  }

  /* ============================================
     Swiper
     ============================================ */

  function initSwiper() {
    if (typeof Swiper === "undefined") return;
    if (!qs(".testimonial-swiper")) return;

    new Swiper(".testimonial-swiper", {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: true,
      autoplay: {
        delay: 6000,
        disableOnInteraction: true,
        pauseOnMouseEnter: true,
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      keyboard: {
        enabled: true,
        onlyInViewport: true,
      },
      a11y: {
        enabled: true,
        prevSlideMessage: "Previous testimonial",
        nextSlideMessage: "Next testimonial",
        firstSlideMessage: "This is the first testimonial",
        lastSlideMessage: "This is the last testimonial",
        paginationBulletMessage: "Go to testimonial {{index}}",
      },
      breakpoints: {
        768: {
          slidesPerView: 2,
          spaceBetween: 28,
        },
        1200: {
          slidesPerView: 2,
          spaceBetween: 32,
        },
      },
    });
  }

  /* ============================================
     Navbar Scroll
     ============================================ */

  function initNavbarScroll() {
    var navbar = qs(".navbar-bloom");
    if (!navbar) return;

    function handleScroll() {
      navbar.classList.toggle("scrolled", window.scrollY > 50);
    }

    on(window, "scroll", handleScroll, { passive: true });
    handleScroll();
  }

  /* ============================================
     Mobile Menu Close
     ============================================ */

  function initMobileMenuClose() {
    var navCollapse = qs("#mainNav");
    if (!navCollapse || typeof bootstrap === "undefined") return;

    qsa(".navbar-bloom .nav-link").forEach(function (link) {
      on(link, "click", function () {
        var bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
        if (bsCollapse && navCollapse.classList.contains("show")) {
          bsCollapse.hide();
        }
      });
    });
  }

  /* ============================================
     Contact Form
     ============================================ */

  function initContactForm() {
    var form = qs("#contact-form");
    var successMessage = qs("#form-success");
    var errorMessage = qs("#form-error");

    if (!form) return;

    var requiredFields = qsa(
      "input[required], select[required], textarea[required]",
      form,
    );

    function clearCustomValidity(formEl) {
      qsa("input, select, textarea", formEl).forEach(function (input) {
        input.setCustomValidity("");
      });
    }

    function validateEmailField(input) {
      if (!input || input.type !== "email") return;

      var value = input.value.trim();
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (value !== "" && !emailPattern.test(value)) {
        input.setCustomValidity("Please enter a valid email address.");
        input.classList.add("is-invalid");
      }
    }

    function validateField(input) {
      var value = input.value.trim();

      input.setCustomValidity("");
      input.classList.remove("is-invalid");

      if (value === "") {
        input.setCustomValidity("This field is required.");
        input.classList.add("is-invalid");
      }

      if (input.type === "email" && value !== "") {
        validateEmailField(input);
      }

      if (input.checkValidity()) {
        input.setCustomValidity("");
        input.classList.remove("is-invalid");
      }
    }

    function showSuccess() {
      if (errorMessage) {
        errorMessage.style.display = "none";
      }

      form.style.display = "none";

      if (successMessage) {
        successMessage.classList.add("show");
        successMessage.focus();
      }

      var liveRegion = document.createElement("div");
      liveRegion.setAttribute("role", "status");
      liveRegion.setAttribute("aria-live", "polite");
      liveRegion.className = "visually-hidden";
      liveRegion.textContent =
        "Your message has been sent successfully. Thank you for contacting Bloom.";

      document.body.appendChild(liveRegion);

      setTimeout(function () {
        if (liveRegion.parentNode) {
          liveRegion.parentNode.removeChild(liveRegion);
        }
      }, 5000);
    }

    function showErrors() {
      form.classList.add("was-validated");

      if (errorMessage) {
        errorMessage.style.display = "block";
      }

      var firstInvalid = qs(":invalid", form);
      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.reportValidity();
      }

      announceToScreenReader(
        "There are errors in the form. Please review and correct the highlighted fields.",
      );
    }

    on(form, "submit", function (event) {
      event.preventDefault();
      event.stopPropagation();

      clearCustomValidity(form);

      var emailField = qs("#contact-email");
      validateEmailField(emailField);

      if (form.checkValidity()) {
        showSuccess();
      } else {
        showErrors();
      }
    });

    requiredFields.forEach(function (input) {
      on(input, "blur", function () {
        validateField(input);
      });

      on(input, "input", function () {
        validateField(input);
      });

      on(input, "change", function () {
        validateField(input);
      });
    });
  }

  /* ============================================
     Opportunities Filter
     ============================================ */

  function initOpportunityFilter() {
    var filterButtons = qsa(".filter-btn");
    var oppItems = qsa(".opp-item");
    var keywordSearch = qs("#opp-keyword-search");
    var categoryFilter = qs("#opp-category-filter");
    var locationFilter = qs("#opp-location-filter");
    var resetBtn = qs("#opp-reset-filters");
    var resultsCount = qs("#opp-results-count");

    if (!oppItems.length) return;

    var currentTypeFilter = "all";

    function updateResultsCount(count) {
      if (!resultsCount) return;

      if (count === 0) {
        resultsCount.textContent =
          "No opportunities match your criteria. Try adjusting your filters.";
      } else if (count === oppItems.length) {
        resultsCount.textContent = "Showing all " + count + " opportunities";
      } else {
        resultsCount.textContent =
          "Showing " + count + " of " + oppItems.length + " opportunities";
      }
    }

    function matchesFilters(item, keyword, category, location) {
      var typeCategory = item.getAttribute("data-category") || "";
      var oppCategory = item.getAttribute("data-opp-category") || "";
      var itemLocation = item.getAttribute("data-location") || "";
      var textContent = item.textContent.toLowerCase();

      var matchesType =
        currentTypeFilter === "all" || typeCategory === currentTypeFilter;
      var matchesCategory = category === "all" || oppCategory === category;
      var matchesLocation = location === "all" || itemLocation === location;
      var matchesKeyword =
        keyword === "" || textContent.indexOf(keyword) !== -1;

      return (
        matchesType && matchesCategory && matchesLocation && matchesKeyword
      );
    }

    function filterOpportunities() {
      var keyword = keywordSearch
        ? keywordSearch.value.toLowerCase().trim()
        : "";
      var category = categoryFilter ? categoryFilter.value : "all";
      var location = locationFilter ? locationFilter.value : "all";
      var count = 0;

      oppItems.forEach(function (item) {
        var shouldShow = matchesFilters(item, keyword, category, location);

        item.style.display = shouldShow ? "" : "none";

        if (shouldShow) {
          item.removeAttribute("aria-hidden");
          count++;
        } else {
          item.setAttribute("aria-hidden", "true");
        }
      });

      updateResultsCount(count);
      announceToScreenReader(count + " opportunities found.");
    }

    function setActiveFilterButton(activeBtn) {
      filterButtons.forEach(function (btn) {
        btn.classList.remove("active");
        btn.setAttribute("aria-pressed", "false");
      });

      if (activeBtn) {
        activeBtn.classList.add("active");
        activeBtn.setAttribute("aria-pressed", "true");
      }
    }

    filterButtons.forEach(function (btn) {
      on(btn, "click", function () {
        currentTypeFilter = btn.getAttribute("data-filter") || "all";
        setActiveFilterButton(btn);
        filterOpportunities();
      });
    });

    on(keywordSearch, "input", filterOpportunities);
    on(categoryFilter, "change", filterOpportunities);
    on(locationFilter, "change", filterOpportunities);

    on(resetBtn, "click", function () {
      if (keywordSearch) keywordSearch.value = "";
      if (categoryFilter) categoryFilter.value = "all";
      if (locationFilter) locationFilter.value = "all";

      currentTypeFilter = "all";
      setActiveFilterButton(qs('.filter-btn[data-filter="all"]'));

      filterOpportunities();
      announceToScreenReader("All filters have been reset.");
    });
  }

  /* ============================================
     Newsletter Forms
     ============================================ */

  function initNewsletterForms() {
    qsa(".newsletter-inline form").forEach(function (form) {
      on(form, "submit", function (event) {
        event.preventDefault();

        var emailInput = qs('input[type="email"]', form);
        if (!emailInput || !emailInput.value) return;

        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailInput.value)) return;

        emailInput.value = "";
        emailInput.placeholder = "Thank you for subscribing!";
        emailInput.setAttribute("aria-label", "Successfully subscribed");

        announceToScreenReader(
          "Thank you for subscribing to the Bloom newsletter.",
        );

        setTimeout(function () {
          emailInput.placeholder = "Your email address";
          emailInput.setAttribute("aria-label", "Email address");
        }, 4000);
      });
    });
  }

  /* ============================================
     Smooth Scroll
     ============================================ */

  function initSmoothScroll() {
    qsa('a[href^="#"]:not([data-bs-toggle])').forEach(function (link) {
      on(link, "click", function (event) {
        var targetId = link.getAttribute("href");
        if (targetId === "#") return;

        var target = qs(targetId);
        if (!target) return;

        event.preventDefault();

        var navbar = qs(".navbar-bloom");
        var navbarHeight = navbar ? navbar.offsetHeight : 0;
        var targetPosition =
          target.getBoundingClientRect().top +
          window.pageYOffset -
          navbarHeight -
          20;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });

        if (!target.hasAttribute("tabindex")) {
          target.setAttribute("tabindex", "-1");
        }

        target.focus({ preventScroll: true });
      });
    });
  }

  /* ============================================
     Back to Top
     ============================================ */

  function initBackToTop() {
    var backToTopBtn = document.createElement("button");
    backToTopBtn.type = "button";
    backToTopBtn.className = "btn-bloom btn-bloom-primary";
    backToTopBtn.setAttribute("aria-label", "Back to top");
    backToTopBtn.setAttribute("title", "Back to top");
    backToTopBtn.innerHTML = "&#8593;";
    backToTopBtn.style.cssText =
      "position: fixed; bottom: 2rem; right: 2rem; z-index: 999; width: 52px; height: 52px; min-width: auto; padding: 0; border-radius: 50%; font-size: 1.3rem; opacity: 0; visibility: hidden; transition: opacity 0.3s ease, visibility 0.3s ease; display: flex; align-items: center; justify-content: center;";

    document.body.appendChild(backToTopBtn);

    function toggleBackToTop() {
      var visible = window.scrollY > 400;
      backToTopBtn.style.opacity = visible ? "1" : "0";
      backToTopBtn.style.visibility = visible ? "visible" : "hidden";
    }

    on(window, "scroll", toggleBackToTop, { passive: true });

    on(backToTopBtn, "click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });

      var skipLink = qs(".skip-link");
      if (skipLink) {
        skipLink.focus({ preventScroll: true });
      }
    });
  }

  /* ============================================
     Accordion A11y
     ============================================ */

  function initAccordionA11y() {
    qsa(".accordion-button").forEach(function (btn) {
      btn.style.backgroundColor = "var(--white)";

      on(btn, "focus", function () {
        btn.style.boxShadow = "0 0 0 3px rgba(139, 58, 98, 0.3)";
      });

      on(btn, "blur", function () {
        btn.style.boxShadow = "none";
      });
    });
  }

  /* ============================================
     Accessibility Toolbar
     ============================================ */

  function loadA11ySettings() {
    var defaults = {
      fontSize: 0,
      darkMode: false,
      highContrast: false,
      highlightLinks: false,
      reduceMotion: false,
      clickSpeed: 0,
    };

    try {
      var stored = localStorage.getItem("bloom-a11y");
      if (!stored) return defaults;

      return Object.assign({}, defaults, JSON.parse(stored));
    } catch (e) {
      return defaults;
    }
  }

  function saveA11ySettings(settings) {
    try {
      localStorage.setItem("bloom-a11y", JSON.stringify(settings));
    } catch (e) {
      /* ignore */
    }
  }

  function applyA11ySettings(settings) {
    var baseFontSize = 18;
    var newSize = clamp(baseFontSize + settings.fontSize * 2, 14, 26);
    document.documentElement.style.fontSize = newSize + "px";

    document.body.classList.toggle("a11y-dark-mode", settings.darkMode);
    document.body.classList.toggle("a11y-high-contrast", settings.highContrast);
    document.body.classList.toggle(
      "a11y-highlight-links",
      settings.highlightLinks,
    );
    document.body.classList.toggle("a11y-reduce-motion", settings.reduceMotion);

    document.body.setAttribute("data-click-speed", settings.clickSpeed);
  }

  function updateA11yButtonStates(settings, panelBtns) {
    panelBtns.forEach(function (btn) {
      var action = btn.getAttribute("data-a11y");
      btn.classList.remove("active");

      if (
        (action === "dark-mode" && settings.darkMode) ||
        (action === "high-contrast" && settings.highContrast) ||
        (action === "highlight-links" && settings.highlightLinks) ||
        (action === "reduce-motion" && settings.reduceMotion) ||
        (action === "click-speed" && settings.clickSpeed > 0)
      ) {
        btn.classList.add("active");
      }
    });
  }

  function resetA11ySettings(settings, panelBtns) {
    settings.fontSize = 0;
    settings.darkMode = false;
    settings.highContrast = false;
    settings.highlightLinks = false;
    settings.reduceMotion = false;
    settings.clickSpeed = 0;

    applyA11ySettings(settings);
    saveA11ySettings(settings);
    updateA11yButtonStates(settings, panelBtns);
  }

  function handleA11yAction(action, settings, panelBtns) {
    switch (action) {
      case "font-increase":
        if (settings.fontSize < 4) {
          settings.fontSize++;
          announceToScreenReader("Font size increased.");
        }
        break;

      case "font-decrease":
        if (settings.fontSize > -2) {
          settings.fontSize--;
          announceToScreenReader("Font size decreased.");
        }
        break;

      case "dark-mode":
        settings.darkMode = !settings.darkMode;
        if (settings.darkMode) settings.highContrast = false;
        announceToScreenReader(
          settings.darkMode ? "Dark mode enabled." : "Dark mode disabled.",
        );
        break;

      case "high-contrast":
        settings.highContrast = !settings.highContrast;
        if (settings.highContrast) settings.darkMode = false;
        announceToScreenReader(
          settings.highContrast
            ? "High contrast mode enabled."
            : "High contrast mode disabled.",
        );
        break;

      case "highlight-links":
        settings.highlightLinks = !settings.highlightLinks;
        announceToScreenReader(
          settings.highlightLinks
            ? "Links are now highlighted."
            : "Link highlighting disabled.",
        );
        break;

      case "reduce-motion":
        settings.reduceMotion = !settings.reduceMotion;
        announceToScreenReader(
          settings.reduceMotion
            ? "Motion reduced."
            : "Motion animations restored.",
        );
        break;

      case "click-speed":
        settings.clickSpeed = (settings.clickSpeed + 1) % 3;
        announceToScreenReader(
          "Click speed set to " +
            ["Normal", "Slow", "Very Slow"][settings.clickSpeed],
        );
        break;
    }

    applyA11ySettings(settings);
    saveA11ySettings(settings);
    updateA11yButtonStates(settings, panelBtns);
  }

  function initAccessibilityToolbar() {
    var toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "a11y-toolbar-toggle";
    toggleBtn.setAttribute("aria-label", "Open accessibility settings");
    toggleBtn.setAttribute("title", "Accessibility Settings");
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.setAttribute("aria-controls", "a11y-panel");
    toggleBtn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" width="36" height="36" fill="currentColor">' +
      '<path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-1 6h2c2.21 0 5 .5 5 .5l-.4 2s-2.1-.5-3.6-.5V13l2.5 5.5-1.8.8L12 14l-2.7 5.3-1.8-.8L10 13v-3c-1.5 0-3.6.5-3.6.5L6 8.5S8.79 8 11 8z"/>' +
      "</svg>";

    document.body.appendChild(toggleBtn);

    var panel = document.createElement("div");
    panel.className = "a11y-panel";
    panel.id = "a11y-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-hidden", "true");
    panel.setAttribute("aria-label", "Accessibility settings panel");
    panel.innerHTML =
      "<h3>Accessibility Settings</h3>" +
      '<button class="a11y-panel-btn" data-a11y="font-increase" aria-label="Increase font size"><span class="a11y-icon" aria-hidden="true">A+</span><span>Increase Font Size</span></button>' +
      '<button class="a11y-panel-btn" data-a11y="font-decrease" aria-label="Decrease font size"><span class="a11y-icon" aria-hidden="true">A-</span><span>Decrease Font Size</span></button>' +
      '<button class="a11y-panel-btn" data-a11y="dark-mode" aria-label="Toggle dark mode"><span class="a11y-icon" aria-hidden="true">&#9789;</span><span>Dark Mode</span></button>' +
      '<button class="a11y-panel-btn" data-a11y="high-contrast" aria-label="Toggle high contrast mode"><span class="a11y-icon" aria-hidden="true">&#9680;</span><span>High Contrast</span></button>' +
      '<button class="a11y-panel-btn" data-a11y="highlight-links" aria-label="Toggle highlight links"><span class="a11y-icon" aria-hidden="true">&#128279;</span><span>Highlight Links</span></button>' +
      '<button class="a11y-panel-btn" data-a11y="reduce-motion" aria-label="Toggle reduce motion"><span class="a11y-icon" aria-hidden="true">&#9726;</span><span>Reduce Motion</span></button>' +
      '<button class="a11y-panel-btn" data-a11y="click-speed"><span class="a11y-icon">&#128433;</span><span>Click Speed</span></button>' +
      '<button class="a11y-panel-reset" aria-label="Reset all accessibility settings">Reset All Settings</button>';

    document.body.appendChild(panel);

    var settings = loadA11ySettings();
    var panelBtns = qsa(".a11y-panel-btn", panel);
    var resetBtn = qs(".a11y-panel-reset", panel);

    applyA11ySettings(settings);
    updateA11yButtonStates(settings, panelBtns);

    function openPanel() {
      panel.classList.add("open");
      panel.setAttribute("aria-hidden", "false");
      toggleBtn.setAttribute("aria-expanded", "true");
      toggleBtn.setAttribute("aria-label", "Close accessibility settings");

      var firstBtn = qs(".a11y-panel-btn", panel);
      if (firstBtn) firstBtn.focus();
    }

    function closePanel(returnFocus) {
      panel.classList.remove("open");
      panel.setAttribute("aria-hidden", "true");
      toggleBtn.setAttribute("aria-expanded", "false");
      toggleBtn.setAttribute("aria-label", "Open accessibility settings");

      if (returnFocus) {
        toggleBtn.focus();
      }
    }

    on(toggleBtn, "click", function () {
      if (panel.classList.contains("open")) {
        closePanel(true);
      } else {
        openPanel();
      }
    });

    on(panel, "keydown", function (e) {
      if (!panel.classList.contains("open") || e.key !== "Tab") return;

      var focusableElements = qsa(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        panel,
      );

      if (!focusableElements.length) return;

      var firstElement = focusableElements[0];
      var lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    });

    on(document, "keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("open")) {
        closePanel(true);
      }
    });

    on(document, "click", function (e) {
      if (
        panel.classList.contains("open") &&
        !panel.contains(e.target) &&
        !toggleBtn.contains(e.target)
      ) {
        closePanel(false);
      }
    });

    panelBtns.forEach(function (btn) {
      on(btn, "click", function () {
        handleA11yAction(btn.getAttribute("data-a11y"), settings, panelBtns);
      });
    });

    on(resetBtn, "click", function () {
      resetA11ySettings(settings, panelBtns);
      announceToScreenReader("All accessibility settings have been reset.");
    });
  }

  /* ============================================
     Click Speed Protection
     ============================================ */

  function initClickSpeedProtection() {
    on(
      document,
      "click",
      function (event) {
        var speed = parseInt(
          document.body.getAttribute("data-click-speed") || "0",
          10,
        );

        var minInterval = 0;
        if (speed === 1) minInterval = 700;
        if (speed === 2) minInterval = 1200;
        if (minInterval === 0) return;

        var target = event.target.closest(
          "a, button, .btn, input[type='submit']",
        );
        if (!target) return;

        var now = Date.now();
        var lastClick = parseInt(
          target.getAttribute("data-last-click") || "0",
          10,
        );

        if (now - lastClick < minInterval) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }

        target.setAttribute("data-last-click", String(now));
      },
      true,
    );
  }

  /* ============================================
     Init
     ============================================ */

  function init() {
    initAccessibilityToolbar();
    initClickSpeedProtection();
    initAOS();
    initSwiper();
    initNavbarScroll();
    initMobileMenuClose();
    initContactForm();
    initOpportunityFilter();
    initNewsletterForms();
    initSmoothScroll();
    initBackToTop();
    initAccordionA11y();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
