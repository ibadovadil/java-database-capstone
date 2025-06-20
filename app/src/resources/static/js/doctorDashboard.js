import { getAllAppointments } from './services/appointmentRecordService.js';
import { createPatientRow } from './components/patientRows.js';

const tableBody = document.getElementById('patientTableBody');
let selectedDate = new Date().toISOString().split('T')[0];
const doctorEmail = localStorage.getItem('doctorEmail');
const token = localStorage.getItem("token");
let patientName = null;

document.getElementById('searchBar').addEventListener('input', (e) => {
  const value = e.target.value.trim();
  patientName = value !== "" ? value : "null";
  loadAppointments();
});

document.getElementById('todayButton').addEventListener('click', () => {
  selectedDate = new Date().toISOString().split('T')[0];
  document.getElementById('datePicker').value = selectedDate;
  loadAppointments();
});

document.getElementById('datePicker').addEventListener('change', (e) => {
  selectedDate = e.target.value;
  loadAppointments();
});

async function loadAppointments() {
  if (!selectedDate || selectedDate.trim() === "") {
    selectedDate = new Date().toISOString().split('T')[0];
  }
  try {
    console.log("Selected Date:", selectedDate);
    console.log("Patient Name:", patientName);
    console.log("Token:", token);
    const response = await getAllAppointments(selectedDate, patientName, token);
    const appointments = response.appointments || [];

    tableBody.innerHTML = "";

    if (appointments.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = `<td colspan="5">No appointments found for today.</td>`;
      tableBody.appendChild(row);
      return;
    }

    appointments.forEach((appointment) => {
      const patient = {
        id: appointment.patientId,
        name: appointment.patientName,
        phone: appointment.patientPhone,
        email: appointment.patientEmail
      };

      const appointmentId = appointment.id;
      const doctorId = appointment.doctorId;

      const row = createPatientRow(patient, appointmentId, doctorId);
      tableBody.appendChild(row);
    });

  } catch (error) {
    console.error("Error loading appointments:", error);
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="4">Error loading appointments. Please try again later.</td>`;
    tableBody.appendChild(row);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof renderContent === 'function') {
    renderContent();
  }
  document.getElementById('datePicker').value = selectedDate;
  loadAppointments();
});