/**
 * Клас для роботи зі списком бажань (Wishlist)
 * Відповідає за відображення, додавання та видалення товарів
 */
class Wishlist {
  constructor() {
    // Знаходимо контейнер для списку товарів
    this.container = document.getElementById('wishlist-items');
    
    // Якщо контейнер не знайдено - припиняємо роботу
    if (!this.container) return;
    
    // Ініціалізуємо функціонал
    this.init();
  }

  /**
   * Ініціалізація класу
   */
  init() {
    this.renderItems();          // Відображаємо товари
    this.setupEventListeners();  // Налаштовуємо обробники подій
  }

  /**
   * Отримуємо список бажань з localStorage
   * @returns {Array} Масив товарів у списку бажань
   */
  getWishlist() {
    return JSON.parse(localStorage.getItem('wishlist')) || [];
  }

  /**
   * Відображаємо товари у списку бажань
   */
  renderItems() {
    const wishlist = this.getWishlist();
    
    // Якщо список порожній - показуємо повідомлення
    if (wishlist.length === 0) {
      this.container.innerHTML = `
        <div class="empty-message">
          <p>Ваш список бажань порожній</p>
          <a href="/collections/all" class="button">Продовжити покупки</a>
        </div>
      `;
      return;
    }

    // Генеруємо HTML для кожного товару та додаємо в контейнер
    this.container.innerHTML = wishlist.map(item => this.createItemHTML(item)).join('');
  }

  /**
   * Створює HTML-розмітку для одного товару
   * @param {Object} item Об'єкт товару
   * @returns {string} HTML-розмітка товару
   */
  createItemHTML(item) {
    return `
      <div class="wishlist-item" data-id="${item.id}">
        <img src="${item.image}" alt="${item.title}" loading="lazy">
        <div>
          <h3>${item.title}</h3>
          <p>${item.price}</p>
        </div>
        <button class="remove-btn">Видалити</button>
      </div>
    `;
  }

  /**
   * Налаштовує обробники подій
   */
  setupEventListeners() {
    // Додаємо обробник кліку для видалення товарів
    this.container.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-btn')) {
        this.removeItem(e.target.closest('.wishlist-item'));
      }
    });
  }

  /**
   * Видаляє товар зі списку бажань
   * @param {HTMLElement} itemElement Елемент товару, який потрібно видалити
   */
  removeItem(itemElement) {
    // Отримуємо ID товару
    const itemId = itemElement.dataset.id;
    
    // Фільтруємо список, залишаючи всі товари крім видаленого
    const wishlist = this.getWishlist().filter(item => item.id !== itemId);
    
    // Оновлюємо localStorage
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    
    // Перемальовуємо список (без перезавантаження сторінки)
    this.renderItems();
  }
}

// Ініціалізація класу після повного завантаження DOM
document.addEventListener('DOMContentLoaded', () => {
  new Wishlist();
});