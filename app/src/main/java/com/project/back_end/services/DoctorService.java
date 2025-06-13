package com.project.back_end.services;

import com.project.back_end.DTO.Login;
import com.project.back_end.models.Appointment;
import com.project.back_end.models.Doctor;
import com.project.back_end.repo.AppointmentRepository;
import com.project.back_end.repo.DoctorRepository;
import com.project.back_end.services.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final TokenService tokenService;

    @Autowired
    public DoctorService(DoctorRepository doctorRepository,
                         AppointmentRepository appointmentRepository,
                         TokenService tokenService) {
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.tokenService = tokenService;
    }

    @Transactional(readOnly = true)
    public List<String> getDoctorAvailability(Long doctorId, LocalDate date) {
        Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
        if (doctorOpt.isEmpty()) {
            return Collections.emptyList();
        }

        Doctor doctor = doctorOpt.get();
        List<String> allAvailableSlots = doctor.getAvailableTimes();

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
        List<Appointment> bookedAppointments = appointmentRepository.findByDoctorIdAndAppointmentTimeBetween(doctorId, startOfDay, endOfDay);

        List<String> bookedTimes = bookedAppointments.stream()
                .map(appointment -> appointment.getAppointmentTime().format(DateTimeFormatter.ofPattern("HH:mm")))
                .collect(Collectors.toList());

        return allAvailableSlots.stream()
                .filter(slot -> {
                    String slotStartTime = slot.split("-")[0].trim();
                    return !bookedTimes.contains(slotStartTime);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public int saveDoctor(Doctor doctor) {
        try {
            Optional<Doctor> existingDoctor = doctorRepository.findByEmail(doctor.getEmail());
            if (existingDoctor.isPresent()) {
                return -1;
            }
            doctorRepository.save(doctor);
            return 1;
        } catch (Exception e) {
            System.err.println("Error saving doctor: " + e.getMessage());
            return 0;
        }
    }

    @Transactional
    public int updateDoctor(Doctor doctor) {
        try {
            Optional<Doctor> existingDoctorOpt = doctorRepository.findById(doctor.getId());
            if (existingDoctorOpt.isEmpty()) {
                return -1;
            }
            Doctor existingDoctor = existingDoctorOpt.get();
            existingDoctor.setName(doctor.getName());
            existingDoctor.setSpecialty(doctor.getSpecialty());
            existingDoctor.setEmail(doctor.getEmail());
            existingDoctor.setPassword(doctor.getPassword());
            existingDoctor.setPhone(doctor.getPhone());
            existingDoctor.setAvailableTimes(doctor.getAvailableTimes());
            doctorRepository.save(existingDoctor);
            return 1;
        } catch (Exception e) {
            System.err.println("Error updating doctor: " + e.getMessage());
            return 0;
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDoctors() {
        Map<String, Object> response = new HashMap<>();
        List<Doctor> doctors = doctorRepository.findAll();
        response.put("doctors", doctors);
        response.put("message", "Doctors retrieved successfully.");
        return response;
    }

    @Transactional
    public int deleteDoctor(long id) {
        try {
            Optional<Doctor> doctorOpt = doctorRepository.findById(id);
            if (doctorOpt.isEmpty()) {
                return -1;
            }
            appointmentRepository.deleteAllByDoctorId(id);
            doctorRepository.deleteById(id);
            return 1;
        } catch (Exception e) {
            System.err.println("Error deleting doctor: " + e.getMessage());
            return 0;
        }
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, String>> validateDoctor(Login login) {
        Map<String, String> response = new HashMap<>();
        try {
            Optional<Doctor> doctorOpt = doctorRepository.findByEmail(login.getEmail());
            if (doctorOpt.isPresent()) {
                Doctor doctor = doctorOpt.get();
                if (doctor.getPassword().equals(login.getPassword())) {
                    String token = tokenService.generateToken(doctor.getEmail(), "doctor");
                    response.put("token", token);
                    response.put("message", "Doctor login successful.");
                    return new ResponseEntity<>(response, HttpStatus.OK);
                } else {
                    response.put("message", "Unauthorized: Incorrect password.");
                    return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
                }
            } else {
                response.put("message", "Unauthorized: Doctor not found.");
                return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
            }
        } catch (Exception e) {
            response.put("message", "Internal Server Error: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> findDoctorByName(String name) {
        Map<String, Object> response = new HashMap<>();
        List<Doctor> doctors = doctorRepository.findByNameLike(name);
        response.put("doctors", doctors);
        response.put("message", "Doctors retrieved successfully.");
        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> filterDoctorsByNameSpecilityandTime(String name, String specialty, String amOrPm) {
        Map<String, Object> response = new HashMap<>();
        List<Doctor> doctors = doctorRepository.findByNameContainingIgnoreCaseAndSpecialtyIgnoreCase(name, specialty);
        List<Doctor> filteredByTime = filterDoctorByTime(doctors, amOrPm);
        response.put("doctors", filteredByTime);
        response.put("message", "Doctors filtered successfully.");
        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> filterDoctorByNameAndTime(String name, String amOrPm) {
        Map<String, Object> response = new HashMap<>();
        List<Doctor> doctors = doctorRepository.findByNameLike(name);
        List<Doctor> filteredByTime = filterDoctorByTime(doctors, amOrPm);
        response.put("doctors", filteredByTime);
        response.put("message", "Doctors filtered successfully.");
        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> filterDoctorByNameAndSpecility(String name, String specialty) {
        Map<String, Object> response = new HashMap<>();
        List<Doctor> doctors = doctorRepository.findByNameContainingIgnoreCaseAndSpecialtyIgnoreCase(name, specialty);
        response.put("doctors", doctors);
        response.put("message", "Doctors filtered successfully.");
        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> filterDoctorByTimeAndSpecility(String specialty, String amOrPm) {
        Map<String, Object> response = new HashMap<>();
        List<Doctor> doctors = doctorRepository.findBySpecialtyIgnoreCase(specialty);
        List<Doctor> filteredByTime = filterDoctorByTime(doctors, amOrPm);
        response.put("doctors", filteredByTime);
        response.put("message", "Doctors filtered successfully.");
        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> filterDoctorBySpecility(String specialty) {
        Map<String, Object> response = new HashMap<>();
        List<Doctor> doctors = doctorRepository.findBySpecialtyIgnoreCase(specialty);
        response.put("doctors", doctors);
        response.put("message", "Doctors filtered successfully.");
        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> filterDoctorsByTime(String amOrPm) {
        Map<String, Object> response = new HashMap<>();
        List<Doctor> allDoctors = doctorRepository.findAll();
        List<Doctor> filteredByTime = filterDoctorByTime(allDoctors, amOrPm);
        response.put("doctors", filteredByTime);
        response.put("message", "Doctors filtered successfully.");
        return response;
    }

    private List<Doctor> filterDoctorByTime(List<Doctor> doctors, String amOrPm) {
        if (amOrPm == null || amOrPm.isEmpty()) {
            return doctors;
        }
        return doctors.stream()
                .filter(doctor -> doctor.getAvailableTimes() != null && doctor.getAvailableTimes().stream()
                        .anyMatch(timeSlot -> {
                            try {
                                String startTimeStr = timeSlot.split("-")[0].trim();
                                LocalTime startTime = LocalTime.parse(startTimeStr, DateTimeFormatter.ofPattern("HH:mm"));
                                if ("AM".equalsIgnoreCase(amOrPm)) {
                                    return startTime.isBefore(LocalTime.NOON);
                                } else if ("PM".equalsIgnoreCase(amOrPm)) {
                                    return !startTime.isBefore(LocalTime.NOON);
                                }
                                return false;
                            } catch (Exception e) {
                                System.err.println("Error parsing time slot '" + timeSlot + "': " + e.getMessage());
                                return false;
                            }
                        }))
                .collect(Collectors.toList());
    }
}
