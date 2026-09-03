const $ = (id) => document.getElementById(id);

const symbols = { USD:"US $", GBP:"£", EUR:"€", CAD:"CA $", AUD:"A$" };
const THEME_KEY = "mrmrr-break-even-theme";

function applyTheme(theme) {
  const light = theme === "light";
  document.documentElement.dataset.theme = light ? "light" : "dark";
  $("themeIcon").textContent = light ? "🌙" : "☀️";
  $("themeLabel").textContent = light ? "Dark mode" : "Light mode";
  $("themeToggle").setAttribute("aria-pressed", String(light));
  $("themeToggle").setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved === "light" ? "light" : "dark");
}

function val(id) {
  const el = $(id);
  if (!el) return 0;
  const n = Number(el.value);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function money(value) {
  const safe = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: $("currency").value,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(safe)
    .replace(/US\$/g, "US $")
    .replace(/CA\$/g, "CA $");
}

function timeframe() {
  const active = document.querySelector(".time-option.active");
  if (!active) return "30 days";
  if (active.dataset.time !== "Custom") return active.dataset.time;
  const start = $("startDate").value;
  const end = $("endDate").value;
  return start && end ? `${start} to ${end}` : "Custom";
}

function calculate() {
  const adSpend = val("adSpend");
  const frontRevenue = val("frontRevenue");
  const sales = val("customers");
  const membershipPrice = val("rebillPrice");
  const averageCogs = val("cogsPerOrder");
  const totalCogs = averageCogs * sales;
  const rebillRevenueNeeded = Math.max(0, adSpend + totalCogs - frontRevenue);
  const rebillRevenueAt100 = sales * membershipPrice;
  const breakEvenRate = rebillRevenueAt100 > 0 ? (rebillRevenueNeeded / rebillRevenueAt100) * 100 : 0;
  const frontRoas = adSpend > 0 ? frontRevenue / adSpend : 0;
  const actualCpa = sales > 0 ? adSpend / sales : 0;
  const aov = sales > 0 ? frontRevenue / sales : 0;
  const approvalRate = Math.max(0, Math.min(100, Number($("approvalSlider").value) || 0));
  const projectedRebillRevenue = rebillRevenueAt100 * approvalRate / 100;
  const totalRevenueAfterRebill = frontRevenue + projectedRebillRevenue;
  const projectedProfit = totalRevenueAfterRebill - adSpend - totalCogs;
  const profitPerCustomer = sales > 0 ? projectedProfit / sales : 0;
  const totalRoas = adSpend > 0 ? totalRevenueAfterRebill / adSpend : 0;

  $("breakEvenRate").textContent = `${breakEvenRate.toFixed(2)}%`;
  $("frontRoas").textContent = `${frontRoas.toFixed(2)}x`;
  $("revenueNeeded").textContent = money(rebillRevenueNeeded);
  $("maxRebillRevenue").textContent = money(rebillRevenueAt100);
  $("frontRevenueResult").textContent = money(frontRevenue);
  $("actualCpa").textContent = money(actualCpa);
  $("aov").textContent = money(aov);
  $("compareFrontRoas").textContent = `${frontRoas.toFixed(2)}x`;
  $("compareTotalRoas").textContent = `${totalRoas.toFixed(2)}x`;
  $("approvalDisplay").textContent = `${approvalRate}%`;
  $("projectedRebill").textContent = money(projectedRebillRevenue);
  $("totalRevenue").textContent = money(totalRevenueAfterRebill);
  $("totalCogs").textContent = money(totalCogs);
  $("adSpendResult").textContent = money(adSpend);
  $("profitPerCustomer").textContent = money(profitPerCustomer);
  $("projectedProfit").textContent = `${projectedProfit >= 0 ? "+" : ""}${money(projectedProfit)}`;

  const hasRequiredInputs = adSpend > 0 && sales > 0 && membershipPrice > 0;
  if (!hasRequiredInputs) {
    $("breakEvenText").textContent = "Enter your campaign(s) numbers to calculate the approval rate needed to break even.";
  } else if (rebillRevenueNeeded <= 0) {
    $("breakEvenText").textContent = "Your front-end revenue already covers ad spend and COGS before any first rebills are approved.";
  } else if (breakEvenRate > 100) {
    $("breakEvenText").textContent = "Even 100% first-rebill approval would not fully recover the current campaign(s) cost.";
  } else {
    $("breakEvenText").textContent = `You need about ${breakEvenRate.toFixed(1)}% of first rebills to successfully process for the campaign(s) to break even.`;
  }

  const card = $("profitCard");
  const status = $("statusPill");
  card.classList.remove("loss", "near");
  if (!hasRequiredInputs && frontRevenue <= 0) {
    status.textContent = "Waiting for data";
  } else {
    const nearBand = Math.max(50, (adSpend + totalCogs) * 0.02);
    if (projectedProfit < -nearBand) { card.classList.add("loss"); status.textContent = "Loss"; }
    else if (Math.abs(projectedProfit) <= nearBand) { card.classList.add("near"); status.textContent = "Near break-even"; }
    else status.textContent = "Profitable";
  }

  const marker = $("beMarker");
  const markerRate = Math.max(0, Math.min(100, breakEvenRate));
  marker.style.left = `${markerRate}%`;
  $("beLabel").textContent = breakEvenRate > 100 ? "BE >100%" : `BE ${breakEvenRate.toFixed(1)}%`;
  marker.classList.toggle("hidden-marker", rebillRevenueAt100 <= 0);
  marker.classList.toggle("marker-left", markerRate < 8);
  marker.classList.toggle("marker-right", markerRate > 92);

  $("mathLine").textContent = `${money(frontRevenue)} front-end + ${money(projectedRebillRevenue)} first rebill revenue − ${money(adSpend)} ad spend − ${money(totalCogs)} COGS = ${projectedProfit >= 0 ? "+" : ""}${money(projectedProfit)}.`;
  $("timePill").textContent = timeframe();
}

function updateCurrency() {
  const symbol = symbols[$("currency").value] || "$";
  document.querySelectorAll(".currency-symbol").forEach((el) => { el.textContent = symbol; });
  calculate();
}

function resetCalculator() {
  ["adSpend","frontRevenue","customers","rebillPrice","cogsPerOrder"].forEach((id) => { $(id).value = ""; });
  $("approvalSlider").value = 65;
  $("currency").value = "USD";
  $("startDate").value = "";
  $("endDate").value = "";
  document.querySelectorAll(".time-option").forEach((btn) => { btn.classList.toggle("active", btn.dataset.time === "30 days"); });
  $("customDates").classList.add("hidden");
  updateCurrency();
}

["adSpend","frontRevenue","customers","rebillPrice","cogsPerOrder"].forEach((id) => { $(id).addEventListener("input", calculate); });
$("approvalSlider").addEventListener("input", calculate);
$("currency").addEventListener("change", updateCurrency);
$("startDate").addEventListener("change", calculate);
$("endDate").addEventListener("change", calculate);
$("resetBtn").addEventListener("click", resetCalculator);
$("themeToggle").addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
});

document.querySelectorAll(".time-option").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".time-option").forEach((item) => item.classList.remove("active"));
    btn.classList.add("active");
    $("customDates").classList.toggle("hidden", btn.dataset.time !== "Custom");
    calculate();
  });
});

document.querySelectorAll(".help-tip").forEach((tip) => {
  tip.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const open = tip.classList.contains("tip-open");
    document.querySelectorAll(".help-tip.tip-open").forEach((item) => item.classList.remove("tip-open"));
    if (!open) tip.classList.add("tip-open");
  });
});

document.addEventListener("click", () => { document.querySelectorAll(".help-tip.tip-open").forEach((item) => item.classList.remove("tip-open")); });

initTheme();
updateCurrency();
