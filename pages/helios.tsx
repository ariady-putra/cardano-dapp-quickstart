import type { NextPage } from "next";
import Link from "next/link";
import Router from "next/router";

import { useState, useEffect } from "react";
import { StoreProvider } from "easy-peasy";
import { Lucid } from "lucid-cardano";

import { useStoreState } from "../utils/store";
import chestStore from "../utils/chest";
import initLucid from "../utils/lucid";

import WalletConnect from "../components/WalletConnect";
import LockUnlock from "../components/LockUnlock";
import VestingScript from "../components/VestingScript";
import Morbid from "../components/Morbid";
import GiftCard from "../components/GiftCard";

const Helios: NextPage = () => {
  const MorbidProvider = StoreProvider as any;

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

  return !loaded || !lucid || walletStore.name == "" ? (
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

      <LockUnlock lucid={lucid} setActionResult={setActionResult} />

      <VestingScript lucid={lucid} setActionResult={setActionResult} />

      <MorbidProvider store={chestStore}>
        <Morbid lucid={lucid} setActionResult={setActionResult} />
      </MorbidProvider>

      <GiftCard lucid={lucid} setActionResult={setActionResult} />

      <div className="px-10 text-xl">
        <pre>{actionResult}</pre>
      </div>
    </div>
  );
};

export default Helios;
