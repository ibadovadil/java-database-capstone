package com.project.back_end.controllers;

import com.project.back_end.models.Prescription;
import com.project.back_end.services.AppService;
import com.project.back_end.services.PrescriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("${api.path}" + "prescription")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final AppService appService;

    @Autowired
    public PrescriptionController(PrescriptionService prescriptionService, AppService appService) {
        this.prescriptionService = prescriptionService;
        this.appService = appService;
    }

    @PostMapping("/{token}")
    public ResponseEntity<Map<String, String>> savePrescription(
            @RequestBody @Valid Prescription prescription,
            @PathVariable String token) {

        Map<String, String> response = new HashMap<>();

        Map<String, String> validationErrors = appService.validateToken(token, "doctor").getBody();
        if (!validationErrors.isEmpty()) {
            response.put("message", validationErrors.get("error"));
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        ResponseEntity<Map<String, String>> saveResponse = prescriptionService.savePrescription(prescription);

        return saveResponse;
    }

    @GetMapping("/{appointmentId}/{token}")
    public ResponseEntity<Map<String, Object>> getPrescription(
            @PathVariable Long appointmentId,
            @PathVariable String token) {

        Map<String, Object> response = new HashMap<>();

        Map<String, String> validationErrors = appService.validateToken(token, "doctor").getBody();
        if (!validationErrors.isEmpty()) {
            response.put("message", validationErrors.get("error"));
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        return prescriptionService.getPrescription(appointmentId);
    }
}
