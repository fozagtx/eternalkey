// Bitcoin Vault Type Definitions
// Replaces the Solana IDL types with Bitcoin-specific types

export interface BitcoinAddress {
  address: string;
  network: 'mainnet' | 'testnet' | 'regtest';
}

export interface BitcoinVaultIDL {
  version: string;
  name: string;
  instructions: Array<{
    name: string;
    accounts: Array<{
      name: string;
      isMut: boolean;
      isSigner: boolean;
    }>;
    args: Array<{
      name: string;
      type: string;
    }>;
  }>;
  accounts: Array<{
    name: string;
    type: {
      kind: string;
      fields: Array<{
        name: string;
        type: string;
      }>;
    };
  }>;
  errors: Array<{
    code: number;
    name: string;
    msg: string;
  }>;
}

// Bitcoin Vault IDL equivalent
export const BITCOIN_VAULT_IDL: BitcoinVaultIDL = {
  version: "0.1.0",
  name: "bitcoin_vault",
  instructions: [
    {
      name: "createVault",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false
        }
      ],
      args: [
        {
          name: "beneficiaries",
          type: "vec<Beneficiary>"
        },
        {
          name: "timeoutBlocks",
          type: "u32"
        },
        {
          name: "initialDeposit",
          type: "u64"
        },
        {
          name: "vaultId",
          type: "string"
        }
      ]
    },
    {
      name: "checkIn",
      accounts: [
        {
          name: "owner",
          isMut: false,
          isSigner: true
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false
        }
      ],
      args: [
        {
          name: "newTimeoutBlocks",
          type: "option<u32>"
        }
      ]
    },
    {
      name: "deposit",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false
        }
      ],
      args: [
        {
          name: "amount",
          type: "u64"
        }
      ]
    },
    {
      name: "claimInheritance",
      accounts: [
        {
          name: "beneficiary",
          isMut: true,
          isSigner: true
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: "cancelVault",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false
        }
      ],
      args: []
    }
  ],
  accounts: [
    {
      name: "InheritanceVault",
      type: {
        kind: "struct",
        fields: [
          {
            name: "owner",
            type: "publicKey"
          },
          {
            name: "beneficiaries",
            type: "vec<Beneficiary>"
          },
          {
            name: "timeoutBlocks",
            type: "u32"
          },
          {
            name: "lastCheckin",
            type: "u32"
          },
          {
            name: "vaultBalance",
            type: "u64"
          },
          {
            name: "status",
            type: "VaultStatus"
          },
          {
            name: "vaultId",
            type: "string"
          },
          {
            name: "createdAt",
            type: "u64"
          }
        ]
      }
    }
  ],
  errors: [
    {
      code: 6000,
      name: "InvalidOwner",
      msg: "Invalid vault owner"
    },
    {
      code: 6001,
      name: "InvalidBeneficiary",
      msg: "Invalid beneficiary"
    },
    {
      code: 6002,
      name: "InsufficientBalance",
      msg: "Insufficient balance"
    },
    {
      code: 6003,
      name: "TimeoutNotExpired",
      msg: "Timeout not expired"
    },
    {
      code: 6004,
      name: "VaultNotFound",
      msg: "Vault not found"
    },
    {
      code: 6005,
      name: "VaultAlreadyExpired",
      msg: "Vault already expired"
    },
    {
      code: 6006,
      name: "VaultAlreadyClaimed",
      msg: "Vault already claimed"
    },
    {
      code: 6007,
      name: "InvalidPercentageTotal",
      msg: "Beneficiary percentages must sum to 100"
    },
    {
      code: 6008,
      name: "UnauthorizedOperation",
      msg: "Unauthorized operation"
    }
  ]
};

// Export the IDL for compatibility with existing code
export const IDL = BITCOIN_VAULT_IDL;