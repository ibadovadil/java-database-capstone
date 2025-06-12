import { openModal } from './modals.js';
import { selectRole } from './render.js';

export function renderHeader() {
  const headerDiv = document.getElementById("header");
  if (!headerDiv) {
    console.error("Header div not found.");
    return;
  }

  if (window.location.pathname.endsWith("/")) {
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    headerDiv.innerHTML = `
      <header class="header">
        <div class="logo-section">
          <img src="../assets/images/logo/logo.png" alt="Hospital CRM Logo" class="logo-img">
          <span class="logo-title">Hospital CMS</span>
        </div>
      </header>`;
    return;
  }

  const role = localStorage.getItem("userRole");
  const token = localStorage.getItem("token");

  let headerContent = `<header class="header">
    <div class="logo-section">
      <img src="../assets/images/logo/logo.png" alt="Hospital CRM Logo" class="logo-img">
      <span class="logo-title">Hospital CMS</span>
    </div>
    <nav>`;

  if ((role === "loggedPatient" || role === "admin" || role === "doctor") && !token) {
    localStorage.removeItem("userRole");
    alert("Session expired or invalid login. Please log in again.");
    window.location.href = "/";
    return;
  } else if (role === "admin") {
    headerContent += `
          <button id="addDocBtn" class="adminBtn" onclick="openModal('addDoctor')">Add Doctor</button>
          <a href="#" onclick="logout()">Logout</a>`;
  } else if (role === "doctor") {
    headerContent += `
          <button class="adminBtn"  onclick="selectRole('doctor')">Home</button>
          <a href="#" onclick="logout()">Logout</a>`;
  } else if (role === "patient") {
    headerContent += `
          <button id="patientLogin" class="adminBtn">Login</button>
          <button id="patientSignup" class="adminBtn">Sign Up</button>`;
  } else if (role === "loggedPatient") {
    headerContent += `
          <button id="home" class="adminBtn" onclick="window.location.href='/patientDashboard.html'">Home</button>
          <button id="patientAppointments" class="adminBtn" onclick="window.location.href='/patientAppointments.html'">Appointments</button>
          <a href="#" onclick="logoutPatient()">Logout</a>`;
  }

  headerContent += `</nav></header>`;

  headerDiv.innerHTML = headerContent;
  attachHeaderButtonListeners();
}

function attachHeaderButtonListeners() {
  const patientLoginBtn = document.getElementById("patientLogin");
  if (patientLoginBtn) {
    patientLoginBtn.addEventListener("click", () => openModal("patientLogin"));
  }

  const patientSignupBtn = document.getElementById("patientSignup");
  if (patientSignupBtn) {
    patientSignupBtn.addEventListener("click", () => openModal("patientSignup"));
  }
}

window.logout = function () {
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  window.location.href = "/";
};

window.logoutPatient = function () {
  localStorage.removeItem("token");
  localStorage.setItem("userRole", "patient");
  window.location.href = "/patientDashboard.html";
};

document.addEventListener('DOMContentLoaded', renderHeader);
