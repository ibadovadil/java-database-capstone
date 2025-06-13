package com.project.back_end.services;

import com.project.back_end.DTO.AppointmentDTO;
import com.project.back_end.models.Appointment;
import com.project.back_end.models.Patient;
import com.project.back_end.repo.AppointmentRepository;
import com.project.back_end.repo.PatientRepository;
import com.project.back_end.services.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final TokenService tokenService;

    @Autowired
    public PatientService(PatientRepository patientRepository,
                          AppointmentRepository appointmentRepository,
                          TokenService tokenService) {
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.tokenService = tokenService;
    }

    @Transactional
    public int createPatient(Patient patient) {
        try {
            patientRepository.save(patient);
            return 1;
        } catch (Exception e) {
            System.err.println("Error saving patient: " + e.getMessage());
            return 0;
        }
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getPatientAppointment(Long id, String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            String patientEmailFromToken = tokenService.extractUsername(token);
            Optional<Patient> patientOpt = patientRepository.findByEmail(patientEmailFromToken);

            if (patientOpt.isEmpty() || !patientOpt.get().getId().equals(id)) {
                response.put("message", "Unauthorized: Patient ID mismatch or patient not found.");
                response.put("appointments", Collections.emptyList());
                return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
            }

            List<Appointment> appointments = appointmentRepository.findByPatientId(id);
            List<AppointmentDTO> appointmentDTOs = appointments.stream()
                    .map(app -> new AppointmentDTO(
                            app.getId(),
                            app.getDoctor().getId(),
                            app.getDoctor().getName(),
                            app.getPatient().getId(),
                            app.getPatient().getName(),
                            app.getPatient().getEmail(),
                            app.getPatient().getPhone(),
                            app.getPatient().getAddress(),
                            app.getAppointmentTime(),
                            app.getStatus()
                    ))
                    .collect(Collectors.toList());

            response.put("message", "Appointments retrieved successfully.");
            response.put("appointments", appointmentDTOs);
            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            System.err.println("Error getting patient appointments: " + e.getMessage());
            response.put("message", "Internal Server Error: " + e.getMessage());
            response.put("appointments", Collections.emptyList());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> filterByCondition(String condition, Long id) {
        Map<String, Object> response = new HashMap<>();
        List<Appointment> appointments;
        int status;

        if ("past".equalsIgnoreCase(condition)) {
            status = 1;
        } else if ("upcoming".equalsIgnoreCase(condition)) {
            status = 0;
        } else {
            response.put("message", "Invalid condition provided. Use 'past' or 'upcoming'.");
            response.put("appointments", Collections.emptyList());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        try {
            appointments = appointmentRepository.findByPatient_IdAndStatusOrderByAppointmentTimeAsc(id, status);
            List<AppointmentDTO> appointmentDTOs = appointments.stream()
                    .map(app -> new AppointmentDTO(
                            app.getId(),
                            app.getDoctor().getId(),
                            app.getDoctor().getName(),
                            app.getPatient().getId(),
                            app.getPatient().getName(),
                            app.getPatient().getEmail(),
                            app.getPatient().getPhone(),
                            app.getPatient().getAddress(),
                            app.getAppointmentTime(),
                            app.getStatus()
                    ))
                    .collect(Collectors.toList());

            response.put("message", "Appointments filtered by condition successfully.");
            response.put("appointments", appointmentDTOs);
            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            System.err.println("Error filtering appointments by condition: " + e.getMessage());
            response.put("message", "Internal Server Error: " + e.getMessage());
            response.put("appointments", Collections.emptyList());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> filterByDoctor(String name, Long patientId) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Appointment> appointments = appointmentRepository.filterByDoctorNameAndPatientId(name, patientId);
            List<AppointmentDTO> appointmentDTOs = appointments.stream()
                    .map(app -> new AppointmentDTO(
                            app.getId(),
                            app.getDoctor().getId(),
                            app.getDoctor().getName(),
                            app.getPatient().getId(),
                            app.getPatient().getName(),
                            app.getPatient().getEmail(),
                            app.getPatient().getPhone(),
                            app.getPatient().getAddress(),
                            app.getAppointmentTime(),
                            app.getStatus()
                    ))
                    .collect(Collectors.toList());

            response.put("message", "Appointments filtered by doctor successfully.");
            response.put("appointments", appointmentDTOs);
            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            System.err.println("Error filtering appointments by doctor: " + e.getMessage());
            response.put("message", "Internal Server Error: " + e.getMessage());
            response.put("appointments", Collections.emptyList());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> filterByDoctorAndCondition(String condition, String name, long patientId) {
        Map<String, Object> response = new HashMap<>();
        List<Appointment> appointments;
        int status;

        if ("past".equalsIgnoreCase(condition)) {
            status = 1;
        } else if ("upcoming".equalsIgnoreCase(condition)) {
            status = 0;
        } else {
            response.put("message", "Invalid condition provided. Use 'past' or 'upcoming'.");
            response.put("appointments", Collections.emptyList());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        try {
            appointments = appointmentRepository.filterByDoctorNameAndPatientIdAndStatus(name, patientId, status);
            List<AppointmentDTO> appointmentDTOs = appointments.stream()
                    .map(app -> new AppointmentDTO(
                            app.getId(),
                            app.getDoctor().getId(),
                            app.getDoctor().getName(),
                            app.getPatient().getId(),
                            app.getPatient().getName(),
                            app.getPatient().getEmail(),
                            app.getPatient().getPhone(),
                            app.getPatient().getAddress(),
                            app.getAppointmentTime(),
                            app.getStatus()
                    ))
                    .collect(Collectors.toList());

            response.put("message", "Appointments filtered by doctor and condition successfully.");
            response.put("appointments", appointmentDTOs);
            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            System.err.println("Error filtering appointments by doctor and condition: " + e.getMessage());
            response.put("message", "Internal Server Error: " + e.getMessage());
            response.put("appointments", Collections.emptyList());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getPatientDetails(String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            String patientEmailFromToken = tokenService.extractUsername(token);
            Optional<Patient> patientOpt = patientRepository.findByEmail(patientEmailFromToken);

            if (patientOpt.isEmpty()) {
                response.put("message", "Patient not found for the given token.");
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }

            Patient patient = patientOpt.get();
            Map<String, Object> patientDetails = new HashMap<>();
            patientDetails.put("id", patient.getId());
            patientDetails.put("name", patient.getName());
            patientDetails.put("email", patient.getEmail());
            patientDetails.put("phone", patient.getPhone());
            patientDetails.put("address", patient.getAddress());

            response.put("message", "Patient details retrieved successfully.");
            response.put("patient", patientDetails);
            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            System.err.println("Error getting patient details: " + e.getMessage());
            response.put("message", "Internal Server Error: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
