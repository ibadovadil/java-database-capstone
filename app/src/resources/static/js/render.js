// render.js

export function setRole(role) {
  localStorage.setItem("userRole", role);
}

export function getRole() {
  return localStorage.getItem("userRole");
}

export function clearRole() {
  localStorage.removeItem("userRole");
}

export function selectRole(role) {
  const token = localStorage.getItem('token'); 
  if (role === "admin") {
    window.location.href = "/adminDashboard.html";
  }
  else if (role === "patient") { 
    window.location.href = "/patientDashboard.html";
  }
  else if (role === "doctor") {
    window.location.href = "/doctorDashboard.html";
  }
  else if (role === "loggedPatient") {
    window.location.href = "/patientDashboard.html"; 
  }
}

export function renderContent() {
  const userRole = getRole();

  if (!userRole) {
    window.location.href = "/"; 
    return;
  }

}
