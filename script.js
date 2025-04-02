let budget = 0;
let spent = 0;
let taskCount = 0;
let expenses = [];

// Load data when the page is opened
document.addEventListener("DOMContentLoaded", () => {
    loadData();

    document.getElementById("budget").addEventListener("keypress", (event) => {
        if (event.key === "Enter") setBudget();
    });

    document.getElementById("task").addEventListener("keypress", handleKeyPress);
    document.getElementById("expense").addEventListener("keypress", handleKeyPress);
    document.getElementById("clearBtn").addEventListener("click", clearAll);
});

function handleKeyPress(event) {
    if (event.key === "Enter") addExpense();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem("budget", budget);
    localStorage.setItem("spent", spent);
    localStorage.setItem("taskCount", taskCount);
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

// Load data from localStorage
function loadData() {
    budget = parseFloat(localStorage.getItem("budget")) || 0;
    spent = parseFloat(localStorage.getItem("spent")) || 0;
    taskCount = parseInt(localStorage.getItem("taskCount")) || 0;
    expenses = JSON.parse(localStorage.getItem("expenses")) || [];

    document.getElementById("budget").value = budget || "";
    document.getElementById("taskCount").textContent = taskCount;
    
    updateUI();
    renderExpenses();
}

// Set budget
function setBudget() {
    let newBudget = parseFloat(document.getElementById('budget').value) || 0;

    // If the budget is already set and tasks exist, prevent resetting
    if (budget > 0 && expenses.length > 0) {
        alert("Budget is already set and cannot be changed after adding tasks!");
        document.getElementById('budget').value = budget; // Reset input to old budget
        return;
    }

    // Allow budget to be set if no tasks exist
    budget = newBudget;
    
    if (budget <= 0) {
        alert("Please enter a valid budget!");
        return;
    }

    saveData();
    updateUI();
}


// Add expense
function addExpense() {
    let taskInput = document.getElementById('task');
    let expenseInput = document.getElementById('expense');
    let task = taskInput.value.trim();
    let expense = parseFloat(expenseInput.value);

    if (task === "" || isNaN(expense) || expense <= 0) {
        alert("Please enter a valid task name and amount!");
        return;
    }

    spent += expense;
    taskCount++;

    // Add new expense with timestamp
    expenses.push({ task, expense, date: new Date().toISOString() });

    saveData();
    updateUI();
    renderExpenses();

    // Clear input fields
    taskInput.value = "";
    expenseInput.value = "";
    taskInput.focus();
}

// Update UI
function updateUI() {
    let remaining = budget - spent;
    document.getElementById('remaining').textContent = `₹${remaining.toFixed(2)}`;
    
    let percentSpent = budget > 0 ? (spent / budget) * 100 : 0;
    document.getElementById('progressBar').style.width = percentSpent + '%';
    
    document.getElementById('taskCount').textContent = taskCount;
}

// Render expense list with sorting options
function renderExpenses(sortBy = "date") {
    let expenseList = document.getElementById('expenseList');
    expenseList.innerHTML = ""; // Clear before re-rendering

    // Sort based on selected parameter
    expenses.sort((a, b) => {
        if (sortBy === "amount") return a.expense - b.expense;
        if (sortBy === "task") return a.task.localeCompare(b.task);
        return new Date(a.date) - new Date(b.date);
    });

    let table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th onclick="renderExpenses('task')">Task</th>
                <th onclick="renderExpenses('amount')">Amount</th>
                <th onclick="renderExpenses('date')">Date</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            ${expenses.map((entry, index) => `
                <tr>
                    <td>${entry.task}</td>
                    <td>₹${entry.expense.toFixed(2)}</td>
                    <td>${new Date(entry.date).toLocaleDateString()}</td>
                    <td>
                        <button class="delete-btn" onclick="deleteExpense(${index})">Delete</button>
                    </td>
                </tr>
            `).join("")}
        </tbody>
    `;

    expenseList.appendChild(table);
}

// Delete an expense with confirmation
function deleteExpense(index) {
    if (confirm("Are you sure you want to delete this expense?")) {
        spent -= expenses[index].expense;
        taskCount--;

        expenses.splice(index, 1); // Remove expense from array

        saveData();
        updateUI();
        renderExpenses();
    }
}

// Clear all data
function clearAll() {
    if (confirm("Are you sure you want to reset everything?")) {
        budget = 0;
        spent = 0;
        taskCount = 0;
        expenses = [];
        
        document.getElementById('budget').value = '';
        document.getElementById('task').value = '';
        document.getElementById('expense').value = '';
        document.getElementById('expenseList').innerHTML = '';
        document.getElementById('taskCount').textContent = taskCount;

        localStorage.clear();
        updateUI();
    }
}
document.getElementById("downloadBtn").addEventListener("click", downloadPDF);

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Expense Report", 20, 20);
    
    let y = 40; // Initial Y position

    doc.setFontSize(12);
    doc.text(`Budget: ₹${budget.toFixed(2)}`, 20, y);
    y += 10;
    doc.text(`Total Spent: ₹${spent.toFixed(2)}`, 20, y);
    y += 10;
    doc.text(`Remaining: ₹${(budget - spent).toFixed(2)}`, 20, y);
    y += 20;

    // Table Header
    doc.setFont("helvetica", "bold");
    doc.text("Task", 20, y);
    doc.text("Amount", 90, y);
    doc.text("Date", 140, y);
    y += 10;
    doc.setFont("helvetica", "normal");

    // Add Expenses to PDF
    expenses.forEach((entry) => {
        doc.text(entry.task, 20, y);
        doc.text(`₹${entry.expense.toFixed(2)}`, 90, y);
        doc.text(new Date(entry.date).toLocaleDateString(), 140, y);
        y += 10;
    });

    // Save the PDF
    doc.save("Expense_Report.pdf");
}
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("refreshPageBtn").addEventListener("click", resetPage);
});

function resetPage() {
    if (confirm("Are you sure you want to refresh everything? This will erase all data!")) {
        localStorage.clear(); // Clear all saved data
        location.reload(); // Refresh the page
    }
}
