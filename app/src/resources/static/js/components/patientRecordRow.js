export function createPatientRecordRow(patient) {
  const tableRow = document.createElement("tr");
  tableRow.innerHTML = `
      <td class="patient-id">${patient.appointmentDate}</td>
      <td>${patient.id}</td>
      <td>${patient.patientId}</td>
      <td><img src="../assets/images/addPrescriptionIcon/addPrescription.png" alt="addPrescriptionIcon" class="prescription-btn" data-id="${patient.id}"></img></td>
    `;

  tableRow.querySelector(".prescription-btn").addEventListener("click", () =>
  {
    window.location.href = `/pages/addPrescription.html?mode=view&appointmentId=${patient.id}`;
  });

  return tableRow;
}