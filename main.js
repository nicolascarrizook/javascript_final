//Variables

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDom = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDom = document.querySelector('.products-center');
//Creamos un carrito vacio

let cart = [];
//Botones 

let buttonsDom = [];

// Obtenemos los productos de un archivo JSON
class Products {
    async getProducts(){
        try {
            let res = await fetch('product.json');
            let data = await res.json();
            let products = data.items;
            products = products.map( item => {
                const {title, price} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title, price, id, image}
            })
            return products
        } catch (error) {
            console.log(error);
        }
    }   
}

// Mostramos los productos

class UI{
    displayProducts(products){
        let result = '';
        products.forEach(product => {
            result += `
                <!--Single products-->
                <article class="products">
                    <div class="img-container">
                        <img src=${product.image} alt="producto" class="product-img">
                        <button class="bag-btn" data-id=${product.id}>
                            <i class="fas fa-shopping-cart"></i>
                            Agregar
                        </button>
                    </div>
                    <h3>${product.title}</h3>
                    <h4>${product.price}</h4>
                </article>
                <!--Fin single products-->
            `;
        });
        productsDom.innerHTML = result;
    }
    getBagButtons(){
        const buttons = [...document.querySelectorAll('.bag-btn')];
        buttonsDom = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if(inCart){
                button.innerText = "En carrito";  
                button.disabled = true;
            } 
            button.addEventListener('click', event => {
                event.target.innerText = "En carrito";
                event.target.disabled = true;
                //Obtener producto de productos
                let cartItem = {...Storage.getProduct(id),
                amount:1};
                //Agregar producto al carrito
                cart = [...cart, cartItem];
                //Guardar carrito en local storage
                Storage.saveCart(cart);
                //Setear valores del carrito
                this.setCartValues(cart);
                // Visualizar items del carrito
                this.addCartItem(cartItem);
                // Mostrar carrito
                this.showCart();
            });
        });
    }
    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }
    addCartItem(item){
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
            <img src=${item.image} alt="producto">
            <div>
                <h4>${item.title}</h4>
                <h5>${item.price}</h5>
                <span class="remove-item" data-id=${item.id}>Eliminar</span>
            </div>
            <div>
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
                <p class="item-amount">${item.amount}</p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>
        `
        cartContent.appendChild(div);
    }
    showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDom.classList.add('showCart');
    }
    setupAPP(){
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
    }
    populateCart(cart){
        cart.forEach(item => this.addCartItem(item));
    }
    hideCart(){
        cartOverlay.classList.remove('transparentBcg');
        cartDom.classList.remove('showCart');
    }
    cartLogic(){
        //Boton de limpiar carrito
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        });
        //Funcionalidad del carrito
    }
    clearCart(){
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
    }
    removeItem(id){
        cart = cart.filter(item => item.id !== id); 
        this.setCartValues(cart);
        Storage.saveCart(cart);
    }
}

// Local Storage
class Storage{
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'))
        return products.find(product => product.id === id)
    }
    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart))
    }
    static getCart(){
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')):[]
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    const products = new Products();
    // Setup App
    ui.setupAPP();

    // Obteniendo todos los productos
    products.getProducts().then( products => {
        ui.displayProducts(products)
        Storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });
});
