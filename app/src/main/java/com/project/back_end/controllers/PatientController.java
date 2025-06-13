package com.project.back_end.controllers;

import com.project.back_end.DTO.Login;
import com.project.back_end.models.Patient;
import com.project.back_end.services.AppService;
import com.project.back_end.services.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/patient")
public class PatientController {

    private final PatientService patientService;
    private final AppService appService;

    @Autowired
    public PatientController(PatientService patientService, AppService appService) {
        this.patientService = patientService;
        this.appService = appService;
    }

    @GetMapping("/{token}")
    public ResponseEntity<Map<String, Object>> getPatientDetails(@PathVariable String token) {
        Map<String, Object> response = new HashMap<>();

        Map<String, String> validationErrors = appService.validateToken(token, "patient").getBody();
        if (!validationErrors.isEmpty()) {
            response.put("message", validationErrors.get("error"));
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        return patientService.getPatientDetails(token);
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> createPatient(@RequestBody @Valid Patient patient) {
        Map<String, String> response = new HashMap<>();
        try {
            boolean isValidPatient = appService.validatePatient(patient);

            if (!isValidPatient) {
                response.put("message", "Patient with this email or phone number already exists.");
                return new ResponseEntity<>(response, HttpStatus.CONFLICT);
            }

            int result = patientService.createPatient(patient);
            if (result == 1) {
                response.put("message", "Signup successful.");
                return new ResponseEntity<>(response, HttpStatus.CREATED);
            } else {
                response.put("message", "Internal server error occurred during signup.");
                return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch (Exception e) {
            System.err.println("Error creating patient: " + e.getMessage());
            response.put("message", "Internal server error: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> patientLogin(@RequestBody @Valid Login login) {
        return appService.validatePatientLogin(login);
    }

    @GetMapping("/{id}/appointments/{token}")
    public ResponseEntity<Map<String, Object>> getPatientAppointments(
            @PathVariable Long id,
            @PathVariable String token) {

        Map<String, Object> response = new HashMap<>();

        Map<String, String> validationErrors = appService.validateToken(token, "patient").getBody();
        if (!validationErrors.isEmpty()) {
            response.put("message", validationErrors.get("error"));
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        return patientService.getPatientAppointment(id, token);
    }

    @GetMapping("/filter/{condition}/{name}/{token}")
    public ResponseEntity<Map<String, Object>> filterPatientAppointments(
            @PathVariable String condition,
            @PathVariable(required = false) String name,
            @PathVariable String token) {

        Map<String, Object> response = new HashMap<>();

        Map<String, String> validationErrors = appService.validateToken(token, "patient").getBody();
        if (!validationErrors.isEmpty()) {
            response.put("message", validationErrors.get("error"));
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        String filterName = (name != null && !name.equalsIgnoreCase("null")) ? name : null;

        return appService.filterPatient(condition, filterName, token);
    }
}
