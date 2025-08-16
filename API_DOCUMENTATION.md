# LSTS Events API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication
The API uses Laravel Sanctum for authentication. Include the bearer token in the Authorization header:
```
Authorization: Bearer {token}
```

## Response Format
All API responses follow this structure:
```json
{
    "success": true/false,
    "message": "Response message",
    "data": {...}, // Response data
    "errors": {...} // Validation errors (if any)
}
```

---

## Authentication Endpoints

### POST /auth/login
Login user and get access token.

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "user@example.com"
        },
        "token": "sanctum_token_here"
    },
    "redirect": "/admin/events"
}
```

### POST /auth/register
Register new user account.

**Request Body:**
```json
{
    "name": "John Doe",
    "email": "user@example.com",
    "password": "password123",
    "password_confirmation": "password123"
}
```

### POST /auth/logout
Logout current user (requires authentication).

### GET /auth/user
Get current authenticated user info.

### GET /auth/check-session
Check if current session is valid.

### POST /auth/refresh-session
Refresh current session.

### GET /auth/permissions
Get user permissions.

### GET /auth/users
Get all users (admin only).

**Query Parameters:**
- `search`: Search in name or email
- `role`: Filter by user role
- `length`: Number of results per page (default: 100)

---

## Categories API

### GET /categories
Get all categories.

**Query Parameters:**
- `search`: Search by category name
- `category_user_email`: Filter by user email assignment
- `user_email`: Show categories assigned to user or public ones

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "category_id": 1,
            "category_name": "Conference",
            "category_description": "Academic conferences",
            "is_public": 1,
            "parent_id": null,
            "events_count": 5,
            "category_users_count": 3,
            "created_at": "2024-01-01T00:00:00.000000Z",
            "updated_at": "2024-01-01T00:00:00.000000Z"
        }
    ],
    "total": 1
}
```

### POST /categories
Create new category.

**Request Body:**
```json
{
    "category_name": "New Category",
    "category_description": "Description here",
    "is_public": true,
    "parent_id": 1
}
```

### GET /categories/{id}
Get specific category by ID.

### PUT /categories/{id}
Update specific category.

### DELETE /categories/{id}
Delete specific category (soft delete).

### GET /categories/statistics
Get category statistics.

**Response:**
```json
{
    "success": true,
    "data": {
        "total_categories": 10,
        "public_categories": 7,
        "private_categories": 3,
        "assigned_users": 15
    }
}
```

### GET /categories/tree
Get category tree structure.

**Query Parameters:**
- `exclude_id`: Exclude specific category from results
- `search`: Search by category name

### POST /categories/{id}/assign-users
Assign users to category.

**Request Body:**
```json
{
    "user_emails": ["user1@example.com", "user2@example.com"]
}
```

### GET /categories/{id}/users
Get users assigned to category.

### PUT /categories/{id}/move
Move category to different parent.

**Request Body:**
```json
{
    "parent_id": 2
}
```

---

## Events API

### GET /events
Get all events.

**Query Parameters:**
- `search`: Search by event name
- `start_date`: Filter events from this date (YYYY-MM-DD)
- `end_date`: Filter events until this date (YYYY-MM-DD)
- `category_id`: Filter by category
- `is_big_event`: Filter big events (0/1)
- `create_by`: Filter by creator
- `is_admin`: Check admin permissions
- `per_page`: Results per page (default: 15)

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "event_name": "Tech Conference 2024",
            "event_date": "2024-06-15",
            "event_time": "09:00:00",
            "location": "Conference Hall A",
            "description": "Annual technology conference",
            "category_id": 1,
            "is_big_event": 1,
            "path": "/events/2024/2024-06-15 Tech Conference 2024",
            "category": {
                "category_id": 1,
                "category_name": "Conference"
            },
            "media": []
        }
    ],
    "total": 1,
    "per_page": 15,
    "current_page": 1,
    "last_page": 1
}
```

### POST /events
Create new event.

**Request Body:**
```json
{
    "event_name": "New Event",
    "event_date": "2024-12-25",
    "event_time": "14:00",
    "location": "Main Hall",
    "description": "Event description here",
    "category_id": 1,
    "is_big_event": false,
    "media": [
        {
            "file_path": "/storage/uploads/temp/file.jpg",
            "file_name": "image.jpg",
            "is_show": 1,
            "order": 1
        }
    ]
}
```

### GET /events/{id}
Get specific event by ID.

**Query Parameters:**
- `is_show`: Filter media by visibility (0/1)

### PUT /events/{id}
Update specific event.

### DELETE /events/{id}
Delete specific event (soft delete).

### POST /events/upload
Upload files for events.

**Request Body:** (multipart/form-data)
- `file_data[]`: Array of files to upload

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "file_path": "/storage/uploads/temp/abc123.jpg",
            "file_name": "abc123.jpg",
            "original_name": "photo.jpg",
            "size": 1024000,
            "mime_type": "image/jpeg"
        }
    ]
}
```

