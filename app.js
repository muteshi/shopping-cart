//variables
// https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

//array for holding items
let cart = [];
//buttons
let buttonsDOM = [];

//class for getting products
class Products {
  async getProducts() {
    try {
      let result = await fetch("/products.json");
      let data = await result.json();

      let products = data.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });

      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

//class for displaying products-UI
class UserInterface {
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      result += `
        <!--Single product-->
          <article class="product">
            <div class="img-container">
              <img
                src=${product.image}
                alt="product"
                class="product-img"
              />
              <button class="bag-btn" data-id=${product.id}>
                <i class="fas fa-shopping-cart"></i>
                add to cart
              </button>
            </div>
            <h3>${product.title}</h3>
            <h4>$${product.price}</h4>
          </article>
          <!--End of Single product-->
        `;
    });
    productsDOM.innerHTML = result;
  }

  //get bag buttons
  getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let btnId = button.dataset.id;
      let itemInCart = cart.find((item) => item.id === btnId);
      if (itemInCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }
      button.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        //get product from products
        let cartItem = ProductsStorage.getProduct(btnId);
        cartItem = { ...cartItem, amount: 1 };

        //add product to the cart
        cart = [...cart, cartItem];

        //save cart to the local storage
        ProductsStorage.saveCart(cart);
        //set cart values
        this.setCartValues(cart);
        //display cart item
        this.addCartItem(cartItem);
        //show the cart
        this.showCart();
      });
    });
  }
  //set cart values
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }

  //add cart item
  addCartItem(item) {
    const itemDIV = document.createElement("div");
    itemDIV.classList.add("cart-item");
    itemDIV.innerHTML = `
    <!--Cart item-->
<img src=${item.image} alt="product" />
            <div>
              <h4>${item.title}</h4>
              <h5>$${item.price}</h5>
              <span class="remove-item"><i class="fas fa-trash" data-id=${item.id}></i></span>
            </div>
            <div>
              <i class="fas fa-chevron-up" data-id=${item.id}></i>
              <p class="item-amount">${item.amount}</p>
              <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>
            <!--end of Cart item-->
`;
    //append cart item to cart content
    cartContent.appendChild(itemDIV);
  }
  //show cart method
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  //setup the application
  setupAPP() {
    cart = ProductsStorage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }
  //populate cart
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
  //hide cart
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  //cart logic
  cartLogic() {
    //clear cart button
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    // cart functionality
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("fa-trash")) {
        let removedItem = event.target;
        let itemId = removedItem.dataset.id;
        cartContent.removeChild(
          removedItem.parentElement.parentElement.parentElement
        );
        this.removeCartItem(itemId);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let addItemId = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === addItemId);
        tempItem.amount = tempItem.amount + 1;
        ProductsStorage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let subtractAmount = event.target;
        let subtractItemId = subtractAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === subtractItemId);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          ProductsStorage.saveCart(cart);
          this.setCartValues(cart);
          subtractAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(subtractAmount.parentElement.parentElement);
          this.removeCartItem(subtractItemId);
        }
      }
    });
  }

  //clear cart
  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeCartItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  //remove cart item
  removeCartItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    ProductsStorage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `
    <i class="fas fa-shopping-cart"></i>add to cart
    `;
  }
  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

//class for local storage
class ProductsStorage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

//event listener for DOM loading
document.addEventListener("DOMContentLoaded", () => {
  const userInterface = new UserInterface();
  const products = new Products();

  //setup the app
  userInterface.setupAPP();

  //get all products
  products
    .getProducts()
    .then((products) => {
      userInterface.displayProducts(products);
      ProductsStorage.saveProducts(products);
    })
    .then(() => {
      userInterface.getBagButtons();
      userInterface.cartLogic();
    });
});
