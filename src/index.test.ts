import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    callFunction,
    callFunctionSchema,
    gas,
    gasSchema,
    gasUtils,
    near,
    nearSchema,
    nearUtils
} from './index.js';

describe('Gas Schema', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('String inputs', () => {
    it('should parse TGas values', () => {
      expect(gasSchema.parse('25 TGas')).toBe(BigInt(25 * 10 ** 12));
      expect(gasSchema.parse('25.5 TGas')).toBe(BigInt(25.5 * 10 ** 12));
      expect(gasSchema.parse('1 tgas')).toBe(BigInt(10 ** 12)); // case insensitive
    });

    it('should parse GGas values', () => {
      expect(gasSchema.parse('300 GGas')).toBe(BigInt(300 * 10 ** 9));
      expect(gasSchema.parse('1.5 GGas')).toBe(BigInt(1.5 * 10 ** 9));
    });

    it('should parse Gas values', () => {
      expect(gasSchema.parse('1000 Gas')).toBe(BigInt(1000));
      expect(gasSchema.parse('500.7 Gas')).toBe(BigInt(500)); // floors decimals
    });

    it('should handle whitespace', () => {
      expect(gasSchema.parse('25    TGas')).toBe(BigInt(25 * 10 ** 12));
      expect(gasSchema.parse('25TGas')).toBe(BigInt(25 * 10 ** 12));
    });

    it('should reject invalid formats', () => {
      expect(() => gasSchema.parse('25')).toThrow();
      expect(() => gasSchema.parse('25 XGas')).toThrow();
      expect(() => gasSchema.parse('invalid TGas')).toThrow();
      expect(() => gasSchema.parse('')).toThrow();
    });
  });

  describe('BigInt inputs', () => {
    it('should accept BigInt values', () => {
      expect(gasSchema.parse(BigInt(1000))).toBe(BigInt(1000));
      expect(gasSchema.parse(BigInt(25 * 10 ** 12))).toBe(BigInt(25 * 10 ** 12));
    });

    it('should warn for small BigInt values', () => {
      gasSchema.parse(BigInt(10));
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Gas limit 10 seems very small')
      );
    });

    it('should not warn for reasonable BigInt values', () => {
      gasSchema.parse(BigInt(1000));
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });
});

describe('NEAR Schema', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('String inputs', () => {
    it('should parse NEAR values', () => {
      expect(nearSchema.parse('1 NEAR')).toBe(BigInt(10 ** 24));
      expect(nearSchema.parse('0.5 NEAR')).toBe(BigInt(0.5 * 10 ** 24));
    });

    it('should parse milliNEAR values', () => {
      expect(nearSchema.parse('500 mNEAR')).toBe(BigInt(500 * 10 ** 21));
      expect(nearSchema.parse('1000 milliNEAR')).toBe(BigInt(1000 * 10 ** 21));
    });

    it('should parse microNEAR values', () => {
      expect(nearSchema.parse('1000 μNEAR')).toBe(BigInt(1000 * 10 ** 18));
      expect(nearSchema.parse('2000 microNEAR')).toBe(BigInt(2000 * 10 ** 18));
    });

    it('should parse yocto values', () => {
      expect(nearSchema.parse('100 yocto')).toBe(BigInt(100));
      expect(nearSchema.parse('500 yoctoNEAR')).toBe(BigInt(500));
    });

    it('should be case insensitive', () => {
      expect(nearSchema.parse('1 near')).toBe(BigInt(10 ** 24));
      expect(nearSchema.parse('500 MNEAR')).toBe(BigInt(500 * 10 ** 21));
    });

    it('should reject invalid formats', () => {
      expect(() => nearSchema.parse('1')).toThrow();
      expect(() => nearSchema.parse('1 ETH')).toThrow();
      expect(() => nearSchema.parse('invalid NEAR')).toThrow();
    });
  });

  describe('BigInt inputs', () => {
    it('should accept BigInt values', () => {
      expect(nearSchema.parse(BigInt(10 ** 24))).toBe(BigInt(10 ** 24));
    });

    it('should warn for small BigInt values', () => {
      nearSchema.parse(BigInt(1000));
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('NEAR amount 1000 yoctoNEAR seems very small')
      );
    });
  });
});

