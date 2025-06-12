// patientRows.js

export function createPatientRow(patient, appointmentId, doctorId) {
  const row = document.createElement('tr');

  row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 patient-id" data-patient-id="${patient.id || 'N/A'}">${patient.id || 'N/A'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${patient.name || 'N/A'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${patient.phone || 'N/A'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${patient.email || 'N/A'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <img src="/assets/icons/prescription-icon.svg" alt="Prescription" class="prescription-btn cursor-pointer w-6 h-6 inline-block" data-appointment-id="${appointmentId}">
        </td>
    `;

  const patientIdCell = row.querySelector('.patient-id');
  if (patientIdCell) {
    patientIdCell.addEventListener('click', () => {
      const pId = patientIdCell.dataset.patientId;
      window.location.href = `/patientRecord.html?patientId=${pId}&doctorId=${doctorId}`;
    });
  }

  const prescriptionButton = row.querySelector('.prescription-btn');
  if (prescriptionButton) {
    prescriptionButton.addEventListener('click', () => {
      const apptId = prescriptionButton.dataset.appointmentId;
      window.location.href = `/addPrescription.html?appointmentId=${apptId}&patientName=${patient.name}`; // Assuming addPrescription.html expects patientName
    });
  }

  return row;
}
