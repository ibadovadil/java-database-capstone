import { getAppointments as createAppointmentRow } from './components/appointmentRow.js';
import { getAllAppointments } from './services/appointmentRecordService.js';

let tableBody;
let filterDropdown;

document.addEventListener('DOMContentLoaded', () => {
  tableBody = document.getElementById('appointmentRecordTableBody');
  filterDropdown = document.getElementById('filterAppointments');

  if (filterDropdown) {
    filterDropdown.addEventListener('change', (event) => {
      loadAppointments(event.target.value);
    });
  }

  loadAppointments("upcoming");
});

async function loadAppointments(filter) {
  if (!tableBody) {
    console.error("Appointment record table body not found.");
    return;
  }

  tableBody.innerHTML = '';

  const token = localStorage.getItem('token');
  if (!token) {
    console.error("Authentication token missing. Cannot load appointment records.");
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-red-500">Authentication error. Please log in again.</td></tr>';
    return;
  }

  try {
    const allAppointments = await getAllAppointments(null, null, token);

    if (!allAppointments || allAppointments.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-gray-500">No appointments found.</td></tr>';
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filteredAppointments = [];
    if (filter === 'upcoming') {
      filteredAppointments = allAppointments.filter(app => {
        const appointmentDate = new Date(app.appointmentDate);
        appointmentDate.setHours(0, 0, 0, 0);
        return appointmentDate >= today;
      });
    } else if (filter === 'past') {
      filteredAppointments = allAppointments.filter(app => {
        const appointmentDate = new Date(app.appointmentDate);
        appointmentDate.setHours(0, 0, 0, 0);
        return appointmentDate < today;
      });
    } else {
      filteredAppointments = allAppointments;
    }

    if (filteredAppointments.length === 0) {
      const message = filter === 'upcoming' ? 'No upcoming appointments found.' : 'No past appointments found.';
      tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-gray-500">${message}</td></tr>`;
      return;
    }

    filteredAppointments.forEach(appointment => {
      const row = createAppointmentRow(appointment);
      tableBody.appendChild(row);
    });

  } catch (error) {
    console.error("Error loading appointment records:", error);
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-red-500">Error loading appointment records. Please try again later.</td></tr>';
  }
}
