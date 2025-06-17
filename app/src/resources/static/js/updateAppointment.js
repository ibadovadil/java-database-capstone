import { getDoctors } from './services/doctorServices.js';
import { updateAppointment as updateAppointmentService } from './services/appointmentRecordService.js';
import { selectRole } from './render.js';

let token;
let appointmentId;
let patientId;
let doctorId;
let patientName;
let doctorName;
let appointmentDate;
let appointmentTime;
let doctor;

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    appointmentId = urlParams.get('appointmentId');
    patientId = urlParams.get('patientId');
    doctorId = urlParams.get('doctorId');
    patientName = urlParams.get('patientName');
    doctorName = urlParams.get('doctorName');
    appointmentDate = urlParams.get('appointmentDate');
    appointmentTime = urlParams.get('appointmentTime');

    token = localStorage.getItem('token');

    if (!token || !patientId) {
        console.error("Authentication token or patient ID missing. Redirecting to patient appointments page.");
        window.location.href = "/patientAppointments.html";
        return;
    }

    await initializePage();

    const updateAppointmentForm = document.getElementById('updateAppointmentForm');
    if (updateAppointmentForm) {
        updateAppointmentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleUpdateAppointmentFormSubmission();
        });
    }
});

async function initializePage() {
    const patientNameInput = document.getElementById('patientNameInput');
    const doctorNameInput = document.getElementById('doctorNameInput');
    const appointmentDateInput = document.getElementById('appointmentDateInput');
    const appointmentTimeSelect = document.getElementById('appointmentTimeSelect');

    if (patientNameInput) patientNameInput.value = patientName || '';
    if (doctorNameInput) doctorNameInput.value = doctorName || '';
    if (appointmentDateInput) appointmentDateInput.value = appointmentDate || '';
    if (appointmentTimeSelect) appointmentTimeSelect.value = appointmentTime || '';

    try {
        const allDoctors = await getDoctors();
        if (allDoctors && allDoctors.length > 0) {
            doctor = allDoctors.find(doc => doc.id === doctorId);

            if (doctor && appointmentTimeSelect) {
                appointmentTimeSelect.innerHTML = '<option value="">Select a time</option>';
                doctor.availability.forEach(timeSlot => {
                    const option = document.createElement('option');
                    option.value = timeSlot;
                    option.textContent = timeSlot;
                    appointmentTimeSelect.appendChild(option);
                });
                if (appointmentTime) {
                    appointmentTimeSelect.value = appointmentTime;
                }
            } else if (!doctor) {
                console.error("Selected doctor not found in the fetched list.");
                alert("Selected doctor details could not be loaded.");
            }
        } else {
            console.error("No doctors found in the system.");
            alert("No doctors available to load appointment times.");
        }
    } catch (error) {
        console.error("Error fetching doctor list for appointment update:", error);
        alert("Error loading doctor information. Please try again.");
    }
}

async function handleUpdateAppointmentFormSubmission() {
    const appointmentDateInput = document.getElementById('appointmentDateInput');
    const appointmentTimeSelect = document.getElementById('appointmentTimeSelect');

    const newAppointmentDate = appointmentDateInput ? appointmentDateInput.value : '';
    const newAppointmentTime = appointmentTimeSelect ? appointmentTimeSelect.value : '';

    if (!newAppointmentDate || !newAppointmentTime) {
        alert("Please select both a date and a time for the appointment.");
        return;
    }

    const updatedAppointment = {
        id: appointmentId,
        patientId: patientId,
        doctorId: doctorId,
        appointmentDate: newAppointmentDate,
        appointmentTime: newAppointmentTime
    };

    try {
        const result = await updateAppointmentService(updatedAppointment, token);

        if (result.success) {
            alert(result.message || "Appointment updated successfully!");
            window.location.href = "/patientAppointments.html";
        } else {
            alert(result.message || "Failed to update appointment. Please try again.");
        }
    } catch (error) {
        console.error("Error updating appointment:", error);
        alert("An unexpected error occurred during appointment update. Please try again.");
    }
}
