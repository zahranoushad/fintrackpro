// DOM elements
const loginPage = document.getElementById("login-page");
const dashboard = document.getElementById("dashboard");
const loginBtn = document.getElementById("login-btn");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const userNameDisplay = document.getElementById("user-name");
const navLinks = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page");
const addExpenseBtn = document.getElementById("add-expense-btn");
const expenseModal = document.getElementById("expense-modal");
const expenseForm = document.getElementById("expense-form");
const cancelBtn = document.getElementById("cancel-btn");
const transactionsBody = document.getElementById("transactions-body");
const logoutBtn = document.getElementById("logout-btn");
const deleteAccountBtn = document.getElementById("delete-account-btn");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Login
loginBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (username && password) {
    localStorage.setItem("user", username);
    userNameDisplay.textContent = username;
    loginPage.style.display = "none";
    dashboard.style.display = "flex";
    updateDashboard();
    loadTransactions();
    renderChart();
  } else {
    alert("Please enter username and password!");
  }
});

// Navigation
navLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    navLinks.forEach(l => l.classList.remove("active"));
    link.classList.add("active");
    const pageId = link.getAttribute("data-page");
    pages.forEach(p => p.classList.remove("active"));
    document.getElementById(pageId).classList.add("active");
  });
});

// Add Expense
addExpenseBtn.addEventListener("click", () => {
  expenseForm.reset();
  document.getElementById("expense-id").value = "";
  expenseModal.style.display = "flex";
});

// Cancel Modal
cancelBtn.addEventListener("click", () => {
  expenseModal.style.display = "none";
});

// Save Transaction
expenseForm.addEventListener("submit", e => {
  e.preventDefault();
  const id = document.getElementById("expense-id").value;
  const date = document.getElementById("expense-date").value;
  const desc = document.getElementById("expense-desc").value;
  const category = document.getElementById("expense-category").value;
  const amount = parseFloat(document.getElementById("expense-amount").value);

  if (id) {
    const index = transactions.findIndex(t => t.id == id);
    transactions[index] = { id: parseInt(id), date, desc, category, amount };
  } else {
    const newId = transactions.length ? transactions[transactions.length - 1].id + 1 : 1;
    transactions.push({ id: newId, date, desc, category, amount });
  }

  localStorage.setItem("transactions", JSON.stringify(transactions));
  expenseModal.style.display = "none";
  loadTransactions();
  updateDashboard();
  renderChart();
});

// Load Transactions
function loadTransactions() {
  transactionsBody.innerHTML = "";
  transactions.forEach(t => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${t.date}</td>
      <td>${t.desc}</td>
      <td>${t.category}</td>
      <td>₹${t.amount}</td>
      <td>
        <button onclick="editTransaction(${t.id})">✏️</button>
        <button onclick="deleteTransaction(${t.id})">🗑️</button>
      </td>`;
    transactionsBody.appendChild(row);
  });
}

// Edit Transaction
window.editTransaction = function(id) {
  const t = transactions.find(tr => tr.id === id);
  document.getElementById("expense-id").value = t.id;
  document.getElementById("expense-date").value = t.date;
  document.getElementById("expense-desc").value = t.desc;
  document.getElementById("expense-category").value = t.category;
  document.getElementById("expense-amount").value = t.amount;
  expenseModal.style.display = "flex";
};

// Delete Transaction
window.deleteTransaction = function(id) {
  if (confirm("Delete this transaction?")) {
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    loadTransactions();
    updateDashboard();
    renderChart();
  }
};

// Update Summary
function updateDashboard() {
  const income = transactions.filter(t => t.amount > 0).reduce((a, b) => a + b.amount, 0);
  const expense = transactions.filter(t => t.amount < 0).reduce((a, b) => a + b.amount, 0);
  document.getElementById("total-income").textContent = income;
  document.getElementById("total-expense").textContent = Math.abs(expense);
  document.getElementById("balance").textContent = income + expense;
}

// Logout
logoutBtn.addEventListener("click", () => {
  dashboard.style.display = "none";
  loginPage.style.display = "flex";
});

// Delete Account
deleteAccountBtn.addEventListener("click", () => {
  if (confirm("Delete your account and all data?")) {
    localStorage.clear();
    location.reload();
  }
});

// Chart
function renderChart() {
  const ctx = document.getElementById("categoryChart").getContext("2d");
  const categories = {};
  transactions.forEach(t => {
    categories[t.category] = (categories[t.category] || 0) + t.amount;
  });

  new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories),
        backgroundColor: ["#3f37c9", "#4cc9f0", "#f8961e", "#06d6a0", "#ef476f"]
      }]
    }
  });
}
