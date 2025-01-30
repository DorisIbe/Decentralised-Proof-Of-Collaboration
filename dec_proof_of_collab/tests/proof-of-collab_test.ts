
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

