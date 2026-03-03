# SehatVault Auth API Module

Complete authentication system for SehatVault based on the Supabase schema.

## 📁 Module Structure

```
auth/
├── controller/
│   └── AuthController.java         # REST API endpoints
├── service/
│   └── AuthService.java            # Business logic
├── entity/
│   ├── User.java                   # User entity (JPA)
│   ├── Role.java                   # Role entity (JPA)
│   └── Settings.java               # Settings entity (JPA)
├── dto/
│   ├── SignupRequest.java          # Signup request DTO
│   ├── SigninRequest.java          # Signin request DTO
│   └── AuthResponse.java           # Auth response DTO
├── repository/
│   ├── UserRepository.java         # User data access
│   ├── RoleRepository.java         # Role data access
│   └── SettingsRepository.java     # Settings data access
├── util/
│   └── JwtUtil.java                # JWT token utility
└── README.md                       # This file
```

## 🔑 API Endpoints

### 1. Sign Up
**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phoneNum": "+923001234567",
  "address": "123 Main Street",
  "city": "Karachi",
  "bloodGroup": "O+",
  "dateOfBirth": "1990-01-15",
  "role": "patient"
}
```

**Valid Roles:**
- `patient`
- `hospital_admin`
- `hospital_staff`
- `bank_staff`
- `admin`

**Success Response (201 Created):**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "patient",
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "success": true,
  "message": "Authentication successful"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

### 2. Sign In
**Endpoint:** `POST /api/auth/signin`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200 OK):**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "patient",
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "success": true,
  "message": "Authentication successful"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid password"
}
```

---

### 3. Verify Token
**Endpoint:** `POST /api/auth/verify`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
```

**Success Response (200 OK):**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "patient",
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "success": true,
  "message": "Authentication successful"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid token"
}
```

---

## ⚙️ Configuration

Update `application.properties`:

```properties
# JWT Configuration
jwt.secret=your-super-secret-key-change-this-in-production-at-least-256-bits-long
jwt.expiration=86400000  # 24 hours in milliseconds

# Token expiration options:
# 1 hour   = 3600000
# 24 hours = 86400000
# 7 days   = 604800000
```

---

## 🔒 Security Features

- ✅ BCrypt password encryption
- ✅ JWT token-based authentication
- ✅ Email validation
- ✅ Password strength validation (minimum 6 characters)
- ✅ Token verification
- ✅ CORS configuration for frontend

---

## 🧪 Testing with cURL

### Sign Up
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "patient"
  }'
```

### Sign In
```bash
curl -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Verify Token
```bash
curl -X POST http://localhost:8080/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📦 Dependencies Added

```xml
<!-- JWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>

<!-- Spring Security -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

---

## 🚀 Next Steps

1. Rebuild the project: `.\mvnw clean install`
2. Run the backend: `.\mvnw spring-boot:run`
3. Test endpoints using cURL or Postman
4. Create additional entities (Patient, Hospital, Bank, etc.)
5. Build more APIs on top of auth

---

## 📝 Database Schema

**users table:**
- user_id (UUID, Primary Key)
- role_id (UUID, Foreign Key)
- name, email, password_hash
- phone_num, address, city, blood_group
- date_of_birth, mfa_enabled, status
- created_at, updated_at

**roles table:**
- role_id (UUID, Primary Key)
- role_name (ENUM: patient, hospital_admin, etc.)

**settings table:**
- setting_id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- multi_factor_enabled, email_verified
- notification_enabled

---

## 🔗 Related Documentation

- [Supabase Schema](../../documentation/schema.sql)
- [Backend Setup](../README.md)
- [API Testing Guide](./TESTING.md)

---

**Last Updated:** March 3, 2026
