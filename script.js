// PERSONAL FINANCE MANAGER

function isValidTransaction(transaction) {
    if (!transaction || typeof transaction !== "object") {
        return false;
    }

    const amount = Number(transaction.amount);
    const description = String(transaction.description || "").trim();
    const date = String(transaction.date || "").trim();

    return (
        (transaction.type === "income" || transaction.type === "expense") &&
        description.length > 0 &&
        Number.isFinite(amount) &&
        amount > 0 &&
        date.length > 0
    );
}

let transactions = [];

try {
    const storedTransactions = JSON.parse(
        localStorage.getItem("transactions") || "[]"
    );

    transactions = Array.isArray(storedTransactions)
        ? storedTransactions.filter(isValidTransaction)
        : [];
} catch (error) {
    transactions = [];
    localStorage.setItem("transactions", JSON.stringify([]));
}

// Currency formatter
function formatMoney(amount) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(amount);
}

// Update dashboard
function updateDashboard() {
    let income = 0;
    let expenses = 0;

    transactions.forEach((transaction) => {
        const amount = Number(transaction.amount);

        if (!Number.isFinite(amount) || amount <= 0) {
            return;
        }

        if (transaction.type === "income") {
            income += amount;
        } else if (transaction.type === "expense") {
            expenses += amount;
        }
    });

    const balance = income - expenses;
    const savingsRate = income > 0
        ? (balance / income) * 100
        : 0;

    const balanceElement = document.getElementById("balance");
    const incomeElement = document.getElementById("income");
    const expensesElement = document.getElementById("expenses");
    const savingsRateElement = document.getElementById("savingsRate");

    if (balanceElement) {
        balanceElement.textContent = formatMoney(balance);
    }

    if (incomeElement) {
        incomeElement.textContent = formatMoney(income);
    }

    if (expensesElement) {
        expensesElement.textContent = formatMoney(expenses);
    }

    if (savingsRateElement) {
        savingsRateElement.textContent = savingsRate.toFixed(2) + "%";
    }

    displayTransactions();
}

// Display transaction history
function displayTransactions() {
    const list = document.getElementById("transactionList");

    if (!list) {
        return;
    }

    list.innerHTML = "";

    if (transactions.length === 0) {
        list.innerHTML = "<p>No transactions yet.</p>";
        return;
    }

    transactions.forEach((transaction) => {
        const item = document.createElement("div");

        const description = document.createElement("span");
        description.textContent = transaction.description;

        const amount = document.createElement("span");
        amount.textContent =
            (transaction.type === "income" ? "+" : "-") +
            formatMoney(Number(transaction.amount));

        const date = document.createElement("small");
        date.textContent = transaction.date;

        item.append(description, amount, date);
        list.appendChild(item);
    });
}

// Add new transaction
document.getElementById("transactionForm")?.addEventListener("submit", function(event) {
    event.preventDefault();

    const type = document.getElementById("type").value;
    const description = document.getElementById("description").value.trim();
    const amount = Number(document.getElementById("amount").value);
    const date = document.getElementById("date").value;

    if (!description || !Number.isFinite(amount) || amount <= 0 || !date) {
        alert("Please enter valid transaction details.");
        return;
    }

    const transaction = {
        type,
        description,
        amount,
        date
    };

    if (transaction.type !== "income" && transaction.type !== "expense") {
        alert("Please select a valid transaction type.");
        return;
    }

    transactions.push(transaction);

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

    this.reset();
    updateDashboard();
    alert("Transaction added successfully!");
});

// Load saved information
updateDashboard();