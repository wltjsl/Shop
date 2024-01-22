import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    unique: true
  },
  userName: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  passWord: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  isForSale: {
    type: Boolean,
    required: true
  }
});

// 프론트엔드 서빙을 위한 코드입니다. 모르셔도 괜찮아요!
ProductSchema.virtual("productId").get(function () {
  return this._id.toHexString();
});
ProductSchema.set("toJSON", {
  virtuals: true
});

// ProductSchema를 바탕으로 Product모델을 생성하여, 외부로 내보냅니다.
export default mongoose.model("Product", ProductSchema);
