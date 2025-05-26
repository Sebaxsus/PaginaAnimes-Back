# PaginaAnimes-Back

A RESTful API and server for the MiPaginaReact client, managing anime and manga data, authentication, and business logic. Built with Node.js and Express, using MVC architecture.

## Features

- REST API for anime and manga resources
- JWT authentication and authorization
- Modular MVC structure (Models, Controllers, Routes)
- Input validation and error handling with middleware
- SQL database integration (see `PaginaMangasYAnime.sql`)
- Unit and integration tests with Jest
- Utilities for data handling and custom logic
- Mocking for robust test coverage

## Folder Structure

```
.
├── app.js                  # Main application entry point
├── jest.config.js          # Jest test configuration
├── PaginaMangasYAnime.sql  # Database schema and seed
│
├── Back/
│   ├── Models/             # Database models
│   ├── Controllers/        # Business logic/controllers
│   ├── Routes/             # API route definitions
│   ├── Middleware/         # Authentication, error, and validation middleware
│   ├── Schemas/            # Data validation schemas (e.g. Joi)
│   ├── Utils/              # Utility functions/helpers
│   ├── Auth/               # Authentication logic (JWT, login, register)
│   ├── __mocks__/Models/   # Model mocks for testing
│
├── Pruebas_API/            # API test scripts/examples
├── Test/                   # Automated tests (Jest)
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- A running SQL database (see SQL file for schema)

### Installation

```bash
git clone https://github.com/Sebaxsus/PaginaAnimes-Back.git
cd PaginaAnimes-Back
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and fill in your database and secret values.

### Database Setup

1. Create the database using the provided SQL script:
   ```bash
   # In your SQL client:
   source PaginaMangasYAnime.sql
   ```
2. Configure your `.env` to match your DB credentials.

### Running the Server

```bash
npm start
```
or (for nodemon/dev)
```bash
npm run dev
```

Server will start on the port defined in `.env` or default (e.g., 3000).

### Running Tests

```bash
npm test
```

## API Overview

See the [routes](./app/Routes) and [controllers](./app/Controllers) for available endpoints and request/response structure.

## Contributing

Pull requests and issues are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).  
See the [LICENSE](./LICENSE) file for more details.

---

For questions or support, open an issue!