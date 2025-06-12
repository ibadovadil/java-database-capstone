import { createPatientRecordRow } from './components/patientRecordRow.js';
import { getPatientAppointments } from './services/patientServices.js';

let tableBody;
let token;
let patientId;
let doctorId;
let filterDropdown;

document.addEventListener('DOMContentLoaded', async () => {
    tableBody = document.getElementById('patientAppointmentsTableBody');
    filterDropdown = document.getElementById('filterAppointments');

    const urlParams = new URLSearchParams(window.location.search);
    patientId = urlParams.get('patientId');
    doctorId = urlParams.get('doctorId');
    token = localStorage.getItem('token');

    if (!token || !patientId || !doctorId) {
        console.error("Authentication token, patient ID, or doctor ID missing. Cannot load patient record.");
        alert("Authentication error or missing data. Please try again.");
        window.location.href = "/";
        return;
    }

    if (filterDropdown) {
        filterDropdown.addEventListener('change', () => {
            loadAppointments(filterDropdown.value);
        });
    }

    await initializePage();
});

async function initializePage() {
    await loadAppointments(filterDropdown ? filterDropdown.value : 'all');
}

async function loadAppointments(filter) {
    if (!tableBody) {
        console.error("Table body not found.");
        return;
    }
    tableBody.innerHTML = '';

    try {
        const allAppointments = await getPatientAppointments(patientId, token, "doctor");

        if (!allAppointments || allAppointments.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center text-gray-500">No appointments found.</td></tr>';
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let filteredAppointments = allAppointments;

        if (filter === "upcoming") {
            filteredAppointments = allAppointments.filter(app => {
                const appDate = new Date(app.appointmentDate);
                appDate.setHours(0, 0, 0, 0);
                return appDate >= today;
            });
        } else if (filter === "past") {
            filteredAppointments = allAppointments.filter(app => {
                const appDate = new Date(app.appointmentDate);
                appDate.setHours(0, 0, 0, 0);
                return appDate < today;
            });
        }
        filteredAppointments = filteredAppointments.filter(app => app.doctorId === doctorId);


        if (filteredAppointments.length === 0) {
            const message = filter === 'upcoming' ? 'No upcoming appointments found for this patient with this doctor.' : 'No past appointments found for this patient with this doctor.';
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-gray-500">${message}</td></tr>`;
            return;
        }

        filteredAppointments.forEach(appointment => {
            const row = createPatientRecordRow(appointment);
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error loading patient appointments:", error);
        alert("Error loading patient appointments. Please try again.");
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center text-red-500">Error loading appointments. Please try again later.</td></tr>';
    }
}
