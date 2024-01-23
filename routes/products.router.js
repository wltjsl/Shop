import express from "express";
import Product from "../schemas/products.schema.js";

const router = express.Router();

/** 상품 등록 **/
// localhost:3000/api/products POST
router.post("/products", async (req, res) => {
  try {
    const { productName, userName, content, passWord } = req.body;

    if (!productName) {
      return res.status(400).json({ success: false, errorMessage: "상품명을 입력해주세요." });
    }
    if (!userName) {
      return res.status(400).json({ success: false, errorMessage: "작성자명을 입력해주세요." });
    }
    if (!content) {
      return res.status(400).json({ success: false, errorMessage: "설명을 입력해주세요." });
    }
    if (!passWord) {
      return res.status(400).json({ success: false, errorMessage: "비밀번호를 입력해주세요." });
    }

    const product = await Product.find({ productName }).exec();
    if (product.length) {
      return res.status(400).json({ success: false, errorMessage: "이미 존재하는 상품입니다." });
    }
    const createdProduct = new Product({
      productName,
      userName,
      content,
      passWord
    });

    await createdProduct.save();
    return res.status(201).json({ message: "상품이 등록되었습니다." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errorMessage: "예기치 못한 에러가 발생했습니다." });
  }
});

/** 상품 목록 조회 **/
router.get("/products", async (req, res) => {
  try {
    // 상품명, 작성자명, 상품 상태, 작성 날짜 조회하기
    // 상품 목록은 작성 날짜를 기준으로 내림차순(최신순) 정렬하기
    const products = await Product.find()
      .select("productId productName status userName createdAt")
      .sort({ createdAt: -1 })
      .exec();

    if (!products.length) {
      return res.status(404).json({ errorMessage: "등록된 상품이 없습니다." });
    }
    // 찾은 '상품'을 클라이언트에게 전달합니다.
    return res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errorMessage: "예기치 못한 에러가 발생했습니다." });
  }
});

/** 상품 상세 조회 **/
router.get("/products/:productId", async (req, res) => {
  try {
    // 상품명, 작성 내용, 작성자명, 상품 상태, 작성 날짜 조회하기
    const productItem = await Product.findById(req.params.productId).select(
      "productName content userName status createdAt"
    );

    if (!productItem) {
      return res.status(404).json({ errorMessage: "등록된 상품이 없습니다." });
    }

    return res.json(productItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errorMessage: "예기치 못한 에러가 발생했습니다." });
  }
});

/** 상품 정보 수정 **/
router.patch("/products/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;
    const { productName, content, status, passWord } = req.body;

    const currentProduct = await Product.findById(productId).exec();
    if (!currentProduct) {
      return res.status(404).json({ errorMessage: "상품 조회에 실패하였습니다." });
    }

    if (currentProduct.passWord !== passWord) {
      return res.status(404).json({ errorMessage: "비밀번호가 다릅니다." });
    }

    if (!productName) {
      return res.status(404).json({ errorMessage: "수정할 상품명을 입력해주세요." });
    }
    if (!content) {
      return res.status(404).json({ errorMessage: "수정할 설명을 입력해주세요." });
    }
    if (!status) {
      return res.status(404).json({ errorMessage: "변경할 상태를 입력해주세요." });
    }

    currentProduct.status = status;
    currentProduct.productName = productName;
    currentProduct.content = content;

    await currentProduct.save();

    return res.status(200).json({ message: "성공적으로 수정되었습니다." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errorMessage: "예기치 못한 에러가 발생했습니다." });
  }
});

/** 상품 삭제 **/
router.delete("/products/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;
    const passWord = req.body.passWord;

    const product = await Product.findById(productId).exec();
    if (!product) {
      return res.status(404).json({ errorMessage: "상품 조회에 실패하였습니다." });
    }

    if (product.passWord !== passWord) {
      return res.status(404).json({ errorMessage: "비밀번호가 다릅니다." });
    }

    await Product.deleteOne({ _id: productId }).exec();

    return res.status(200).json({ message: "성공적으로 삭제되었습니다." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errorMessage: "예기치 못한 에러가 발생했습니다." });
  }
});

export default router;
