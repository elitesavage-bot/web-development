const menuToggle = document.querSzySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

mainNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  mainNav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
}));

document.querySelectorAll(".slider-button").forEach((button) => button.addEventListener("click", () => {
  const quote = document.querySelector(".reviews blockquote");
  quote.classList.add("is-changing");
  window.setTimeout(() => quote.classList.remove("is-changing"), 350);
}));

const form = document.querySelector("#reservation-form");
const message = document.querySelector(".form-message");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = data.get("name");
  message.textContent = `Thank you${name ? `, ${name.split(" ")[0]}` : ""}! Your reservation request has been received.`;
  form.reset();
});
