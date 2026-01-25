# System Architecture

## Overview
Đăng Khoa Sport follows a layered Model-View-Controller (MVC) architecture, enhanced with a Service Layer and Repository Pattern for better separation of concerns and testability.

## Diagram

```mermaid
graph TD
    Client[Client (Browser/Mobile)]
    LB[Nginx Load Balancer / Reverse Proxy]
    
    subgraph "Application Cluster"
        App[Node.js Express App]
        Cache[Redis Cache]
    end
    
    subgraph "Data Layer"
        DB[(MongoDB Primary)]
    end

    Client -->|HTTPS| LB
    LB -->|HTTP| App
    
    App -->|Read/Write| Cache
    App -->|Persist| DB
```

## Component Breakdown

### 1. Presentation Layer (Views & Routes)
- **Tech**: EJS Templates, Bootstrap 5, CSS3
- **Responsibility**: Rendering UI, handling client interactions.
- **Routes**: `src/routes/*` map URLs to controllers.

### 2. Control Layer (Controllers)
- **Tech**: Express.js Middleware
- **Responsibility**: Request validation, response formatting, HTTP status codes.
- **Location**: `src/controllers/*`
- **Key Components**:
    - `authController`: Authentication flow.
    - `productController`: Product management.
    - `orderController`: Checkout and history.

### 3. Service Layer (Business Logic)
- **Pattern**: Service Object Pattern
- **Responsibility**: Complex business rules, reusable logic, calling repositories.
- **Location**: `src/services/*`
- **Example**: `authService` handles password hashing comparison and JWT generation.

### 4. Data Access Layer (Repositories)
- **Pattern**: Repository Pattern
- **Responsibility**: Direct database interaction, query abstraction.
- **Location**: `src/repositories/*`
- **Key**: `BaseRepository` provides generic CRUD, extended by specific repositories.

### 5. Infrastructure
- **Database**: MongoDB (Mongoose ODM)
- **Caching**: Redis (Sessions & Data Caching)
- **Containerization**: Docker & Docker Compose

## Data Flow
1. **Request**: Hits Nginx -> Forwarded to Express.
2. **Middleware**: Security (Helmet, CORS), Body Parsing, Logging (Winston).
3. **Route**: Dispatches to Controller.
4. **Controller**: Validates input -> Calls Service.
5. **Service**: Checks Cache -> Calls Repository -> Applies Logic.
6. **Repository**: Executes DB Query.
7. **Response**: Data flows back up stack -> JSON or HTML response sent.
