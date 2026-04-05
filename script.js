let cart = [];
let total = 0;

/* ADD TO CART */
function addToCart(name, price) {
    cart.push({ name, price });
    total += price;
    updateCart();
}

/* UPDATE CART UI */
function updateCart() {
    const cartItems = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");
    const totalDisplay = document.getElementById("total");

    cartItems.innerHTML = "";

    cart.forEach((item, index) => {
        let li = document.createElement("li");
        li.textContent = `${item.name} - €${item.price.toFixed(2)}`;

        let removeBtn = document.createElement("button");
        removeBtn.textContent = "❌";
        removeBtn.style.marginLeft = "10px";
        removeBtn.onclick = () => removeItem(index);

        li.appendChild(removeBtn);
        cartItems.appendChild(li);
    });

    cartCount.textContent = cart.length;
    totalDisplay.textContent = total.toFixed(2);
}

/* REMOVE ITEM */
function removeItem(index) {
    total -= cart[index].price;
    cart.splice(index, 1);
    updateCart();
}

/* TOAST NOTIFICATION */
function showToast() {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

/* FORM SUBMIT */
const form = document.getElementById("checkout-form");

form.addEventListener("submit", function(e) {
    e.preventDefault();

    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    // Get form values (FIXED IDs)
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const discord = document.getElementById("discord").value;
    const phone = document.getElementById("phone").value;
    const notes = document.getElementById("notes").value;

    // Get existing orders
    let orders = JSON.parse(localStorage.getItem("orders")) || [];

    // Save each cart item as an order
    cart.forEach(item => {
        orders.push({
            product: item.name,
            price: item.price,
            name: name,
            email: email,
            discord: discord,
            phone: phone,
            notes: notes,
            status: "Pending"
        });
    });

    localStorage.setItem("orders", JSON.stringify(orders));

    // Show clean notification
    showToast();

    // Reset cart + form
    cart = [];
    total = 0;
    updateCart();
    form.reset();
});