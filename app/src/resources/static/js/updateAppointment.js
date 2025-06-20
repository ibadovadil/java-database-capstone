import { updateAppointment } from "../js/services/appointmentRecordService.js";
import { getDoctors } from "../js/services/doctorServices.js";

document.addEventListener("DOMContentLoaded", initializePage);

async function initializePage() {
  const token = localStorage.getItem("token");
  const urlParams = new URLSearchParams(window.location.search);
  const appointmentId = urlParams.get("appointmentId");
  const patientId = urlParams.get("patientId");
  const doctorId = urlParams.get("doctorId");
  const patientName = urlParams.get("patientName");
  const doctorName = urlParams.get("doctorName");
  const appointmentDate = urlParams.get("appointmentDate");
  const appointmentTime = urlParams.get("appointmentTime");

  console.log(doctorId);

  if (!token || !patientId) {
    alert("Missing session data, redirecting to appointments page.");
    window.location.href = "/pages/patientAppointments.html";
    return;
  }

  getDoctors()
    .then(doctors => {
      const doctor = doctors.find(d => d.id == doctorId);
      if (!doctor) {
        alert("Doctor not found.");
        return;
      }

      document.getElementById("patientName").value = patientName || "You";
      document.getElementById("doctorName").value = doctorName;
      document.getElementById("appointmentDate").value = appointmentDate;
      document.getElementById("appointmentTime").value = appointmentTime;

      const timeSelect = document.getElementById("appointmentTime");

      if (appointmentTime && !doctor.availableTimes.includes(appointmentTime)) {
        const option = document.createElement("option");
        option.value = appointmentTime;
        option.textContent = appointmentTime;
        timeSelect.appendChild(option);
      }
      doctor.availableTimes.forEach(time => {
        const option = document.createElement("option");
        option.value = time;
        option.textContent = time;
        timeSelect.appendChild(option);
      });

      if (appointmentTime) {
        timeSelect.value = appointmentTime;
      }

      document.getElementById("updateAppointmentForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const date = document.getElementById("appointmentDate").value;
        const time = document.getElementById("appointmentTime").value;
        const startTime = time.split('-')[0];

        console.log(date);
        console.log(startTime);

        if (!date || !time) {
          alert("Please select both date and time.");
          return;
        }

        const updatedAppointment = {
          id: parseInt(appointmentId),
          doctor: { id: parseInt(doctor.id) },
          patient: { id: parseInt(patientId) },
          appointmentTime: `${date}T${startTime}:00`,
          status: 0
        };

        const updateResponse = await updateAppointment(updatedAppointment, token);

        if (updateResponse.success) {
          alert("Appointment updated successfully!");
          window.location.href = "/pages/patientAppointments.html";
        } else {
          alert("Failed to update appointment: " + updateResponse.message);
        }
      });
    })
    .catch(error => {
      console.error("Error fetching doctors:", error);
      alert("Failed to load doctor data.");
    });
}