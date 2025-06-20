export function getAppointments(appointment) {
  const tableRow = document.createElement("tr");

  tableRow.innerHTML = `
      <td class="patient-id">${appointment.patientName}</td>
      <td>${appointment.doctorName}</td>
      <td>${appointment.date}</td>
      <td>${appointment.time}</td>
      <td><img src="../assets/images/edit/edit.png" alt="action" class="prescription-btn" data-id="${appointment.id}"></img></td>
    `;

tableRow.querySelector(".prescription-btn").addEventListener("click", () => {
  const appointmentId = appointment.id || appointment._id;
  const patientName = encodeURIComponent(appointment.patientName);
window.location.href = `/pages/addPrescription.html?appointmentId=${appointmentId}&patientName=${patientName}`;
});
console.log("appointment object:", appointment);
console.log("appointment id:", appointment?.id);
console.log("patient name:", appointment?.patientName);


  return tableRow;
}