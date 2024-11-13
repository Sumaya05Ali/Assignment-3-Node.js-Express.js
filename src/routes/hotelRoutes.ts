import { Router } from 'express';
import { createHotel, getHotel, updateHotel, uploadImages } from '../controllers/hotelController';
import { validateHotelData } from '../middlewares/validateData';

const router: Router = Router();

// POST /hotel - Create a new hotel
router.post('/hotel', validateHotelData, createHotel);

// GET /hotel/:hotelId - Get hotel details by ID
router.get('/hotel/:hotelId', getHotel);

// PUT /hotel/:hotelId - Update hotel details
router.put('/hotel/:hotelId', validateHotelData, updateHotel);

// POST /images - Upload multiple images and update hotel record
router.post('/images', uploadImages);

export default router;
