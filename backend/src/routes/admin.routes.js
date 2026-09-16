import { Router } from 'express';
import { adminAuth } from '../middlewares/auth.middleware.js';
import * as admin from '../controllers/adminController.js';

const router = Router();

// Kirish — yagona ochiq yo'l
router.post('/login', admin.login);

// Qolgan hammasi token talab qiladi
router.use(adminAuth);

router.get('/me', admin.me);
router.get('/stats', admin.stats);

// Sozlamalar
router.get('/settings', admin.getSettings);
router.put('/settings', admin.updateSettings);
router.post('/settings/password', admin.changePassword);

// Rasm yuklash (brauzer rasmni oldindan kichraytirib yuboradi)
router.post('/upload', admin.uploadImage);

// Buyurtmalar
router.get('/orders', admin.listOrders);
router.get('/orders/:id', admin.getOrder);
router.patch('/orders/:id/status', admin.updateOrderStatus);
router.patch('/orders/:id/payment', admin.updatePaymentStatus);
router.delete('/orders/:id', admin.deleteOrder);

// Mahsulotlar
router.get('/products', admin.listProducts);
router.post('/products', admin.createProduct);
router.put('/products/:id', admin.updateProduct);
router.delete('/products/:id', admin.deleteProduct);

// Kategoriyalar
router.get('/categories', admin.listCategories);
router.post('/categories', admin.createCategory);
router.put('/categories/:id', admin.updateCategory);
router.delete('/categories/:id', admin.deleteCategory);

// Promokodlar
router.get('/promos', admin.listPromos);
router.post('/promos', admin.createPromo);
router.put('/promos/:id', admin.updatePromo);
router.delete('/promos/:id', admin.deletePromo);

// Stories
router.get('/stories', admin.listStories);
router.post('/stories', admin.createStory);
router.delete('/stories/:id', admin.deleteStory);

// Mijozlar
router.get('/users', admin.listUsers);
router.post('/users/message', admin.messageUser);

export default router;
