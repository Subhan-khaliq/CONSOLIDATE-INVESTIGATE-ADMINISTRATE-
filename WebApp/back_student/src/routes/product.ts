import { Router } from 'express';
import ProductController from '../controller/ProductController';
import { checkJwt } from '../middlewares/checkJwt';
import { checkRole } from '../middlewares/checkRole';

const router = Router();

// Get all products
router.get('/', ProductController.listAll);

// Get one by id
router.get('/:id', ProductController.getOneById);

// Create new product
router.post('/', [checkJwt, checkRole(['ADMIN'])], ProductController.newProduct);

// Edit product
router.patch('/:id', [checkJwt, checkRole(['ADMIN'])], ProductController.editProduct);

// Delete product
router.delete('/:id', [checkJwt, checkRole(['ADMIN'])], ProductController.deleteProduct);

export default router;
