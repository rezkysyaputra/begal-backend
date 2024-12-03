import mongoose from 'mongoose';
import ResponseError from '../helpers/responseError';
import { ProductModel } from '../models/productModel';
import { WishListModel } from '../models/wishListModel';
import {
  createWishListResponse,
  CreateWishListResponse,
  toWishListResponse,
  WishListRequest,
  WishListResponse,
} from '../types/wishListType';
import { Validation } from '../validations/validation';
import { WishListValidation } from '../validations/wishListValidation';

export class WishListService {
  static async create(data: WishListRequest): Promise<CreateWishListResponse> {
    const wishListValidation = Validation.validate(
      WishListValidation.WISH_LIST,
      data
    );

    if (!mongoose.Types.ObjectId.isValid(wishListValidation.product_id)) {
      throw new ResponseError(404, 'Produk tidak ditemukan');
    }

    const product = await ProductModel.findById(wishListValidation.product_id);
    if (!product) {
      throw new ResponseError(404, 'Produk tidak ditemukan');
    }

    const existingProductInList = await WishListModel.findOne({
      user_id: wishListValidation.user_id,
      product_id: wishListValidation.product_id,
    });

    if (existingProductInList) {
      throw new ResponseError(400, 'Produk sudah ada di daftar wishlist');
    }

    const wishList = await WishListModel.create({
      user_id: wishListValidation.user_id,
      product_id: wishListValidation.product_id,
    });

    return createWishListResponse(wishList);
  }

  static async getAll(userId: string): Promise<WishListResponse[]> {
    const wishLists = await WishListModel.find({ user_id: userId }).populate(
      'product_id'
    );

    return wishLists.map((wishList) => toWishListResponse(wishList));
  }

  static async delete(wishlistId: string): Promise<string> {
    if (!mongoose.Types.ObjectId.isValid(wishlistId)) {
      throw new ResponseError(404, 'Wishlist tidak ditemukan');
    }

    const wishList = await WishListModel.findByIdAndDelete(wishlistId);

    if (!wishList) {
      throw new ResponseError(404, 'Wishlist tidak ditemukan');
    }

    return 'Wishlist berhasil dihapus';
  }
}
