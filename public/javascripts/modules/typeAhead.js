import axios from "axios";
import dompurify from "dompurify";

function searchResultsHTML(stores) {
  return stores
    .map((store, index) => {
      return `
			<a href="/store/${store.slug}" class="search__result">
				<strong>${index + 1}. ${store.name}</strong></a>`;
    })
    .join("");
}

function typeAhead(search) {
  if (!search) {
    return;
  }

  const searchInput = search.querySelector('input[name="search"]');
  const searchResults = search.querySelector(".search__results");

  searchInput.on("input", function() {
    // if there is no value, quit it
    if (!this.value) {
      searchResults.style.display = "none";
      return;
    }
    // show the search results
    searchResults.style.display = "block";

    axios
      .get(`/api/search?q=${this.value}`)
      .then(res => {
        if (res.data.length) {
          searchResults.innerHTML = dompurify.sanitize(
            searchResultsHTML(res.data)
          );
          return;
        }
        // Tell them nothing came back
        searchResults.innerHTML = dompurify.sanitize(
          `<div class="search__result">No results found for <strong>${
            this.value
          }</strong> found!</div>`
        );
      })
      .catch(err => {
        console.error(err);
      });
  });

  // Handle keyboard inputs
  searchInput.on("keyup", e => {
    let characterCode;
    if (e.which || e.charCode || e.keyCode) {
      characterCode = e.which || e.charCode || e.keyCode;
    } else if (e.key !== undefined) {
      characterCode = charCodeArr[e.key] || e.key.charCodeAt(0);
    } else {
      characterCode = 0;
    }
    // if they aren't pressing up down or enter who cares
    if (![38, 40, 13].includes(characterCode)) {
      return; // skip it
    }
    const activeClass = "search__result--active";
    const current = search.querySelector(`.${activeClass}`);
    const items = search.querySelectorAll(".search__result");
    let next;
    if (characterCode === 40 && current) {
      next = current.nextElementSibling || items[0];
    } else if (characterCode === 40) {
      next = items[0];
    } else if (characterCode === 38 && current) {
      next = current.previousElementSibling || items[items.length - 1];
    } else if (characterCode === 38) {
      next = items[items.length - 1];
    } else if (characterCode === 13 && current.href) {
      window.location = current.href;
      return;
    }
    if (current) {
      current.classList.remove(activeClass);
    }
    next.classList.add(activeClass);
  });
}

export default typeAhead;
