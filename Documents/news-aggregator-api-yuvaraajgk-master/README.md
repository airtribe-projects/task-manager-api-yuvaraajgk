# News Aggregator API

A RESTful API for a personalized news aggregator built with Node.js and Express.js.

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your keys:
   ```env
   JWT_SECRET=your-secret-key-here
   NEWS_API_KEY=your-news-api-key
   ```

3. Start the server:
   ```bash
   node app.js
   ```
   
   Server runs on `http://localhost:3001`

## API Endpoints

### Authentication

**POST** `/users/signup` - Register a new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "preferences": ["tech", "sports"]
}
```

**POST** `/users/login` - Login and get token
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Preferences

**GET** `/users/preferences` - Get user preferences
- Requires: `Authorization: Bearer <token>`

**PUT** `/users/preferences` - Update preferences
- Requires: `Authorization: Bearer <token>`
```json
{
  "preferences": ["tech", "sports", "movies"]
}
```

### News

**GET** `/news` - Get news articles based on preferences
- Requires: `Authorization: Bearer <token>`

## Testing

Run tests:
```bash
npm test
```

## Example Usage

1. Register: `POST /users/signup`
2. Login: `POST /users/login` (save the token)
3. Get preferences: `GET /users/preferences` (with token)
4. Update preferences: `PUT /users/preferences` (with token)
5. Get news: `GET /news` (with token)
