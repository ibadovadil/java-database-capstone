# User Stories for Patient Appointment Portal

---

## Admin User Stories

### User Story 1
**Title:**  
_As an Admin, I want to log into the portal with my username and password, so that I can securely manage the platform._

**Acceptance Criteria:**
1. Given a valid username and password, when I log in, then I should be granted access to the admin dashboard.
2. Given an invalid username or password, when I attempt to log in, then I should receive an error message.
3. Given a successful login, when I navigate to the dashboard, then I should see management options.

**Priority:** High  
**Story Points:** 3  
**Notes:** Admin authentication must be secure (OAuth or JWT recommended).

---

### User Story 2
**Title:**  
_As an Admin, I want to log out of the portal, so that I can protect the system access._

**Acceptance Criteria:**
1. Given I am logged in, when I click the logout button, then I should be logged out and redirected to the login page.

**Priority:** High  
**Story Points:** 2  
**Notes:** Session must be invalidated.

---

### User Story 3
**Title:**  
_As an Admin, I want to add a doctor to the portal, so that the doctor can manage appointments._

**Acceptance Criteria:**
1. Given valid doctor details, when I submit the add doctor form, then the doctor profile should be created and visible.

**Priority:** High  
**Story Points:** 5  
**Notes:** Email uniqueness must be validated.

---

### User Story 4
**Title:**  
_As an Admin, I want to delete a doctor's profile from the portal, so that I can manage system users._

**Acceptance Criteria:**
1. Given an existing doctor, when I delete the profile, then it should no longer be accessible in the portal.

**Priority:** Medium  
**Story Points:** 3  
**Notes:** Deletion must be soft delete to preserve historical appointment data.

---

### User Story 5
**Title:**  
_As an Admin, I want to run a stored procedure in MySQL CLI to get monthly appointment stats, so that I can monitor portal usage._

**Acceptance Criteria:**
1. Given I run the stored procedure, when execution completes, then I should receive a report of monthly appointments.

**Priority:** Low  
**Story Points:** 5  
**Notes:** The stored procedure must return data in a consistent format.

---

## Patient User Stories

### User Story 1
**Title:**  
_As a Patient, I want to view the list of doctors without logging in, so that I can explore options before registration._

**Acceptance Criteria:**
1. Given I visit the public portal, when I navigate to doctors list, then I should see available doctors.

**Priority:** High  
**Story Points:** 3

---

### User Story 2
**Title:**  
_As a Patient, I want to register using my email and password, so that I can book appointments._

**Acceptance Criteria:**
1. Given valid email and password, when I register, then my account should be created and I should be logged in.

**Priority:** High  
**Story Points:** 5

---

### User Story 3
**Title:**  
_As a Patient, I want to log into the portal, so that I can manage my appointments._

**Acceptance Criteria:**
1. Given valid credentials, when I log in, then I should access my dashboard.

**Priority:** High  
**Story Points:** 3

---

### User Story 4
**Title:**  
_As a Patient, I want to log out of the portal, so that I can secure my account._

**Acceptance Criteria:**
1. Given I am logged in, when I log out, then my session should end.

**Priority:** High  
**Story Points:** 2

---

### User Story 5
**Title:**  
_As a Patient, I want to book a one-hour appointment with a doctor, so that I can consult with them._

**Acceptance Criteria:**
1. Given I am logged in, when I select a doctor and time, then the appointment should be created.

**Priority:** High  
**Story Points:** 5

---

### User Story 6
**Title:**  
_As a Patient, I want to view my upcoming appointments, so that I can prepare for them._

**Acceptance Criteria:**
1. Given I am logged in, when I view upcoming appointments, then I should see a list of future appointments.

**Priority:** Medium  
**Story Points:** 3

---

## Doctor User Stories

### User Story 1
**Title:**  
_As a Doctor, I want to log into the portal, so that I can manage my appointments._

**Acceptance Criteria:**
1. Given valid credentials, when I log in, then I should access my dashboard.

**Priority:** High  
**Story Points:** 3

---

### User Story 2
**Title:**  
_As a Doctor, I want to log out of the portal, so that I can protect my data._

**Acceptance Criteria:**
1. Given I am logged in, when I log out, then my session should end.

**Priority:** High  
**Story Points:** 2

---

### User Story 3
**Title:**  
_As a Doctor, I want to view my appointment calendar, so that I can stay organized._

**Acceptance Criteria:**
1. Given I am logged in, when I navigate to my calendar, then I should see my scheduled appointments.

**Priority:** High  
**Story Points:** 5

---

### User Story 4
**Title:**  
_As a Doctor, I want to mark myself as unavailable, so that patients can only book available times._

**Acceptance Criteria:**
1. Given I am logged in, when I update my availability, then patients should see only available slots.

**Priority:** High  
**Story Points:** 5

---

### User Story 5
**Title:**  
_As a Doctor, I want to update my profile with specialization and contact details, so that patients have accurate information._

**Acceptance Criteria:**
1. Given I am logged in, when I update my profile, then changes should reflect in the public doctor listing.

**Priority:** Medium  
**Story Points:** 4

---

### User Story 6
**Title:**  
_As a Doctor, I want to view patient information for upcoming appointments, so that I can prepare accordingly._

**Acceptance Criteria:**
1. Given I am logged in, when I view upcoming appointments, then I should see relevant patient details.

**Priority:** High  
**Story Points:** 4

---
