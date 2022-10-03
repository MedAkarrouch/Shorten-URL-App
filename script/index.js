const navBtn = document.querySelector(".header__btn");
const menu = document.querySelector(".menu");
const form = document.querySelector("form");
const input = document.querySelector("input");
const urlsContainer = document.querySelector(".about__urls");
const warningContainer = document.querySelector(".about__warning");
const links = document.querySelectorAll("a");
const mediaQuery = window.matchMedia("(min-width: 900px)");

class App {
  constructor() {
    this._displayLocalStorage();
    // Event Handlers
    form.addEventListener("submit", this._handleSubmittedForm.bind(this));
    urlsContainer.addEventListener("click", this._handlePesssedBtns.bind(this));

    navBtn.addEventListener("click", this._handleNav);
    this._handleLinks();
    // Register event listener
    mediaQuery.addListener(this._hideNav);
    // Initial check
    this._hideNav(mediaQuery);
  }
  _handleLinks() {
    links.forEach((link) =>
      link.addEventListener("click", (e) => {
        e.preventDefault();
      })
    );
  }
  _handleNav() {
    menu.classList.toggle("show-menu", !menu.classList.contains("show-menu"));
    navBtn.classList.toggle(
      "change-color",
      !navBtn.classList.contains("change-color")
    );
  }
  _handleSubmittedForm(e) {
    e.preventDefault();
    const url = input.value;
    if (!url) {
      this._renderWarning();
      return;
    }
    try {
      console.log(new URL(url));
      const { href } = new URL(url);
      console.log(href);
      if (this._checkIFTheLinkWasAlreadyExisted(href)) {
        this._renderWarning("this link was already shortened");
        return;
      }
      this._shortenUrl(href);
    } catch (error) {
      this._renderWarning("Invalid URL");
    }
  }
  _handlePesssedBtns(e) {
    const clicked = e.target;
    if (clicked.classList.contains("about__copy")) {
      const url = clicked.parentElement.previousElementSibling.textContent;
      clicked.classList.add("copied");
      clicked.textContent = "Copied!";
      navigator.clipboard.writeText(url);
      setTimeout(() => {
        clicked.classList.remove("copied");
        clicked.textContent = "Copy";
      }, 2000);
    }
    if (clicked.classList.contains("about__delete")) {
      const shortenedUrl =
        clicked.parentElement.previousElementSibling.textContent;
      console.log(shortenedUrl);
      clicked.parentElement.parentElement.remove();
      console.log(this);
      this._removeUrlFromLocalStorage(shortenedUrl);
    }
  }
  _removeUrlFromLocalStorage(shortenedUrl) {
    let urls = this._getLocalStorage();
    console.log(urls);

    urls = urls.filter((ele) => ele.shortenedUrl !== shortenedUrl);
    if (!urls.length) {
      window.localStorage.clear();
      return;
    }
    window.localStorage.setItem("urls", JSON.stringify(urls));
  }
  _renderWarning(con = "add") {
    form.classList.add("warning");
    warningContainer.textContent =
      con === "add" ? "Please add a link" : `${con}`;
    input.value = "";
    setTimeout(() => {
      form.classList.remove("warning");
    }, 2500);
  }

  _checkIFTheLinkWasAlreadyExisted(link) {
    let urls = JSON.parse(window.localStorage.getItem("urls"));
    if (!urls) return false;
    console.log(!urls.every((url) => url.originUrl !== link));
    return !urls.every((url) => url.originUrl !== link);
    // const urls = Array.from(document.querySelectorAll(".about__url"));
    // return urls.reduce((prev, curr) => {
    //   if (curr.textContent === link) return true;
    //   else return prev;
    // }, false);
  }
  _renderUrl(url, shortenUrl) {
    // if (this._checkIFTheLinkWasAlreadyExisted(url))
    //   renderWarning("The link was already shortened");
    // else {
    const html = `<article class="about__url-box">
    <p class="about__url">${url}</p>
    <p class="about__url-shortened">${shortenUrl}</p>
    <div class="about__btns-box">
      <button class="about__copy">Copy</button>
      <button class="about__delete">Delete</button>
    </div>
  </article>`;
    urlsContainer.insertAdjacentHTML("afterbegin", html);
    form.classList.remove("warning");
    // }
    input.value = "";
  }
  async _shortenUrl(url) {
    try {
      this._renderLoadingUrl();
      const response = await fetch(
        `https://api.shrtco.de/v2/shorten?url=${url}`
      );
      const data = await response.json();
      console.log(data);
      const shortenedUrl = data.result.full_short_link2;
      const originalUrl = data.result.original_link;
      this._renderUrl(originalUrl, shortenedUrl);
      this._removeLoadingUrl();
      this._addToLocalStorage(originalUrl, shortenedUrl);
    } catch (error) {
      this._renderWarning(
        "Something went wrong, Try to shorten the link again"
      );
      this._removeLoadingUrl();
    }
  }
  _addToLocalStorage(originUrl, shortenedUrl) {
    const urls = this._getLocalStorage() ? this._getLocalStorage() : [];
    const url = { originUrl, shortenedUrl };
    urls.push(url);
    window.localStorage.setItem("urls", JSON.stringify(urls));
  }
  _getLocalStorage() {
    return JSON.parse(window.localStorage.getItem("urls"));
  }
  _displayLocalStorage() {
    if (!this._getLocalStorage()) return;
    this._getLocalStorage().forEach((ele) =>
      this._renderUrl(ele.originUrl, ele.shortenedUrl)
    );
  }
  _renderLoadingUrl() {
    const html = `<article class="about__url-box about__url-box--loading">
        <p class="about__url skeleton"></p>
        <p class="about__url-shortened skeleton"></p>
        <div class="about__btns-box">
          <button class="about__copy skeleton"></button>
          <button class="about__delete skeleton"></button>
        </div>
      </article>`;
    urlsContainer.insertAdjacentHTML("afterbegin", html);
  }
  _removeLoadingUrl() {
    document.querySelector(".about__url-box--loading").remove();
  }
  _hideNav(e) {
    if (e.matches) {
      menu.classList.remove("show-menu", !menu.classList.contains("show-menu"));
      navBtn.classList.remove(
        "change-color",
        !navBtn.classList.contains("change-color")
      );
    }
  }
}
const app = new App();
