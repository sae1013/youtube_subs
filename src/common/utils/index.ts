export const NAVER_COMMERCE_API = {
  BASE_URL: 'http://3.34.197.105',
  AUTH: {
    TOKEN_URL: '/v1/oauth2/token',
  },
  ORDER: {
    GET_ORDER_URL: '/v1/pay-order/seller/orders/:orderId/product-order-ids', // 상품 목록조회
  },
};
