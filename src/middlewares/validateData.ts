import { Request, Response, NextFunction } from 'express';
import { Hotel, Room } from '../models/hotelModel';

export const validateHotelData = (req: Request, res: Response, next: NextFunction): void => {
  const { title, description, guestCount, bedroomCount, bathroomCount, amenities, 
         hostInfo, address, latitude, longitude, rooms } = req.body;

  // Check if required fields are present
  if (!title || !description || !guestCount || !bedroomCount || !bathroomCount || 
      !amenities || !hostInfo || !address || latitude === undefined || longitude === undefined || !rooms) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  // Validate data types
  if (typeof title !== 'string' ||
      typeof description !== 'string' ||
      typeof guestCount !== 'number' ||
      typeof bedroomCount !== 'number' ||
      typeof bathroomCount !== 'number' ||
      !Array.isArray(amenities) ||
      typeof hostInfo !== 'string' ||
      typeof address !== 'string' ||
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      !Array.isArray(rooms)) {
    res.status(400).json({ message: 'Invalid data types' });
    return;
  }

  // Validate rooms structure
  const isValidRoom = (room: Room): boolean => {
    return typeof room.roomSlug === 'string' &&
           typeof room.roomImage === 'string' &&
           typeof room.roomTitle === 'string' &&
           typeof room.bedroomCount === 'number';
  };

  if (!rooms.every(isValidRoom)) {
    res.status(400).json({ message: 'Invalid room data structure' });
    return;
  }

  next();
};
