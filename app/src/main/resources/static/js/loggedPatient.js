// loggedPatient.js

import { getDoctors, filterDoctors, bookAppointment } from './services/doctorServices.js';
import { createDoctorCard } from './components/doctorCard.js';


document.addEventListener('DOMContentLoaded', () => {
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
    const contentDiv = document.getElementById("content");
    if (!contentDiv) {
        console.error("Content div not found.");
        return;
    }
    contentDiv.innerHTML = "";

    try {
        const doctors = await getDoctors();
        if (doctors && doctors.length > 0) {
            renderDoctorCards(doctors);
        } else {
            contentDiv.innerHTML = '<p class="text-center text-gray-500">No doctors found in the system.</p>';
        }
    } catch (error) {
        console.error("Error loading doctor cards:", error);
        contentDiv.innerHTML = '<p class="text-center text-red-500">An error occurred while loading doctors.</p>';
    }
}


export function showBookingOverlay(event, doctor, patientData) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    const x = event.clientX - event.target.offsetLeft;
    const y = event.clientY - event.target.offsetTop;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    event.target.appendChild(ripple);

    const modal = document.createElement('div');
    modal.classList.add('fixed', 'inset-0', 'flex', 'items-center', 'justify-center', 'bg-gray-800', 'bg-opacity-75', 'z-50');
    modal.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full relative">
            <h2 class="text-2xl font-bold mb-4">Book Appointment</h2>
            <button class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-3xl font-bold" onclick="this.closest('.fixed').remove(); document.querySelector('.ripple')?.remove();">&times;</button>
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">Doctor:</label>
                <input type="text" value="${doctor.name || ''} - ${doctor.specialty || ''}" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" disabled>
            </div>
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">Patient:</label>
                <input type="text" value="${patientData.name || ''} (ID: ${patientData.id || ''})" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" disabled>
            </div>
            <div class="mb-4">
                <label for="appointmentDate" class="block text-gray-700 text-sm font-bold mb-2">Date:</label>
                <input type="date" id="appointmentDate" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
            </div>
            <div class="mb-6">
                <label for="appointmentTime" class="block text-gray-700 text-sm font-bold mb-2">Time:</label>
                <select id="appointmentTime" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                    <option value="">Select a time</option>
                    ${doctor.availability ? doctor.availability.map(time => `<option value="${time}">${time}</option>`).join('') : ''}
                </select>
            </div>
            <div class="flex items-center justify-between">
                <button id="confirmBookingBtn" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Confirm Booking</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('modal-active'), 10); 

    const confirmBookingBtn = modal.querySelector('#confirmBookingBtn');
    if (confirmBookingBtn) {
        confirmBookingBtn.addEventListener('click', async () => {
            // Collect selected date and time
            const appointmentDate = modal.querySelector('#appointmentDate').value;
            const appointmentTime = modal.querySelector('#appointmentTime').value;

            if (!appointmentDate || !appointmentTime) {
                alert("Please select both date and time for the appointment.");
                return;
            }

            const startTime = appointmentTime.split(' ')[0];

            const appointment = {
                doctorId: doctor.id,
                patientId: patientData.id,
                appointmentDate: appointmentDate,
                appointmentTime: startTime
            };

            const token = localStorage.getItem('token');
            if (!token) {
                alert("Authentication token not found. Please log in again.");
                modal.remove();
                if (ripple) ripple.remove();
                return;
            }

            try {
                const result = await bookAppointment(appointment, token);

                if (result.success) {
                    alert(result.message || "Appointment successfully booked!");
                    modal.remove();
                    if (ripple) ripple.remove();
                } else {
                    alert(result.message || "Failed to book appointment.");
                }
            } catch (error) {
                console.error("Error during appointment booking:", error);
                alert("An unexpected error occurred while booking the appointment. Please try again.");
            }
        });
    }
}


async function filterDoctorsOnChange() {
    const searchBar = document.getElementById("searchBar").value;
    const filterTime = document.getElementById("filterTime").value;
    const filterSpecialty = document.getElementById("filterSpecialty").value;

    const name = searchBar.trim() === "" ? null : searchBar.trim();
    const time = filterTime === "" ? null : filterTime;
    const specialty = filterSpecialty === "" ? null : filterSpecialty;

    const contentDiv = document.getElementById("content");
    if (!contentDiv) {
        console.error("Content div not found.");
        return;
    }
    contentDiv.innerHTML = "";

    try {
        const filteredResults = await filterDoctors(name, time, specialty);
        if (filteredResults && filteredResults.length > 0) {
            renderDoctorCards(filteredResults);
        } else {
            contentDiv.innerHTML = '<p class="text-center text-gray-500">No doctors found with the given filters.</p>';
        }
    } catch (error) {
        console.error("Error filtering doctors:", error);
        alert("Error filtering doctors. Please try again.");
        contentDiv.innerHTML = '<p class="text-center text-red-500">Error filtering doctors.</p>';
    }
}


export function renderDoctorCards(doctors) {
    const contentDiv = document.getElementById("content");
    if (contentDiv) {
        contentDiv.innerHTML = "";
        doctors.forEach(doctor => {
            const doctorCard = createDoctorCard(doctor);
            contentDiv.appendChild(doctorCard);
        });
    }
}
