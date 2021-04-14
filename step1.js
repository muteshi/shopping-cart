//variables
// https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const clearDOM = document.querySelector(".cart");
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

  getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttons.forEach((button) => {
      let btnId = button.dataset.id;
      let itemInCart = cart.find((item) => item.id === btnId);
      if (itemInCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }
      button.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        event.target.disabled = True;
        //get product from products arrays
        //add product to the cart
        //save cart to the local storage
        //set cart values
        //display cart item
        //show the cart
      });
    });
  }
}

//class for local storage
class ProductsStorage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
}

//event listener for DOM loading
document.addEventListener("DOMContentLoaded", () => {
  const userInterface = new UserInterface();
  const products = new Products();

  //get all products
  //console log first
  products
    .getProducts()
    .then((products) => {
      userInterface.displayProducts(products);
      ProductsStorage.saveProducts(products);
    })
    .then(() => {
      userInterface.getBagButtons();
    });
});
