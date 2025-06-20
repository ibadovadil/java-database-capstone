package com.project.back_end.controllers;

import com.project.back_end.DTO.Login;
import com.project.back_end.models.Patient;
import com.project.back_end.services.AppService;
import com.project.back_end.services.PatientService;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patient")
public class PatientController {

    private final PatientService patientService;
    private final AppService service;

    @Autowired
    public PatientController(PatientService patientService, AppService service) {
        this.patientService = patientService;
        this.service = service;
    }

    @GetMapping("/{token}")
    public ResponseEntity<Map<String, Object>> getPatient(@PathVariable String token) {
        Map<String, Object> map = new HashMap<>();
        ResponseEntity<Map<String, String>> tempMap = service.validateToken(
                token,
                "patient"
        );
        if (!tempMap.getBody().isEmpty()) {
            map.putAll(tempMap.getBody());
            return new ResponseEntity<>(map, tempMap.getStatusCode());
        }
        return patientService.getPatientDetails(token);
    }

    @PostMapping()
    public ResponseEntity<Map<String, String>> createPatient(
            @RequestBody @Valid Patient patient
    ) {
        Map<String, String> map = new HashMap<>();
        if (service.validatePatient(patient)) {
            int result = patientService.createPatient(patient);
            if (result == 1) {
                map.put("message", "Signup successful.");
                return ResponseEntity.status(HttpStatus.CREATED).body(map);
            }
            if (result == 0) {
                map.put("message", "Internal server error.");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(map);
            }
        }
        map.put("message", "Patient with this email or phone number already exists.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(map);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Login login) {
        return service.validatePatientLogin(login);
    }

    @GetMapping("/{id}/{user}/{token}")
    public ResponseEntity<Map<String, Object>> getPatientAppointment(
            @PathVariable Long id,
            @PathVariable String token,
            @PathVariable String user
    ) {
        Map<String, Object> map = new HashMap<>();
        ResponseEntity<Map<String, String>> tempMap = service.validateToken(
                token,
                user
        );
        if (!tempMap.getBody().isEmpty()) {
            map.putAll(tempMap.getBody());
            return new ResponseEntity<>(map, tempMap.getStatusCode());
        }

        return patientService.getPatientAppointment(id, token);
    }

    @GetMapping("/filter/{condition}/{name}/{token}")
    public ResponseEntity<Map<String, Object>> filterPatientAppointment(
            @PathVariable String condition,
            @PathVariable String name,
            @PathVariable String token
    ) {
        Map<String, Object> map = new HashMap<>();
        ResponseEntity<Map<String, String>> tempMap = service.validateToken(
                token,
                "patient"
        );
        if (!tempMap.getBody().isEmpty()) {
            map.putAll(tempMap.getBody());
            return new ResponseEntity<>(map, tempMap.getStatusCode());
        }
        return service.filterPatient(condition, name, token);
    }
}