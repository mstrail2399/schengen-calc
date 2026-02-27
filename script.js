let currentDate = new Date();
let records = JSON.parse(localStorage.getItem("records") || "[]");

const calendarContainer = document.getElementById("calendarContainer");
const monthLabel = document.getElementById("monthLabel");

function saveRecords() {
  localStorage.setItem("records", JSON.stringify(records));
}

function expandStays() {
  const set = new Set();
  records.forEach(r => {
    let start = new Date(r.entry);
    let end = new Date(r.exit);
    while (start <= end) {
      set.add(start.toISOString().split("T")[0]);
      start.setDate(start.getDate() + 1);
    }
  });
  return set;
}

function calculateUsedDays(targetDate, staySet) {
  let used = 0;
  let check = new Date(targetDate);
  check.setDate(check.getDate() - 179);

  for (let i = 0; i < 180; i++) {
    let d = new Date(check);
    d.setDate(check.getDate() + i);
    let key = d.toISOString().split("T")[0];
    if (staySet.has(key)) used++;
  }
  return used;
}

function renderCalendar() {
  calendarContainer.innerHTML = "";
  const staySet = expandStays();

  for (let m = 0; m < 2; m++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + m, 1);
    const monthDiv = document.createElement("div");
    monthDiv.className = "month";

    const title = document.createElement("div");
    title.className = "month-title";
    title.textContent = `${date.getFullYear()} 年 ${date.getMonth()+1} 月`;
    monthDiv.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "grid";

    const firstDay = new Date(date);
    const startDay = firstDay.getDay();
    const daysInMonth = new Date(date.getFullYear(), date.getMonth()+1, 0).getDate();

    for (let i = 0; i < startDay; i++) {
      grid.appendChild(document.createElement("div"));
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dayDiv = document.createElement("div");
      dayDiv.className = "day";

      const fullDate = new Date(date.getFullYear(), date.getMonth(), d);
      const key = fullDate.toISOString().split("T")[0];

      const dateSpan = document.createElement("div");
      dateSpan.className = "date";
      dateSpan.textContent = d;

      const used = calculateUsedDays(fullDate, staySet);
      const remaining = 90 - used;

      const remainSpan = document.createElement("div");
      remainSpan.className = "remaining";
      remainSpan.textContent = remaining;

      if (remaining < 0) remainSpan.classList.add("danger");
      else if (remaining < 10) remainSpan.classList.add("warn");

      if (staySet.has(key)) {
        dayDiv.classList.add("in-schengen");
      }

      dayDiv.appendChild(dateSpan);
      dayDiv.appendChild(remainSpan);
      grid.appendChild(dayDiv);
    }

    monthDiv.appendChild(grid);
    calendarContainer.appendChild(monthDiv);
  }

  monthLabel.textContent =
    `${currentDate.getFullYear()} 年 ${currentDate.getMonth()+1} 月`;
}

document.getElementById("prevMonth").onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
};

document.getElementById("nextMonth").onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
};

document.getElementById("openRecords").onclick = () => {
  document.getElementById("recordPanel").classList.remove("hidden");
  renderRecords();
};

document.getElementById("closeRecords").onclick = () => {
  document.getElementById("recordPanel").classList.add("hidden");
};

document.getElementById("addRecord").onclick = () => {
  const entry = prompt("入境日期 (YYYY-MM-DD)");
  const exit = prompt("出境日期 (YYYY-MM-DD)");
  if (entry && exit) {
    records.push({ entry, exit });
    saveRecords();
    renderCalendar();
    renderRecords();
  }
};

function renderRecords() {
  const list = document.getElementById("recordList");
  list.innerHTML = "";
  records.forEach((r, index) => {
    const div = document.createElement("div");
    div.className = "record-item";
    div.textContent = `${r.entry} → ${r.exit}`;
    div.onclick = () => {
      records.splice(index, 1);
      saveRecords();
      renderRecords();
      renderCalendar();
    };
    list.appendChild(div);
  });
}

renderCalendar();
