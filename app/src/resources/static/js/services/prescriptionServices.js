import API_BASE_URL from '../config/config.js';

const PRESCRIPTION_API = `${API_BASE_URL}/prescription`;

export async function savePrescription(prescription, token) {
  try {
    const response = await fetch(`${PRESCRIPTION_API}/${token}`, {
      method: "POST",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify(prescription)
    });
    const result = await response.json();
    return { success: response.ok, message: result.message };
  } catch (error) {
    console.error("Error saving prescription:", error);
    return { success: false, message: "Something went wrong while saving the prescription." };
  }
}

export async function getPrescription(appointmentId, token) {
  try {
    const response = await fetch(`${PRESCRIPTION_API}/${appointmentId}/${token}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to fetch prescription:", errorData);
      throw new Error(errorData.message || "Unable to fetch prescription.");
    }

    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error("Error getting prescription:", error);
    throw error;
  }
}