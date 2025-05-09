// Глобальний стан додатку
const state = {
  // Об'єкт для відстеження вибраних товарів
  selectedProducts: {
    snowboard: { selected: false, variantId: null },  // Стан для сноуборду
    jacket: { selected: false, variantId: null },     // Стан для куртки
    helmet: { selected: false, variantId: null },     // Стан для шолома
  },
  
  // Об'єкт для роботи зі списком бажань
  wishlist: {
    items: [],  // Масив товарів у списку бажань
    
    // Метод ініціалізації - завантажує дані з localStorage
    init: function() {
      const saved = localStorage.getItem('wishlist');
      this.items = saved ? JSON.parse(saved) : [];
      return this;
    },
    
    // Метод збереження даних у localStorage
    save: function() {
      localStorage.setItem('wishlist', JSON.stringify(this.items));
    }
  }.init()  // Викликаємо init() одразу при створенні об'єкта
};

// Функція для оновлення лічильника товарів у списку бажань
function updateWishlistCounter() {
  // Знаходимо елемент лічильника
  const wishlistCounter = document.querySelector('.wishlist-counter');
  if (!wishlistCounter) return;  // Виходимо, якщо лічильник не знайдено
  
  // Оновлюємо текст та видимість лічильника
  wishlistCounter.textContent = state.wishlist.items.length;
  wishlistCounter.style.display = state.wishlist.items.length ? 'block' : 'none';
}

// Функція ініціалізації списку бажань
function initWishlist() {
  // Знаходимо всі кнопки "Додати до списку бажань"
  const wishlistButtons = document.querySelectorAll('.wishlist-button');
  if (!wishlistButtons.length) return;  // Виходимо, якщо кнопок немає

  // Для кожної кнопки
  wishlistButtons.forEach(button => {
    // Отримуємо ID товару
    const productId = button.dataset.productId;
    if (!productId) return;  // Пропускаємо, якщо ID відсутній
    
    // Перевіряємо, чи товар вже є у списку бажань
    const isInWishlist = state.wishlist.items.some(item => item.id === productId);
    if (isInWishlist) {
      button.classList.add('active');  // Додаємо клас active, якщо товар у списку
    }

    // Додаємо обробник кліку
    button.addEventListener('click', function() {
      // Знаходимо батьківський елемент картки товару
      const productCard = this.closest('.product-card');
      if (!productCard) return;

      // Отримуємо дані про товар
      const productId = this.dataset.productId;
      const productTitle = productCard.querySelector('.product-card__name')?.textContent || 'Product';
      const productPrice = productCard.querySelector('.product-card__price')?.textContent || '';
      const productImage = productCard.querySelector('.product-card__image img')?.src || '';

      // Шукаємо індекс товару у списку бажань
      const existingIndex = state.wishlist.items.findIndex(item => item.id === productId);
      
      if (existingIndex === -1) {
        // Якщо товару немає у списку - додаємо його
        state.wishlist.items.push({
          id: productId,
          title: productTitle,
          price: productPrice,
          image: productImage
        });
        this.classList.add('active');  // Додаємо клас active
      } else {
        // Якщо товар вже є у списку - видаляємо його
        state.wishlist.items.splice(existingIndex, 1);
        this.classList.remove('active');  // Видаляємо клас active
      }

      // Зберігаємо зміни та оновлюємо лічильник
      state.wishlist.save();
      updateWishlistCounter();
    });
  });

  // Ініціалізуємо лічильник
  updateWishlistCounter();
}

// Функція для плавного скролу до секції
function scrollToSection(section) {
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Функція для оновлення стану кнопки Checkout
function updateCheckoutButton() {
  const checkoutButton = document.querySelector('.header__actions .button');
  // Перевіряємо, чи всі товари вибрані
  const allSelected = Object.values(state.selectedProducts).every(item => item.selected);

  // Оновлюємо стан кнопки
  checkoutButton.disabled = !allSelected;
  checkoutButton.classList.toggle('button--primary', allSelected);
  checkoutButton.classList.toggle('button--secondary', !allSelected);

  // Оновлюємо лічильник вибраних товарів
  const selectedCount = Object.values(state.selectedProducts).filter(item => item.selected).length;
  document.querySelector('.header__status').textContent = `${selectedCount} OF 3 PRODUCTS SELECTED`;
}

// Обробник кнопки START
document.querySelector('.hero .button').addEventListener('click', () => {
  const firstStep = document.querySelector('.builder-steps section:first-child');
  if (firstStep) scrollToSection(firstStep);  // Скролимо до першої секції
});

// Обробники вибору товарів
document.querySelectorAll('.products .button').forEach(button => {
  button.addEventListener('click', function() {
    const section = this.closest('section');
    // Визначаємо тип товару за підзаголовком
    const productType = section.querySelector('.products__subtitle').textContent.toLowerCase().includes('snowboard') 
      ? 'snowboard' 
      : section.querySelector('.products__subtitle').textContent.toLowerCase().includes('jacket') 
        ? 'jacket' 
        : 'helmet';

    // Скидаємо всі кнопки в поточній секції
    section.querySelectorAll('.button').forEach(btn => {
      btn.classList.remove('button--primary');
      btn.classList.add('button--secondary');
      btn.textContent = 'SELECT';
      btn.disabled = false;
      btn.setAttribute('aria-pressed', 'false');
    });

    // Встановлюємо стан для поточної кнопки
    this.classList.remove('button--secondary');
    this.classList.add('button--primary');
    this.textContent = 'SELECTED';
    this.setAttribute('aria-pressed', 'true');
    this.disabled = true;

    // Оновлюємо глобальний стан
    state.selectedProducts[productType] = {
      selected: true,
      variantId: this.dataset.variantId,
    };

    // Відключаємо інші кнопки в секції
    section.querySelectorAll('.button').forEach(btn => {
      if (btn !== this) btn.disabled = true;
    });

    updateCheckoutButton();  // Оновлюємо кнопку Checkout

    // Скролимо до наступної секції через 500 мс
    setTimeout(() => {
      const nextSection = section.nextElementSibling;
      if (nextSection) scrollToSection(nextSection);
    }, 500);
  });
});

// Обробник кнопки Checkout
document.querySelector('.header__actions .button').addEventListener('click', async () => {
  // Формуємо масив товарів для кошика
  const items = Object.values(state.selectedProducts)
    .filter(item => item.selected)
    .map(item => ({ id: item.variantId, quantity: 1 }));

  try {
    // Відправляємо запит на додавання до кошика
    const response = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    // Перенаправляємо на сторінку оформлення замовлення
    window.location.href = '/checkout';
  } catch (error) {
    alert('Error adding to cart. Please try again.');  // Обробка помилки
  }
});

// Ініціалізація при повному завантаженні DOM
document.addEventListener('DOMContentLoaded', function() {
  initWishlist();  // Ініціалізуємо список бажань
  
  // Встановлюємо стан кнопок "Додати до списку бажань"
  document.querySelectorAll('.wishlist-button').forEach(button => {
    const productId = button.dataset.productId;
    if (state.wishlist.items.some(item => item.id === productId)) {
      button.classList.add('active');
    }
  });
});