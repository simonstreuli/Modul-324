# API Reference

This document provides detailed information about all API endpoints available in the Ticketsystem.

## Base URL

```
http://localhost:6001
```

## Interactive Documentation

For interactive API testing, access the Swagger UI at:

```
http://localhost:6001/api-docs
```

---

## Employee Endpoints

The Employee service manages employee records including their details and skill levels.

### Create Employee

Creates a new employee in the system.

**Endpoint:** `POST /api/employees`

**Request Body:**

```json
{
  "vorname": "Max",
  "nachname": "Mustermann",
  "beitrittsdatum": "2021-05-15",
  "skillLevel": 4
}
```

**Request Fields:**

| Field            | Type    | Required | Description                 |
| ---------------- | ------- | -------- | --------------------------- |
| `vorname`        | String  | Yes      | Employee's first name       |
| `nachname`       | String  | Yes      | Employee's last name        |
| `beitrittsdatum` | Date    | Yes      | Join date (ISO 8601 format) |
| `skillLevel`     | Integer | Yes      | Skill level (1-5)           |

**Validation Rules:**

- `vorname`: Required, must be a string
- `nachname`: Required, must be a string
- `beitrittsdatum`: Required, must be a valid date
- `skillLevel`: Required, must be an integer between 1 and 5

**Success Response:**

- **Status Code:** `201 Created`
- **Response Body:**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "vorname": "Max",
  "nachname": "Mustermann",
  "beitrittsdatum": "2021-05-15T00:00:00.000Z",
  "skillLevel": 4,
  "createdAt": "2024-01-20T10:30:00.000Z",
  "updatedAt": "2024-01-20T10:30:00.000Z"
}
```

**Error Responses:**

- **Status Code:** `400 Bad Request`
  - Missing required fields
  - Invalid skill level (not between 1-5)
  - Invalid date format

### Get All Employees

Retrieves a list of all employees.

**Endpoint:** `GET /api/employees`

**Success Response:**

- **Status Code:** `200 OK`
- **Response Body:**

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "vorname": "Max",
    "nachname": "Mustermann",
    "beitrittsdatum": "2021-05-15T00:00:00.000Z",
    "skillLevel": 4,
    "createdAt": "2024-01-20T10:30:00.000Z",
    "updatedAt": "2024-01-20T10:30:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "vorname": "Anna",
    "nachname": "Schmidt",
    "beitrittsdatum": "2022-03-10T00:00:00.000Z",
    "skillLevel": 5,
    "createdAt": "2024-01-20T10:31:00.000Z",
    "updatedAt": "2024-01-20T10:31:00.000Z"
  }
]
```

### Get Employee by ID

Retrieves a specific employee by their ID.

**Endpoint:** `GET /api/employees/:id`

**URL Parameters:**

| Parameter | Type   | Description                 |
| --------- | ------ | --------------------------- |
| `id`      | String | Employee's MongoDB ObjectId |

**Success Response:**

