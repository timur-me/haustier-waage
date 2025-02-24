# 🔌 API Documentation

## Base URLs

- Frontend: `https://pet.executable.fun`
- Backend API: `https://petapi.executable.fun`
- WebSocket: `wss://petapi.executable.fun/ws`

## Authentication

All API endpoints (except authentication endpoints) require JWT authentication using Bearer token.

```http
Authorization: Bearer <access_token>
```

### Authentication Endpoints

#### POST /auth/register

Register a new user.

**Request Body:**

```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "access_token": "string",
  "token_type": "bearer",
  "expires_in": 1800
}
```

#### POST /auth/login

Authenticate user and get access token.

**Request Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "access_token": "string",
  "token_type": "bearer",
  "expires_in": 1800
}
```

#### POST /auth/verify-email/{token}

Verify user's email address.

**Response:**

```json
{
  "message": "Email verified successfully"
}
```

#### POST /auth/password-reset

Request password reset email.

**Request Body:**

```json
{
  "email": "string"
}
```

**Response:**

```json
{
  "message": "If the email exists, a password reset link will be sent"
}
```

#### POST /auth/reset-password/{token}/confirm

Reset password using token.

**Request Body:**

```json
{
  "password": "string"
}
```

#### POST /auth/refresh-token

Get a new access token.

**Response:**

```json
{
  "access_token": "string",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### User Management

#### GET /api/users/me

Get current user's profile.

**Response:**

```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "email_verified": boolean,
  "first_name": "string",
  "last_name": "string",
  "profile_picture": {
    "id": "uuid",
    "filename": "string",
    "content_type": "string",
    "size": number,
    "created_at": "datetime",
    "updated_at": "datetime"
  },
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

#### PATCH /api/users/me

Update current user's profile.

**Request Body:**

```json
{
  "username": "string",
  "first_name": "string",
  "last_name": "string",
  "profile_picture_id": "uuid"
}
```

#### POST /api/users/password

Update user's password.

**Request Body:**

```json
{
  "current_password": "string",
  "new_password": "string"
}
```

### Pet Management

#### POST /api/animals

Create a new pet.

**Request Body:**

```json
{
  "name": "string",
  "description": "string",
  "birth_date": "date",
  "species": "string",
  "breed": "string",
  "profile_picture_id": "uuid"
}
```

#### GET /api/animals

Get all pets for current user.

#### GET /api/animals/{animal_id}

Get specific pet details.

#### PATCH /api/animals/{animal_id}

Update pet details.

**Request Body:**

```json
{
  "name": "string",
  "description": "string",
  "birth_date": "date",
  "species": "string",
  "breed": "string",
  "profile_picture_id": "uuid"
}
```

#### DELETE /api/animals/{animal_id}

Delete a pet and all associated weight records.

### Weight Management

#### POST /api/weights

Add a new weight record.

**Request Body:**

```json
{
  "animal_id": "uuid",
  "weight": number,
  "date": "datetime"
}
```

#### GET /api/weights/animal/{animal_id}

Get all weight records for a specific pet.

#### PUT /api/weights/{weight_id}

Update a weight record.

**Request Body:**

```json
{
  "weight": number,
  "date": "datetime"
}
```

#### DELETE /api/weights/{weight_id}

Delete a weight record.

### Media Management

#### POST /api/media

Upload a media file.

**Request Body:**

- Form data with file upload
- Supported types: image/jpeg, image/png, image/gif, image/webp
- Max file size: 5MB

**Response:**

```json
{
  "id": "uuid",
  "filename": "string",
  "content_type": "string",
  "size": number,
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

#### GET /api/media/{filename}

Get media file by filename.

#### DELETE /api/media/{media_id}

Delete a media file.

### WebSocket API

Connect to WebSocket endpoint with authentication token:

```
wss://petapi.executable.fun/ws/{token}
```

#### Message Types

**Weight Created:**

```json
{
  "type": "WEIGHT_CREATED",
  "data": {
    "id": "uuid",
    "animal_id": "uuid",
    "weight": number,
    "date": "datetime",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

**Weight Updated:**

```json
{
  "type": "WEIGHT_UPDATED",
  "data": {
    "id": "uuid",
    "animal_id": "uuid",
    "weight": number,
    "date": "datetime",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

**Weight Deleted:**

```json
{
  "type": "WEIGHT_DELETED",
  "data": {
    "id": "uuid",
    "animal_id": "uuid"
  }
}
```

**Animal Created/Updated:**

```json
{
  "type": "ANIMAL_CREATED" | "ANIMAL_UPDATED",
  "data": {
    "id": "uuid",
    "name": "string",
    "owner_id": "uuid",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

**Animal Deleted:**

```json
{
  "type": "ANIMAL_DELETED",
  "data": {
    "id": "uuid"
  }
}
```

## Error Responses

All error responses follow this format:

```json
{
  "detail": "Error message"
}
```

Common HTTP status codes:

- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 422: Validation Error
- 429: Too Many Requests
- 500: Internal Server Error

## Rate Limiting

- Authentication endpoints: 20 requests per minute
- Other endpoints: 100 requests per minute per user

## Support

For support, please contact support@pet.executable.fun
