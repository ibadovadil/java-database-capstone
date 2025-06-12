// patientRecordRow.js

export function createPatientRecordRow(patient) {
  const row = document.createElement('tr');

  row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${patient.appointmentDate || 'N/A'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${patient.id || 'N/A'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${patient.patientId || 'N/A'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <img src="/assets/icons/prescription-icon.svg" alt="Prescription" class="prescription-btn cursor-pointer w-6 h-6 inline-block" data-id="${patient.id}">
        </td>
    `;

  const prescriptionButton = row.querySelector('.prescription-btn');
  if (prescriptionButton) {
    prescriptionButton.addEventListener('click', () => {
      const appointmentId = prescriptionButton.dataset.id;
      window.location.href = `/addPrescription.html?mode=view&appointmentId=${appointmentId}&patientName=${patient.name}`; // Also passing patient name for view mode
    });
  }

  return row;
}
