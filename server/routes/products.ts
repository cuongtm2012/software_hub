import { Router } from 'express';
import { prisma } from '../../database/prisma';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createReviewSchema = z.object({
  reviewerName: z.string().min(1, 'Tên người đánh giá không được để trống'),
  rating: z.number().min(1).max(5),
  reviewText: z.string().min(10, 'Nội dung đánh giá phải có ít nhất 10 ký tự'),
  verifiedPurchase: z.boolean().optional().default(false)
});

// GET /api/products/:id - Lấy chi tiết sản phẩm
router.get('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: {
          orderBy: { position: 'asc' }
        },
        packages: true,
        reviews: {
          orderBy: { reviewDate: 'desc' }
        },
        faqs: true,
        relatedProducts: {
          include: {
            relatedProduct: {
              include: {
                images: {
                  where: { isThumbnail: true },
                  take: 1
                }
              }
            }
          },
          take: 4
        }
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    // Tính toán rating trung bình
    const averageRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

    // Đếm số lượng đánh giá theo rating
    const ratingDistribution = {
      5: product.reviews.filter(r => r.rating === 5).length,
      4: product.reviews.filter(r => r.rating === 4).length,
      3: product.reviews.filter(r => r.rating === 3).length,
      2: product.reviews.filter(r => r.rating === 2).length,
      1: product.reviews.filter(r => r.rating === 1).length,
    };

    res.json({
      ...product,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: product.reviews.length,
      ratingDistribution
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thông tin sản phẩm' });
  }
});

// POST /api/products/:id/reviews - Tạo review mới
router.post('/:id/reviews', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    // Validate input
    const validatedData = createReviewSchema.parse(req.body);

    // Kiểm tra sản phẩm có tồn tại không
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    // Tạo review
    const review = await prisma.review.create({
      data: {
        productId,
        reviewerName: validatedData.reviewerName,
        rating: validatedData.rating,
        reviewText: validatedData.reviewText,
        verifiedPurchase: validatedData.verifiedPurchase,
        reviewDate: new Date()
      }
    });

    res.status(201).json(review);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Dữ liệu không hợp lệ', 
        errors: error.errors 
      });
    }
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Lỗi khi tạo đánh giá' });
  }
});

// PUT /api/products/:id/reviews/:reviewId/helpful - Tăng helpful count
router.put('/:id/reviews/:reviewId/helpful', async (req, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId);

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        helpfulCount: {
          increment: 1
        }
      }
    });

    res.json(review);
  } catch (error) {
    console.error('Error updating helpful count:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật helpful count' });
  }
});

// POST /api/products/:id/purchase - Mua sản phẩm
router.post('/:id/purchase', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { packageId, email } = req.body;

    if (!packageId || !email) {
      return res.status(400).json({ 
        message: 'Vui lòng chọn gói và nhập email' 
      });
    }

    // Lấy thông tin package
    const packageInfo = await prisma.package.findUnique({
      where: { id: packageId }
    });

    if (!packageInfo) {
      return res.status(404).json({ message: 'Không tìm thấy gói mua' });
    }

    // Tính giá cuối cùng
    const totalPrice = packageInfo.price * (1 - packageInfo.discountPercent / 100);

    // Tạo order
    const order = await prisma.order.create({
      data: {
        productId,
        packageId,
        email,
        totalPrice,
        status: 'pending'
      }
    });

    res.status(201).json({ 
      order,
      message: 'Đơn hàng đã được tạo thành công' 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Lỗi khi tạo đơn hàng' });
  }
});

export default router;
