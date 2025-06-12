import { getAllAppointments } from './services/appointmentRecordService.js';
import { createPatientRow } from './components/patientRows.js';

let patientTableBody;
let selectedDate;
let token;
let patientName = null;

document.addEventListener('DOMContentLoaded', () => {
  if (typeof renderContent === 'function') {
    renderContent();
  }

  patientTableBody = document.getElementById('patientTableBody');
  const todayButton = document.getElementById('todayButton');
  const datePicker = document.getElementById('datePicker');
  const searchBar = document.getElementById('searchBar');

  token = localStorage.getItem('token');
  if (!token) {
    console.error("Authentication token not found for doctor.");
    alert("Session expired or invalid login. Please log in again.");
    window.location.href = "/";
    return;
  }

  const today = new Date();
  selectedDate = today.toISOString().split('T')[0];
  if (datePicker) {
    datePicker.value = selectedDate;
  }

  if (searchBar) {
    searchBar.addEventListener('input', () => {
      const inputValue = searchBar.value.trim();
      patientName = inputValue === "" ? null : inputValue;
      loadAppointments();
    });
  }

  if (todayButton) {
    todayButton.addEventListener('click', () => {
      selectedDate = today.toISOString().split('T')[0];
      if (datePicker) {
        datePicker.value = selectedDate;
      }
      loadAppointments();
    });
  }

  if (datePicker) {
    datePicker.addEventListener('change', () => {
      selectedDate = datePicker.value;
      loadAppointments();
    });
  }

  loadAppointments();
});



async function loadAppointments() {
  if (!patientTableBody) {
    console.error("Patient table body not found.");
    return;
  }
  patientTableBody.innerHTML = '';

  if (!token) {
    patientTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-red-500">Authentication error. Please log in again.</td></tr>';
    return;
  }

  try {
    const appointments = await getAllAppointments(selectedDate, patientName, token);

    if (!appointments || appointments.length === 0) {
      patientTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-gray-500">No appointments found for the selected date.</td></tr>';
      return;
    }

    appointments.forEach(appointment => {
      const patientData = {
        id: appointment.patientId,
        name: appointment.patientName,
        phone: appointment.patientPhone,
        email: appointment.patientEmail,
        prescription: appointment.prescription
      };
      const patientRow = createPatientRow(patientData);
      patientTableBody.appendChild(patientRow);
    });

  } catch (error) {
    console.error("Error loading appointments:", error);
    patientTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-red-500">Error loading appointments. Please try again later.</td></tr>';
  }
}
