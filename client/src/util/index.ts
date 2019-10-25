/**
 * Round a number to .5 place
 * @param {number} number
 * @returns {number} rounded number
 */
const roundHalf = (number: number, inc: number): number => {
  return Math.round(number * inc) / inc;
};

/**
 * Probability density function
 * @param {number} mean of the distribution
 * @param {number} x is a point in that distribution
 * @param {number} delta is a variance parameter
 * @returns {number} location probability of that x
 */
const gaussian = (mean: number, x: number, delta: number): number => {
  const member1 = 1 / (delta * Math.sqrt(2 * Math.PI));
  const member2 = Math.pow(Math.E, -((x - mean) ** 2) / (2 * delta ** 2));
  return member1 * member2;
};

interface Props {
  quantity: number;
  n_tp: number;
  start: number;
  end: number;
  side: string;
  symbol: string;
  distribution?: any;
}

const Uniform = (Props: Props): { orders: object[] } => {
  const { quantity, n_tp, start, end, side, symbol } = Props;

  let inc = Props.symbol === "XBTUSD" ? 2 : 20;

  const start1 = roundHalf(start, inc);
  const end1 = roundHalf(end, inc);

  let orders: { orders: object[] } = { orders: [] };
  const increment = roundHalf((end1 - start1) / (n_tp - 1), inc);
  const mean = Math.floor(quantity / n_tp);
  //startEndPutOrders(orders.orders, start, end, mean, side);
  for (let i = 0; i < n_tp; i++) {
    //ROUND TO NEAREST 0.5
    orders.orders.push({
      symbol: symbol,
      side: side,
      orderQty: mean,
      price: parseFloat((start1 + i * increment).toFixed(3)),
      ordType: "Limit",
      execInst: "ParticipateDoNotInitiate",
      text: "order"
    });
  }

  return orders;
};
const Positive = (Props: Props): { orders: object[] } => {
  const { quantity, n_tp, start, end, side, symbol } = Props;

  let inc = symbol === "XBTUSD" ? 2 : 20;

  const start1 = roundHalf(start, inc);
  const end1 = roundHalf(end, inc);

  const START_CFG = -1;
  const END_CFG = 1;

  const incrementQty = (END_CFG - START_CFG) / (n_tp - 1);

  const arr = [];
  for (let i = 0; i < n_tp; i++) {
    arr.push(gaussian(-1, START_CFG + i * incrementQty, 1)); //mean == -1
  }
  const summ = arr.reduce((a, b) => a + b, 0);

  let orders: { orders: object[] } = { orders: [] };

  const increment = roundHalf((end1 - start1) / (n_tp - 1), inc);
  for (let i = 0; i < n_tp; i++) {
    //ROUND TO NEAREST 0.5
    orders.orders.push({
      symbol: symbol,
      side: side,
      orderQty: Math.floor((arr[i] / summ) * quantity),
      price: parseFloat((start1 + i * increment).toFixed(3)),
      ordType: "Limit",
      execInst: "ParticipateDoNotInitiate",
      text: "order"
    });
  }

  return orders;
};
const Negative = (Props: Props): { orders: object[] } => {
  const { quantity, n_tp, start, end, side, symbol } = Props;

  let inc = symbol === "XBTUSD" ? 2 : 20;

  const start1 = roundHalf(start, inc);
  const end1 = roundHalf(end, inc);

  const START_CFG = -1;
  const END_CFG = 1;

  const incrementQty = (END_CFG - START_CFG) / (n_tp - 1);

  const arr = [];
  for (let i = 0; i < n_tp; i++) {
    arr.push(gaussian(1, START_CFG + i * incrementQty, 1)); //mean == 1
  }
  const summ = arr.reduce((a, b) => a + b, 0);

  const increment = roundHalf((end1 - start1) / (n_tp - 1), inc);

  let orders: { orders: object[] } = { orders: [] };
  for (let i = 0; i < n_tp; i++) {
    //ROUND TO NEAREST 0.5
    orders.orders.push({
      symbol: symbol,
      side: side,
      orderQty: Math.floor((arr[i] / summ) * quantity),
      price: parseFloat((start1 + i * increment).toFixed(3)),
      ordType: "Limit",
      execInst: "ParticipateDoNotInitiate",
      text: "order"
    });
  }

  return orders;
};
const Normal = (Props: Props): { orders: object[] } => {
  const { quantity, n_tp, start, end, side, symbol } = Props;

  let inc = symbol === "XBTUSD" ? 2 : 20;

  const start1 = roundHalf(start, inc);
  const end1 = roundHalf(end, inc);

  const START_CFG = -2;
  const END_CFG = 2;

  const incrementQty = (END_CFG - START_CFG) / (n_tp - 1);

  const arr = [];
  for (let i = 0; i < n_tp; i++) {
    arr.push(gaussian(0, START_CFG + i * incrementQty, 1)); //mean == 0
  }
  const summ = arr.reduce((a: number, b: number) => a + b, 0);

  const increment = roundHalf((end1 - start1) / (n_tp - 1), inc);
  let orders: { orders: object[] } = { orders: [] };
  for (let i = 0; i < n_tp; i++) {
    //ROUND TO NEAREST 0.5
    orders.orders.push({
      symbol: symbol,
      side: side,
      orderQty: Math.floor((arr[i] / summ) * quantity),
      price: parseFloat((start1 + i * increment).toFixed(3)),
      ordType: "Limit",
      execInst: "ParticipateDoNotInitiate",
      text: "order"
    });
  }

  return orders;
};

/**
 * Setting one of the distributions
 */
export const orderBulk = ({
  quantity,
  n_tp,
  start,
  end,
  side,
  distribution,
  symbol // : XBTUSD, ETHUSD...
}: Props): { orders: object[] } => {
  switch (distribution) {
    case "Positive":
      return Positive({ quantity, n_tp, start, end, side, symbol });
    case "Negative":
      return Negative({ quantity, n_tp, start, end, side, symbol });
    case "Normal":
      return Normal({ quantity, n_tp, start, end, side, symbol });
    case "Uniform":
    default:
      return Uniform({ quantity, n_tp, start, end, side, symbol });
  }
};