import { getAppointments as createAppointmentRow } from './components/appointmentRow.js';
import { getPatientAppointments, getPatientData, filterAppointments } from './services/patientServices.js';

let tableBody;
let token;
let allAppointments = [];
let patientId;

document.addEventListener('DOMContentLoaded', async () => {
  tableBody = document.getElementById('patientAppointmentsTableBody');
  const searchBar = document.getElementById('searchBar');
  const filterDropdown = document.getElementById('filterAppointments');

  token = localStorage.getItem('token');

  if (!token) {
    console.error("Authentication token missing. Cannot load patient appointments.");
    window.location.href = "/";
    return;
  }

  try {
    const patientData = await getPatientData(token);
    if (patientData && patientData.id) {
      patientId = patientData.id;
    } else {
      console.error("Patient data could not be retrieved. Cannot load appointments.");
      alert("Failed to load patient data. Please log in again.");
      window.location.href = "/";
      return;
    }

    allAppointments = await getPatientAppointments(patientId, token, "patient"); // User as "patient" for patient's own view.
    allAppointments = allAppointments.filter(app => app.patientId === patientId);

    if (searchBar) {
      searchBar.addEventListener('input', () => {
        applyFiltersAndRender();
      });
    }

    if (filterDropdown) {
      filterDropdown.addEventListener('change', () => {
        applyFiltersAndRender();
      });
    }

    applyFiltersAndRender();
  } catch (error) {
    console.error("Error during page initialization:", error);
    alert("An error occurred during page setup. Please try again.");
    if (tableBody) {
      tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-red-500">Error loading appointments.</td></tr>';
    }
  }
});

async function applyFiltersAndRender() {
  const searchBar = document.getElementById('searchBar');
  const filterDropdown = document.getElementById('filterAppointments');

  const searchText = searchBar ? searchBar.value.toLowerCase().trim() : '';
  const filterValue = filterDropdown ? filterDropdown.value : 'all';

  let currentFilteredAppointments = allAppointments;

  if (searchText) {
    currentFilteredAppointments = currentFilteredAppointments.filter(app =>
      (app.doctorName && app.doctorName.toLowerCase().includes(searchText)) ||
      (app.patientName && app.patientName.toLowerCase().includes(searchText))
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (filterValue === "upcoming") {
    currentFilteredAppointments = currentFilteredAppointments.filter(app => {
      const appDate = new Date(app.appointmentDate);
      appDate.setHours(0, 0, 0, 0);
      return appDate >= today;
    });
  } else if (filterValue === "past") {
    currentFilteredAppointments = currentFilteredAppointments.filter(app => {
      const appDate = new Date(app.appointmentDate);
      appDate.setHours(0, 0, 0, 0);
      return appDate < today;
    });
  }

  renderAppointments(currentFilteredAppointments);
}

function renderAppointments(appointmentsToRender) {
  if (!tableBody) {
    console.error("Table body not found for rendering.");
    return;
  }

  tableBody.innerHTML = '';

  if (!appointmentsToRender || appointmentsToRender.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-gray-500">No appointments found.</td></tr>';
    return;
  }


  appointmentsToRender.forEach(appointment => {
    const isEditable = appointment.status === 0;

    const appointmentDataForDisplay = {
        id: appointment.id,
        patientName: "You", 
        doctorName: appointment.doctorName,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        isEditable: isEditable 
    };

    const row = createAppointmentRow(appointmentDataForDisplay);
    tableBody.appendChild(row);

  });
}
