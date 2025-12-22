export const PROD_COUNTRY = {
  itunes: ['india', 'turkey'],
  // steam: ['india', 'turkey', 'jp'], ...
} as const;

type ProdCountryMap = typeof PROD_COUNTRY;

export type ProductType = keyof ProdCountryMap;
// "itunes" | "steam" | ...

// 특정 상품 P 에 대해 가능한 국가 코드
export type Country<P extends ProductType = ProductType> =
  ProdCountryMap[P][number];

// 상품/국가별로 값 T를 매핑하는 공용 타입
export type ByProdCountry<T> = {
  [P in ProductType]: {
    [C in Country<P>]: T;
  };
};

export const DEFAULT_RANGE = '시트1!A2:C';
