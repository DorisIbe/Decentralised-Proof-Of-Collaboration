
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure that contract initializes correctly with owner as admin",
    async fn(chain: Chain, accounts: Map<string, Account>)
    {
        const deployer = accounts.get("deployer")!;

        let block = chain.mineBlock([
            Tx.contractCall("proof-of-collab", "initialize", [], deployer.address),
            Tx.contractCall("proof-of-collab", "is-project-admin",
                [types.principal(deployer.address)],
                deployer.address
            )
        ]);

        assertEquals(block.receipts.length, 2);
        assertEquals(block.receipts[0].result, '(ok true)');
        assertEquals(block.receipts[1].result, 'true');
    },
});

Clarinet.test({
    name: "Ensure that only owner can add project admins",
    async fn(chain: Chain, accounts: Map<string, Account>)
    {
        const deployer = accounts.get("deployer")!;
        const wallet1 = accounts.get("wallet_1")!;
        const wallet2 = accounts.get("wallet_2")!;

        let block = chain.mineBlock([
            Tx.contractCall("proof-of-collaboration", "initialize", [], deployer.address),
            Tx.contractCall("proof-of-collaboration", "add-project-admin",
                [types.principal(wallet1.address)],
                deployer.address
            ),
            Tx.contractCall("proof-of-collaboration", "add-project-admin",
                [types.principal(wallet2.address)],
                wallet1.address
            )
        ]);

        assertEquals(block.receipts.length, 3);
        assertEquals(block.receipts[1].result, '(ok true)');
        assertEquals(block.receipts[2].result, '(err u100)'); // err-owner-only
    },
});


Clarinet.test({
    name: "Ensure that users can submit contributions and get correct initial tier",
    async fn(chain: Chain, accounts: Map<string, Account>)
    {
        const wallet1 = accounts.get("wallet_1")!;

        let block = chain.mineBlock([
            Tx.contractCall("proof-of-collaboration", "submit-contribution",
                [types.utf8("Test contribution")],
                wallet1.address
            ),
            Tx.contractCall("proof-of-collaboration", "get-contributor-tier",
                [types.principal(wallet1.address)],
                wallet1.address
            )
        ]);

        assertEquals(block.receipts.length, 2);
        assertEquals(block.receipts[0].result, '(ok u1)'); // First contribution ID
        assertEquals(block.receipts[1].result, '(ok u1)'); // BRONZE tier
    },
});


Clarinet.test({
    name: "Ensure that contribution verification works correctly and updates scores",
    async fn(chain: Chain, accounts: Map<string, Account>)
    {
        const deployer = accounts.get("deployer")!;
        const wallet1 = accounts.get("wallet_1")!;

        let block = chain.mineBlock([
            Tx.contractCall("proof-of-collaboration", "initialize", [], deployer.address),
            Tx.contractCall("proof-of-collaboration", "submit-contribution",
                [types.utf8("Test contribution")],
                wallet1.address
            ),
            Tx.contractCall("proof-of-collaboration", "verify-contribution",
                [types.uint(1), types.uint(150)],
                deployer.address
            ),
            Tx.contractCall("proof-of-collaboration", "update-contributor-tier",
                [types.principal(wallet1.address)],
                wallet1.address
            ),
            Tx.contractCall("proof-of-collaboration", "get-contributor-tier",
                [types.principal(wallet1.address)],
                wallet1.address
            )
        ]);

        assertEquals(block.receipts.length, 5);
        assertEquals(block.receipts[2].result, '(ok true)'); // Verification success
        assertEquals(block.receipts[4].result, '(ok u2)'); // SILVER tier
    },
});

Clarinet.test({
    name: "Ensure that badge awarding system works correctly",
    async fn(chain: Chain, accounts: Map<string, Account>)
    {
        const deployer = accounts.get("deployer")!;
        const wallet1 = accounts.get("wallet_1")!;

        let block = chain.mineBlock([
            Tx.contractCall("proof-of-collaboration", "initialize", [], deployer.address),
            Tx.contractCall("proof-of-collaboration", "award-badge",
                [types.principal(wallet1.address), types.utf8("First Contribution Badge")],
                deployer.address
            ),
            Tx.contractCall("proof-of-collaboration", "get-contributor-stats",
                [types.principal(wallet1.address)],
                wallet1.address
            )
        ]);

        assertEquals(block.receipts.length, 3);
        assertEquals(block.receipts[1].result, '(ok true)');
    },
});