describe('CallFunction Schema', () => {
  it('should validate complete function calls', () => {
    const result = callFunctionSchema.parse({
      gasLimit: '25 TGas',
      attachedDeposit: '0.01 NEAR'
    });

    expect(result.gasLimit).toBe(BigInt(25 * 10 ** 12));
    expect(result.attachedDeposit).toBe(BigInt(0.01 * 10 ** 24));
  });

  it('should handle mixed input types', () => {
    const result = callFunctionSchema.parse({
      gasLimit: BigInt(30 * 10 ** 12),
      attachedDeposit: '500 mNEAR'
    });

    expect(result.gasLimit).toBe(BigInt(30 * 10 ** 12));
    expect(result.attachedDeposit).toBe(BigInt(500 * 10 ** 21));
  });
});

describe('Gas Utils', () => {
  it('should convert gas amounts correctly', () => {
    const gasAmount = gas.tgas(25);
    expect(gasUtils.toTGas(gasAmount)).toBe(25);
    expect(gasUtils.toGGas(gas.ggas(300))).toBe(300);
    expect(gasUtils.fromTGas(25)).toEqual(gas.tgas(25));
    expect(gasUtils.fromGGas(300)).toEqual(gas.ggas(300));
  });

  it('should format gas amounts nicely', () => {
    expect(gasUtils.format(gas.tgas(25))).toBe('25 TGas');
    expect(gasUtils.format(gas.ggas(300))).toBe('300 GGas');
    expect(gasUtils.format(gas.raw(BigInt(1000)))).toBe('1000 Gas');
  });
});

describe('NEAR Utils', () => {
  it('should convert NEAR amounts correctly', () => {
    const nearAmount = near.near(1);
    expect(nearUtils.toNEAR(nearAmount)).toBe(1);
    expect(nearUtils.toMilliNEAR(near.milli(500))).toBe(500);
    expect(nearUtils.fromNEAR(1)).toEqual(near.near(1));
    expect(nearUtils.fromMilliNEAR(500)).toEqual(near.milli(500));
  });

  it('should format NEAR amounts nicely', () => {
    expect(nearUtils.format(near.near(1))).toBe('1 NEAR');
    expect(nearUtils.format(near.milli(500))).toBe('500 mNEAR');
    expect(nearUtils.format(near.milli(1))).toBe('1 mNEAR'); // 1000 μNEAR = 1 mNEAR
    expect(nearUtils.format(near.micro(100))).toBe('100 μNEAR'); // Actual μNEAR example
    expect(nearUtils.format(near.yocto(BigInt(100)))).toBe('100 yocto');
  });
});

describe('Type-safe Constructors', () => {
  it('should create valid gas values', () => {
    expect(gas.tgas(25)).toBe(BigInt(25 * 10 ** 12));
    expect(gas.ggas(300)).toBe(BigInt(300 * 10 ** 9));
    expect(gas.raw(BigInt(1000))).toBe(BigInt(1000));
  });

  it('should create valid NEAR values', () => {
    expect(near.near(1)).toBe(BigInt(10 ** 24));
    expect(near.milli(500)).toBe(BigInt(500 * 10 ** 21));
    expect(near.micro(1000)).toBe(BigInt(1000 * 10 ** 18));
    expect(near.yocto(BigInt(100))).toBe(BigInt(100));
  });

  it('should work with callFunction', () => {
    const result = callFunction({
      gasLimit: gas.tgas(25),
      attachedDeposit: near.near(0.01)
    });

    expect(result.gasLimit).toBe(BigInt(25 * 10 ** 12));
    expect(result.attachedDeposit).toBe(BigInt(0.01 * 10 ** 24));
  });
});

describe('Integration Tests', () => {
  it('should work with realistic examples', () => {
    const examples = [
      { gasLimit: '25.5 TGas' as const, attachedDeposit: '0.01 NEAR' as const },
      { gasLimit: '300 GGas' as const, attachedDeposit: '500 mNEAR' as const },
      { gasLimit: BigInt(30 * 10 ** 12), attachedDeposit: '1000 μNEAR' as const },
      { gasLimit: '10 TGas' as const, attachedDeposit: '100 yocto' as const }
    ];

    examples.forEach(example => {
      expect(() => callFunction(example)).not.toThrow();
    });
  });

  it('should handle type-safe constructor examples', () => {
    const examples = [
      { gasLimit: gas.tgas(25), attachedDeposit: near.near(0.01) },
      { gasLimit: gas.ggas(300), attachedDeposit: near.milli(500) },
      { gasLimit: gas.raw(BigInt(30 * 10 ** 12)), attachedDeposit: near.micro(1000) }
    ];

    examples.forEach(example => {
      const result = callFunction(example);
      expect(typeof result.gasLimit).toBe('bigint');
      expect(typeof result.attachedDeposit).toBe('bigint');
    });
  });
});