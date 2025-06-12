// import { BASE_API_URL } from '../config.js';
export const PATIENT_API = '/patient';


export async function patientSignup(data) {
  try {
    const response = await fetch(`${PATIENT_API}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Registration failed.');
    }

    return { success: true, message: result.message || 'Registration completed successfully.' };

  } catch (error) {
    console.error("Patient registration error:", error);
    return { success: false, message: error.message || 'Network error: Registration failed.' };
  }
}


export async function patientLogin(data) {
  try {
    const response = await fetch(`${PATIENT_API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    return response;
  } catch (error) {
    console.error("Patient login error:", error);
    throw error;
  }
}


export async function getPatientData(token) {
  const url = `${PATIENT_API}?token=${token}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      const patient = await response.json();
      return patient;
    } else {
      console.error('API error while retrieving patient data. Status:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Network error while retrieving patient data:', error);
    return null;
  }
}


export async function getPatientAppointments(id, token, user) {
  const url = `${PATIENT_API}/${id}/appointments/${user}?token=${token}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      const appointments = await response.json();
      return appointments;
    } else {
      console.error('API error while retrieving appointments. Status:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Network error while retrieving appointments:', error);
    return null;
  }
}


export async function filterAppointments(condition, name, token) {
  const url = `${PATIENT_API}/filter/${condition}/${name}?token=${token}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      const filteredAppointments = await response.json();
      return filteredAppointments;
    } else {
      console.error('API error while filtering appointments. Status:', response.status);
      alert('An error occurred while filtering appointments. Please try again.');
      return [];
    }
  } catch (error) {
    console.error('Network error occurred while filtering appointments:', error);
    alert('Network error: Appointments could not be filtered. Please try again.');
    return [];
  }
}

/*
  Import the base API URL from the config file
  Create a constant named PATIENT_API by appending '/patient' to the base URL


  Function  patientSignup
  Purpose  Register a new patient in the system

     Send a POST request to PATIENT_API with 
    - Headers  Content-Type set to 'application/json'
    - Body  JSON.stringify(data) where data includes patient details

    Convert the response to JSON and check for success
    - If response is not OK, throw an error with the message from the server

    Return an object with 
    - success  true or false
    - message  feedback from the server

    Use try-catch to handle network or API errors
    - Log errors and return a failure response with the error message


  Function  patientLogin
  Purpose  Authenticate a patient with email and password

     Send a POST request to `${PATIENT_API}/login`
    - Include appropriate headers and the login data in JSON format

    Return the raw fetch response to be handled where the function is called
    - The caller will check the response status and process the token or error


  Function  getPatientData
  Purpose  Fetch basic patient information using a token

     Send a GET request to `${PATIENT_API}/${token}`
    Parse the response and return the 'patient' object if response is OK
    If there's an error or the response is not OK, return null
    Catch and log any network or server errors


  Function  getPatientAppointments
  Purpose  Retrieve appointment data for a specific user (doctor or patient)

     Send a GET request to `${PATIENT_API}/${id}/${user}/${token}`
    - 'id' is the user’s ID, 'user' is either 'doctor' or 'patient', and 'token' is for auth

    Parse the response and return the 'appointments' array if successful
    If the response fails or an error occurs, return null
    Log any errors for debugging


  Function  filterAppointments
  Purpose  Retrieve filtered appointments based on condition and patient name

   Send a GET request to `${PATIENT_API}/filter/${condition}/${name}/${token}`
    - This allows filtering based on status or search criteria

   Parse the response if it's OK and return the data
   If the response fails, return an empty appointments array
   Use a try-catch to handle errors gracefully and notify the user
*/
