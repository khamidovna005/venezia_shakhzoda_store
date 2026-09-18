import config from '../config/default.js';
import prisma from '../database/connection.js';
import UserModel from '../models/User.js';
import ProductModel from '../models/Product.js';
import CategoryModel from '../models/Category.js';
import StoryModel from '../models/Story.js';
import PromoModel from '../models/Promo.js';
import OrderModel from '../models/Order.js';
import SettingModel from '../models/Setting.js';
import { safeSend, bot } from '../core/bot.js';
import { t } from '../utils/i18n.js';
import { formatMoney, toPlain } from '../utils/helpers.js';
import { paymentUrlFor } from '../utils/payment.js';

/* ------------------------------------------------------------------ */
/*  BOSHLANG'ICH MA'LUMOTLAR                                           */
/* ------------------------------------------------------------------ */

export async function init(req, res, next) {
  try {
    const [categories, stories, upsell, shop, promos] = await Promise.all([
      CategoryModel.listActive(),
      StoryModel.listActive(),
      prisma.product.findFirst({
        where: { isActive: true, category: { slug: 'aksessuar' } },
        orderBy: { price: 'asc' },
        include: { variants: true },
      }),
      SettingModel.getShopInfo(),
      PromoModel.listPublic(),
    ]);

    res.json({
      ok: true,
      user: toPlain(req.user),
      categories,
      stories,
      upsell,
      promos,
      settings: {
        shopName: shop.shopName,
        currency: shop.currency,
        deliveryFee: shop.deliveryFee,
        freeDeliveryFrom: shop.freeDeliveryFrom,
        payments: {
          cash: true,
          cardTransfer: Boolean(shop.cardNumber),
          payme: Boolean(shop.paymeMerchantId),
          click: Boolean(shop.clickServiceId && shop.clickMerchantId),
        },
        card: {
          number: shop.cardNumber,
          holder: shop.cardHolder,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------ */
/*  KATALOG                                                            */
/* ------------------------------------------------------------------ */

export async function listProducts(req, res, next) {
  try {
    const products = await ProductModel.listForClient({
      categoryId: req.query.category || undefined,
      search: req.query.search || undefined,
      minPrice: req.query.minPrice || undefined,
      maxPrice: req.query.maxPrice || undefined,
      sort: req.query.sort || 'new',
    });
    res.json({ ok: true, products });
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product || !product.isActive) {
      return res.status(404).json({ ok: false, error: 'Mahsulot topilmadi' });
    }
    res.json({ ok: true, product });
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------ */
/*  SEVIMLILAR                                                         */
/* ------------------------------------------------------------------ */

export async function listFavorites(req, res, next) {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: { product: { include: { category: true, variants: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ ok: true, products: favorites.map((f) => f.product) });
  } catch (err) {
    next(err);
  }
}

export async function toggleFavorite(req, res, next) {
  try {
    const productId = Number(req.params.productId);
    const existing = await prisma.favorite.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return res.json({ ok: true, favorite: false });
    }

    await prisma.favorite.create({ data: { userId: req.user.id, productId } });
    res.json({ ok: true, favorite: true });
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------ */
/*  PROFIL                                                             */
/* ------------------------------------------------------------------ */

export async function updateProfile(req, res, next) {
  try {
    const data = {};
    if (req.body.phone) data.phone = String(req.body.phone).trim();
    if (req.body.language) data.language = req.body.language === 'ru' ? 'ru' : 'uz';
    if (req.body.seenIntro === true) data.seenIntro = true;

    const user = await UserModel.update(req.user.id, data);
    res.json({ ok: true, user: toPlain(user) });
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------ */
/*  PROMOKOD                                                           */
/* ------------------------------------------------------------------ */

export async function checkPromo(req, res, next) {
  try {
    const { code, subtotal } = req.body;
    const result = await PromoModel.validate(code, Number(subtotal) || 0);

    if (!result.ok) {
      const messages = {
        EMPTY: 'Promokodni kiriting',
        NOT_FOUND: 'Bunday promokod topilmadi',
        EXPIRED: 'Promokod muddati tugagan',
        LIMIT: 'Promokod ishlatilib bo‘lingan',
        MIN_TOTAL: `Bu promokod kamida ${formatMoney(result.minTotal, config.currency)} lik buyurtmaga amal qiladi`,
      };
      return res.status(400).json({ ok: false, error: messages[result.reason] || 'Promokod yaroqsiz' });
    }

    res.json({
      ok: true,
      code: result.promo.code,
      discount: result.discount,
      type: result.promo.type,
      value: result.promo.value,
    });
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------ */
/*  BUYURTMA YARATISH                                                  */
/* ------------------------------------------------------------------ */

export async function createOrder(req, res, next) {
  try {
    const {
      items = [],
      customerName,
      phone,
      address,
      lat,
      lng,
      comment,
      promoCode,
      paymentMethod = 'CASH',
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, error: 'Savatcha bo‘sh' });
    }
    if (!phone || String(phone).trim().length < 7) {
      return res.status(400).json({ ok: false, error: 'Telefon raqamini kiriting' });
    }
    if (!address && (lat == null || lng == null)) {
      return res.status(400).json({ ok: false, error: 'Yetkazib berish manzilini kiriting' });
    }

    const allowedMethods = ['CASH', 'CARD_TRANSFER', 'PAYME', 'CLICK'];
    const method = allowedMethods.includes(paymentMethod) ? paymentMethod : 'CASH';

    // Rekvizitlar sozlamalarda bo'lmasa, to'lov havolasini yasab bo'lmaydi
    const shopNow = await SettingModel.getShopInfo();
    if (method === 'PAYME' && !shopNow.paymeMerchantId) {
      return res.status(400).json({ ok: false, error: 'Payme hozircha ulanmagan' });
    }
    if (method === 'CLICK' && !(shopNow.clickServiceId && shopNow.clickMerchantId)) {
      return res.status(400).json({ ok: false, error: 'Click hozircha ulanmagan' });
    }

    // --- Narxlarni bazadan olamiz (mijoz yuborgan narxga ishonmaymiz) ---
    const productIds = [...new Set(items.map((i) => Number(i.productId)))];
    const products = await ProductModel.findManyByIds(productIds);
    const productMap = new Map(products.map((p) => [p.id, p]));

    const orderItems = [];
    let subtotal = 0;

    for (const raw of items) {
      const product = productMap.get(Number(raw.productId));
      if (!product || !product.isActive) {
        return res.status(400).json({ ok: false, error: 'Ba‘zi mahsulotlar endi mavjud emas' });
      }

      const qty = Math.max(1, Number(raw.qty) || 1);
      const variant = product.variants.find((v) => v.id === Number(raw.variantId));

      if (product.variants.length > 0) {
        if (!variant) {
          return res.status(400).json({
            ok: false,
            error: `"${product.nameUz}" uchun o‘lcham va rangni tanlang`,
          });
        }
        if (variant.stock < qty) {
          return res.status(400).json({
            ok: false,
            error: `"${product.nameUz}" (${variant.size}) omborda yetarli emas. Qoldiq: ${variant.stock}`,
          });
        }
      }

      const lineTotal = product.price * qty;
      subtotal += lineTotal;

      orderItems.push({
        productId: product.id,
        variantId: variant?.id ?? null,
        nameUz: product.nameUz,
        nameRu: product.nameRu,
        image: product.images[0] || null,
        size: variant?.size ?? null,
        colorUz: variant?.colorUz ?? null,
        colorRu: variant?.colorRu ?? null,
        colorHex: variant?.colorHex ?? null,
        price: product.price,
        qty,
        lineTotal,
      });
    }

    // --- Promokod ---
    let discount = 0;
    let appliedPromo = null;
    if (promoCode) {
      const result = await PromoModel.validate(promoCode, subtotal);
      if (result.ok) {
        discount = result.discount;
        appliedPromo = result.promo.code;
      }
    }

    // --- Yetkazib berish ---
    const shop = shopNow;
    const deliveryFee = subtotal >= shop.freeDeliveryFrom ? 0 : shop.deliveryFee;
    const total = Math.max(0, subtotal - discount) + deliveryFee;

    // --- Saqlash ---
    const order = await OrderModel.create({
      userId: req.user.id,
      items: orderItems,
      subtotal,
      discount,
      deliveryFee,
      total,
      promoCode: appliedPromo,
      paymentMethod: method,
      customerName: (customerName || req.user.firstName || 'Mijoz').trim(),
      phone: String(phone).trim(),
      address: address ? String(address).trim() : null,
      lat: lat != null ? Number(lat) : null,
      lng: lng != null ? Number(lng) : null,
      comment: comment ? String(comment).trim() : null,
    });

    // --- Yon effektlar ---
    await ProductModel.decreaseStock(orderItems);
    if (appliedPromo) await PromoModel.markUsed(appliedPromo);
    if (phone && phone !== req.user.phone) {
      await UserModel.update(req.user.id, { phone: String(phone).trim() }).catch(() => {});
    }

    // --- Botdan mijozga xabar ---
    const lang = req.user.language || 'uz';
    await safeSend(req.user.telegramId, t(lang, 'orderAccepted', order.orderNo), {
      reply_markup: { remove_keyboard: false },
    });

    if (method === 'CARD_TRANSFER' && shop.cardNumber) {
      await safeSend(
        req.user.telegramId,
        t(
          lang,
          'askReceipt',
          order.orderNo,
          shop.cardNumber,
          shop.cardHolder,
          formatMoney(order.total, shop.currency),
        ),
      );
    }

    // --- Payme / Click: to'lov havolasi ---
    const payUrl = paymentUrlFor({ method, shop, order, lang });

    if (payUrl) {
      // Botga ham yuboramiz: mijoz ilovani yopib qo'ysa ham havola qoladi
      await safeSend(
        req.user.telegramId,
        t(lang, 'payLinkText', order.orderNo, formatMoney(order.total, shop.currency)),
        {
          reply_markup: {
            inline_keyboard: [[{ text: t(lang, 'payNow'), url: payUrl }]],
          },
        },
      );
    }

    res.json({ ok: true, order: toPlain(order), payUrl });
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------ */
/*  BUYURTMALAR TARIXI                                                 */
/* ------------------------------------------------------------------ */

export async function listMyOrders(req, res, next) {
  try {
    const orders = await OrderModel.listByUser(req.user.id);
    res.json({ ok: true, orders: toPlain(orders) });
  } catch (err) {
    next(err);
  }
}

/** "Yana shundan buyurtma qilish" — eski buyurtma tarkibini qaytaradi */
export async function reorder(req, res, next) {
  try {
    const order = await OrderModel.findById(req.params.id);
    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ ok: false, error: 'Buyurtma topilmadi' });
    }

    const items = Array.isArray(order.items) ? order.items : [];
    const products = await ProductModel.findManyByIds(items.map((i) => i.productId));
    const productMap = new Map(products.map((p) => [p.id, p]));

    const available = [];
    const unavailable = [];

    for (const item of items) {
      const product = productMap.get(Number(item.productId));
      const variant = product?.variants.find((v) => v.id === Number(item.variantId));
      const hasStock = product?.variants.length ? (variant?.stock ?? 0) >= item.qty : true;

      if (product?.isActive && hasStock) {
        available.push({
          productId: product.id,
          variantId: variant?.id ?? null,
          nameUz: product.nameUz,
          nameRu: product.nameRu,
          image: product.images[0] || null,
          size: variant?.size ?? null,
          colorUz: variant?.colorUz ?? null,
          colorRu: variant?.colorRu ?? null,
          colorHex: variant?.colorHex ?? null,
          price: product.price,
          qty: item.qty,
        });
      } else {
        unavailable.push(item.nameUz);
      }
    }

    res.json({ ok: true, items: available, unavailable });
  } catch (err) {
    next(err);
  }
}

/** Mini App'dan yuborilgan telefonni saqlash uchun yordamchi */
export async function requestPhoneViaBot(req, res, next) {
  try {
    const lang = req.user.language || 'uz';
    await bot
      .sendMessage(req.user.telegramId, t(lang, 'phoneNeeded'), {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [[{ text: t(lang, 'sharePhone'), request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      })
      .catch(() => {});
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
