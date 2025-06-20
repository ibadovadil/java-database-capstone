package com.project.back_end.controllers;

import com.project.back_end.models.Appointment;
import com.project.back_end.services.AppService;
import com.project.back_end.services.AppointmentService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final AppService service;

    @Autowired
    public AppointmentController(
            AppointmentService appointmentService,
            AppService service
    ) {
        this.appointmentService = appointmentService;
        this.service = service;
    }

    @GetMapping("/{date}/{patientName}/{token}")
    public ResponseEntity<Map<String, Object>> getAppointments(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @PathVariable String patientName,
            @PathVariable String token
    ) {
        Map<String, Object> map = new HashMap<>();
        ResponseEntity<Map<String, String>> tempMap = service.validateToken(
                token,
                "doctor"
        );
        if (!tempMap.getBody().isEmpty()) {
            map.putAll(tempMap.getBody());
            return new ResponseEntity<>(map, tempMap.getStatusCode());
        }
        map = appointmentService.getAppointment(patientName, date, token);
        return ResponseEntity.status(HttpStatus.OK).body(map);
    }

    @PostMapping("/{token}")
    public ResponseEntity<Map<String, String>> bookAppointment(
            @RequestBody @Valid Appointment appointment,
            @PathVariable String token
    ) {
        ResponseEntity<Map<String, String>> tempMap = service.validateToken(
                token,
                "patient"
        );
        if (!tempMap.getBody().isEmpty()) {
            return tempMap;
        }

        Map<String, String> response = new HashMap<>();
        int validationResult = service.validateAppointment(appointment);
        if (validationResult == 1) {
            int bookingResult = appointmentService.bookAppointment(appointment);
            if (bookingResult == 1) {
                response.put("message", "Appointment booked successfully.");
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            }
            response.put("message", "Internal server error during booking.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } else if (validationResult == -1) {
            response.put("message", "Invalid doctor ID.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        response.put(
                "message",
                "Appointment already booked for the given time or doctor not available."
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @PutMapping("/{token}")
    public ResponseEntity<Map<String, String>> updateAppointment(
            @PathVariable String token,
            @RequestBody @Valid Appointment appointment
    ) {
        ResponseEntity<Map<String, String>> tempMap = service.validateToken(
                token,
                "patient"
        );
        if (!tempMap.getBody().isEmpty()) {
            return tempMap;
        }
        return appointmentService.updateAppointment(appointment);
    }

    @DeleteMapping("/{id}/{token}")
    public ResponseEntity<Map<String, String>> cancelAppointment(
            @PathVariable Long id,
            @PathVariable String token
    ) {
        ResponseEntity<Map<String, String>> tempMap = service.validateToken(
                token,
                "patient"
        );
        if (!tempMap.getBody().isEmpty()) {
            return tempMap;
        }
        return appointmentService.cancelAppointment(id, token);
    }
}