console.log("Script loaded");
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB3tDV5M2lPzv1p0sBKaCHLf9886YcUMYU",
  authDomain: "webshop-82a87.firebaseapp.com",
  projectId: "webshop-82a87"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let cart = [];

window.addToCart = (name, price) => {
  cart.push({ name, price });
  updateCartUI();
};

window.removeItem = (index) => {
  cart.splice(index, 1);
  updateCartUI();
};

function updateCartUI() {
  const listEl = document.getElementById("cart-items");
  const totalEl = document.getElementById("total");
  const countEl = document.getElementById("cart-count");

  listEl.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.name} (€${item.price.toFixed(2)})
      <button onclick="removeItem(${index})">x</button>
    `;
    listEl.appendChild(li);
  });

  totalEl.textContent = total.toFixed(2);
  countEl.textContent = cart.length;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

document.getElementById("checkout-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const discord = document.getElementById("discord").value;
  const phone = document.getElementById("phone").value;
  const notes = document.getElementById("notes").value;
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  try {
    await addDoc(collection(db, "orders"), {
      name,
      email,
      discord,
      phone,
      notes,
      products: cart.map(i => i.name).join(", "),
      totalPrice: total,
      status: "Pending",
      createdAt: new Date()
    });

    cart = [];
    updateCartUI();
    document.getElementById("checkout-form").reset();
    showToast("✅ Order placed!");
  } catch (err) {
    alert("Error placing order: " + err.message);
  }
});
