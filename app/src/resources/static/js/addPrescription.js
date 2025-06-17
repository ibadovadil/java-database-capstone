
import { savePrescription, getPrescription } from './services/appointmentRecordService.js';
import { selectRole } from './render.js'; 

document.addEventListener('DOMContentLoaded', async () => {
  const headingElement = document.getElementById('prescriptionHeading');
  const patientNameInput = document.getElementById('patientNameInput');
  const medicationInput = document.getElementById('medication');
  const dosageInput = document.getElementById('dosage');
  const notesInput = document.getElementById('notes');
  const saveButton = document.getElementById('savePrescriptionBtn');

  const urlParams = new URLSearchParams(window.location.search);
  const appointmentId = urlParams.get('appointmentId');
  const mode = urlParams.get('mode'); 
  const patientName = urlParams.get('patientName');

  const token = localStorage.getItem('token');

  if (headingElement) {
    if (mode === 'view') {
      headingElement.textContent = "View Prescription";
    } else {
      headingElement.textContent = "Add Prescription";
    }
  }

  if (patientName && patientNameInput) {
    patientNameInput.value = patientName;
    patientNameInput.readOnly = true; 
  }

  if (appointmentId && token) {
    try {
      const prescriptionData = await getPrescription(appointmentId, token);
      if (prescriptionData) {
        medicationInput.value = prescriptionData.medication || '';
        dosageInput.value = prescriptionData.dosage || '';
        notesInput.value = prescriptionData.notes || '';
      }
    } catch (error) {
      console.error("Error fetching prescription:", error);
    }
  }

  if (mode === 'view') {
    if (medicationInput) medicationInput.readOnly = true;
    if (dosageInput) dosageInput.readOnly = true;
    if (notesInput) notesInput.readOnly = true;

    if (saveButton) saveButton.style.display = 'none';
  }

  if (saveButton) {
    saveButton.addEventListener('click', async (event) => {
      event.preventDefault();

      const prescription = {
        appointmentId: appointmentId,
        patientName: patientName,
        medication: medicationInput.value,
        dosage: dosageInput.value,
        notes: notesInput.value,
      };

      if (!prescription.medication || !prescription.dosage) {
        alert("Medication and Dosage are required.");
        return;
      }

      try {
        const result = await savePrescription(prescription, token);

        if (result.success) {
          alert(result.message || "Prescription saved successfully!"); // Show a success alert
          selectRole('doctor');
        } else {
          alert(result.message || "Failed to save prescription.");
        }
      } catch (error) {
        console.error("Error saving prescription:", error);
        alert("An unexpected error occurred while saving the prescription. Please try again.");
      }
    });
  }
});
