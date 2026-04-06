import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ====== FIREBASE CONFIG ======
const firebaseConfig = {
  apiKey: "AIzaSyB3tDV5M2lPzv1p0sBKaCHLf9886YcUMYU",
  authDomain: "webshop-82a87.firebaseapp.com",
  projectId: "webshop-82a87"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ====== CART LOGIC (INDEX.HTML) ======
let cart = [];

window.addToCart = (name, price) => {
  cart.push({ name, price });
  updateCart();
};

function updateCart() {
  const cartList = document.getElementById("cart-items");
  const totalEl = document.getElementById("total");
  const countEl = document.getElementById("cart-count");

  cartList.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;
    cartList.innerHTML += `
      <li>
        ${item.name} (€${item.price.toFixed(2)})
        <button onclick="removeItem(${index})">x</button>
      </li>`;
  });

  totalEl.textContent = total.toFixed(2);
  countEl.textContent = cart.length;
}

window.removeItem = (index) => {
  cart.splice(index, 1);
  updateCart();
};

// ====== CHECKOUT ======
const checkoutForm = document.getElementById("checkout-form");
if (checkoutForm) {
  checkoutForm.addEventListener("submit", async (e) => {
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
      updateCart();
      checkoutForm.reset();
      showToast("✅ Order placed!");
    } catch (error) {
      alert("Error placing order: " + error.message);
    }
  });
}

// ====== ADMIN LOGIC (ADMIN.HTML) ======
async function fetchOrders() {
  const ordersTable = document.getElementById("orders-table");
  const totalOrdersEl = document.getElementById("total-orders");
  const totalRevenueEl = document.getElementById("total-revenue");

  if (!ordersTable) return;

  const querySnapshot = await getDocs(collection(db, "orders"));
  let orders = [];
  let revenue = 0;

  querySnapshot.forEach(docSnap => {
    const order = { id: docSnap.id, ...docSnap.data() };
    orders.push(order);
    revenue += order.totalPrice || 0;
  });

  ordersTable.innerHTML = "";
  orders.forEach(order => {
    ordersTable.innerHTML += `
      <tr>
        <td>${order.name}</td>
        <td>${order.email}</td>
        <td>${order.discord}</td>
        <td>${order.phone || "-"}</td>
        <td>${order.notes || "-"}</td>
        <td>${order.products}</td>
        <td>€${(order.totalPrice || 0).toFixed(2)}</td>
        <td>
          <select onchange="updateStatus('${order.id}', this.value)">
            <option ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option ${order.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
        </td>
        <td><button onclick="deleteOrder('${order.id}')">✖️</button></td>
      </tr>
    `;
  });

  totalOrdersEl.textContent = orders.length;
  totalRevenueEl.textContent = revenue.toFixed(2);
}

window.updateStatus = async (id, status) => {
  await updateDoc(doc(db, "orders", id), { status });
  showToast("✅ Status updated!");
  fetchOrders();
};

window.deleteOrder = async (id) => {
  if (confirm("Are you sure you want to delete this order?")) {
    await deleteDoc(doc(db, "orders", id));
    showToast("✅ Order deleted!");
    fetchOrders();
  }
};

window.clearOrders = async () => {
  if (confirm("Are you sure you want to delete ALL orders?")) {
    const querySnapshot = await getDocs(collection(db, "orders"));
    for (const docSnap of querySnapshot.docs) {
      await deleteDoc(doc(db, "orders", docSnap.id));
    }
    showToast("✅ All orders cleared!");
    fetchOrders();
  }
};

fetchOrders();

// ====== TOAST MESSAGE ======
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}
