export interface TravelCoupon {
  code: string;
  title: string;
  label: string;
  description: string;
  type: "fixed" | "percent";
  value: number;
  minOrder: number;
}

/**
 * Coupons accepted by the current checkout flow. Keep customer-facing coupon
 * pages and checkout validation on this shared source so advertised codes are
 * always usable at checkout.
 */
export const availableCoupons: TravelCoupon[] = [
  {
    code: "TRIP50",
    title: "Save $50 on bookings over $500",
    label: "$50 OFF on orders above $500",
    description: "Apply this code to an eligible Tripile booking with a subtotal of $500 or more.",
    type: "fixed",
    value: 50,
    minOrder: 500,
  },
  {
    code: "NEWUSER",
    title: "Save 10% on your first booking",
    label: "10% OFF for new users",
    description: "A welcome offer for new Tripile customers making their first eligible booking.",
    type: "percent",
    value: 10,
    minOrder: 0,
  },
  {
    code: "SAVE20",
    title: "Save $20 on any booking",
    label: "$20 OFF on any booking",
    description: "Use this flexible travel coupon on an eligible booking with no minimum subtotal.",
    type: "fixed",
    value: 20,
    minOrder: 0,
  },
];

export const calculateCouponDiscount = (coupon: TravelCoupon, totalPrice: number) =>
  coupon.type === "fixed" ? coupon.value : (totalPrice * coupon.value) / 100;