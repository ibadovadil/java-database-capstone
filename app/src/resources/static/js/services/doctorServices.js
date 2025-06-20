import BASE_API from '../config/config.js';

const DOCTOR_API = `${BASE_API}/doctor`;

export async function getDoctors() {
  try {
    const response = await fetch(DOCTOR_API);
    if (response.ok) {
      const data = await response.json();
      return data.doctors || [];
    } else {
      console.error('Couldn\'t retrieve doctors from the API. Status:', response.status);
      return [];
    }
  } catch (error) {
    console.error('Network error occurred while fetching doctors:', error);
    return [];
  }
}

export async function deleteDoctor(id, token) {
  const url = `${DOCTOR_API}/${id}/${token}`;
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const result = await response.json();
    if (response.ok) {
      return { success: true, message: result.message || 'Deletion successful.' };
    } else {
      console.error('API error occurred while deleting doctor:', response.status, result.message);
      return { success: false, message: result.message || 'Deletion failed.' };
    }
  } catch (error) {
    console.error('Network error occurred while deleting doctor:', error);
    return { success: false, message: 'Network error: Deletion failed.' };
  }
}

export async function saveDoctor(doctor, token) {
  const url = `${DOCTOR_API}/doctor/add/${token}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(doctor)
    });

    let data = {};
    try {
      data = await response.json();
    } catch (jsonErr) {
      console.warn("Failed to parse JSON response.");
    }

    if (!response.ok) {
      console.error("Server returned an error status:", response.status);
      console.error("Server error body:", data);
      return { success: false, message: data.message || "Unknown server error" };
    }

    return { success: true, message: data.message || "Doctor successfully added." };
  } catch (error) {
    console.error("Network or fetch error occurred:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

export async function filterDoctors(name = '', time = '', specialty = '') {
  try {
    const url = `${DOCTOR_API}/filter/${name || 'null'}/${time || 'null'}/${specialty || 'null'}`;
    const response = await fetch(url);
    if (response.ok) {
      const result = await response.json();
      return Array.isArray(result) ? result : result.doctors || [];
    } else {
      console.error('Failed to filter doctors.');
      return [];
    }
  } catch (error) {
    console.error('Error occurred while filtering doctors:', error);
    alert('Something went wrong while filtering doctors.');
    return [];
  }
}