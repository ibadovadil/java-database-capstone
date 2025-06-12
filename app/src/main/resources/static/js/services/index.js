import { openModal } from '../components/modals';
import { selectRole } from '../render.js';
const ADMIN_API = '/admin';
const DOCTOR_API = '/doctor/login';

window.onload = function () {
  const adminLoginBtn = document.getElementById('adminLoginBtn');
  const doctorLoginBtn = document.getElementById('doctorLoginBtn');

  if (adminLoginBtn) {
    adminLoginBtn.addEventListener('click', () => {
      openModal('adminLogin');
    });
  }

  if (doctorLoginBtn) {
    doctorLoginBtn.addEventListener('click', () => {
      openModal('doctorLogin');
    });
  }

};

window.adminLoginHandler = async () => {
  const usernameInput = document.getElementById('adminUsername');
  const passwordInput = document.getElementById('adminPassword');

  const username = usernameInput ? usernameInput.value : '';
  const password = passwordInput ? passwordInput.value : '';

  if (!username || !password) {
    alert("Username and password cannot be blank!");
    return;
  }

  const admin = { username, password };

  try {
    const response = await fetch(ADMIN_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(admin)
    });

    if (response.ok) {
      const result = await response.json();
      localStorage.setItem('token', result.token);
      selectRole('admin');
    } else {
      alert("Invalid username or password!");
    }
  } catch (error) {
    console.error("An error occurred during the login request:", error);
    alert("An error occurred. Please try again!");
  }
};

window.doctorLoginHandler = async () => {
  const emailInput = document.getElementById('doctorEmail');
  const passwordInput = document.getElementById('doctorPassword');

  const email = emailInput ? emailInput.value : '';
  const password = passwordInput ? passwordInput.value : '';

  if (!email || !password) {
    alert("Email and password cannot be blank!");
    return;
  }

  const doctor = { email, password };

  try {
    const response = await fetch(DOCTOR_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doctor)
    });

    if (response.ok) {
      const result = await response.json();
      localStorage.setItem('token', result.token);
      selectRole('doctor');
    } else {
      alert("Invalid username or password!");
    }
  } catch (error) {
    console.error("An error occurred during the login request:", error);
    alert("An error occurred. Please try again!");
  }
};

