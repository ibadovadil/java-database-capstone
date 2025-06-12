// appointmentRow.js

export function getAppointments(appointment) {
  const row = document.createElement('tr');
  row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${appointment.patientName || 'N/A'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${appointment.doctorName || 'N/A'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${appointment.appointmentDate || 'N/A'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${appointment.appointmentTime || 'N/A'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <img src="/assets/icons/edit-icon.svg" alt="Edit" class="prescription-btn cursor-pointer w-6 h-6 inline-block" data-id="${appointment.id}">
        </td>
    `;

  const editButton = row.querySelector('.prescription-btn');
  if (editButton) {
    editButton.addEventListener('click', () => {
      const appointmentId = editButton.dataset.id;
      window.location.href = `/addPrescription.html?appointmentId=${appointmentId}&mode=add&patientName=${appointment.patientName}`;
    });
  }

  return row;
}
