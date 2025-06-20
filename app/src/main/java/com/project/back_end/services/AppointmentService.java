package com.project.back_end.services;

import com.project.back_end.DTO.AppointmentDTO;
import com.project.back_end.models.Appointment;
import com.project.back_end.models.Patient;
import com.project.back_end.repo.AppointmentRepository;
import com.project.back_end.repo.DoctorRepository;
import com.project.back_end.repo.PatientRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AppService service;
    private final TokenService tokenService;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            AppService service,
            TokenService tokenService,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository
    ) {
        this.appointmentRepository = appointmentRepository;
        this.service = service;
        this.tokenService = tokenService;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    public int bookAppointment(Appointment appointment) {
        try {
            appointmentRepository.save(appointment);
            return 1;
        } catch (Exception e) {
            System.err.println("Error booking appointment: " + e.getMessage());
            return 0;
        }
    }

    public ResponseEntity<Map<String, String>> updateAppointment(
            Appointment appointment
    ) {
        Map<String, String> response = new HashMap<>();

        Optional<Appointment> existingAppointment = appointmentRepository.findById(
                appointment.getId()
        );
        if (existingAppointment.isEmpty()) {
            response.put(
                    "message",
                    "Appointment not found with ID: " + appointment.getId()
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        if (
                !existingAppointment
                        .get()
                        .getPatient()
                        .getId()
                        .equals(appointment.getPatient().getId())
        ) {
            response.put("message", "Patient ID mismatch.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        int validationResult = service.validateAppointment(appointment);
        if (validationResult == 1) {
            try {
                appointmentRepository.save(appointment);
                response.put("message", "Appointment updated successfully.");
                return ResponseEntity.status(HttpStatus.OK).body(response);
            } catch (Exception e) {
                System.err.println("Error updating appointment: " + e.getMessage());
                response.put("message", "Internal server error during update.");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
        } else if (validationResult == -1) {
            response.put("message", "Invalid doctor ID.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        response.put(
                "message",
                "Appointment slot unavailable or doctor not available."
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    public ResponseEntity<Map<String, String>> cancelAppointment(
            long id,
            String token
    ) {
        Map<String, String> response = new HashMap<>();
        Optional<Appointment> appointmentOptional = appointmentRepository.findById(
                id
        );

        if (appointmentOptional.isEmpty()) {
            response.put("message", "Appointment not found with ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        String extractedEmail = tokenService.extractEmail(token);
        Patient patient = patientRepository.findByEmail(extractedEmail);

        if (!patient.getId().equals(appointmentOptional.get().getPatient().getId())) {
            response.put("message", "Patient ID mismatch.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        try {
            appointmentRepository.delete(appointmentOptional.get());
            response.put("message", "Appointment cancelled successfully.");
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            System.err.println("Error cancelling appointment: " + e.getMessage());
            response.put("message", "Internal server error during cancellation.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @Transactional
    public Map<String, Object> getAppointment(
            String patientName,
            LocalDate date,
            String token
    ) {
        Map<String, Object> map = new HashMap<>();
        String extractedEmail = tokenService.extractEmail(token);
        Long doctorId = doctorRepository.findByEmail(extractedEmail).getId();
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        List<Appointment> appointments;

        if (patientName.equals("null")) {
            appointments =
                    appointmentRepository.findByDoctorIdAndAppointmentTimeBetween(
                            doctorId,
                            startOfDay,
                            endOfDay
                    );
        } else {
            appointments =
                    appointmentRepository.findByDoctorIdAndPatient_NameContainingIgnoreCaseAndAppointmentTimeBetween(
                            doctorId,
                            patientName,
                            startOfDay,
                            endOfDay
                    );
        }

        List<AppointmentDTO> appointmentDTOs = appointments
                .stream()
                .map(
                        app ->
                                new AppointmentDTO(
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
                                )
                )
                .collect(Collectors.toList());

        map.put("appointments", appointmentDTOs);
        return map;
    }

    @Transactional
    public void changeStatus(long appointmentId) {
        appointmentRepository.updateStatus(1, appointmentId);
    }
}