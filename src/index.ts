import { z } from 'zod';

// Constants
const GAS_UNITS = {
  TGAS: BigInt(10 ** 12),
  GGAS: BigInt(10 ** 9),
} as const;

const NEAR_UNITS = {
  NEAR: BigInt(10 ** 24),
  MILLI_NEAR: BigInt(10 ** 21),
  MICRO_NEAR: BigInt(10 ** 18),
} as const;

// Gas validation schema
export const gasSchema = z.union([
  z.string().regex(/^\d+(\.\d+)?\s*(TGas|GGas|Gas)$/i),
  z.bigint()
]).transform((value, ctx) => {
  if (typeof value === 'string') {
    const match = value.match(/^(\d+(?:\.\d+)?)\s*(TGas|GGas|Gas)$/i);
    if (!match) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid gas format. Use format like "25.5 TGas", "300 GGas", or "1000 Gas"'
      });
      return z.NEVER;
    }
    
    const [, amount, unit] = match;
    const numAmount = parseFloat(amount);
    
    switch (unit.toLowerCase()) {
      case 'tgas':
        return BigInt(Math.floor(numAmount * Number(GAS_UNITS.TGAS)));
      case 'ggas':
        return BigInt(Math.floor(numAmount * Number(GAS_UNITS.GGAS)));
      case 'gas':
        return BigInt(Math.floor(numAmount));
      default:
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Unknown gas unit. Supported: TGas, GGas, Gas'
        });
        return z.NEVER;
    }
  }
  
  // BigInt - warn if suspiciously small
  if (value < 300n) {
    console.warn(`⚠️  Gas limit ${value} seems very small. Did you mean "${value} TGas"?`);
  }
  return value;
});

// NEAR token validation schema
export const nearSchema = z.union([
  z.string().regex(/^\d+(\.\d+)?\s*(NEAR|mNEAR|milliNEAR|μNEAR|microNEAR|yoctoNEAR|yocto)$/i),
  z.bigint()
]).transform((value, ctx) => {
  if (typeof value === 'string') {
    const match = value.match(/^(\d+(?:\.\d+)?)\s*(NEAR|mNEAR|milliNEAR|μNEAR|microNEAR|yoctoNEAR|yocto)$/i);
    if (!match) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid NEAR format. Use format like "0.01 NEAR", "500 mNEAR", "1000 μNEAR", or "100 yocto"'
      });
      return z.NEVER;
    }
    
    const [, amount, unit] = match;
    const numAmount = parseFloat(amount);
    
    switch (unit.toLowerCase()) {
      case 'near':
        return BigInt(Math.floor(numAmount * Number(NEAR_UNITS.NEAR)));
      case 'mnear':
      case 'millinear':
        return BigInt(Math.floor(numAmount * Number(NEAR_UNITS.MILLI_NEAR)));
      case 'μnear':
      case 'micronear':
        return BigInt(Math.floor(numAmount * Number(NEAR_UNITS.MICRO_NEAR)));
      case 'yoctonear':
      case 'yocto':
        return BigInt(Math.floor(numAmount));
      default:
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Unknown NEAR unit. Supported: NEAR, mNEAR/milliNEAR, μNEAR/microNEAR, yoctoNEAR/yocto'
        });
        return z.NEVER;
    }
  }
  
  // BigInt - warn if suspiciously small
  if (value < BigInt(10 ** 20)) {
    console.warn(`⚠️  NEAR amount ${value} yoctoNEAR seems very small. Did you mean a larger unit?`);
  }
  return value;
});

// Main function call schema
export const callFunctionSchema = z.object({
  gasLimit: gasSchema,
  attachedDeposit: nearSchema,
});

// Type exports
export type GasInput = z.input<typeof gasSchema>;
export type GasOutput = z.output<typeof gasSchema>;
export type NearInput = z.input<typeof nearSchema>;
export type NearOutput = z.output<typeof nearSchema>;
export type CallFunctionInput = z.input<typeof callFunctionSchema>;
export type CallFunctionOutput = z.output<typeof callFunctionSchema>;

// Utility functions
export const gasUtils = {
  toTGas: (gasAmount: bigint): number => Number(gasAmount) / Number(GAS_UNITS.TGAS),
  toGGas: (gasAmount: bigint): number => Number(gasAmount) / Number(GAS_UNITS.GGAS),
  fromTGas: (amount: number): bigint => BigInt(Math.floor(amount * Number(GAS_UNITS.TGAS))),
  fromGGas: (amount: number): bigint => BigInt(Math.floor(amount * Number(GAS_UNITS.GGAS))),
  format: (gasAmount: bigint): string => {
    const tgas = Number(gasAmount) / Number(GAS_UNITS.TGAS);
    if (tgas >= 1) return `${tgas} TGas`;
    const ggas = Number(gasAmount) / Number(GAS_UNITS.GGAS);
    if (ggas >= 1) return `${ggas} GGas`;
    return `${gasAmount} Gas`;
  }
};

export const nearUtils = {
  toNEAR: (yoctoAmount: bigint): number => Number(yoctoAmount) / Number(NEAR_UNITS.NEAR),
  toMilliNEAR: (yoctoAmount: bigint): number => Number(yoctoAmount) / Number(NEAR_UNITS.MILLI_NEAR),
  toMicroNEAR: (yoctoAmount: bigint): number => Number(yoctoAmount) / Number(NEAR_UNITS.MICRO_NEAR),
  fromNEAR: (amount: number): bigint => BigInt(Math.floor(amount * Number(NEAR_UNITS.NEAR))),
  fromMilliNEAR: (amount: number): bigint => BigInt(Math.floor(amount * Number(NEAR_UNITS.MILLI_NEAR))),
  fromMicroNEAR: (amount: number): bigint => BigInt(Math.floor(amount * Number(NEAR_UNITS.MICRO_NEAR))),
  format: (yoctoAmount: bigint): string => {
    const near = Number(yoctoAmount) / Number(NEAR_UNITS.NEAR);
    if (near >= 1) return `${near} NEAR`;
    const milli = Number(yoctoAmount) / Number(NEAR_UNITS.MILLI_NEAR);
    if (milli >= 1) return `${milli} mNEAR`;
    const micro = Number(yoctoAmount) / Number(NEAR_UNITS.MICRO_NEAR);
    if (micro >= 1) return `${micro} μNEAR`;
    return `${yoctoAmount} yocto`;
  }
};

// Main function
export function callFunction(params: CallFunctionInput): CallFunctionOutput {
  return callFunctionSchema.parse(params);
}
