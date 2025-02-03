export class ListManager {
  constructor(urlList, domWrapper) {
    this._urlSet = new Set(urlList);
    this._domWrapper = domWrapper

    this._domWrapper.addEventListener("click", event => {
      if (event.target.classList.contains("delete-button")) {
        this.deleteUrl(event.target.parentElement.dataset.url); // deletes the url from the set
        this._domWrapper.removeChild(event.target.parentElement); // deletes the url from the document
      }
    });
  } 

  /**
   * 
   * @param {*} url url to be deleted from the list
   */
  deleteUrl(url) {
    this._urlSet.delete(url);
  }

  /**
   *  renders @_urlSet to the dom
   */
  renderAll() {
    this._domWrapper.innerHTML = "";
    for (let url of this._urlSet) {
      this._domWrapper.innerHTML += this.urlElementDomString(url);
    }
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