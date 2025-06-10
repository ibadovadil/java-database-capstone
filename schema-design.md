# Smart Clinic Management System - Database Schema Design

## 1. MySQL Database Design (Relational Data)

The MySQL database will store structured relational data for core entities that benefit from a normalized schema, such as users, appointments, and administrative records.

### Table: `Admins`

Stores administrative user information.
-   **Purpose:** Manage system administrators.
-   **Relationships:** One-to-many with appointments (if admins can manage/create appointments).

| Column Name | Data Type    | Constraints                  | Description                 |
| :---------- | :----------- | :--------------------------- | :-------------------------- |
| `admin_id`    | `BIGINT`     | `PRIMARY KEY`, `AUTO_INCREMENT` | Unique identifier for the admin |
| `username`    | `VARCHAR(50)` | `NOT NULL`, `UNIQUE`         | Admin's username            |
| `password_hash`| `VARCHAR(255)`| `NOT NULL`                   | Hashed password for security |
| `email`       | `VARCHAR(100)`| `NOT NULL`, `UNIQUE`         | Admin's email address       |
| `full_name`   | `VARCHAR(100)`| `NOT NULL`                   | Full name of the admin      |
| `created_at`  | `TIMESTAMP`  | `DEFAULT CURRENT_TIMESTAMP`  | Timestamp when the record was created |
| `updated_at`  | `TIMESTAMP`  | `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | Timestamp of last update |

### Table: `Patients`

Stores patient demographic and contact information.
-   **Purpose:** Manage patient profiles.
-   **Relationships:** One-to-many with `Appointments` (a patient can have multiple appointments), One-to-many with `Prescriptions` (a patient can have multiple prescriptions, though prescriptions will be in MongoDB).

| Column Name | Data Type    | Constraints                  | Description                 |
| :---------- | :----------- | :--------------------------- | :-------------------------- |
| `patient_id`  | `BIGINT`     | `PRIMARY KEY`, `AUTO_INCREMENT` | Unique identifier for the patient |
| `first_name`  | `VARCHAR(50)` | `NOT NULL`                   | Patient's first name        |
| `last_name`   | `VARCHAR(50)` | `NOT NULL`                   | Patient's last name         |
| `date_of_birth`| `DATE`       | `NOT NULL`                   | Patient's date of birth     |
| `gender`      | `ENUM('Male', 'Female', 'Other')` | `NOT NULL`                   | Patient's gender            |
| `contact_number`| `VARCHAR(20)` | `UNIQUE`                     | Patient's phone number      |
| `email`       | `VARCHAR(100)`| `NOT NULL`, `UNIQUE`         | Patient's email address     |
| `address`     | `VARCHAR(255)`|                              | Patient's physical address  |
| `password_hash`| `VARCHAR(255)`| `NOT NULL`                   | Hashed password for security |
| `created_at`  | `TIMESTAMP`  | `DEFAULT CURRENT_TIMESTAMP`  | Timestamp when the record was created |
| `updated_at`  | `TIMESTAMP`  | `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | Timestamp of last update |

### Table: `Doctors`

Stores doctor profiles, including their specializations and contact details.
-   **Purpose:** Manage doctor profiles and their availability.
-   **Relationships:** One-to-many with `Appointments` (a doctor can have many appointments).

