import API_BASE_URI from '../config/config.js';

const APPOINTMENT_API = `${API_BASE_URI}/appointments`;

export async function getAllAppointments(date, patientName, token) {
  const response = await fetch(`${APPOINTMENT_API}/${date}/${patientName}/${token}`);

  if (!response.ok) {
    throw new Error("Failed to fetch appointments");
  }

  const data = await response.json();
  console.log("JSON response from API:", data);

  return data;
}

export async function bookAppointment(appointment, token) {
  try {
    const response = await fetch(`${APPOINTMENT_API}/${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(appointment)
    });

    const data = await response.json();
    return {
      success: response.ok,
      message: data.message || "Something went wrong"
    };
  } catch (error) {
    console.error("Error while booking appointment:", error);
    return {
      success: false,
      message: "Network error. Please try again later."
    };
  }
}

export async function updateAppointment(appointment, token) {
  try {
    const response = await fetch(`${APPOINTMENT_API}/${token}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(appointment)
    });

    const data = await response.json();
    return {
      success: response.ok,
      message: data.message || "Something went wrong"
    };
  } catch (error) {
    console.error("Error while updating appointment:", error);
    return {
      success: false,
      message: "Network error. Please try again later."
    };
  }
}