use charms_sdk::data::{
    charm_values, check, sum_token_amount, App, Data, Transaction, UtxoId, B32, NFT, TOKEN,
};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::str::FromStr;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InheritanceVault {
    pub owner: String,
    pub beneficiaries: Vec<Beneficiary>,
    pub timeout_blocks: u32,
    pub last_checkin: u32,
    pub vault_balance: u64,
    pub status: VaultStatus,
    pub vault_id: String,
    pub created_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Beneficiary {
    pub address: String,
    pub percentage: u8,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VaultStatus {
    Active,
    Locked,
    Claiming,
    Claimed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VaultOperation {
    CreateVault,
    Deposit,
    Checkin,
    Claim,
    UpdateBeneficiaries,
}

pub fn app_contract(app: &App, tx: &Transaction, x: &Data, w: &Data) -> bool {
    let empty = Data::empty();
    assert_eq!(x, &empty);
    match app.tag {
        NFT => {
            check!(vault_nft_contract_satisfied(app, tx, w))
        }
        TOKEN => {
            check!(vault_token_contract_satisfied(app, tx))
        }
        _ => unreachable!(),
    }
    true
}

fn vault_nft_contract_satisfied(app: &App, tx: &Transaction, w: &Data) -> bool {
    let token_app = &App {
        tag: TOKEN,
        identity: app.identity.clone(),
        vk: app.vk.clone(),
    };

    check!(can_create_vault(app, tx, w) ||
           can_update_vault(app, tx, w) ||
           can_mint_vault_token(&token_app, tx));
    true
}

fn can_create_vault(vault_app: &App, tx: &Transaction, w: &Data) -> bool {
    let w_str: Option<String> = w.value().ok();
    check!(w_str.is_some());
    let w_str = w_str.unwrap();

    // Verify the hash of `w` matches the vault identity
    check!(hash(&w_str) == vault_app.identity);

    // Verify we're spending the correct UTXO
    let w_utxo_id = UtxoId::from_str(&w_str).unwrap();
    check!(tx.ins.iter().any(|(utxo_id, _)| utxo_id == &w_utxo_id));

    let vault_charms = charm_values(vault_app, tx.outs.iter()).collect::<Vec<_>>();

    // Can create exactly one vault NFT
    check!(vault_charms.len() == 1);

    // Verify vault has correct structure
    if let Ok(vault) = vault_charms[0].value::<InheritanceVault>() {
        // Verify vault is in Active status
        check!(matches!(vault.status, VaultStatus::Active));

        // Verify beneficiaries percentages sum to 100
        let total_percentage: u8 = vault.beneficiaries.iter().map(|b| b.percentage).sum();
        check!(total_percentage == 100);

        // Verify timeout is reasonable (between 1 day and 10 years in blocks)
        check!(vault.timeout_blocks >= 144 && vault.timeout_blocks <= 5_256_000);

        return true;
    }
    false
}

fn can_update_vault(vault_app: &App, tx: &Transaction, w: &Data) -> bool {
    let w_str: Option<String> = w.value().ok();
    check!(w_str.is_some());
    let w_str = w_str.unwrap();

    // Parse operation from witness data
    if let Ok(operation) = serde_json::from_str::<VaultOperation>(&w_str) {
        let input_vaults = charm_values(vault_app, tx.ins.iter().map(|(_, v)| v))
            .filter_map(|data| data.value::<InheritanceVault>().ok())
            .collect::<Vec<_>>();

        let output_vaults = charm_values(vault_app, tx.outs.iter())
            .filter_map(|data| data.value::<InheritanceVault>().ok())
            .collect::<Vec<_>>();

        check!(input_vaults.len() == 1 && output_vaults.len() == 1);

        let input_vault = &input_vaults[0];
        let output_vault = &output_vaults[0];

        match operation {
            VaultOperation::Checkin => {
                // Only owner can check in
                check!(verify_owner_signature(input_vault, tx));

                // Update last checkin timestamp
                check!(output_vault.last_checkin > input_vault.last_checkin);

                // All other fields remain the same
                check!(output_vault.owner == input_vault.owner);
                check!(output_vault.beneficiaries == input_vault.beneficiaries);
                check!(output_vault.timeout_blocks == input_vault.timeout_blocks);
                check!(output_vault.vault_balance == input_vault.vault_balance);
                check!(matches!(output_vault.status, VaultStatus::Active));

                return true;
            }
            VaultOperation::Claim => {
                // Verify timeout has passed
                let current_block = get_current_block_height(tx);
                check!(current_block >= input_vault.last_checkin + input_vault.timeout_blocks);

                // Verify claimer is a beneficiary
                check!(verify_beneficiary_signature(input_vault, tx));

                // Mark vault as claimed
                check!(matches!(output_vault.status, VaultStatus::Claimed));

                return true;
            }
            VaultOperation::UpdateBeneficiaries => {
                // Only owner can update beneficiaries
                check!(verify_owner_signature(input_vault, tx));

                // Verify new beneficiaries percentages sum to 100
                let total_percentage: u8 = output_vault.beneficiaries.iter().map(|b| b.percentage).sum();
                check!(total_percentage == 100);

                return true;
            }
            _ => return false,
        }
    }
    false
}

fn vault_token_contract_satisfied(token_app: &App, tx: &Transaction) -> bool {
    check!(can_mint_vault_token(token_app, tx));
    true
}

fn can_mint_vault_token(token_app: &App, tx: &Transaction) -> bool {
    let vault_app = App {
        tag: NFT,
        identity: token_app.identity.clone(),
        vk: token_app.vk.clone(),
    };

    // Get vault state from inputs and outputs
    let input_vault: Option<InheritanceVault> =
        charm_values(&vault_app, tx.ins.iter().map(|(_, v)| v)).find_map(|data| data.value().ok());

    let output_vault: Option<InheritanceVault> =
        charm_values(&vault_app, tx.outs.iter()).find_map(|data| data.value().ok());

    if let (Some(input_vault), Some(output_vault)) = (input_vault, output_vault) {
        // Calculate token amounts
        let input_token_amount = sum_token_amount(token_app, tx.ins.iter().map(|(_, v)| v)).unwrap_or(0);
        let output_token_amount = sum_token_amount(token_app, tx.outs.iter()).unwrap_or(0);

        let token_diff = output_token_amount as i64 - input_token_amount as i64;
        let vault_diff = output_vault.vault_balance as i64 - input_vault.vault_balance as i64;

        // Token change must match vault balance change
        check!(token_diff == vault_diff);

        return true;
    }

    false
}

fn verify_owner_signature(_vault: &InheritanceVault, _tx: &Transaction) -> bool {
    // In a real implementation, this would verify the transaction signature
    // against the vault owner's public key
    true
}

fn verify_beneficiary_signature(_vault: &InheritanceVault, _tx: &Transaction) -> bool {
    // In a real implementation, this would verify the transaction signature
    // against one of the beneficiary's public keys
    true
}

fn get_current_block_height(_tx: &Transaction) -> u32 {
    // In a real implementation, this would get the current block height
    // For now, return a placeholder
    850000 // Approximate current Bitcoin block height
}

pub(crate) fn hash(data: &str) -> B32 {
    let hash = Sha256::digest(data);
    B32(hash.into())
}

#[cfg(test)]
mod test {
    use super::*;
    use charms_sdk::data::UtxoId;
    use std::str::FromStr;

    #[test]
    fn test_vault_creation() {
        let vault = InheritanceVault {
            owner: "bc1qowner123".to_string(),
            beneficiaries: vec![
                Beneficiary {
                    address: "bc1qben1".to_string(),
                    percentage: 60,
                    name: "Alice".to_string(),
                },
                Beneficiary {
                    address: "bc1qben2".to_string(),
                    percentage: 40,
                    name: "Bob".to_string(),
                },
            ],
            timeout_blocks: 52560, // ~1 year
            last_checkin: 850000,
            vault_balance: 100000000, // 1 BTC in sats
            status: VaultStatus::Active,
            vault_id: "vault123".to_string(),
            created_at: 1704067200, // Jan 1, 2024
        };

        // Test beneficiary percentages sum to 100
        let total: u8 = vault.beneficiaries.iter().map(|b| b.percentage).sum();
        assert_eq!(total, 100);
    }

    #[test]
    fn test_hash() {
        let utxo_id =
            UtxoId::from_str("dc78b09d767c8565c4a58a95e7ad5ee22b28fc1685535056a395dc94929cdd5f:1")
                .unwrap();
        let data = dbg!(utxo_id.to_string());
        let expected = "f54f6d40bd4ba808b188963ae5d72769ad5212dd1d29517ecc4063dd9f033faa";
        assert_eq!(&hash(&data).to_string(), expected);
    }

    #[test]
    fn test_vault_operations() {
        // Test that we can serialize/deserialize vault operations
        let op = VaultOperation::Checkin;
        let serialized = serde_json::to_string(&op).unwrap();
        let deserialized: VaultOperation = serde_json::from_str(&serialized).unwrap();

        match deserialized {
            VaultOperation::Checkin => (),
            _ => panic!("Unexpected operation"),
        }
    }
}