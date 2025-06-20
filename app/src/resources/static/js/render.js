import API_BASE_URI from './config/config.js';


function selectRole(role) {
  setRole(role);
  const token = localStorage.getItem('token');

  if (role === "admin") {
    if (token) {
      window.location.href = `${API_BASE_URI}/adminDashboard/${token}`;
    }
  } else if (role === "patient") {
    window.location.href = "/pages/patientDashboard.html";
  } else if (role === "doctor") {
    if (token) {
      window.location.href = `{API_BASE_URI}/doctorDashboard/${token}`;
    }
  } else if (role === "loggedPatient") {
    window.location.href = "loggedPatientDashboard.html";
  }
}

function renderContent() {
  const role = getRole();
  if (!role) {
    window.location.href = "/";
    return;
  }
}

window.selectRole = selectRole;
window.renderContent = renderContent;