import { showBookingOverlay } from '../services/loggedPatient.js';
import { deleteDoctor } from '../services/doctorServices.js';
import { getPatientData } from '../services/patientServices.js';

export function createDoctorCard(doctor) {
  const card = document.createElement("div");
  card.classList.add("doctor-card");
  const role = localStorage.getItem("userRole");

  const infoDiv = document.createElement("div");
  infoDiv.classList.add("doctor-info");

  const name = document.createElement("h3");
  name.textContent = doctor.name;

  const specialization = document.createElement("p");
  specialization.textContent = `Specialty: ${doctor.specialty}`;

  const email = document.createElement("p");
  email.textContent = `Email: ${doctor.email}`;

  const availability = document.createElement("p");
  availability.textContent = `Availability: ${doctor.availability ? doctor.availability.join(", ") : 'N/A'}`;

  infoDiv.appendChild(name);
  infoDiv.appendChild(specialization);
  infoDiv.appendChild(email);
  infoDiv.appendChild(availability);

  const actionsDiv = document.createElement("div");
  actionsDiv.classList.add("card-actions");


  // === ADMIN ROLE ACTIONS ===
  if (role === "admin") {
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Delete";

    removeBtn.addEventListener("click", async () => {
      const token = localStorage.getItem("token");
      try {
        const success = await deleteDoctor(doctor.id, token);
        if (success) {
          card.remove();
          alert(`Doctor ${doctor.name} deleted successfully.`);
        } else {
          alert(`Could not delete doctor: ${doctor.name}.`);
        }
      } catch (error) {
        console.error("An error occurred while deleting the doctor:", error);
        alert("An unexpected error occurred while deleting the doctor.");
      }
    });
    actionsDiv.appendChild(removeBtn);
  }
  // === PATIENT (NOT LOGGED-IN) ROLE ACTIONS ===
  else if (role === "patient") {
    const bookNow = document.createElement("button");
    bookNow.textContent = "Book Now";

    bookNow.addEventListener("click", () => {
      alert("You must first log in to book an appointment.");
    });
    actionsDiv.appendChild(bookNow);
  }
  // === LOGGED-IN PATIENT ROLE ACTIONS ===
  else if (role === "loggedPatient") {
    const bookNow = document.createElement("button");
    bookNow.textContent = "Book Now";

    bookNow.addEventListener("click", async (e) => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to book an appointment."); return;
      }
      try {
        const patientData = await getPatientData(token);
        if (patientData) {
          showBookingOverlay(e, doctor, patientData);
        } else {
          alert("An error occurred while retrieving patient information.");
        }
      } catch (error) {
        console.error("An error occurred while booking the appointment:", error);
        alert("An unexpected error occurred while booking the appointment.");
      }
    });
    actionsDiv.appendChild(bookNow);
  }

  card.appendChild(infoDiv);
  card.appendChild(actionsDiv);

  return card;
}
