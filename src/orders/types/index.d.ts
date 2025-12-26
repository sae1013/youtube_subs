export interface OrderInfo {
  orderId: string; //
  productOrderId: string; // '2025111166846551',
  lastChangedType: string; // 'PAYED',
  paymentDate: string; // '2025-11-11T17:03:28.207+09:00',
  lastChangedDate: string; //'2025-11-11T17:03:28.000+09:00';
  productOrderStatus: string; //'PAYED';
  receiverAddressChanged: boolean;
}

export interface SmartstoreResponse<TData> {
  code: string;
  message: string;
  data: TData;
}

export interface LastChangedStatus {
  lastChangeStatuses: OrderInfo[];
  more?: {
    moreFrom: string;
    moreSequence: string;
  };
}

export interface IOrderDetail {
  orderId: string; // 2025111139447091
  ordererNo: string; // 204154814
  ordererId: string; // jmw9****
  ordererName: string; // 정민우
  ordererTel: string; // 010-8361-9220
}

export interface IProductOrderDetail {
  quantity: number; // 2
  productOrderId: string;
  productOrderStatus: string; // PAYED
  productOption: string; // 상품코드를 받으실 이메일: sae1013@gmail.com / 금액: 195 루피
  productName: string; // 애플 인도 앱스토어 아이튠즈 기프트카드 (리딤코드 발송)
  productId: string; // 채널 상품 ID 12707577730
  optionCode: string;
  optionManageCode: string; // 옵션 별칭
  originalProductId: string; // 12650488610
  shippingAddress: {
    tel1: string; // 수신자 번호
  };
}

export interface OrderDetail {
  order: IOrderDetail;
  productOrder: IProductOrderDetail;
}

export type OrderDetailResponse = SmartstoreResponse<OrderDetail[]>;

/**
 * ordersInfo: [
 *   {
 *     order: {
 *       orderId: '2025122274610071',
 *       orderDate: '2025-12-22T02:30:57.275+09:00',
 *       ordererId: 'bigb****',
 *       ordererNo: '101541626',
 *       ordererName: '양성호',
 *       ordererTel: '010-5708-8864',
 *       isDeliveryMemoParticularInput: 'false',
 *       paymentDate: '2025-12-22T02:31:13.028+09:00',
 *       paymentMeans: '신용카드 간편결제',
 *       payLocationType: 'MOBILE',
 *       orderDiscountAmount: 0,
 *       generalPaymentAmount: 14500,
 *       naverMileagePaymentAmount: 0,
 *       chargeAmountPaymentAmount: 0,
 *       payLaterPaymentAmount: 0,
 *       isMembershipSubscribed: true
 *     },
 *     productOrder: {
 *       productOrderId: '2025122255657021',
 *       quantity: 1,
 *       initialQuantity: 1,
 *       remainQuantity: 1,
 *       totalProductAmount: 15000,
 *       initialProductAmount: 15000,
 *       remainProductAmount: 15000,
 *       totalPaymentAmount: 14500,
 *       initialPaymentAmount: 14500,
 *       remainPaymentAmount: 14500,
 *       productOrderStatus: 'PAYED',
 *       productId: '12707577730',
 *       productName: '[24시간 자동문자발송] 애플 인도 앱스토어 아이튠즈 기프트카드 리딤코드',
 *       unitPrice: 3000,
 *       productClass: '조합형옵션상품',
 *       originalProductId: '12650488610',
 *       merchantChannelId: '102761766',
 *       deliveryAttributeType: 'NORMAL',
 *       placeOrderDate: '2025-12-22T02:31:13.185+09:00',
 *       placeOrderStatus: 'OK',
 *       shippingDueDate: '2025-12-26T23:59:59.000+09:00',
 *       expectedDeliveryMethod: 'NOTHING',
 *       packageNumber: '2025122257144989',
 *       itemNo: '53712097201',
 *       productOption: '금액: 585 루피',
 *       optionCode: '53712097201',
 *       optionPrice: 12000,
 *       optionManageCode: 'option4',
 *       mallId: 'ncp_1p3wpw_01',
 *       inflowPath: '검색>쇼핑검색(네이버쇼핑)',
 *       inflowPathAdd: 'undefined',
 *       productDiscountAmount: 500,
 *       initialProductDiscountAmount: 500,
 *       remainProductDiscountAmount: 500,
 *       sellerBurdenDiscountAmount: 500,
 *       productImediateDiscountAmount: 500,
 *       initialProductImmediateDiscountAmount: 500,
 *       remainProductImmediateDiscountAmount: 500,
 *       sellerBurdenImediateDiscountAmount: 500,
 *       initialSellerBurdenImmediateDiscountAmount: 500,
 *       remainSellerBurdenImmediateDiscountAmount: 500,
 *       shippingAddress: [Object],
 *       commissionRatingType: '결제수수료',
 *       commissionPrePayStatus: 'GENERAL_PRD',
 *       paymentCommission: 526,
 *       saleCommission: 0,
 *       knowledgeShoppingSellingInterlockCommission: 435,
 *       channelCommission: 0,
 *       expectedSettlementAmount: 13539,
 *       taxType: 'TAX_EXEMPTION'
 *     }
 *   }
 * ]
 */

