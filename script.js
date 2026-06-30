let editingId = null;
let bonds =[
    {id:1, name:"Govt Bond 2030", faceValue: 1000, couponRate: 7.5, yearsToMaturity:5, marketRate:8},
    {id:2, name:"GOI 2033", faceValue: 1000, couponRate: 7.18, yearsToMaturity:2, marketRate:5},
    {id:3, name:"Sovereign Gold Bond 2028", faceValue: 1500, couponRate: 7.00, yearsToMaturity:4, marketRate:6},
    {id:4, name:"NHAI Bond 2029", faceValue: 1200, couponRate: 6.18, yearsToMaturity:4, marketRate:7},
    {id:5, name:"REC Limited Bond 2031", faceValue: 1000, couponRate: 8.00, yearsToMaturity:5, marketRate:8},
    {id:6, name:"HDFC Bank Bond 2027", faceValue: 1600, couponRate: 8.18, yearsToMaturity:6, marketRate:8},
    {id:7, name:"Power Finance Corp Bond 2026", faceValue: 1200, couponRate: 7.18, yearsToMaturity:2, marketRate:5},
    {id:8, name:"IRFC Bond 2032", faceValue: 1000, couponRate: 7.00, yearsToMaturity:1, marketRate:4},
    {id:9, name:"Tata Capital Bond 2028", faceValue: 1500, couponRate: 8.00, yearsToMaturity:6, marketRate:8},
    {id:10, name:"Reliance Industries Bond 2030", faceValue: 1200, couponRate: 8.18, yearsToMaturity:7, marketRate:9},
    {id:11, name:"Bajaj Finance Bond 2025", faceValue: 1000, couponRate: 7.18, yearsToMaturity:5, marketRate:8}
];

function renderBonds(list = bonds) {
    const html = list.map(function(bond) {
        return `
        <tr>
        <td>${bond.name}</td>
        <td>₹${bond.faceValue}</td>
        <td>${bond.couponRate}%</td>
        <td>${bond.yearsToMaturity} yrs</td>
        <td>${bond.marketRate}%</td>
        <td>
          <button class="btn-edit" onclick="editBond(${bond.id})">Edit</button>
          <button class="btn-delete" onclick="deleteBond(${bond.id})">Delete</button>
        </td>
      </tr>
        `;
    }).join("");

    document.getElementById("bondTableBody").innerHTML = html;
  document.getElementById("bondTableBodyDashboard").innerHTML = html;
}

function sortBonds(field) {
    bonds.sort(function(a, b) {
        return a[field] - b[field];
    });
    renderBonds();
}

function searchBonds() {
    const searchText = document.getElementById("searchInput").value.toLowerCase();
    const filteredBonds = bonds.filter(function(bond) {
        return bond.name.toLowerCase().includes(searchText);
    });
    renderBonds(filteredBonds);
}

function deleteBond(id) {
    bonds = bonds.filter(function(bond) {
        return bond.id !== id;
    });
    renderBonds();
    updateSummary();
    saveBonds();
}

function editBond(id) {
    const bond = bonds.find(function(b) {
        return b.id === id;
    });

    document.getElementById("nameInput").value = bond.name;
    document.getElementById("faceValueInput").value = bond.faceValue;
    document.getElementById("couponRateInput").value = bond.couponRate;
    document.getElementById("yearsInput").value = bond.yearsToMaturity;
    document.getElementById("marketRateInput").value = bond.marketRate;

    editingId = id;
    showView('allBondsView', document.querySelectorAll('.nav-link')[1]);
}

function addBond() {
    const name = document.getElementById("nameInput").value;
    const faceValue = Number(document.getElementById("faceValueInput").value);
    const couponRate = Number(document.getElementById("couponRateInput").value);
    const yearsToMaturity = Number(document.getElementById("yearsInput").value);
    const marketRate = Number(document.getElementById("marketRateInput").value);

    if (editingId === null) {
        const newBond = {
            id: Date.now(),
            name: name,
            faceValue: faceValue,
            couponRate: couponRate,
            yearsToMaturity: yearsToMaturity,
            marketRate: marketRate
        };
        bonds.push(newBond);
    } else {
        const bond = bonds.find(function(b) {
            return b.id === editingId;
        });
        bond.name = name;
        bond.faceValue = faceValue;
        bond.couponRate = couponRate;
        bond.yearsToMaturity = yearsToMaturity;
        bond.marketRate = marketRate;
        editingId = null;
    }

    document.getElementById("nameInput").value = "";
    document.getElementById("faceValueInput").value = "";
    document.getElementById("couponRateInput").value = "";
    document.getElementById("yearsInput").value = "";
    document.getElementById("marketRateInput").value = "";

    renderBonds();
    updateSummary();
    saveBonds();
}

function updateSummary() {
    const totalBonds = bonds.length;
    let totalValue = 0;
    let totalCoupon = 0;

    bonds.forEach(function(bond) {
        totalValue += bond.faceValue;
        totalCoupon += (bond.faceValue * bond.couponRate) / 100;
    });

    document.getElementById("totalBonds").textContent = totalBonds;
    document.getElementById("totalValue").textContent = totalValue;
    document.getElementById("totalCoupon").textContent = totalCoupon.toFixed(2);

    document.getElementById("miniTotalBonds").textContent = totalBonds;
    document.getElementById("miniTotalValue").textContent = totalValue;

    document.getElementById("analyticsTotalBonds").textContent = totalBonds;
    document.getElementById("analyticsTotalValue").textContent = totalValue;
    document.getElementById("analyticsTotalCoupon").textContent = totalCoupon.toFixed(2);
}

function saveBonds() {
    localStorage.setItem("bonds", JSON.stringify(bonds));
}

function loadBonds() {
    const saved = localStorage.getItem("bonds");
    if (saved) {
        bonds = JSON.parse(saved);
    }
}

function showView(viewId, clickedLink) {
    document.querySelectorAll(".view").forEach(function(view) {
        view.style.display = "none";
    });
    document.getElementById(viewId).style.display = "block";

    document.querySelectorAll(".nav-link").forEach(function(link) {
        link.classList.remove("active");
    });
    clickedLink.classList.add("active");
}

let allocationChartInstance = null;
let couponChartInstance = null;

function renderCharts() {
  const labels = bonds.map(function(bond) { return bond.name; });
  const values = bonds.map(function(bond) { return bond.faceValue; });
  const couponRates = bonds.map(function(bond) { return bond.couponRate; });

  const allocationCtx = document.getElementById("allocationChart");
  if (allocationChartInstance) {
    allocationChartInstance.destroy();
  }
  allocationChartInstance = new Chart(allocationCtx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: [
          "#2563eb", "#16a34a", "#f97316", "#dc2626", "#9333ea",
          "#0891b2", "#ca8a04", "#db2777", "#4f46e5", "#059669", "#ea580c"
        ]
      }]
    },
    options: {
      responsive: true
    }
  });

  const couponCtx = document.getElementById("couponChart");
  if (couponChartInstance) {
    couponChartInstance.destroy();
  }
  couponChartInstance = new Chart(couponCtx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Coupon Rate (%)",
        data: couponRates,
        backgroundColor: "#2563eb"
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

renderCharts();
loadBonds();
renderBonds();
updateSummary();