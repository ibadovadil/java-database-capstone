package com.project.back_end.controllers;

import com.project.back_end.models.Appointment;
import com.project.back_end.services.AppService;
import com.project.back_end.services.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final AppService appService;

    @Autowired
    public AppointmentController(AppointmentService appointmentService, AppService appService) {
        this.appointmentService = appointmentService;
        this.appService = appService;
    }

    @GetMapping("/{date}/{patientName}/{token}")
    public ResponseEntity<Map<String, Object>> getAppointments(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @PathVariable String patientName,
            @PathVariable String token) {

        Map<String, Object> response = new HashMap<>();

        Map<String, String> validationErrors = appService.validateToken(token, "doctor").getBody();
        if (!validationErrors.isEmpty()) {
            response.put("message", validationErrors.get("error"));
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        String filterPatientName = "null".equalsIgnoreCase(patientName) ? null : patientName;

        // Assuming appointmentService has a method like getDoctorAppointments(date, patientName, token)
        // that handles fetching appointments for a doctor based on the token.
        Map<String, Object> appointmentsResult = appointmentService.getDoctorAppointments(date, filterPatientName, token);

        return new ResponseEntity<>(appointmentsResult, HttpStatus.OK);
    }

    @PostMapping("/{token}")
    public ResponseEntity<Map<String, String>> bookAppointment(
            @RequestBody @Valid Appointment appointment,
            @PathVariable String token) {

        Map<String, String> response = new HashMap<>();

        Map<String, String> validationErrors = appService.validateToken(token, "patient").getBody();
        if (!validationErrors.isEmpty()) {
            response.put("message", validationErrors.get("error"));
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        int validationResult = appService.validateAppointment(
                String.valueOf(appointment.getDoctor().getId()),
                appointment.getAppointmentTime().toLocalDate().toString(),
                appointment.getAppointmentTime().toLocalTime().toString()
        );

        if (validationResult == 1) {
            int res = appointmentService.bookAppointment(appointment);
            if (res == 1) {
                response.put("message", "Appointment booked successfully.");
                return new ResponseEntity<>(response, HttpStatus.CREATED);
            } else {
                response.put("message", "Internal Server Error: Failed to book appointment.");
                return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } else if (validationResult == -1) {
            response.put("message", "Invalid doctor ID.");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        } else {
            response.put("message", "Appointment already booked for given time or Doctor not available.");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}/{token}")
    public ResponseEntity<Map<String, String>> updateAppointment(
            @PathVariable Long id,
            @RequestBody @Valid Appointment appointment,
            @PathVariable String token) {

        Map<String, String> response = new HashMap<>();

        Map<String, String> validationErrors = appService.validateToken(token, "patient").getBody();
        if (!validationErrors.isEmpty()) {
            response.put("message", validationErrors.get("error"));
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        appointment.setId(id);

        ResponseEntity<Map<String, Object>> patientDetailsResponse = appService.getPatientService().getPatientDetails(token);
        if (patientDetailsResponse.getStatusCode() != HttpStatus.OK || !patientDetailsResponse.getBody().containsKey("patient")) {
            response.put("message", "Unauthorized: Patient details could not be retrieved from token.");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }
        Map<String, Object> patientData = (Map<String, Object>) patientDetailsResponse.getBody().get("patient");
        Long patientId = ((Number) patientData.get("id")).longValue();

        return appointmentService.updateAppointment(id, appointment, patientId);
    }

    @DeleteMapping("/{id}/{token}")
    public ResponseEntity<Map<String, String>> cancelAppointment(
            @PathVariable Long id,
            @PathVariable String token) {

        Map<String, String> response = new HashMap<>();

        Map<String, String> validationErrors = appService.validateToken(token, "patient").getBody();
        if (!validationErrors.isEmpty()) {
            response.put("message", validationErrors.get("error"));
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        return appointmentService.cancelAppointment(id, token);
    }
}