// 예시 2
// ordersInfo: [
//   {
//     order: {
//       orderId: '2025122697734441',
//       orderDate: '2025-12-26T14:05:33.708+09:00',
//       ordererId: 'jmw9****',
//       ordererNo: '204154814',
//       ordererName: '정민우',
//       ordererTel: '010-8361-9220',
//       isDeliveryMemoParticularInput: 'false',
//       paymentDate: '2025-12-26T14:05:39.795+09:00',
//       paymentMeans: '신용카드 간편결제',
//       payLocationType: 'PC',
//       orderDiscountAmount: 0,
//       generalPaymentAmount: 4400,
//       naverMileagePaymentAmount: 0,
//       chargeAmountPaymentAmount: 0,
//       payLaterPaymentAmount: 0,
//       isMembershipSubscribed: false,
//     },
//     productOrder: {
//       productOrderId: '2025122642531881',
//       quantity: 1,
//       initialQuantity: 1,
//       remainQuantity: 1,
//       totalProductAmount: 4400,
//       initialProductAmount: 4400,
//       remainProductAmount: 4400,
//       totalPaymentAmount: 4400,
//       initialPaymentAmount: 4400,
//       remainPaymentAmount: 4400,
//       productOrderStatus: 'PAYED',
//       productId: '12874465496',
//       productName: '[24시간 자동문자발송] 애플 터키 앱스토어 기프트카드 코드',
//       unitPrice: 4400,
//       productClass: '조합형옵션상품',
//       originalProductId: '12816975136',
//       merchantChannelId: '102761766',
//       deliveryAttributeType: 'NORMAL',
//       placeOrderDate: '2025-12-26T14:05:39.976+09:00',
//       placeOrderStatus: 'OK',
//       shippingDueDate: '2025-12-31T23:59:59.000+09:00',
//       expectedDeliveryMethod: 'NOTHING',
//       packageNumber: '2025122678699321',
//       itemNo: '54707695428',
//       productOption: '금액: 100 리라',
//       optionCode: '54707695428',
//       optionPrice: 0,
//       mallId: 'ncp_1p3wpw_01',
//       inflowPath: '검색>쇼핑검색(네이버쇼핑)',
//       inflowPathAdd: 'undefined',
//       productDiscountAmount: 0,
//       initialProductDiscountAmount: 0,
//       remainProductDiscountAmount: 0,
//       sellerBurdenDiscountAmount: 0,
//       shippingAddress: [Object],
//       commissionRatingType: '결제수수료',
//       commissionPrePayStatus: 'GENERAL_PRD',
//       paymentCommission: 159,
//       saleCommission: 0,
//       knowledgeShoppingSellingInterlockCommission: 132,
//       channelCommission: 0,
//       expectedSettlementAmount: 4109,
//       taxType: 'TAXATION',
//     },
//   },
// ];
