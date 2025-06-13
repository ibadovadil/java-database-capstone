package com.project.back_end.services;

import com.project.back_end.DTO.AppointmentDTO;
import com.project.back_end.models.Appointment;
import com.project.back_end.models.Doctor;
import com.project.back_end.models.Patient;
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
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final TokenService tokenService;
    private final AppService appService;

    @Autowired
    public AppointmentService(AppointmentRepository appointmentRepository,
                              DoctorRepository doctorRepository,
                              PatientRepository patientRepository,
                              TokenService tokenService,
                              AppService appService) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.tokenService = tokenService;
        this.appService = appService;
    }

    @Transactional
    public int bookAppointment(Appointment appointment) {
        try {
            appointmentRepository.save(appointment);
            return 1;
        } catch (Exception e) {
            System.err.println("Error saving appointment: " + e.getMessage());
            return 0;
        }
    }

    @Transactional
    public ResponseEntity<Map<String, String>> updateAppointment(Long appointmentId, Appointment updatedAppointment, Long patientId) {
        Map<String, String> response = new HashMap<>();
        Optional<Appointment> optionalAppointment = appointmentRepository.findById(appointmentId);
        if (optionalAppointment.isEmpty()) {
            response.put("message", "Appointment not found.");
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }

        Appointment existingAppointment = optionalAppointment.get();
        if (!existingAppointment.getPatient().getId().equals(patientId)) {
            response.put("message", "Unauthorized to update this appointment.");
            return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
        }

        int validationResult = appService.validateAppointment(
                String.valueOf(updatedAppointment.getDoctor().getId()),
                updatedAppointment.getAppointmentTime().toLocalDate().toString(),
                updatedAppointment.getAppointmentTime().toLocalTime().toString()
        );

        if (validationResult == -1) {
            response.put("message", "Doctor not found.");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        } else if (validationResult == 0) {
            response.put("message", "Selected appointment time is not available or already taken.");
            return new ResponseEntity<>(response, HttpStatus.CONFLICT);
        }

        existingAppointment.setAppointmentTime(updatedAppointment.getAppointmentTime());

        Optional<Doctor> doctorOpt = doctorRepository.findById(updatedAppointment.getDoctor().getId());
        doctorOpt.ifPresent(existingAppointment::setDoctor);

        existingAppointment.setStatus(updatedAppointment.getStatus());

        appointmentRepository.save(existingAppointment);
        response.put("message", "Appointment updated successfully.");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Transactional
    public ResponseEntity<Map<String, String>> cancelAppointment(Long appointmentId, String token) {
        Map<String, String> response = new HashMap<>();
        Optional<Appointment> optionalAppointment = appointmentRepository.findById(appointmentId);

        if (optionalAppointment.isEmpty()) {
            response.put("message", "Appointment not found.");
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }

        Appointment appointment = optionalAppointment.get();
        String patientEmailFromToken = tokenService.extractUsername(token);

        Optional<Patient> requestingPatientOpt = patientRepository.findByEmail(patientEmailFromToken);
        if (requestingPatientOpt.isEmpty() || !requestingPatientOpt.get().getId().equals(appointment.getPatient().getId())) {
            response.put("message", "Unauthorized operation: You are not authorized to cancel this appointment.");
            return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
        }

        try {
            appointmentRepository.delete(appointment);
            response.put("message", "Appointment cancelled successfully.");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error cancelling appointment: " + e.getMessage());
            response.put("message", "Error cancelling appointment: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getAppointments(Long patientId, String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            String patientEmailFromToken = tokenService.extractUsername(token);
            Optional<Patient> patientOpt = patientRepository.findByEmail(patientEmailFromToken);

            if (patientOpt.isEmpty() || !patientOpt.get().getId().equals(patientId)) {
                response.put("message", "Unauthorized: Patient ID mismatch or patient not found.");
                response.put("appointments", Collections.emptyList());
                return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
            }

            List<Appointment> appointments = appointmentRepository.findByPatientId(patientId);
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
    public Map<String, Object> getDoctorAppointments(LocalDate date, String patientName, String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            String doctorEmailFromToken = tokenService.extractUsername(token);
            Optional<Doctor> doctorOpt = doctorRepository.findByEmail(doctorEmailFromToken);

            if (doctorOpt.isEmpty()) {
                response.put("message", "Unauthorized: Doctor not found for the given token.");
                response.put("appointments", Collections.emptyList());
                return response;
            }

            Long doctorId = doctorOpt.get().getId();
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

            List<Appointment> appointments;
            if (patientName != null && !patientName.isEmpty()) {
                appointments = appointmentRepository.findByDoctorIdAndPatient_NameContainingIgnoreCaseAndAppointmentTimeBetween(
                        doctorId, patientName, startOfDay, endOfDay);
            } else {
                appointments = appointmentRepository.findByDoctorIdAndAppointmentTimeBetween(
                        doctorId, startOfDay, endOfDay);
            }

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

            response.put("message", "Doctor appointments retrieved successfully.");
            response.put("appointments", appointmentDTOs);
            return response;

        } catch (Exception e) {
            System.err.println("Error getting doctor appointments: " + e.getMessage());
            response.put("message", "Internal Server Error: " + e.getMessage());
            response.put("appointments", Collections.emptyList());
            return response;
        }
    }


    @Transactional
    public ResponseEntity<Map<String, String>> changeStatus(int status, Long id) {
        Map<String, String> response = new HashMap<>();
        try {
            appointmentRepository.updateStatus(status, id);
            response.put("message", "Appointment status updated successfully.");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error updating appointment status: " + e.getMessage());
            response.put("message", "Error updating appointment status: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
