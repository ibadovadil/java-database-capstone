const renderHeader = () => {
  const headerDiv = document.getElementById('header');

  if (!headerDiv) {
    console.log("HeaderDiv not found !")
  }

  if (window.location.pathname.endsWith("/")) {
    localStorage.removeItem("userRole");
    // localStorage.removeItem("token"); optional 

    headerDiv.innerHTML = `<header class="header">
             <div class="logo-section">
               <img src="../assets/images/logo/logo.png" alt="Hospital CRM Logo" class="logo-img">
               <span class="logo-title">Hospital CMS</span>
             </div>
           </header>`;
    return;
  }
  const role = localStorage.getItem("userRole");
  const token = localStorage.getItem("token");

  let headerContent = `<header class="header">
    <div class="logo-section">
      <img src="assets/images/logo/logo.png" alt="Hospital CRM Logo" class="logo-img">
      <span class="logo-title">Hospital CMS</span>
    </div>
    <nav>`;

  if ((role === "loggedPatient" || role === "admin" || role === "doctor") && !token) {
    localStorage.removeItem("userRole");
    localStorage.removeItem("token"); //****** */
    alert("Session expired or invalid login. Please log in again.");
    window.location.href = "/";
    return;
  }
  else if (role === "admin") {
    headerContent += `
           <button id="addDocBtn" class="adminBtn" onclick="openModal('addDoctor')">Add Doctor</button>
           <a href="#" onclick="logout()">Logout</a>`;
  }
  else if (role === "doctor") {
    headerContent += `
           <button class="adminBtn"  onclick="selectRole('doctor')">Home</button>
           <a href="#" onclick="logout()">Logout</a>`;
  }
  else if (role === "patient") {
    headerContent += `
           <button id="patientLogin" class="adminBtn">Login</button>
           <button id="patientSignup" class="adminBtn">Sign Up</button>`;
  }
  else if (role === "loggedPatient") {
    headerContent += `
           <button id="home" class="adminBtn" onclick="window.location.href='/pages/loggedPatientDashboard.html'">Home</button>
           <button id="patientAppointments" class="adminBtn" onclick="window.location.href='/pages/patientAppointments.html'">Appointments</button>
           <a href="#" onclick="logoutPatient()">Logout</a>`;
  }
  else { //optional;
    headerContent += `
        <button id="loginBtn" class="nav-btn">Login</button>
        <button id="signupBtn" class="nav-btn">Sign Up</button>
    `;
}
  headerContent += `</nav></header>`;

  headerDiv.innerHTML = headerContent;
  attachHeaderButtonListeners();


  //Helper Functions

  const attachHeaderButtonListeners = () => {
    const addDocBtn = document.getElementById("addDocBtn");
    const adminLogoutLink = document.getElementById("adminLogoutLink");
    const doctorHomeBtn = document.getElementById("doctorHomeBtn");
    const doctorLogoutLink = document.getElementById("doctorLogoutLink");
    const patientSignupBtn = document.getElementById("patientSignupBtn");
    const loggedPatientHomeBtn = document.getElementById("loggedPatientHomeBtn");
    const patientAppointmentsBtn = document.getElementById("patientAppointmentsBtn");
    const loggedPatientLogoutLink = document.getElementById("loggedPatientLogoutLink");
    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");

    if (addDocBtn) {
      addDocBtn.addEventListener("click", () => openModal('addDoctor'));
    }
    if (adminLogoutLink) {
      adminLogoutLink.addEventListener("click", (e) => {
        e.preventDefault(); 
        logout('admin');
      });
    }
    if (doctorHomeBtn) {
      doctorHomeBtn.addEventListener("click", () => {
        window.location.href = "/doctorDashboard.html";
      });
    }
    if (doctorLogoutLink) {
      doctorLogoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        logout('doctor');
      });
    }
    if (patientLoginBtn) { 
      patientLoginBtn.addEventListener("click", () => openModal('login'));
    }
    if (patientSignupBtn) { 
      patientSignupBtn.addEventListener("click", () => openModal('signup'));
    }
    if (loggedPatientHomeBtn) { 
      loggedPatientHomeBtn.addEventListener("click", () => {
        window.location.href = "/patientDashboard.html"; 
      });
    }
    if (patientAppointmentsBtn) {
      patientAppointmentsBtn.addEventListener("click", () => {
        window.location.href = "/patientAppointments.html";
      });
    }
    if (loggedPatientLogoutLink) {
      loggedPatientLogoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        logoutPatient();
      });
    }
    if (loginBtn) { 
      loginBtn.addEventListener("click", () => openModal('login'));
    }
    if (signupBtn) {
      signupBtn.addEventListener("click", () => openModal('signup'));
    }
  };

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  alert("You have been logged out.");
  window.location.href = "/"; 
};


const logoutPatient = () => {
  localStorage.removeItem("token");
  localStorage.setItem("userRole", "patient");
  alert("You have been logged out.");
  window.location.href = "/patientDashboard.html"; 
};

}

//TODO: 16. **Render the Header**: Finally, the `renderHeader()` function is called to initialize the header rendering process when the page loads.
// renderHeader() funksiyasının özü bu faylda təyin olunur, lakin səhifə yüklənəndə çağırılması
// render.js faylındakı `renderContent()` funksiyası vasitəsilə həyata keçirilir.
