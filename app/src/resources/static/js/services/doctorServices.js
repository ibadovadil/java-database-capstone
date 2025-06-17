// const DOCTOR_API = `${BASE_API_URL}/doctor`; // Eğer BASE_API_URL olsaydı
export const DOCTOR_API = '/doctor';


export async function getDoctors() {
    try {
        const response = await fetch(DOCTOR_API);
        if (response.ok) {
            const doctors = await response.json();
            return doctors;
        } else {
            console.error('Could not get doctors from API. Status:', response.status);
            return [];
        }
    } catch (error) {
        console.error('Network error occurred while fetching doctors:', error);
        return [];
    }
}


export async function deleteDoctor(id, token) {
    const url = `${DOCTOR_API}/${id}?token=${token}`;
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
            console.error('API error while deleting doctor:', response.status, result.message);
            return { success: false, message: result.message || 'Deletion failed.' };
        }
    } catch (error) {
        console.error('Network error occurred while deleting doctor:', error);
        return { success: false, message: 'Network error: Deletion failed.' };
    }
}


export async function saveDoctor(doctor, token) {
    const url = `${DOCTOR_API}?token=${token}`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doctor)
        });
        const result = await response.json();
        if (response.ok) {
            return { success: true, message: result.message || 'Doctor saved successfully.', data: result };
        } else {
            console.error('API error while saving doctor:', response.status, result.message);
            return { success: false, message: result.message || 'Doctor save failed.' };
        }
    } catch (error) {
        console.error('Network error while saving doctor:', error);
        return { success: false, message: 'Network error: Doctor save failed.' };
    }
}


export async function filterDoctors(name, time, specialty) {
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (time) params.append('time', time);
    if (specialty) params.append('specialty', specialty);

    const url = `${DOCTOR_API}/filter?${params.toString()}`;
    try {
        const response = await fetch(url);
        if (response.ok) {
            const filteredDoctors = await response.json();
            return filteredDoctors;
        } else {
            console.error('API error while filtering doctors. Status:', response.status);
            alert('An error occurred while filtering doctors. Please try again.');
            return [];
        }
    } catch (error) {
        console.error('Network error occurred while filtering doctors:', error);
        alert('A network error occurred while filtering doctors. Please try again.');
        return [];
    }
}