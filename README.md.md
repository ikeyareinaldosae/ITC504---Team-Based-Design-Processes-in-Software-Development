# 🎬 Movie Performance Management System API

## Project Overview

The **Movie Performance Management System API** is a RESTful API designed to manage movie information, record weekly revenue performance, generate reports, analyse revenue trends, and support management decisions regarding movie screenings.

The API provides structured endpoints for managing movie records, tracking weekly financial performance, and identifying movies that may require management attention.

All monetary values are represented in Australian Dollars (AUD).

## 🚀 Project Information

| Detail | Description |
|---|---|
| Project Name | Movie Performance Management System API |
| API Version | 1.0.0 |
| OpenAPI Version | 3.0.3 |
| API Type | REST API |
| Base Path | `/api/v1` |
| Data Format | JSON |
| Currency | AUD |
| Authentication | Optional |

## 🎯 Project Objectives

- Manage movie information and screening statuses.
- Record weekly movie revenue.
- Update or delete performance records.
- Generate weekly performance reports.
- Analyse movie revenue trends.
- Identify movies requiring management review.
- Support screening extensions and screening endings.

## 🛠️ API Features

### 1. Movies Management
- Retrieve movie information.
- Add new movies.
- Retrieve individual movie details.
- Manage movie screening status.

### 2. Performance Management
- Record weekly movie revenue.
- Update existing performance records.
- Delete performance records.
- Prevent duplicate weekly performance records.

### 3. Reports and Analytics
- Retrieve weekly reports.
- Generate weekly performance summaries.
- Analyse revenue trends through chart-related endpoints.

### 4. Management
- Identify movies requiring management review.
- Apply revenue thresholds and percentage-drop criteria.
- Extend movie screenings.
- End movie screenings.

### 5. Authentication
- Optional bearer-token authentication.
- Login endpoint for authentication.

## 📡 API Base URL

Local development server:

`http://localhost:3000/api/v1`

## 📋 Main API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/movies` | Retrieve movies |
| POST | `/movies` | Add a movie |
| GET | `/movies/{movieId}` | Retrieve movie details |
| POST | `/performance` | Record weekly performance |
| PUT | `/performance/{recordId}` | Update performance |
| DELETE | `/performance/{recordId}` | Delete performance |
| GET | `/reports/weeks` | Retrieve available weeks |
| GET | `/reports/weekly` | Generate weekly report |
| GET | `/reports/charts/revenue-trend` | Analyse revenue trends |
| GET | `/management/review-flags` | Retrieve management review flags |
| POST | `/movies/{movieId}/extend` | Extend screening |
| POST | `/movies/{movieId}/end` | End screening |
| POST | `/auth/login` | User login |

## 📊 Business Rules

- All monetary values must be non-negative.
- Revenue is recorded in AUD, with up to two decimal places.
- Each movie can have only one performance record per week.
- Duplicate weekly performance records are rejected.
- Weekly reporting starts on Monday.
- Screening statuses include `active`, `extended`, and `ended`.
- Management review flags identify movies based on revenue thresholds or percentage drops.

## ⚠️ Error Handling

The API supports the following standard HTTP status codes:

| Status Code | Description |
|---|---|
| 400 | Bad Request |
| 401 | Unauthorised |
| 404 | Resource Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

## 📁 Project Structure

```text
Movie_Performance_Management_System/
│
├── openapi.yaml
│
├── README.md
│
├── Documentation/
│   └── Assessment_Documentation.pdf
│
└── Swagger Screenshots/
    ├── swagger screenshot1.png
    ├── swagger screenshot2.png
    └── swagger screenshot3.png
```

## 🔍 API Documentation

The API specification is written using OpenAPI 3.0.3 and can be viewed and validated using Swagger Editor.

Swagger Editor: https://editor.swagger.io/

To view the documentation:
1. Open Swagger Editor.
2. Import or paste the `openapi.yaml` file.
3. Review the API endpoints and schemas.
4. Check the validation panel for errors.

## 💻 Technologies and Standards

- OpenAPI 3.0.3
- YAML
- REST API principles
- JSON
- HTTP methods and status codes
- Bearer authentication (optional)

## 👥 Team Project

This repository contains the API specification and supporting documentation for the Movie Performance Management System project.

Team members can contribute by reviewing the API specification, suggesting improvements, and collaborating on future API implementation and testing.

## 📌 Project Status

**API Specification:** Completed and validated in Swagger Editor.

**Implementation and Testing:** To be completed or documented separately as applicable.

---

*Movie Performance Management System API — Version 1.0.0*