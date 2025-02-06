import { deleteFromListMessage, setToListMessage } from "./popup-messages.js";
export class ListManager {
  #urlSet;
  #domWrapper;

  constructor(urlList, domWrapper) {
    this.#urlSet = new Set(urlList);
    this.#domWrapper = domWrapper;

    this.#domWrapper.addEventListener("click", (event) => {
      if (event.target.classList.contains("delete-button")) {
        const url = event.target.parentElement.dataset.url;
        this.deleteUrl(url); // deletes the url from the set
        deleteFromListMessage(url); // deletes the url from the background
        this.#domWrapper.removeChild(event.target.parentElement); // deletes the url from the document
      }
    });
  }

  /**
   * @param {*} urls list of urls to be passed to the list
   */
  setUrls(urls) {
    this.#urlSet = new Set(urls);
  }

  /**
   *
   * @param {*} url url to be added to the list
   * @returns a promise that resolves to the response from the background
   */
  async addUrl(url) {
    const response = await setToListMessage(url);
    if (response.type === "OK") {
      this.#urlSet.add(response.hostname);
      this.renderElement(response.hostname);
    }

    return response;
  }

  /**
   *
   * @param {*} url url to be deleted from the list
   */
  deleteUrl(url) {
    this.#urlSet.delete(url);
  }

  /**
   *  renders @param #urlSet to the dom
   */
  renderAll() {
    this.#domWrapper.innerHTML = "";
    for (let url of this.#urlSet) {
      this.#domWrapper.innerHTML += this.urlElementDomString(url);
    }
  }

  /**
   *
   * @param {*} url single url to be added to the head of the list
   */
  renderElement(url) {
    this.#domWrapper.innerHTML =
      this.urlElementDomString(url) + this.#domWrapper.innerHTML;
  }

  /**
   *
   * @param {*} url rul of the element to be added to the list
   * @returns an html string that represents the url element
   */
  urlElementDomString(url) {
    return `
    <div class="list-item" data-url="${url}">
      <span class="url-span">${url}</span>
      <button class="delete-button">✕</button>
    </div>
    `;
  }
}
