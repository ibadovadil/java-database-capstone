package com.project.back_end.controllers;

import com.project.back_end.DTO.Login;
import com.project.back_end.models.Doctor;
import com.project.back_end.services.AppService;
import com.project.back_end.services.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("${api.path}" + "doctor")
public class DoctorController {

    private final DoctorService doctorService;
    private final AppService appService;

    @Autowired
    public DoctorController(DoctorService doctorService, AppService appService) {
        this.doctorService = doctorService;
        this.appService = appService;
    }

    @GetMapping("/availability/{user}/{doctorId}/{date}/{token}")
    public ResponseEntity<Map<String, Object>> getDoctorAvailability(
            @PathVariable String user,
            @PathVariable Long doctorId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @PathVariable String token) {

        Map<String, Object> response = new HashMap<>();

        Map<String, String> validationErrors = appService.validateToken(token, user).getBody();
        if (!validationErrors.isEmpty()) {
            response.put("message", validationErrors.get("error"));
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        List<String> availability = doctorService.getDoctorAvailability(doctorId, date);
        response.put("availability", availability);
        response.put("message", "Doctor availability retrieved successfully.");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDoctors() {
        return new ResponseEntity<>(doctorService.getDoctors(), HttpStatus.OK);
    }

    @PostMapping("/{token}")
    public ResponseEntity<Map<String, String>> addDoctor(
            @RequestBody @Valid Doctor doctor,
            @PathVariable String token) {

        Map<String, String> response = new HashMap<>();

        Map<String, String> validationErrors = appService.validateToken(token, "admin").getBody();
        if (!validationErrors.isEmpty()) {
            response.put("message", validationErrors.get("error"));
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        int result = doctorService.saveDoctor(doctor);
        if (result == 1) {
            response.put("message", "Doctor added to db successfully.");
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } else if (result == -1) {
            response.put("message", "Doctor already exists.");
            return new ResponseEntity<>(response, HttpStatus.CONFLICT);
        } else {
            response.put("message", "Some internal error occurred while adding doctor.");
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> doctorLogin(@RequestBody @Valid Login login) {
        return doctorService.validateDoctor(login);
    }

    @PutMapping("/{token}")
    public ResponseEntity<Map<String, String>> updateDoctor(
            @RequestBody @Valid Doctor doctor,
            @PathVariable String token) {

        Map<String, String> response = new HashMap<>();

        Map<String, String> validationErrors = appService.validateToken(token, "admin").getBody();
        if (!validationErrors.isEmpty()) {
            response.put("message", validationErrors.get("error"));
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        int result = doctorService.updateDoctor(doctor);
        if (result == 1) {
            response.put("message", "Doctor updated successfully.");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else if (result == -1) {
            response.put("message", "Doctor not found.");
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } else {
            response.put("message", "Some internal error occurred while updating doctor.");
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}/{token}")
    public ResponseEntity<Map<String, String>> deleteDoctor(
            @PathVariable Long id,
            @PathVariable String token) {

        Map<String, String> response = new HashMap<>();

        Map<String, String> validationErrors = appService.validateToken(token, "admin").getBody();
        if (!validationErrors.isEmpty()) {
            response.put("message", validationErrors.get("error"));
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        int result = doctorService.deleteDoctor(id);
        if (result == 1) {
            response.put("message", "Doctor deleted successfully.");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else if (result == -1) {
            response.put("message", "Doctor not found with id: " + id);
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } else {
            response.put("message", "Some internal error occurred while deleting doctor.");
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/filter/{name}/{time}/{speciality}")
    public ResponseEntity<Map<String, Object>> filterDoctors(
            @PathVariable(required = false) String name,
            @PathVariable(required = false) String time,
            @PathVariable(required = false) String speciality) {

        String filterName = (name != null && !name.equalsIgnoreCase("null")) ? name : null;
        String filterTime = (time != null && !time.equalsIgnoreCase("null")) ? time : null;
        String filterSpecialty = (speciality != null && !speciality.equalsIgnoreCase("null")) ? speciality : null;

        Map<String, Object> filteredDoctors = appService.filterDoctor(filterName, filterSpecialty, filterTime);

        return new ResponseEntity<>(filteredDoctors, HttpStatus.OK);
    }
}
