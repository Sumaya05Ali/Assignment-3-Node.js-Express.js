# Assignment-3-Node.js-Express.js

#Hotel Management API
This is a backend API built using Node.js, Express.js, and TypeScript to manage hotel details stored in a JSON file. The API allows you to create, retrieve, update, and upload images for hotel records.

#Features
- POST /hotel: Create a new hotel record.
- GET /hotel/{hotelId}: Retrieve hotel details by hotelId or slug.
- PUT /hotel/{hotelId}: Update an existing hotel.
- POST /images: Upload multiple images for a hotel.

#Installation
Clone the repository:
  ```bash
git clone https://github.com/Sumaya05Ali/Assignment-3-Node.js-Express.js.git
 ```
Navigate to the project folder:
```bash
cd Assignment-3-Node.js-Express.js
```

Install dependencies:
```bash
npm install
```

Install TypeScript and type definitions:
```bash
npm install --save-dev typescript @types/express @types/multer @types/jest
```
Compile TypeScript:
```bash
npx tsc
```

Run the server:
```bash
node dist/app.js
```
#API Endpoints
- POST /hotel: Create a new hotel (JSON format).
- GET /hotel/{hotelId}: Get hotel details by hotelId or slug.
- PUT /hotel/{hotelId}: Update hotel information.
- POST /images: Upload hotel images as multipart form data.

#Running Tests
To run unit tests:
```bash
npm test
```
#Dependencies
- express: Web framework for Node.js.
- multer: File upload handling.
- slugify: Generates URL-friendly slugs.
- jest: Testing framework.
- supertest: HTTP assertions for API testing.
