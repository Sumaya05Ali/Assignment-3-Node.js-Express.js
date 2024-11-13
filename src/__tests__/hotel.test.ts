import request from 'supertest';
import fs from 'fs';
import path from 'path';
import app from '../app';
import { Hotel } from '../models/hotelModel';

// Increase timeout to 20 seconds for all tests
jest.setTimeout(20000);

// Mock fs module
jest.mock('fs');

// Mock database path
const dbFile = './src/database.json';

// Sample valid hotel data
const validHotelData: Partial<Hotel> = {
  title: "Test Hotel",
  description: "Test Description",
  guestCount: 4,
  bedroomCount: 2,
  bathroomCount: 1,
  amenities: ["Wifi", "Pool"],
  hostInfo: "John Doe",
  address: "123 Test St",
  latitude: 45.123,
  longitude: -93.123,
  rooms: [
    {
      roomSlug: "test-room",
      roomImage: "test.jpg",
      roomTitle: "Test Room",
      bedroomCount: 1
    }
  ]
};

// Sample database data
const mockDatabaseData: Hotel[] = [
  {
    hotelId: "hotel-1",
    slug: "existing-hotel",
    images: ["/uploads/test.jpg"],
    title: "Existing Hotel",
    description: "Existing Description",
    guestCount: 4,
    bedroomCount: 2,
    bathroomCount: 1,
    amenities: ["Wifi", "Pool"],
    hostInfo: "John Doe",
    address: "123 Existing St",
    latitude: 45.123,
    longitude: -93.123,
    rooms: [
      {
        roomSlug: "existing-room",
        roomImage: "existing.jpg",
        roomTitle: "Existing Room",
        bedroomCount: 1
      }
    ]
  }
];

describe('Hotel API Endpoints', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock fs.readFileSync to return our mock database
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockDatabaseData));
    
    // Mock fs.writeFileSync to do nothing
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
  });

  // GET /hotel/:hotelId tests
  describe('GET /hotel/:hotelId', () => {
    test('should return hotel when valid ID is provided', async () => {
      const response = await request(app)
        .get('/hotel/hotel-1')
        .expect(200);

      expect(response.body).toHaveProperty('hotelId', 'hotel-1');
      expect(response.body).toHaveProperty('title', 'Existing Hotel');
    });

    test('should return 404 when hotel not found', async () => {
      const response = await request(app)
        .get('/hotel/nonexistent-hotel')
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Hotel not found');
    });
  });

  // POST /hotel tests
  describe('POST /hotel', () => {
    test('should create new hotel with valid data', async () => {
      const response = await request(app)
        .post('/hotel')
        .send(validHotelData)
        .expect(201);

      expect(response.body).toHaveProperty('hotelId');
      expect(response.body).toHaveProperty('slug');
      expect(response.body.title).toBe(validHotelData.title);
    });

    test('should return 400 when required fields are missing', async () => {
      const invalidData = { ...validHotelData };
      delete invalidData.title;

      const response = await request(app)
        .post('/hotel')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'All fields are required');
    });

    test('should return 400 when data types are invalid', async () => {
      const invalidData = {
        ...validHotelData,
        guestCount: "invalid" // should be number
      };

      const response = await request(app)
        .post('/hotel')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Invalid data types');
    });
  });

  // PUT /hotel/:hotelId tests
  describe('PUT /hotel/:hotelId', () => {
    test('should update hotel with valid data', async () => {
      const updateData = {
        ...validHotelData,
        title: "Updated Hotel",
        description: "Updated Description"
      };

      const response = await request(app)
        .put('/hotel/hotel-1')
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe("Updated Hotel");
      expect(response.body.description).toBe("Updated Description");
      expect(response.body.hotelId).toBe("hotel-1"); // should preserve hotelId
    });

    test('should return 404 when updating non-existent hotel', async () => {
      const response = await request(app)
        .put('/hotel/nonexistent-hotel')
        .send(validHotelData)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Hotel not found');
    });

    test('should return 400 when update data is invalid', async () => {
      const invalidData = {
        ...validHotelData,
        guestCount: "invalid" // should be number
      };

      const response = await request(app)
        .put('/hotel/hotel-1')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Invalid data types');
    });
  });

  // POST /images tests
  describe('POST /images', () => {
    test('should upload images and update hotel record', async () => {
      const mockFile = {
        fieldname: 'images',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test image content'),
        size: 955578
      };

      const response = await request(app)
        .post('/images')
        .field('hotelId', 'hotel-1')
        .attach('images', Buffer.from('test image content'), 'test.jpg')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Images uploaded successfully');
      expect(response.body).toHaveProperty('images');
      expect(Array.isArray(response.body.images)).toBe(true);
    });

    test('should return 404 when hotel not found for image upload', async () => {
      const response = await request(app)
        .post('/images')
        .field('hotelId', 'nonexistent-hotel')
        .attach('images', Buffer.from('test image content'), 'test.jpg')
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Hotel not found');
    });
  });

  // Validation middleware tests
  describe('Validation Middleware', () => {
    test('should validate room structure', async () => {
      const invalidRoomData = {
        ...validHotelData,
        rooms: [{
          roomSlug: "test-room",
          // missing required fields
        }]
      };

      const response = await request(app)
        .post('/hotel')
        .send(invalidRoomData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Invalid room data structure');
    });

    test('should validate amenities array', async () => {
      const invalidAmenitiesData = {
        ...validHotelData,
        amenities: "invalid" // should be array
      };

      const response = await request(app)
        .post('/hotel')
        .send(invalidAmenitiesData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Invalid data types');
    });
  });
});
