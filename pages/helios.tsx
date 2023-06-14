import type { NextPage } from "next";
import WalletConnect from "../components/WalletConnect";
import { useStoreState } from "../utils/store";
import Link from "next/link";
import { useState, useEffect } from "react";
import initLucid from "../utils/lucid";
import { Data, Lucid, SpendingValidator } from "lucid-cardano";
import { hashDatum } from "../utils/cardano";
import Router from "next/router";

const Helios: NextPage = () => {
  const walletStore = useStoreState((state: any) => state.wallet);
  const [lucid, setLucid] = useState<Lucid>();

  const [actionResult, setActionResult] = useState("");

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (walletStore.name == "") {
      Router.push("/");
      return;
    }

    if (lucid) {
    } else {
      initLucid(walletStore.name).then((Lucid: Lucid) => {
        setLucid(Lucid);
      });
    }
  }, [lucid]);

  const helloAikenScript: SpendingValidator = {
    type: "PlutusV2",
    script:
      "587f587d0100003232323232323232222533300732323232533300b3370e90000008a5014a260166ea80054ccc024cdc38008010a60103d87a800014c103d8798000375a0066eb400c5261633001001480008888cccc018cdc38008018049199980280299b8000448008c02c0040080088c010dd5000ab9a5573aaae795d0aba21",
  };

  const lockAiken = async () => {
    try {
      console.log("LockAiken():");
      if (lucid) {
        const helloAikenAddress =
          lucid.utils.validatorToAddress(helloAikenScript);
        console.log({ scriptAddress: helloAikenAddress });

        const lock = Data.to(BigInt(42)); // datum
        console.log({ datum: lock });

        const tx = await lucid
          .newTx()
          .payToContract(
            helloAikenAddress,
            { asHash: lock, scriptRef: helloAikenScript },
            { lovelace: BigInt(42_000000) }
          )
          .complete();

        const signedTx = await tx.sign().complete();
        const txHash = await signedTx.submit();
        console.log({ txHash: txHash });

        setActionResult(`TxHash: ${txHash}`);
        return txHash;
      }
      throw { error: "Invalid Lucid State!" };
    } catch (x) {
      setActionResult(JSON.stringify(x));
    }
  };

  const redeemAiken = async () => {
    try {
      console.log("RedeemAiken():");
      if (lucid) {
        const userAddress = await lucid.wallet.address();
        console.log({ userAddress: userAddress });

        const helloAikenAddress =
          lucid.utils.validatorToAddress(helloAikenScript);
        console.log({ scriptAddress: helloAikenAddress });

        const lock = Data.to(BigInt(42)); // datum
        console.log({ datum: lock });

        const hash = hashDatum(lock); // datum hash
        console.log({ datumHash: hash });

        const utxos = (await lucid.utxosAt(helloAikenAddress))?.filter(
          (utxo) => utxo.datumHash === hash
        );
        console.log({ utxos: utxos });
        if (!utxos?.length) {
          throw { nothingToUnlock: "No valid UTxO to redeem." };
        }

        const key = Data.to(BigInt(42)); // redeemer
        console.log({ redeemer: key });

        const tx = await lucid
          .newTx()
          .collectFrom(utxos, key)
          .addSigner(userAddress)
          // .attachSpendingValidator(helloAikenScript)
          .readFrom([utxos[0]]) // reference script
          .complete();

        const signedTx = await tx.sign().complete();
        const txHash = await signedTx.submit();
        console.log({ txHash: txHash });

        setActionResult(`TxHash: ${txHash}`);
        return txHash;
      }
      throw { error: "Invalid Lucid State!" };
    } catch (x) {
      setActionResult(JSON.stringify(x));
    }
  };

  return !loaded || walletStore.name == "" ? (
    <></>
  ) : (
    <div className="px-10">
      <div className="navbar bg-base-100">
        <div className="flex-1">
          <Link href="/" className="btn btn-ghost normal-case text-xl">
            Cardano
          </Link>
        </div>
        <div className="flex-none">
          <WalletConnect />
        </div>
      </div>

      {/* Lock button */}
      <button className="btn btn-primary m-5" onClick={lockAiken}>
        Lock 42 to Aiken
      </button>

      {/* Unlock button */}
      <button className="btn btn-secondary m-5" onClick={redeemAiken}>
        Unlock 42 from Aiken
      </button>

      <div className="px-10 text-xl">
        <pre>{actionResult}</pre>
      </div>
    </div>
  );
};

export default Helios;
