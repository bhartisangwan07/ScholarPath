// Sample scholarship rules for the classroom project.
const scholarships = [
  {
    "id": "merit",
    "title": "Academic Merit Scholarship",
    "amount": 60000,
    "minGpa": 8.0
  },
  {
    "id": "nest",
    "title": "LPUNEST Scholarship Route",
    "amount": 75000,
    "minGpa": 0,
    "requiredInterest": "LPUNEST"
  },
  {
    "id": "innovation",
    "title": "Innovation & Entrepreneurship",
    "amount": 40000,
    "minGpa": 6.0,
    "requiredInterest": "Innovation"
  },
  {
    "id": "service",
    "title": "Social Service Recognition",
    "amount": 25000,
    "minGpa": 6.0,
    "requiredInterest": "Social service"
  },
  {
    "id": "sports",
    "title": "Sports & Cultural Achievement",
    "amount": 50000,
    "minGpa": 6.0,
    "requiredInterest": "Sports & cultural"
  },
  {
    "id": "need",
    "title": "Need-Based Financial Aid",
    "amount": 45000,
    "minGpa": 6.0,
    "income": [
      "low"
    ]
  }
];

// Read saved data. Use empty lists when the project is first opened.
function loadData(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch (error) {
    return fallback;
  }
}

let profile = loadData("simple-lpu-profile", null);
let saved = loadData("simple-lpu-saved", []);
let applications = loadData("simple-lpu-applications", []);

function saveData() {
  try {
    localStorage.setItem("simple-lpu-profile", JSON.stringify(profile));
    localStorage.setItem("simple-lpu-saved", JSON.stringify(saved));
    localStorage.setItem("simple-lpu-applications", JSON.stringify(applications));
  } catch (error) {
    document.getElementById("message").textContent = "Browser storage is unavailable. Changes will last until you close the page.";
  }
}

function formatAmount(amount) {
  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  });
}

function isMatch(scholarship) {
  if (!profile || profile.cgpa < scholarship.minGpa) {
    return false;
  }
  if (scholarship.income && profile.income > 250000) {
    return false;
  }
  if (scholarship.requiredInterest && profile.interest !== scholarship.requiredInterest) {
    return false;
  }
  return true;
}

function showScholarships() {
  const container = document.getElementById("scholarships");
  const search = document.getElementById("search").value.toLowerCase();
  const filter = document.getElementById("filter").value;
  container.innerHTML = "";

  scholarships.forEach(function (scholarship) {
    if (!scholarship.title.toLowerCase().includes(search)) return;
    if (filter === "matches" && !isMatch(scholarship)) return;
    if (filter === "saved" && !saved.includes(scholarship.id)) return;

    const card = document.createElement("article");
    const savedAlready = saved.includes(scholarship.id);
    const appliedAlready = applications.some(function (item) {
      return item.id === scholarship.id;
    });

    card.innerHTML = `
      <h3>${scholarship.title}</h3>
      <p>Sample amount: ${formatAmount(scholarship.amount)}</p>
      <p>Minimum CGPA: ${scholarship.minGpa}</p>
      <p>${scholarship.income ? "Family income: up to ₹2,50,000" : "No income rule in this sample"}</p>
      <p>Category: ${scholarship.requiredInterest || "Academic merit"}</p>
      <p class="match">${!profile ? "Save your details to check" : isMatch(scholarship) ? "Matches your details" : "Does not match your details"}</p>
    `;

    const saveButton = document.createElement("button");
    saveButton.textContent = savedAlready ? "Unsave" : "Save";
    saveButton.addEventListener("click", function () {
      if (savedAlready) {
        saved = saved.filter(function (id) { return id !== scholarship.id; });
      } else {
        saved.push(scholarship.id);
      }
      saveData();
      showScholarships();
    });

    const applyButton = document.createElement("button");
    applyButton.textContent = appliedAlready ? "Added to tracker" : "Track application";
    applyButton.disabled = appliedAlready;
    applyButton.addEventListener("click", function () {
      applications.push({ id: scholarship.id, status: "Planning" });
      saveData();
      showScholarships();
      showApplications();
    });

    card.append(saveButton, applyButton);
    container.appendChild(card);
  });

  if (!container.children.length) {
    container.textContent = "No scholarships found. Try another search or filter.";
  }
}

function showApplications() {
  const container = document.getElementById("applications");
  container.innerHTML = "";

  applications.forEach(function (application) {
    const scholarship = scholarships.find(function (item) {
      return item.id === application.id;
    });
    if (!scholarship) return;

    const row = document.createElement("div");
    row.className = "application";
    const title = document.createElement("h3");
    title.textContent = scholarship.title;
    const label = document.createElement("label");
    label.textContent = "Status";
    label.htmlFor = "status-" + scholarship.id;
    const select = document.createElement("select");
    select.id = label.htmlFor;

    ["Planning", "In progress", "Submitted", "Awarded"].forEach(function (status) {
      const option = document.createElement("option");
      option.textContent = status;
      option.selected = status === application.status;
      select.appendChild(option);
    });

    select.addEventListener("change", function () {
      application.status = select.value;
      saveData();
    });

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", function () {
      applications = applications.filter(function (item) {
        return item.id !== application.id;
      });
      saveData();
      showApplications();
      showScholarships();
    });

    row.append(title, label, select, removeButton);
    container.appendChild(row);
  });

  if (!container.children.length) container.textContent = "No applications added yet.";
}

// Save the form without reloading the page.
document.getElementById("profile-form").addEventListener("submit", function (event) {
  event.preventDefault();
  profile = {
    name: document.getElementById("name").value.trim(),
    cgpa: Number(document.getElementById("cgpa").value),
    income: Number(document.getElementById("income").value),
    interest: document.getElementById("interest").value
  };
  document.getElementById("message").textContent = "Details saved. Your matches are updated.";
  saveData();
  showScholarships();
});

document.getElementById("search").addEventListener("input", showScholarships);
document.getElementById("filter").addEventListener("change", showScholarships);

if (profile) {
  document.getElementById("name").value = profile.name;
  document.getElementById("cgpa").value = profile.cgpa;
  document.getElementById("income").value = profile.income;
  document.getElementById("interest").value = profile.interest;
}

showScholarships();
showApplications();
