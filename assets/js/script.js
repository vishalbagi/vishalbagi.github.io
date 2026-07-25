'use strict';



// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () {
  elementToggleFunc(sidebar);

  const isOpen = sidebar.classList.contains("active");
  sidebarBtn.setAttribute("aria-expanded", String(isOpen));
  sidebarBtn.querySelector("span").textContent = isOpen ? "Hide Contacts" : "Show Contacts";
});



// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

select.addEventListener("click", function () {
  elementToggleFunc(this);
  this.setAttribute("aria-expanded", String(this.classList.contains("active")));
});

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  for (let i = 0; i < filterItems.length; i++) {

    if (selectedValue === "all" || selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }

  }

}

// the desktop button row and the mobile select are two views of one state, so
// whichever the visitor uses, move the selection in both. category values live in
// data-filter-btn / data-select-item / data-category rather than in the visible
// label, so a label can be reworded without silently breaking the filter.
const setFilter = function (selectedValue, label) {

  selectValue.innerText = label;
  filterFunc(selectedValue);

  for (let i = 0; i < filterBtn.length; i++) {
    filterBtn[i].classList.toggle("active", filterBtn[i].dataset.filterBtn === selectedValue);
  }

}

for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {

    setFilter(this.dataset.selectItem, this.innerText);
    elementToggleFunc(select);
    select.setAttribute("aria-expanded", "false");

  });
}

for (let i = 0; i < filterBtn.length; i++) {
  filterBtn[i].addEventListener("click", function () {

    setFilter(this.dataset.filterBtn, this.innerText);

  });
}



// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");
const formStatus = document.querySelector("[data-form-status]");
const formFrame = document.querySelector("[data-form-frame]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {

    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }

  });
}

// the form posts into a hidden iframe, so there is no page navigation to signal
// success. wait for the iframe to load the response before confirming, and only
// clear the fields then — resetting inside the submit handler would wipe the
// values before the browser has serialised them.
let awaitingResponse = false;

form.addEventListener("submit", function () {
  awaitingResponse = true;
  formBtn.setAttribute("disabled", "");
  formStatus.textContent = "Sending your message…";
  formStatus.classList.add("active");
});

formFrame.addEventListener("load", function () {
  if (!awaitingResponse) return; // ignore the initial about:blank load
  awaitingResponse = false;

  formStatus.textContent = "Thanks — your message is on its way. I'll get back to you shortly.";
  form.reset();
});



// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// selection is driven by the data-nav-link / data-page values rather than by the
// button's text, so nav labels can be reworded (or given an icon) without
// breaking navigation.
const showPage = function (pageName) {

  // resolve before mutating — an unrecognised name (say a stale #hash) must
  // leave the current tab alone rather than hiding every panel
  let matched = false;
  for (let i = 0; i < pages.length; i++) {
    if (pages[i].dataset.page === pageName) matched = true;
  }

  if (!matched) return false;

  for (let i = 0; i < pages.length; i++) {
    pages[i].classList.toggle("active", pages[i].dataset.page === pageName);
  }

  for (let i = 0; i < navigationLinks.length; i++) {
    const isActive = navigationLinks[i].dataset.navLink === pageName;
    navigationLinks[i].classList.toggle("active", isActive);
    navigationLinks[i].setAttribute("aria-selected", String(isActive));
    navigationLinks[i].setAttribute("tabindex", isActive ? "0" : "-1");
  }

  return true;

}

for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {

    showPage(this.dataset.navLink);
    history.replaceState(null, "", "#" + this.dataset.navLink);
    window.scrollTo(0, 0);

  });
}

// arrow-key navigation between tabs, per the WAI-ARIA tabs pattern
const navbarList = document.querySelector("[data-nav-list]");

navbarList.addEventListener("keydown", function (event) {

  const keys = { ArrowLeft: -1, ArrowRight: 1 };
  if (!(event.key in keys) && event.key !== "Home" && event.key !== "End") return;

  const current = Array.prototype.indexOf.call(navigationLinks, document.activeElement);
  if (current === -1) return;

  let next;
  if (event.key === "Home") next = 0;
  else if (event.key === "End") next = navigationLinks.length - 1;
  else next = (current + keys[event.key] + navigationLinks.length) % navigationLinks.length;

  event.preventDefault();
  navigationLinks[next].focus();
  navigationLinks[next].click();

});

// deep links — #resume, #certification and friends survive a reload and can be
// shared. falls through to the About tab already marked active in the markup.
const pageFromHash = function () { return window.location.hash.replace("#", ""); }

if (pageFromHash()) showPage(pageFromHash());

window.addEventListener("hashchange", function () { showPage(pageFromHash()); });
