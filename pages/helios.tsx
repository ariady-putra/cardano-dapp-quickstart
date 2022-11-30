import type { NextPage } from "next";
import Head from "next/head";
import WalletConnect from "../components/WalletConnect";
import { useStoreActions, useStoreState } from "../utils/store";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getAssets } from "../utils/cardano";
import NftGrid from "../components/NftGrid";
import initLucid from "../utils/lucid";
import {
  Lucid,
  TxHash,
  Lovelace,
  Constr,
  SpendingValidator,
  Data,
} from "lucid-cardano";
import * as helios from "@hyperionbt/helios";

const Helios: NextPage = () => {
  const walletStore = useStoreState((state: any) => state.wallet);
  const [nftList, setNftList] = useState([]);
  const [lucid, setLucid] = useState<Lucid>();
  const [script, setScript] = useState<SpendingValidator>();
  const [scriptAddress, setScriptAddress] = useState("");

  useEffect(() => {
    if (lucid) {
    } else {
      initLucid(walletStore.name).then((Lucid: Lucid) => {
        setLucid(Lucid);
      });
    }
  }, [lucid]);

  const alwaysSucceedScript: SpendingValidator = {
    type: "PlutusV2",
    script: "49480100002221200101",
  };

  const Datum = () => Data.empty();
  const Redeemer = () => Data.empty();

  const lockUtxo = async () => {
    if (lucid) {
      const alwaysSucceedAddress: any =
        lucid.utils.validatorToAddress(alwaysSucceedScript);

      // //const receiving_addr : string = "addr_test1qrp26gyxzq9yys8vhdc2rjfkny34w5976hxzd4t2vgsvvlmczpu3ccwkxq9faer2kt3238ppz9zykwd2yyrt96sz52nqkq2trl"
      // const receiving_addr : string = "addr_test1qryc5tck5kqqs3arcqnl4lplvw5yg2ujsdnhx5eawn9lyzzvpmpraw365fayhrtpzpl4nulq6f9hhdkh4cdyh0tgnjxsg03qnh"
      // const tx = await lucid.newTx()
      //   .payToAddress(receiving_addr, { lovelace: BigInt(2000000) })
      //   .complete();

      // const signedTx = await tx.sign().complete();
      // const txHash = await signedTx.submit();

      // Modified the deposit to include 3 different utxos with different values:
      const tx = await lucid
        .newTx()
        .payToContract(
          alwaysSucceedAddress,
          { inline: Datum() },
          { lovelace: BigInt(100_000_000) }
        )
        .payToContract(
          alwaysSucceedAddress,
          { inline: Datum() },
          { lovelace: BigInt(200_000_000) }
        )
        .payToContract(
          alwaysSucceedAddress,
          { inline: Datum() },
          { lovelace: BigInt(300_000_000) }
        )
        .payToContract(
          alwaysSucceedAddress,
          {
            asHash: Datum(),
            scriptRef: alwaysSucceedScript, // adding plutusV2 script to output
          },
          {}
        )
        .complete();

      const signedTx = await tx.sign().complete();
      const txHash = await signedTx.submit();
      return txHash;
    }
  };

  const redeemUtxo = async () => {
    if (lucid) {
      const alwaysSucceedAddress: any =
        lucid.utils.validatorToAddress(alwaysSucceedScript);

      /* Modified the unlock to include all the alwaysSucceedAddress utxos: */
      const referenceScriptUtxo = (await lucid.utxosAt(alwaysSucceedAddress))

        /* .find((utxo) => Boolean(utxo.scriptRef)); */
        .filter((utxo) => Boolean(utxo.scriptRef));

      if (!referenceScriptUtxo) throw new Error("Reference script not found");

      /* const utxo = (await lucid.utxosAt(alwaysSucceedAddress)).find( */
      const utxo = (await lucid.utxosAt(alwaysSucceedAddress)).filter(
        (utxo) => utxo.datum === Datum() && !utxo.scriptRef
      );
      if (!utxo) throw new Error("Spending script utxo not found");

      const tx = await lucid
        .newTx()

        /* .readFrom([referenceScriptUtxo]) */
        // spending utxo by reading plutusV2 from reference utxo
        .readFrom(referenceScriptUtxo)

        /* .collectFrom([utxo], Redeemer()) */
        .collectFrom(utxo, Redeemer())

        .complete();

      const signedTx = await tx.sign().complete();
      const txHash = await signedTx.submit();
      return txHash;
    }
  };

  return (
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

      {/* connected Wallet Address */}
      <div>Address: {walletStore.address}</div>

      {/* Deposit button */}
      <div className="mx-40 my-10">
        <button className="btn btn-primary m-5" onClick={() => lockUtxo()}>
          Deposit
        </button>

        {/* Unlock button */}
        <button className="btn btn-secondary m-5" onClick={() => redeemUtxo()}>
          Unlock
        </button>
      </div>
    </div>
  );
};

export default Helios;