Clarinet.test({
    name: "Ensure that activity streak tracking works correctly",
    async fn(chain: Chain, accounts: Map<string, Account>)
    {
        const wallet1 = accounts.get("wallet_1")!;

        let block = chain.mineBlock([
            Tx.contractCall("proof-of-collaboration", "update-activity-streak",
                [types.principal(wallet1.address)],
                wallet1.address
            )
        ]);

        // Mine blocks to simulate time passing (almost one day)
        chain.mineEmptyBlock(143); // BLOCKS_PER_DAY - 1

        block = chain.mineBlock([
            Tx.contractCall("proof-of-collaboration", "update-activity-streak",
                [types.principal(wallet1.address)],
                wallet1.address
            ),
            Tx.contractCall("proof-of-collaboration", "get-contributor-stats",
                [types.principal(wallet1.address)],
                wallet1.address
            )
        ]);

        assertEquals(block.receipts[0].result, '(ok true)');
    },
});

Clarinet.test({
    name: "Ensure that contribution revocation works correctly",
    async fn(chain: Chain, accounts: Map<string, Account>)
    {
        const deployer = accounts.get("deployer")!;
        const wallet1 = accounts.get("wallet_1")!;

        let block = chain.mineBlock([
            Tx.contractCall("proof-of-collaboration", "initialize", [], deployer.address),
            Tx.contractCall("proof-of-collaboration", "submit-contribution",
                [types.utf8("Test contribution")],
                wallet1.address
            ),
            Tx.contractCall("proof-of-collaboration", "revoke-contribution",
                [types.uint(1)],
                wallet1.address
            ),
            Tx.contractCall("proof-of-collaboration", "get-contribution",
                [types.uint(1)],
                wallet1.address
            )
        ]);

        assertEquals(block.receipts.length, 4);
        assertEquals(block.receipts[2].result, '(ok true)'); // Revocation success
        assertEquals(block.receipts[3].result, 'none'); // Contribution should not exist
    },
});

Clarinet.test({
    name: "Ensure that recent contributions listing works correctly",
    async fn(chain: Chain, accounts: Map<string, Account>)
    {
        const wallet1 = accounts.get("wallet_1")!;

        let block = chain.mineBlock([
            Tx.contractCall("proof-of-collaboration", "submit-contribution",
                [types.utf8("Test contribution 1")],
                wallet1.address
            ),
            Tx.contractCall("proof-of-collaboration", "submit-contribution",
                [types.utf8("Test contribution 2")],
                wallet1.address
            ),
            Tx.contractCall("proof-of-collaboration", "get-recent-contributions",
                [types.uint(5)],
                wallet1.address
            )
        ]);

        assertEquals(block.receipts.length, 3);

    },
});

Clarinet.test({
    name: "Ensure that contributor status management works correctly",
    async fn(chain: Chain, accounts: Map<string, Account>)
    {
        const deployer = accounts.get("deployer")!;
        const wallet1 = accounts.get("wallet_1")!;

        let block = chain.mineBlock([
            Tx.contractCall("proof-of-collaboration", "initialize", [], deployer.address),
            Tx.contractCall("proof-of-collaboration", "submit-contribution",
                [types.utf8("Test contribution")],
                wallet1.address
            ),
            Tx.contractCall("proof-of-collaboration", "set-contributor-status",
                [types.principal(wallet1.address), types.bool(false)],
                deployer.address
            ),
            Tx.contractCall("proof-of-collaboration", "get-contributor-profile",
                [types.principal(wallet1.address)],
                wallet1.address
            )
        ]);

        assertEquals(block.receipts.length, 4);
        assertEquals(block.receipts[2].result, '(ok true)');
    },
});


Clarinet.test({
    name: "Ensure that tier thresholds work correctly",
    async fn(chain: Chain, accounts: Map<string, Account>)
    {
        const deployer = accounts.get("deployer")!;
        const wallet1 = accounts.get("wallet_1")!;

        let block = chain.mineBlock([
            Tx.contractCall("proof-of-collaboration", "initialize", [], deployer.address),
            Tx.contractCall("proof-of-collaboration", "submit-contribution",
                [types.utf8("Platinum contribution")],
                wallet1.address
            ),
            Tx.contractCall("proof-of-collaboration", "verify-contribution",
                [types.uint(1), types.uint(500)], // PLATINUM_THRESHOLD
                deployer.address
            ),
            Tx.contractCall("proof-of-collaboration", "update-contributor-tier",
                [types.principal(wallet1.address)],
                wallet1.address
            ),
            Tx.contractCall("proof-of-collaboration", "get-contributor-tier",
                [types.principal(wallet1.address)],
                wallet1.address
            )
        ]);

        assertEquals(block.receipts.length, 5);
        assertEquals(block.receipts[4].result, '(ok u4)'); // PLATINUM tier
    },
});