- **Status Code:** `200 OK`
- **Response Body:**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "vorname": "Max",
  "nachname": "Mustermann",
  "beitrittsdatum": "2021-05-15T00:00:00.000Z",
  "skillLevel": 4,
  "createdAt": "2024-01-20T10:30:00.000Z",
  "updatedAt": "2024-01-20T10:30:00.000Z"
}
```

**Error Responses:**

- **Status Code:** `400 Bad Request` - Invalid ID format
- **Status Code:** `404 Not Found` - Employee does not exist

---

## Ticket Endpoints

The Ticket service manages support tickets with status tracking and employee assignments.

### Create Ticket

Creates a new ticket assigned to an employee.

**Endpoint:** `POST /api/tickets`

**Request Body:**

```json
{
  "status": "Open",
  "titel": "Bug Fix Required",
  "text": "Fix login issue on mobile devices",
  "mitarbeiterId": "507f1f77bcf86cd799439011"
}
```

**Request Fields:**

| Field           | Type   | Required | Description                                      |
| --------------- | ------ | -------- | ------------------------------------------------ |
| `status`        | String | Yes      | Ticket status (Open, In Progress, Review, Done)  |
| `titel`         | String | Yes      | Ticket title                                     |
| `text`          | String | Yes      | Ticket description                               |
| `mitarbeiterId` | String | Yes      | Assigned employee's ID                           |
| `reviewDatum`   | Date   | No       | Review date (only when status is Review or Done) |
| `doneDatum`     | Date   | No       | Completion date (only when status is Done)       |

**Validation Rules:**

- `status`: Required, must be one of: "Open", "In Progress", "Review", "Done"
- `titel`: Required, must be a string
- `text`: Required, must be a string
- `mitarbeiterId`: Required, must reference an existing employee
- `reviewDatum`: Optional, only allowed when status is "Review" or "Done"
- `doneDatum`: Optional, only allowed when status is "Done"

**Success Response:**

- **Status Code:** `201 Created`
- **Response Body:**

```json
{
  "_id": "507f1f77bcf86cd799439020",
  "status": "Open",
  "titel": "Bug Fix Required",
  "text": "Fix login issue on mobile devices",
  "mitarbeiterId": "507f1f77bcf86cd799439011",
  "createdAt": "2024-01-20T10:30:00.000Z",
  "updatedAt": "2024-01-20T10:30:00.000Z"
}
```

**Error Responses:**

- **Status Code:** `400 Bad Request`
  - Missing required fields
  - Invalid status value
  - Invalid date for status (e.g., reviewDatum when status is "Open")
  - Employee does not exist
- **Status Code:** `404 Not Found` - Referenced employee not found

### Get All Tickets

Retrieves a list of all tickets.

**Endpoint:** `GET /api/tickets`

**Success Response:**

- **Status Code:** `200 OK`
- **Response Body:**

```json
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "status": "Open",
    "titel": "Bug Fix Required",
    "text": "Fix login issue on mobile devices",
    "mitarbeiterId": "507f1f77bcf86cd799439011",
    "createdAt": "2024-01-20T10:30:00.000Z",
    "updatedAt": "2024-01-20T10:30:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439021",
    "status": "Done",
    "titel": "Update Documentation",
    "text": "Update API documentation",
    "mitarbeiterId": "507f1f77bcf86cd799439012",
    "reviewDatum": "2024-01-19T14:00:00.000Z",
    "doneDatum": "2024-01-20T09:00:00.000Z",
    "createdAt": "2024-01-18T10:30:00.000Z",
    "updatedAt": "2024-01-20T09:00:00.000Z"
  }
]
```

### Get Ticket by ID

Retrieves a specific ticket by its ID.

**Endpoint:** `GET /api/tickets/:id`

**URL Parameters:**

| Parameter | Type   | Description               |
| --------- | ------ | ------------------------- |
| `id`      | String | Ticket's MongoDB ObjectId |

**Success Response:**

- **Status Code:** `200 OK`
- **Response Body:**

```json
{
  "_id": "507f1f77bcf86cd799439020",
  "status": "Open",
  "titel": "Bug Fix Required",
  "text": "Fix login issue on mobile devices",
  "mitarbeiterId": "507f1f77bcf86cd799439011",
  "createdAt": "2024-01-20T10:30:00.000Z",
  "updatedAt": "2024-01-20T10:30:00.000Z"
}
```

**Error Responses:**

- **Status Code:** `400 Bad Request` - Invalid ID format
- **Status Code:** `404 Not Found` - Ticket does not exist

### Update Ticket

Updates an existing ticket. Commonly used to change status and add review/completion dates.

**Endpoint:** `PUT /api/tickets/:id`

**URL Parameters:**

| Parameter | Type   | Description               |
| --------- | ------ | ------------------------- |
| `id`      | String | Ticket's MongoDB ObjectId |

**Request Body:**

```json
{
  "status": "Done",
  "doneDatum": "2024-01-20T15:30:00Z"
}
```

**Success Response:**

- **Status Code:** `200 OK`
- **Response Body:**

```json
{
  "_id": "507f1f77bcf86cd799439020",
  "status": "Done",
  "titel": "Bug Fix Required",
  "text": "Fix login issue on mobile devices",
  "mitarbeiterId": "507f1f77bcf86cd799439011",
  "reviewDatum": "2024-01-19T14:00:00.000Z",
  "doneDatum": "2024-01-20T15:30:00.000Z",
  "createdAt": "2024-01-20T10:30:00.000Z",
  "updatedAt": "2024-01-20T15:30:00.000Z"
}
```

**Error Responses:**

- **Status Code:** `400 Bad Request`
  - Invalid ID format
  - Invalid status transition
  - Invalid date for status
- **Status Code:** `404 Not Found` - Ticket does not exist

### Delete Ticket

Deletes a ticket from the system.

**Endpoint:** `DELETE /api/tickets/:id`

**URL Parameters:**

| Parameter | Type   | Description               |
| --------- | ------ | ------------------------- |
| `id`      | String | Ticket's MongoDB ObjectId |

**Success Response:**

- **Status Code:** `200 OK`
- **Response Body:**

```json
{
  "message": "Ticket deleted successfully"
}
```

**Error Responses:**

- **Status Code:** `400 Bad Request` - Invalid ID format
- **Status Code:** `404 Not Found` - Ticket does not exist

---

## Status Transitions

Tickets follow a specific workflow with status transitions:

```
Open → In Progress → Review → Done
```

### Status Rules

- **Open**: Initial state, no date restrictions
- **In Progress**: Work has started, no date restrictions
- **Review**: Under review, can have `reviewDatum`
- **Done**: Completed, must have `doneDatum`, can have `reviewDatum`

### Date Validation

- `reviewDatum` is only allowed when status is "Review" or "Done"
- `doneDatum` is only allowed when status is "Done"
- Dates must be in ISO 8601 format

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message in German"
}
```

Common error messages:

- "Mitarbeiter nicht gefunden": Employee not found
- "Ungültiges SkillLevel. Muss zwischen 1 und 5 liegen.": Invalid skill level
- "reviewDatum ist nur erlaubt, wenn Status 'Review' oder 'Done' ist": Review date only allowed for Review or Done status

---

## Data Types

### Date Format

All dates use ISO 8601 format:

- `YYYY-MM-DD` for dates only
- `YYYY-MM-DDTHH:mm:ss.sssZ` for timestamps

Examples:

- `2021-05-15`
- `2024-01-20T10:30:00.000Z`

### ObjectId Format

MongoDB ObjectIds are 24-character hexadecimal strings:

- Example: `507f1f77bcf86cd799439011`
