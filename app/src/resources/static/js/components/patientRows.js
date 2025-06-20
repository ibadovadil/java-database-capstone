export function createPatientRow(patient, appointmentId, doctorId) {
  const Patrow = document.createElement('tr');

  Patrow.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 patient-id" data-patient-id="${patient.id || 'N/A'}">${patient.id || 'N/A'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${patient.name || 'N/A'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${patient.phone || 'N/A'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${patient.email || 'N/A'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <img src="../assets/images/addPrescriptionIcon/addPrescription.png" alt="Prescription" class="prescription-btn cursor-pointer w-6 h-6 inline-block" data-appointment-id="${appointmentId}">
        </td>
    `;

  const patientIdCell = Patrow.querySelector('.patient-id');
  if (patientIdCell) {
    patientIdCell.addEventListener('click', () => {
      const pId = patientIdCell.dataset.patientId;
      window.location.href = `/pages/patientRecord.html?patientId=${pId}&doctorId=${doctorId}`;
    });
  }

  const prescriptionButton = Patrow.querySelector('.prescription-btn');
  if (prescriptionButton) {
    prescriptionButton.addEventListener('click', () => {
      const apptId = prescriptionButton.dataset.appointmentId;
      window.location.href = `/pages/addPrescription.html?appointmentId=${apptId}&patientName=${patient.name}`;
    });
  }

  return Patrow;
}
