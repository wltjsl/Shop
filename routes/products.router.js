import express from "express";
import Product from "../schemas/products.schema.js";

const router = express.Router();

/** 상품 등록 **/
// localhost:3000/api/products POST
router.post("/products", async (req, res) => {
  const { productName, userName, content, passWord } = req.body;

  const product = await Product.find({ productName }).exec();
  if (product.length) {
    return res.status(400).json({ success: false, errorMessage: "이미 존재하는 상품입니다." });
  }

  const currentDate = new Date();

  const createdProduct = new Product({
    productName,
    userName,
    content,
    passWord,
    date: currentDate,
    isForSale: true
  });

  await createdProduct.save();
  return res.status(201).json({ createdProduct });
});

/** 상품 목록 조회 **/
router.get("/products", async (req, res) => {
  // 상품명, 작성자명, 상품 상태, 작성 날짜 조회하기
  // 상품 목록은 작성 날짜를 기준으로 내림차순(최신순) 정렬하기
  const products = await Product.find().sort("-date").exec();

  if (!products.length) {
    return res.status(404).json({ errorMessage: "등록된 상품이 없습니다." });
  }

  const productsToShow = [];

  products.forEach(
    (productItem, index) =>
      (productsToShow[index] = {
        상품명: productItem.productName,
        설명: productItem.content,
        상태: productItem.isForSale ? "FOR_SALE" : "SOLD_OUT",
        작성자: productItem.userName,
        작성일: productItem.date.toISOString().slice(0, 10)
      })
  );
  // 찾은 '상품'을 클라이언트에게 전달합니다.
  return res.status(200).json({ productsToShow });
});

/** 상품 상세 조회 **/
router.get("/products/:productId", async (req, res) => {
  const productId = req.params.productId;
  const productItem = await Product.findById(productId).exec();

  if (!productItem) {
    return res.status(404).json({ errorMessage: "등록된 상품이 없습니다." });
  }

  const product = {
    // 상품명, 작성 내용, 작성자명, 상품 상태, 작성 날짜 조회하기
    상품명: productItem.productName,
    설명: productItem.content,
    상태: productItem.isForSale ? "FOR_SALE" : "SOLD_OUT",
    작성자: productItem.userName,
    작성일: productItem.date.toISOString().slice(0, 10)
  };

  return res.json({ product });
});

/** 상품 정보 수정 **/
router.patch("/products/:productId", async (req, res) => {
  const productId = req.params.productId;
  const { productName, content, isForSale, passWord } = req.body;

  const currentProduct = await Product.findById(productId).exec();
  if (!currentProduct) {
    return res.status(404).json({ errorMessage: "상품 조회에 실패하였습니다." });
  }

  if (currentProduct.passWord !== passWord - 0) {
    return res.status(404).json({ errorMessage: "비밀번호가 다릅니다." });
  }

  if (!productName) {
    return res.status(404).json({ errorMessage: "수정할 상품명을 입력해주세요." });
  }
  if (!content) {
    return res.status(404).json({ errorMessage: "수정할 설명을 입력해주세요." });
  }
  if (!(isForSale + "")) {
    return res.status(404).json({ errorMessage: "변경할 상태를 입력해주세요." });
  }

  currentProduct.productName = productName;
  currentProduct.content = content;
  currentProduct.isForSale = isForSale;

  await currentProduct.save();

  return res.status(200).json({});
});

/** 상품 삭제 **/
router.delete("/products/:productId", async (req, res) => {
  const productId = req.params.productId;
  const passWord = req.body.passWord - 0;

  const product = await Product.findById(productId).exec();
  if (!product) {
    return res.status(404).json({ errorMessage: "상품 조회에 실패하였습니다." });
  }

  if (product.passWord !== passWord) {
    return res.status(404).json({ errorMessage: "비밀번호가 다릅니다." });
  }

  await Product.deleteOne({ _id: productId }).exec();

  return res.status(200).json({});
});

export default router;
