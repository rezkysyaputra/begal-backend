import { Types } from 'mongoose';
import { bcryptPassword } from '../helpers/bcryptPassword';
import { OrderModel } from '../models/orderModel';
import { ProductModel } from '../models/productModel';
import { SellerModel } from '../models/sellerModel';
import { UserModel } from '../models/userModel';

export const createSeller = async () => {
  const seller = await SellerModel.create({
    name: 'ABC Store',
    owner_name: 'Alice Doe',
    email: 'abcstore@gmail.com',
    password: await bcryptPassword('securepassword'),
    phone: '081234567890',
    role: 'seller',
    address: {
      province: 'DI YOGYAKARTA',
      regency: 'KOTA YOGYAKARTA',
      district: 'UMBULHARJO',
      village: 'MUJA-MUJU',
      street: 'Jalan Malioboro',
      detail: 'Toko No. 1',
    },
    operational_hours: {
      open: '08:00',
      close: '20:00',
    },
  });

  return seller;
};

export const createUser = async () => {
  const user = await UserModel.create({
    name: 'Jane Doe',
    email: 'janedoe@gmail.com',
    password: await bcryptPassword('securepassword'),
    phone: '089876543210',
    role: 'user',
    address: {
      province: 'DI YOGYAKARTA',
      regency: 'KOTA YOGYAKARTA',
      district: 'UMBULHARJO',
      village: 'MUJA-MUJU',
      street: 'Jalan Malioboro',
      detail: 'Ruko No. 1',
    },
  });

  return user.toObject();
};

export const createProduct = async (sellerId: string) => {
  const product = await ProductModel.create({
    seller_id: sellerId,
    name: 'Product 1',
    description: 'This is product 1',
    price: 10000,
    stock: 10,
  });

  return product.toObject();
};

const defaultAddress = {
  province: 'Test Province',
  regency: 'Test Regency',
  district: 'Test District',
  village: 'Test Village',
  street: 'Test Street',
  detail: 'Test Detail',
};

export const createOrder = async (product: any) => {
  const order = OrderModel.create({
    user_id: new Types.ObjectId(),
    seller_id: new Types.ObjectId(),
    products: [
      {
        product_id: product._id,
        name: product.name,
        image_url: product.image_url,
        quantity: 10,
        price: product.price,
      },
    ],
    delivery_address: defaultAddress,
    total_price: 0,
    payment_method: 'transfer',
    payment_status: 'pending',
    status: 'pending',
  });

  return order;
};
