
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