| Column Name | Data Type    | Constraints                  | Description                 |
| :---------- | :----------- | :--------------------------- | :-------------------------- |
| `doctor_id`   | `BIGINT`     | `PRIMARY KEY`, `AUTO_INCREMENT` | Unique identifier for the doctor |
| `first_name`  | `VARCHAR(50)` | `NOT NULL`                   | Doctor's first name         |
| `last_name`   | `VARCHAR(50)` | `NOT NULL`                   | Doctor's last name          |
| `specialization`| `VARCHAR(100)`| `NOT NULL`                   | Doctor's medical specialization |
| `contact_number`| `VARCHAR(20)` | `UNIQUE`                     | Doctor's phone number       |
| `email`       | `VARCHAR(100)`| `NOT NULL`, `UNIQUE`         | Doctor's email address      |
| `license_number`| `VARCHAR(50)` | `NOT NULL`, `UNIQUE`         | Medical license number      |
| `password_hash`| `VARCHAR(255)`| `NOT NULL`                   | Hashed password for security |
| `created_at`  | `TIMESTAMP`  | `DEFAULT CURRENT_TIMESTAMP`  | Timestamp when the record was created |
| `updated_at`  | `TIMESTAMP`  | `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | Timestamp of last update |

### Table: `Appointments`

Manages patient-doctor appointments.
-   **Purpose:** Store appointment details, linking patients to doctors.
-   **Relationships:** Many-to-one with `Patients` (multiple appointments for one patient), Many-to-one with `Doctors` (multiple appointments for one doctor).

| Column Name | Data Type    | Constraints                             | Description                 |
| :---------- | :----------- | :-------------------------------------- | :-------------------------- |
| `appointment_id`| `BIGINT`     | `PRIMARY KEY`, `AUTO_INCREMENT`         | Unique identifier for the appointment |
| `patient_id`  | `BIGINT`     | `NOT NULL`, `FOREIGN KEY` references `Patients(patient_id)` | Foreign key to the patient table |
| `doctor_id`   | `BIGINT`     | `NOT NULL`, `FOREIGN KEY` references `Doctors(doctor_id)`   | Foreign key to the doctor table |
| `appointment_date`| `DATE`       | `NOT NULL`                              | Date of the appointment     |
| `appointment_time`| `TIME`       | `NOT NULL`                              | Time of the appointment     |
| `status`      | `ENUM('Scheduled', 'Completed', 'Canceled')` | `NOT NULL`, `DEFAULT 'Scheduled'` | Status of the appointment   |
| `reason_for_visit`| `TEXT`       |                                         | Reason for the patient's visit |
| `created_at`  | `TIMESTAMP`  | `DEFAULT CURRENT_TIMESTAMP`             | Timestamp when the record was created |
| `updated_at`  | `TIMESTAMP`  | `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | Timestamp of last update |

## 2. MongoDB Collection Design (Document Data)

MongoDB will be used for flexible, document-based data that does not require a rigid relational schema, such as prescriptions. This allows for varying structures and rapid evolution of the document format.

### Collection: `Prescriptions`

Stores prescription details for patients. Each document represents a single prescription.
-   **Purpose:** Store detailed and potentially nested prescription records.
-   **Relationships:** One-to-many with `Patients` (a patient can have multiple prescriptions, linked by `patient_id`).

```json
[
  {
    "_id": "60d0fe3d8f8d6f001f3e7b1a", // MongoDB ObjectId
    "patient_id": 101, // Corresponds to MySQL's patient_id for linking
    "doctor_id": 201,  // Corresponds to MySQL's doctor_id for linking
    "prescription_date": "2024-05-15T10:30:00Z", // ISO 8601 format
    "medications": [
      {
        "name": "Amoxicillin",
        "dosage": "500mg",
        "frequency": "Three times a day",
        "duration_days": 7,
        "notes": "Take with food"
      },
      {
        "name": "Ibuprofen",
        "dosage": "200mg",
        "frequency": "As needed for pain",
        "duration_days": 5
      }
    ],
    "diagnosis": "Bacterial Sinusitis",
    "instructions": "Complete the full course of antibiotics. Rest well.",
    "notes": "Patient reported fever and congestion.",
    "follow_up_date": "2024-05-22T09:00:00Z", // Optional follow-up
    "created_at": "2024-05-15T10:35:00Z"
  },
  {
    "_id": "60d0fe3d8f8d6f001f3e7b1b",
    "patient_id": 102,
    "doctor_id": 202,
    "prescription_date": "2024-05-16T14:00:00Z",
    "medications": [
      {
        "name": "Lisinopril",
        "dosage": "10mg",
        "frequency": "Once daily",
        "duration_days": 30
      }
    ],
    "diagnosis": "Hypertension",
    "instructions": "Monitor blood pressure regularly.",
    "created_at": "2024-05-16T14:05:00Z"
  }
]