### GET /events/years
Get available event years.

### GET /events/statistics
Get event statistics.

**Response:**
```json
{
    "success": true,
    "data": {
        "total_events": 25,
        "upcoming_events": 10,
        "big_events": 5,
        "categories_with_events": 8
    }
}
```

---

## Event Media API

### GET /event-media/slides
Get slides from media directory.

### POST /event-media/import
Import media file to event.

**Request Body:**
```json
{
    "media_id": 1,
    "event_id": 1
}
```

### DELETE /event-media/{id}
Delete event media.

### PUT /event-media/{id}/visibility
Set media visibility.

**Request Body:**
```json
{
    "is_show": 1
}
```

### PUT /event-media/{id}/order
Update media order.

**Request Body:**
```json
{
    "order": 5
}
```

### PUT /event-media/bulk-update
Bulk update multiple media files.

**Request Body:**
```json
{
    "updates": [
        {
            "media_id": 1,
            "is_show": 1,
            "order": 1
        },
        {
            "media_id": 2,
            "is_show": 0,
            "order": 2
        }
    ]
}
```

---

## Public Endpoints

### GET /public/categories
Get public categories (no authentication required).

---

## Error Codes

- **200**: Success
- **201**: Created successfully
- **400**: Bad request / Validation error
- **401**: Unauthorized / Authentication required
- **403**: Forbidden / Insufficient permissions
- **404**: Resource not found
- **422**: Validation failed
- **500**: Internal server error

---

## Rate Limiting

API requests are rate limited to:
- 60 requests per minute for authenticated users
- 30 requests per minute for guests

When rate limit is exceeded, you'll receive a 429 status code.

---

## File Upload Guidelines

### Supported File Types
- **Images**: jpg, jpeg, png, gif
- **Videos**: mp4, avi, mov, wmv

### File Size Limits
- **Images**: Max 20MB
- **Videos**: Max 512MB

### Upload Process
1. Use `/events/upload` endpoint to upload files
2. Files are stored temporarily in `/storage/uploads/temp/`
3. Include file paths in event creation/update request
4. Files are moved to event-specific folders automatically

---

## Examples

### Complete Event Creation Flow

1. **Upload files:**
```bash
curl -X POST http://localhost:8000/api/events/upload \
  -H "Authorization: Bearer {token}" \
  -F "file_data[]=@image1.jpg" \
  -F "file_data[]=@video1.mp4"
```

2. **Create event with uploaded files:**
```bash
curl -X POST http://localhost:8000/api/events \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "Sample Event",
    "event_date": "2024-12-25",
    "location": "Main Hall",
    "description": "A sample event",
    "category_id": 1,
    "media": [
      {
        "file_path": "/storage/uploads/temp/abc123.jpg",
        "is_show": 1,
        "order": 1
      }
    ]
  }'
```

### Category Management Flow

1. **Create category:**
```bash
curl -X POST http://localhost:8000/api/categories \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "category_name": "Workshop",
    "category_description": "Educational workshops",
    "is_public": true
  }'
```

2. **Assign users to category:**
```bash
curl -X POST http://localhost:8000/api/categories/1/assign-users \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "user_emails": ["user1@example.com", "user2@example.com"]
  }'
```

---

## Development Notes

- All timestamps are in UTC
- Soft deletes are used for categories and events
- File paths are relative to storage/app/public
- Category hierarchy supports unlimited depth
- Event folders are organized by year and date
- Media files are automatically moved to event folders
- Permission system uses Spatie Laravel Permission package