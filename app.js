'use strict';
const cartBtn = document.querySelector('.nav-cart-icon');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-btn');
const cartDom = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItemsCount = document.querySelector('.cart-items-count');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDom = document.querySelector('.products-center');

// cart
let cart = [];
let btnsDOM = [];
// getting the products

class Products {
  async getProducts() {
    try {
      let result = await fetch('products.json');
      let data = await result.json();
      let products = data.items;
      products = products.map((product) => {
        const { title, price } = product.fields;
        const { id } = product.sys;
        const image = product.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}
// display products
class UI {
  displayProducts(products) {
    let result = '';
    products.forEach((product) => {
      result += `
      <!-- single product -->
      <div class="product">
      <div class="img-container">
        <img class="product-img" src=${product.image} alt="product" />
        <button class="cart-btn btn" data-id=${product.id}>
          <i class="fas fa-shopping-cart"></i>
          add to cart
        </button>
      </div>
      <h3>${product.title}</h3>
      <h4>$${product.price}</h4>
    </div>
    <!-- end of single product  -->
    `;
    });
    productsDom.innerHTML += result;
  }
  getCartBtns() {
    const buttons = [...document.querySelectorAll('.cart-btn')];
    btnsDOM = buttons;
    buttons.forEach((btn) => {
      let id = btn.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        btn.innerText = 'In Cart';
        btn.disabled = true;
      }
      btn.addEventListener('click', () => {
        btn.innerText = 'In Cart';
        btn.disabled = true;
        // get product from products
        let cartItem = { ...new Storage().getProduct(id), amount: 1 };
        // add product to the cart
        cart = [...cart, cartItem];
        // save cart to the local storage
        new Storage().saveCart(cart);
        // set cart values
        this.setCartValues(cart);
        // display cart item
        this.addCartItem(cartItem);
        // show the cart
        // this.showCart();
      });
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsCount = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsCount += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItemsCount.innerText = itemsCount;
  }
  addCartItem(item) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `<img src=${item.image} alt="product" />
    <div>
      <h4>${item.title}</h4>
      <h5>$${item.price}</h5>
      <span class="remove-item" data-id=${item.id}>remove</span>
    </div>

    <div>
      <i class="fas fa-chevron-up" data-id=${item.id}></i>
      <p class="item-amount">${item.amount}</p>
      <i class="fas fa-chevron-down" data-id=${item.id}></i>
    </div>`;
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.style.visibility = 'visible';
    cartDom.style.transform = 'translate(0%)';
  }
  hideCart() {
    cartDom.style.transform = 'translate(100%)';
    cartOverlay.style.visibility = 'hidden';
  }

  setupApp() {
    cart = new Storage().getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
  }
  populateCart(cart) {
    cart.forEach((item) => {
      this.addCartItem(item);
    });
  }

  cartLogic() {
    clearCartBtn.addEventListener('click', () => {
      this.clearCart();
    });

    // cart functionality
    cartContent.addEventListener('click', (event) => {
      let target = event.target;
      if (target.closest('.remove-item')) {
        this.removeItem(target.dataset.id);
      } else if (target.closest('.fa-chevron-up')) {
        this.increaseCartAmount(target);
      } else if (target.closest('.fa-chevron-down')) {
        this.decreaseCartAmount(target);
      } else return;
    });
  }
  increaseCartAmount(target) {
    let itemAmountDisplay = target.nextElementSibling;
    let id = target.dataset.id;
    let tempItem = cart.find((item) => {
      return item.id == id;
    });
    tempItem.amount = tempItem.amount + 1;
    itemAmountDisplay.innerText = tempItem.amount;
    new Storage().saveCart(cart);
    this.setCartValues(cart);
  }
  decreaseCartAmount(target) {
    let itemAmountDisplay = target.previousElementSibling;
    let id = target.dataset.id;
    let tempItem = cart.find((item) => {
      return item.id == id;
    });
    if (tempItem.amount <= 1) {
      this.removeItem(id);
    } else {
      tempItem.amount = tempItem.amount - 1;
      itemAmountDisplay.innerText = tempItem.amount;
      new Storage().saveCart(cart);
      this.setCartValues(cart);
    }
  }
  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    cartContent.innerHTML = ' ';
    this.hideCart();
  }
  removeItem(id) {
    cart = JSON.parse(localStorage.getItem('cart')).filter((item) => {
      return item.id !== id;
    });
    this.setCartValues(cart);
    new Storage().saveCart(cart);
    let button = this.getSingleButton(id);
    button.innerText = 'add to cart';
    button.disabled = false;
    let cartItemContainer = document
      .querySelector(`span[data-id="${id}"]`)
      .closest('.cart-item');
    cartItemContainer.remove();
    if (cart.length <= 0) {
      this.hideCart();
    }
  }

  getSingleButton(id) {
    return btnsDOM.find((button) => button.dataset.id === id);
  }
}
// local storage
class Storage {
  saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }
  getProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find((product) => {
      return product.id === id;
    });
  }
  saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  getCart() {
    return localStorage.getItem('cart')
      ? JSON.parse(localStorage.getItem('cart'))
      : [];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const ui = new UI();
  ui.setupApp();
  const products = new Products();
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      new Storage().saveProducts(products);
    })
    .then(() => {
      ui.getCartBtns();
      ui.cartLogic();
    });
});

cartBtn.addEventListener('click', () => {
  new UI().showCart();
});

closeCartBtn.addEventListener('click', () => {
  new UI().hideCart();
});
