import { openModal } from "../js/components/modals.js";
import { getDoctors, filterDoctors, saveDoctor } from "./services/doctorServices.js";
import { createDoctorCard } from "./components/doctorCard.js";

document.addEventListener("DOMContentLoaded", () => {
  const addDocBtn = document.getElementById("addDocBtn");
  const searchBar = document.getElementById("searchBar");
  const filterTime = document.getElementById("filterTime");
  const filterSpecialty = document.getElementById("filterSpecialty");

  if (addDocBtn) {
    addDocBtn.addEventListener("click", () => {
      openModal("addDoctor");
    });
  }

  if (searchBar) searchBar.addEventListener("input", filterDoctorsOnChange);
  if (filterTime) filterTime.addEventListener("change", filterDoctorsOnChange);
  if (filterSpecialty) filterSpecialty.addEventListener("change", filterDoctorsOnChange);

  loadDoctorCards();
});

async function loadDoctorCards() {
  try {
    const doctors = await getDoctors();
    renderDoctorCards(doctors);
  } catch (error) {
    console.error("Error loading doctors:", error);
  }
}

async function filterDoctorsOnChange() {
  const name = document.getElementById("searchBar").value.trim() || null;
  const time = document.getElementById("filterTime").value || null;
  const specialty = document.getElementById("filterSpecialty").value || null;

  try {
    const doctors = await filterDoctors(name, time, specialty);
    if (doctors.length > 0) {
      renderDoctorCards(doctors);
    } else {
      document.getElementById("content").innerHTML = "<p>No doctors found with the given filters.</p>";
    }
  } catch (error) {
    alert("Error filtering doctors!");
    console.error("Filter error:", error);
  }
}

function renderDoctorCards(doctors) {
  const contentDiv = document.getElementById("content");
  contentDiv.innerHTML = "";
  doctors.forEach((doc) => {
    const card = createDoctorCard(doc);
    contentDiv.appendChild(card);
  });
}

export async function adminAddDoctor() {
  const name = document.getElementById("doctorName").value.trim();
  const email = document.getElementById("doctorEmail").value.trim();
  const phone = document.getElementById("doctorPhone").value.trim();
  const password = document.getElementById("doctorPassword").value.trim();
  const specialty = document.getElementById("specialization").value.trim();
  const checkboxes = document.querySelectorAll("input[name='availability']:checked");
  const availableTimes = Array.from(checkboxes).map(cb => cb.value);

  console.log("Form Data:");
  console.log("Name:", name);
  console.log("Email:", email);
  console.log("Password:", password);
  console.log("Phone:", phone);
  console.log("Specialty:", specialty);
  console.log("Available Times:", availableTimes);

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Login expired. Please log in again.");
    return;
  }

  const doctor = {
    name,
    email,
    password,
    phone,
    specialty,
    availableTimes
  };

  try {
    const result = await saveDoctor(doctor, token);
    if (result.success) {
      alert("Doctor added successfully!");
      document.getElementById("modal").style.display = "none";
      loadDoctorCards();
    } else {
      alert("Error in admin dashboard: " + result.message);
    }
  } catch (error) {
    console.error("Error adding doctor:", error);
    alert("Something went wrong while saving the doctor.");
  }
}

window.adminAddDoctor = adminAddDoctor;