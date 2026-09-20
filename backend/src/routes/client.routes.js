import { Router } from 'express';
import { telegramAuth } from '../middlewares/auth.middleware.js';
import * as cart from '../controllers/cartController.js';

const router = Router();

// Barcha mijoz yo'llari Telegram autentifikatsiyasidan o'tadi
router.use(telegramAuth);

router.get('/init', cart.init);

router.get('/products', cart.listProducts);
router.get('/products/:id', cart.getProduct);

router.get('/favorites', cart.listFavorites);
router.post('/favorites/:productId', cart.toggleFavorite);

router.post('/profile', cart.updateProfile);
router.post('/request-phone', cart.requestPhoneViaBot);

// Lokatsiya: chatdagi tugmani chaqirish va natijasini o'qish
router.post('/request-location', cart.requestLocationViaBot);
router.get('/location', cart.getMyLocation);

router.post('/promo/check', cart.checkPromo);

router.post('/orders', cart.createOrder);
router.get('/orders', cart.listMyOrders);
router.post('/orders/:id/reorder', cart.reorder);

export default router;
