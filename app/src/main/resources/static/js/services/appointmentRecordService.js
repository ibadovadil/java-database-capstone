
export const APPOINTMENT_API = '/appointments'; 


export async function getAllAppointments(date, patientName, token) {
  const url = `${APPOINTMENT_API}/date/${date}/patient/${patientName}/token/${token}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Server error' }));
      throw new Error(errorData.message || `Failed to fetch appointments with status: ${response.status}`);
    }

    const appointments = await response.json();
    return appointments;

  } catch (error) {
    console.error("Error in getAllAppointments:", error.message);
    throw error; 
  }
}


export async function bookAppointment(appointment, token) {
  const url = `${APPOINTMENT_API}/book?token=${token}`;

  try {
    const response = await fetch(url, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(appointment)
    });

    const result = await response.json();

    if (response.ok) {
      return { success: true, message: result.message || 'Appointment booked successfully.' };
    } else {
      return { success: false, message: result.message || 'Failed to book appointment.' };
    }
  } catch (error) {
    console.error("Error in bookAppointment:", error.message);
    return { success: false, message: 'Network error: Failed to book appointment.' };
  }
}


export async function updateAppointment(appointment, token) {
  const url = `${APPOINTMENT_API}/update?token=${token}`; 

  try {
    const response = await fetch(url, {
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(appointment) 
    });

    const result = await response.json();

    if (response.ok) {
      return { success: true, message: result.message || 'Appointment updated successfully.' };
    } else {
      return { success: false, message: result.message || 'Failed to update appointment.' };
    }
  } catch (error) {
    console.error("Error in updateAppointment:", error.message);
    return { success: false, message: 'Network error: Failed to update appointment.' };
  }
}
