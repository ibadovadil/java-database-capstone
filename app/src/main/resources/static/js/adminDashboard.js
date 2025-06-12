import { openModal } from './components/modals.js';
import { getDoctors, filterDoctors, saveDoctor } from './services/doctorServices.js';
import { createDoctorCard } from './components/doctorCard.js';


document.addEventListener('DOMContentLoaded', () => {
  const addDocBtn = document.getElementById('addDocBtn');
  if (addDocBtn) {
    addDocBtn.addEventListener('click', () => {
      openModal('addDoctor');
    });
  }

  loadDoctorCards();

  const searchBar = document.getElementById("searchBar");
  const filterTime = document.getElementById("filterTime");
  const filterSpecialty = document.getElementById("filterSpecialty");

  if (searchBar) {
    searchBar.addEventListener("input", filterDoctorsOnChange);
  }
  if (filterTime) {
    filterTime.addEventListener("change", filterDoctorsOnChange);
  }
  if (filterSpecialty) {
    filterSpecialty.addEventListener("change", filterDoctorsOnChange);
  }
});

async function loadDoctorCards() {
  try {
    const doctors = await getDoctors();
    const contentDiv = document.getElementById("content");
    if (contentDiv) {
      contentDiv.innerHTML = "";

      if (doctors && doctors.length > 0) {
        renderDoctorCards(doctors);
      } else {
        contentDiv.innerHTML = '<p class="text-center text-gray-500">There is no doctor in the system yet.</p>';
      }
    }
  } catch (error) {
    console.error("Error loading doctor cards:", error); const contentDiv = document.getElementById("content");
    if (contentDiv) {
      contentDiv.innerHTML = '<p class="text-center text-red-500">An error occurred while loading doctors.</p>';
    }
  }
}

async function filterDoctorsOnChange() {
  const name = document.getElementById("searchBar").value;
  const time = document.getElementById("filterTime").value;
  const specialty = document.getElementById("filterSpecialty").value;

  const filteredName = name === "" ? null : name;
  const filteredTime = time === "" ? null : time;
  const filteredSpecialty = specialty === "" ? null : specialty;

  try {
    const filteredResults = await filterDoctors(filteredName, filteredTime, filteredSpecialty);

    const contentDiv = document.getElementById("content");
    if (contentDiv) {
      contentDiv.innerHTML = "";
      if (filteredResults && filteredResults.length > 0) {
        renderDoctorCards(filteredResults);
      } else {
        contentDiv.innerHTML = '<p class="text-center text-gray-500">No doctors found matching the given filters.</p>';
      }
    }
  } catch (error) {
    console.error("Error filtering doctors:", error);
    alert("Error filtering doctors. Please try again.");
    const contentDiv = document.getElementById("content");
    if (contentDiv) {
      contentDiv.innerHTML = '<p class="text-center text-red-500">Error filtering doctors.</p>';
    }
  }
}

function renderDoctorCards(doctors) {
  const contentDiv = document.getElementById("content");
  if (contentDiv) {
    contentDiv.innerHTML = "";
    doctors.forEach(doctor => {
      const doctorCard = createDoctorCard(doctor);
      contentDiv.appendChild(doctorCard);
    });
  }
}


window.adminAddDoctor = async () => {
  const name = document.getElementById('addDoctorName').value;
  const specialty = document.getElementById('addDoctorSpecialty').value;
  const email = document.getElementById('addDoctorEmail').value;
  const password = document.getElementById('addDoctorPassword').value;
  const phone = document.getElementById('addDoctorPhone').value;
  const availabilityCheckboxes = document.querySelectorAll('input[name="addDoctorAvailability"]:checked');
  const availability = Array.from(availabilityCheckboxes).map(cb => cb.value);

  if (!name || !specialty || !email || !password || !phone || availability.length === 0) {
    alert("Please fill in all fields and select a time of availability!"); return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    alert("Authentication token not found. Please log in again.");
    window.location.href = "/";
    return;
  }

  const doctorData = {
    name,
    specialty,
    email,
    password,
    phone,
    availability
  };

  try {
    const result = await saveDoctor(doctorData, token);

    if (result.success) {
      alert(result.message || "Doctor added successfully.");
      loadDoctorCards();
    } else {
      alert(result.message || "An error occurred while adding the doctor.");
    }
  } catch (error) {
    console.error("An unexpected error occurred while adding the doctor:", error);
    alert("An error occurred while adding the doctor. Please try again.");
  }
};

