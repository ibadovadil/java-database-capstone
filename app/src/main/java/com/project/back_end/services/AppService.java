package com.project.back_end.services;

import com.project.back_end.DTO.Login;
import com.project.back_end.models.*;
import com.project.back_end.repo.AdminRepository;
import com.project.back_end.repo.AppointmentRepository;
import com.project.back_end.repo.DoctorRepository;
import com.project.back_end.repo.PatientRepository;
import com.project.back_end.services.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AppService {

    private final TokenService tokenService;
    private final AdminRepository adminRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final DoctorService doctorService;
    private final PatientService patientService;
    private final AppointmentRepository appointmentRepository;

    @Autowired
    public AppService(TokenService tokenService,
                      AdminRepository adminRepository,
                      DoctorRepository doctorRepository,
                      PatientRepository patientRepository,
                      DoctorService doctorService,
                      PatientService patientService,
                      AppointmentRepository appointmentRepository) {
        this.tokenService = tokenService;
        this.adminRepository = adminRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.doctorService = doctorService;
        this.patientService = patientService;
        this.appointmentRepository = appointmentRepository;
    }

    // patientService için getter metodu eklendi
    public PatientService getPatientService() {
        return patientService;
    }

    // tokenService için getter metodu eklendi (eğer AppointmentController'da doğrudan kullanılıyorsa)
    public TokenService getTokenService() {
        return tokenService;
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, String>> validateToken(String token, String user) {
        Map<String, String> response = new HashMap<>();
        try {
            if (!tokenService.validateToken(token, user)) {
                response.put("message", "Unauthorized: Invalid or expired token for user role.");
                return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
            }
            response.put("message", "Token is valid.");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Token validation error: " + e.getMessage());
            response.put("message", "Internal Server Error: Token validation failed - " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, String>> validateAdmin(Admin receivedAdmin) {
        Map<String, String> response = new HashMap<>();
        try {
            Optional<Admin> adminOpt = adminRepository.findByUsername(receivedAdmin.getUsername());
            if (adminOpt.isPresent()) {
                Admin admin = adminOpt.get();
                if (admin.getPassword().equals(receivedAdmin.getPassword())) {
                    String token = tokenService.generateToken(admin.getUsername(), "admin");
                    response.put("token", token);
                    response.put("message", "Admin login successful.");
                    return new ResponseEntity<>(response, HttpStatus.OK);
                } else {
                    response.put("message", "Unauthorized: Incorrect password.");
                    return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
                }
            } else {
                response.put("message", "Unauthorized: Admin not found.");
                return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
            }
        } catch (Exception e) {
            System.err.println("Admin login error: " + e.getMessage());
            response.put("message", "Internal Server Error: Admin login failed - " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> filterDoctor(String name, String specialty, String time) {
        boolean hasName = name != null && !name.isEmpty();
        boolean hasSpecialty = specialty != null && !specialty.isEmpty();
        boolean hasTime = time != null && !time.isEmpty();

        if (hasName && hasSpecialty && hasTime) {
            return doctorService.filterDoctorsByNameSpecilityandTime(name, specialty, time);
        } else if (hasName && hasSpecialty) {
            return doctorService.filterDoctorByNameAndSpecility(name, specialty);
        } else if (hasName && hasTime) {
            return doctorService.filterDoctorByNameAndTime(name, time);
        } else if (hasName) {
            return doctorService.findDoctorByName(name);
        } else if (hasSpecialty && hasTime) {
            return doctorService.filterDoctorByTimeAndSpecility(specialty, time);
        } else if (hasSpecialty) {
            return doctorService.filterDoctorBySpecility(specialty);
        } else if (hasTime) {
            return doctorService.filterDoctorsByTime(time);
        } else {
            return doctorService.getDoctors();
        }
    }

    @Transactional(readOnly = true)
    public int validateAppointment(String doctorId, String appointmentDateStr, String appointmentTimeStr) {
        Long docIdLong = Long.valueOf(doctorId);
        Optional<Doctor> doctorOpt = doctorRepository.findById(docIdLong);
        if (doctorOpt.isEmpty()) {
            return -1;
        }

        LocalDate appDate = LocalDate.parse(appointmentDateStr);
        LocalTime appTime = LocalTime.parse(appointmentTimeStr);

        List<String> availableSlots = doctorService.getDoctorAvailability(docIdLong, appDate);

        String requestedTimeFormatted = appTime.toString();

        boolean isTimeSlotAvailableInDoctorSchedule = availableSlots.stream()
                .anyMatch(slot -> slot.startsWith(requestedTimeFormatted));

        if (!isTimeSlotAvailableInDoctorSchedule) {
            return 0;
        }

        boolean isAlreadyBooked = appointmentRepository.findByDoctorIdAndAppointmentDateAndAppointmentTime(
                docIdLong, appDate, appTime).isPresent();

        if (isAlreadyBooked) {
            return 0;
        }

        return 1;
    }

    @Transactional(readOnly = true)
    public boolean validatePatient(Patient patient) {
        Optional<Patient> existingPatient = patientRepository.findByEmailOrPhone(patient.getEmail(), patient.getPhone());
        return existingPatient.isEmpty();
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, String>> validatePatientLogin(Login login) {
        Map<String, String> response = new HashMap<>();
        try {
            Optional<Patient> patientOpt = patientRepository.findByEmail(login.getEmail());
            if (patientOpt.isPresent()) {
                Patient patient = patientOpt.get();
                if (patient.getPassword().equals(login.getPassword())) {
                    String token = tokenService.generateToken(patient.getEmail(), "patient");
                    response.put("token", token);
                    response.put("message", "Patient login successful.");
                    return new ResponseEntity<>(response, HttpStatus.OK);
                } else {
                    response.put("message", "Unauthorized: Incorrect password.");
                    return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
                }
            } else {
                response.put("message", "Unauthorized: Patient not found.");
                return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
            }
        } catch (Exception e) {
            System.err.println("Patient login error: " + e.getMessage());
            response.put("message", "Internal Server Error: Patient login failed - " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> filterPatient(String condition, String name, String token) {
        String patientEmail = tokenService.extractUsername(token);
        Optional<Patient> patientOpt = patientRepository.findByEmail(patientEmail);

        if (patientOpt.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Unauthorized: Patient not found for the given token.");
            response.put("appointments", Collections.emptyList());
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }
        Long patientId = patientOpt.get().getId();

        boolean hasCondition = condition != null && !condition.isEmpty();
        boolean hasName = name != null && !name.isEmpty();

        if (hasCondition && hasName) {
            return patientService.filterByDoctorAndCondition(condition, name, patientId);
        } else if (hasCondition) {
            return patientService.filterByCondition(condition, patientId);
        } else if (hasName) {
            return patientService.filterByDoctor(name, patientId);
        } else {
            return patientService.getPatientAppointment(patientId, token);
        }
    }
}
