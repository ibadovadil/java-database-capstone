package com.project.back_end.mvc;

import com.project.back_end.services.AppService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import com.project.back_end.services.AppService;
import java.util.Map;

@Controller
public class DashboardController {
    private final AppService service;

@Autowired
    public  DashboardController(AppService service){
    this.service=service;
}

@GetMapping("/adminDashboard/{token}")
public String adminDashboard(@PathVariable String token, RedirectAttributes redirectAttributes) {
    Map<String, String> validationErrors = service.validateToken(token, "admin").getBody();
    if (validationErrors.isEmpty()) {
        return "admin/adminDashboard";
    } else {
        redirectAttributes.addFlashAttribute("error", validationErrors.get("error"));
        return "redirect:/";
    }
}


    @GetMapping("/doctorDashboard/{token}")
    public String doctorDashboard(@PathVariable String token, RedirectAttributes redirectAttributes) {
        Map<String, String> validationErrors = service.validateToken(token, "doctor").getBody();
        if (validationErrors.isEmpty()) {
            return "doctor/doctorDashboard";
        } else {
            redirectAttributes.addFlashAttribute("error", validationErrors.get("error"));
            return "redirect:/";
        }
    }
}
