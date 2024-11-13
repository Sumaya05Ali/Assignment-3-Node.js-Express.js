import { Request, Response } from 'express';
import fs from 'fs';
import slugify from 'slugify';
import multer, { StorageEngine } from 'multer';

// Interface definitions
export interface Room {
  roomSlug: string;
  roomImage: string;
  roomTitle: string;
  bedroomCount: number;
}

export interface Hotel {
  hotelId: string;
  slug: string;
  images: string[];
  title: string;
  description: string;
  guestCount: number;
  bedroomCount: number;
  bathroomCount: number;
  amenities: string[];
  hostInfo: string;
  address: string;
  latitude: number;
  longitude: number;
  rooms: Room[];
}

// Mock database file
const dbFile = './src/database.json';

// Function to read the hotel data
const readData = (): Hotel[] => {
  const data = fs.readFileSync(dbFile, 'utf-8');
  return JSON.parse(data);
};

// Function to write hotel data
const writeData = (data: Hotel[]): void => {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
};

// Create a new hotel
export const createHotel = (req: Request, res: Response): void => {
  const { title, description, guestCount, bedroomCount, bathroomCount, amenities, hostInfo, address, latitude, longitude, rooms } = req.body;

  const hotels = readData();
  const slug = slugify(title, { lower: true });
  const hotelId = `hotel-${hotels.length + 1}`;

  const newHotel: Hotel = {
    hotelId,
    slug,
    images: [],
    title,
    description,
    guestCount,
    bedroomCount,
    bathroomCount,
    amenities,
    hostInfo,
    address,
    latitude,
    longitude,
    rooms
  };

  hotels.push(newHotel);
  writeData(hotels);

  res.status(201).json(newHotel);
};

// Get hotel details by ID
export const getHotel = (req: Request, res: Response): void => {
  const hotels = readData();
  const hotel = hotels.find(h => h.hotelId === req.params.hotelId);

  if (!hotel) {
    res.status(404).json({ message: 'Hotel not found' });
  } else {
    res.status(200).json(hotel);
  }
};

// Update hotel details
export const updateHotel = (req: Request, res: Response): void => {
  try {
    const hotels = readData();
    const hotelIndex = hotels.findIndex(h => h.hotelId === req.params.hotelId);

    if (hotelIndex === -1) {
      res.status(404).json({ message: 'Hotel not found' });
      return;
    }

    const existingHotel = hotels[hotelIndex];
    const updatedHotel: Hotel = {
      ...existingHotel,
      ...req.body,
      hotelId: existingHotel.hotelId, // Preserve the original hotelId
      slug: req.body.title ? slugify(req.body.title, { lower: true }) : existingHotel.slug,
      images: req.body.images || existingHotel.images
    };

    hotels[hotelIndex] = updatedHotel;
    writeData(hotels);

    res.status(200).json(updatedHotel);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating hotel', 
      error: (error as Error).message 
    });
  }
};

const storage: StorageEngine = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void): void {
    cb(null, 'uploads/');
  },
  filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void): void {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage }).array('images', 10);

export const uploadImages = (req: Request, res: Response): void => {
  upload(req, res, (err: any) => {
    if (err) {
      return res.status(500).json({ message: 'Error uploading images', error: err });
    }

    const hotelId = req.body.hotelId;
    const hotels = readData();
    const hotel = hotels.find(h => h.hotelId === hotelId);

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    if (Array.isArray(req.files) && req.files.length > 0) {
      const imageUrls = req.files.map(file => `http://localhost:3000/uploads/${file.filename}`);
      hotel.images.push(...imageUrls);
    }

    writeData(hotels);

    res.status(200).json({ message: 'Images uploaded successfully', images: hotel.images });
  });
};
