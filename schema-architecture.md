# Architecture Design Document for Smart Clinic Management System

## 1. Architecture Summary

This Spring Boot application combines both MVC and REST architectural styles. The Admin and Doctor dashboards are rendered using Thymeleaf templates, providing server-side HTML pages. Other modules, such as appointments and patient records, are accessed through RESTful APIs, which serve JSON responses.

The application interacts with two databases: MySQL, which stores structured relational data like patients, doctors, appointments, and admin information; and MongoDB, which stores flexible, document-based data such as prescriptions. All incoming requests pass through controllers that delegate business logic to a common service layer. This service layer interacts with the repository layer to perform data operations. MySQL repositories use JPA entities, while MongoDB repositories use document models.

This architecture allows for clear separation of concerns, scalability, and easier maintenance.

## 2. Numbered Flow of Data and Control

1. The user accesses the application via either Thymeleaf-based web dashboards (AdminDashboard or DoctorDashboard) or REST API clients (such as mobile apps or frontend modules for appointments and patient records).
2. User requests are routed to the appropriate controllers: Thymeleaf controllers handle server-rendered HTML pages, while REST controllers handle API requests and respond with JSON.
3. Controllers validate the requests and forward them to the service layer for processing.
4. The service layer applies business logic, enforces rules, and coordinates workflows across entities.
5. Service methods interact with the repository layer to fetch or persist data.
6. The repository layer accesses the underlying databases: MySQL for structured data and MongoDB for document-based data.
7. Retrieved data is mapped to Java model classes (JPA entities for MySQL, document models for MongoDB) and returned back through the service and controller layers. Controllers then send either rendered HTML pages or JSON responses to the user, completing the request-response cycle.
