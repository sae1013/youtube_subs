export const NAVER_COMMERCE_API = {
  BASE_URL: 'http://3.34.197.105',
  AUTH: {
    TOKEN_URL: '/v1/oauth2/token',
  },
  ORDER: {
    GET_ORDER_URL: '/v1/pay-order/seller/orders/:orderId/product-order-ids', // 상품 목록조회
  },
};

export const parseProductOption = (optionText: string) => {
  // 예: "금액: 1170 루피", "리라: 1,000 리라"
  // 콜론(:) 뒤의 숫자와 단위를 캡쳐
  const re = /:\s*(?<amount>\d[\d,]*)\s*(?<unit>[\p{L}]+)?/u;

  const m = optionText.match(re);

  let amount = '';
  let unit = '';

  if (m?.groups) {
    amount = m.groups.amount ?? '';
    unit = m.groups.unit ?? '';
  }

  return { amount, unit };
};

export const getProdAndCountryByString = (str: string) => {
  return str.split(':');
};
