# NEAR Gas & Token Validation

A TypeScript library for validating and converting NEAR gas limits and token amounts with smart warnings and flexible input formats.

## Installation

```bash
git clone https://github.com/r-near/near-validation.git
cd near-validation
pnpm install
```

## Quick Start

```typescript
import { callFunction } from './index.js';

const result = callFunction({
  gasLimit: "25.5 TGas",
  attachedDeposit: "0.01 NEAR"
});

console.log(result.gasLimit);      // BigInt(25500000000000)
console.log(result.attachedDeposit); // BigInt(10000000000000000000000)
```

## Supported Gas Formats

| Input Format | Example | Output (BigInt) |
|--------------|---------|-----------------|
| **TGas** | `"25.5 TGas"` | `25500000000000n` |
| **GGas** | `"300 GGas"` | `300000000000n` |
| **Gas** | `"1000 Gas"` | `1000n` |
| **BigInt** | `BigInt(25500000000000)` | `25500000000000n` |

### Gas Warnings

```typescript
// ⚠️ Warning: Gas limit 10 seems very small. Did you mean "10 TGas"?
callFunction({ gasLimit: BigInt(10), attachedDeposit: "0 NEAR" });
```

**Warning Trigger:** Any BigInt gas value < 300

## Supported NEAR Formats

| Input Format | Example | Output (yoctoNEAR) |
|--------------|---------|-------------------|
| **NEAR** | `"1 NEAR"` | `1000000000000000000000000n` |
| **mNEAR/milliNEAR** | `"500 mNEAR"` | `500000000000000000000000n` |
| **μNEAR/microNEAR** | `"1000 μNEAR"` | `1000000000000000000000n` |
| **yoctoNEAR** | `"100 yoctoNEAR"` | `100n` |
| **yocto** | `"100 yocto"` | `100n` |
| **BigInt** | `BigInt(10**24)` | `1000000000000000000000000n` |

### NEAR Warnings

```typescript
// ⚠️ Warning: NEAR amount 1000 yoctoNEAR seems very small. Did you mean a larger unit?
callFunction({ gasLimit: "5 TGas", attachedDeposit: BigInt(1000) });
```

**Warning Trigger:** Any BigInt NEAR value < 10²⁰ yoctoNEAR (< 0.0001 NEAR)

## Features

✅ **Case Insensitive** - `"tgas"`, `"TGas"`, `"TGAS"` all work  
✅ **Flexible Whitespace** - `"25 TGas"`, `"25TGas"`, `"25    TGas"`  
✅ **Decimal Support** - `"25.5 TGas"`, `"0.01 NEAR"`  
✅ **Smart Warnings** - Alerts for suspiciously small values  
✅ **Type Safety** - Full TypeScript support with Zod validation  
✅ **Consistent Output** - Always returns BigInt in base units  

## Utility Functions

```typescript
import { gasUtils, nearUtils } from './near-validation';

// Convert and format gas
gasUtils.toTGas(BigInt(25 * 10**12));     // 25
gasUtils.format(BigInt(25 * 10**12));     // "25 TGas"

// Convert and format NEAR
nearUtils.toNEAR(BigInt(10**24));         // 1
nearUtils.format(BigInt(500 * 10**21));   // "500 mNEAR"
```

## Error Examples

```typescript
// ❌ Invalid formats
callFunction({ gasLimit: "25", attachedDeposit: "1 ETH" });
// ZodError: Invalid gas format, Invalid NEAR format

// ❌ Unknown units  
callFunction({ gasLimit: "25 XGas", attachedDeposit: "1 BTC" });
// ZodError: Unknown gas unit, Unknown NEAR unit
```

## Real-World Examples

```typescript
// Small transaction
callFunction({
  gasLimit: "5 TGas",
  attachedDeposit: "100 yocto"
});

// Contract call with deposit
callFunction({
  gasLimit: "50 TGas", 
  attachedDeposit: "0.1 NEAR"
});

// High precision amounts
callFunction({
  gasLimit: "300 GGas",
  attachedDeposit: "2500 μNEAR"
});

// Raw BigInt (from other calculations)
callFunction({
  gasLimit: BigInt(30 * 10**12),
  attachedDeposit: BigInt(10**22)
});
```

## TypeScript Types

```typescript
type GasInput = string | bigint;     // "25 TGas" | BigInt(25000000000000)
type NearInput = string | bigint;    // "0.01 NEAR" | BigInt(10**22)
type GasOutput = bigint;             // Always base Gas units
type NearOutput = bigint;            // Always yoctoNEAR
```

## Testing

```bash
pnpm test  # Run full test suite with Vitest
```

The library includes comprehensive tests covering all input formats, edge cases, warning behavior, and utility functions.