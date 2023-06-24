import {
  Constr,
  Data,
  Lucid,
  SpendingValidator,
  UTxO,
  assetsToValue,
} from "lucid-cardano";
import { useEffect, useState } from "react";
import { getDatumFields, getLatestBlockInfo } from "../utils/blockfrost";
import { hashDatum } from "../utils/cardano";
import { useStoreActions, useStoreState } from "../utils/chest";

const Morbid = (props: {
  lucid: Lucid;
  setActionResult: (actionResult: string) => void;
}) => {
  const lucid = props.lucid;
  const setActionResult = props.setActionResult;

  const chest = useStoreState((state) => state.chest);
  const setChest = useStoreActions((actions) => actions.setChest);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const morbidScript: SpendingValidator = {
    type: "PlutusV2",
    script:
      "590d84590d81010000323232323232323232323232322223232533300b333323232323232323232323232323232323232323232323232322223232323232533302c3370e900018158010a99981619b8748000c0ac00c4c8c8c94ccc0bccdc3a4004605c00e26466022014004605a00e0086eb8c0d0004c0d0004c0a800c0040044c94ccc0b0cdc3a400060560042a66605866e1d2002302b00313232533302e3370e90011816803099191919299981919b87480000084c8c94ccc0d0cdc3a400060660022646464660300220026eb8c0f0004c0f0004c0c800400cc0e4004c0c000c00452818178009980680480118160030019bae3033001302a003001001132533302c3370e900118158010a99981619b8748000c0ac00c4c8c94ccc0b8cdc3a4004605a00c26466018012004605800c0066eb4c0cc004c0a800c0040044c94ccc0b0cdc3a400460560042a66605866e1d2002302b00313232533302e3370e90011816803099191919299981919b87480000084c8c94ccc0d0cdc3a4000606600226464660260200026eb4c0ec004c0c800400cc0e4004c0c000c00452818178009980680480118160030019bae3033001302a00300100114a06060006605e6060004605c605e605e00266058004660580066605866046604a002900125eb8088c8c8c8c94ccc0a4cdc3a4004002264646466e200200054ccc0accdc3a4004605a6ea8cc09cc0a40152002100113370000290011bad30300013027002153330293370e90020008a5114a0604e00266046604a00290001804000998109811998109811801240009007111919299981319b87480000044c8c8c8c94ccc0a8cdc3a4008002264646466e952000330320024bd701813800981880098140010a60103d87a80003028001330243026330243026001480092004302d001302400214c0103d87a80003024001323300400123371e6eb8cc088c090cc088c090cc088c090005200048001200000337586604060446604060440049000240006002002444a66604e0042980103d87a8000132325333025300300213374a90001981500125eb804ccc01401400400cc0ac00cc0a400888c8c8cc0600048c94ccc0940045288a998132481177265637265617465645f6368657374203f2046616c73650014a064a66605200229404c94ccc0a80044c8c8c94ccc0a4cdc3a400800226464a66605666e1d2000302a0011323232325333033303600213233025001232533303200114a22a660669211b706f7374706f6e65645f61667465725f6e6f77203f2046616c73650014a0a66606266e20c8c8c8c94ccc0d4cdc3a4004606e6ea8cc0c4c0cc00d2002100113370000290011bad303a00130313253330343370e9001181980088008a9981aa4812a4578706563746564206f6e20696e636f727265637420636f6e7374727563746f722076617269616e742e00163302f303100148000c050004cc0b4c0bccc0b4c0bc0492000480380145288a9981924954756e736166655f756e777261702e66696e6974655f73746172745f6f66286374782e7472616e73616374696f6e2e76616c69646974795f72616e676529203c206e65775f646561646c696e65203f2046616c73650014a0660489448c94ccc0c40045288a998192491d7369676e65645f62795f6e65775f63726561746f72203f2046616c73650014a0660440220042a660609201334c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e2065787065637465640016375c606800260680046eb4c0c8004c0a400454cc0b12412a4578706563746564206f6e20696e636f727265637420636f6e7374727563746f722076617269616e742e00163030001302700214a0604e00266046604a002900218160010a50302c001323300d0012323253330283370e9002000899251302600214a0604c00266044604800290021bac33020302233020302200548001200433017001232533302400114a22a6604a921136e6f745f647261696e6564203f2046616c73650014a06464646464646464a66605e60640042646464646464a66606a6070004264a666064a66606466e1c01c0045288a99819a4929696e7075745f6c6f76656c616365203d3d206f75747075745f6c6f76656c616365203f2046616c73650014a02a66606466ebc0200085288a99819a4935696e7075745f7363726970745f61646472657373203d3d206f75747075745f7363726970745f61646472657373203f2046616c73650014a02940c05001054cc0c92401334c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e206578706563746564001630360013230160013301700100b375860620046eb0c0bc004c8c8c060004cc064004020dd6198141815004a4008601c0082a66058921334c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e2065787065637465640016303000132301000133011001005375860560046eb0c0a4004c8c8c048004cc04c0048c8c010004cc090c098005200237586604460480069000119bb03750a66604c6460060026604460480029000099191919299981519b874800800452000132375a60620026050004605000264a66605266e1d200200114c0103d87a800013232330190014890037566060002604e004604e0026602e00291100375666044604800290010a4000660446048002900011919299981399b87480080044c92898128010992503025002302500133021302300148000cc07cc0840112000330164a2464a666046002294454cc0912401197369676e65645f62795f63726561746f72203f2046616c73650014a0660280060044664464a66604466e1d20000011003153330223370e900100088018801181019299981119b87480000045300103d8798000153330223370e90020008a6103d87b80001533302253330223370e900118121baa3301e3020003480084cdc3a400460486ea8cc078c080009200213330223370e900118121baa3301e3020002480092825114c0103d87a8000153330223370e900118121baa3301e302000348008530103d87b800014c103d8798000302033223253330243370e9000000899299981299b8748000004530103d87a800014c103d87980003023002153330243370e9002000899299981299b8748010004530103d87a800014c103d87b80003023002132323253330273370e90000008a60103d87b8000153330273370e90020008a6103d8798000132325333029337100080022980103d8798000153330293370e0080022980103d87a800014c103d87b8000375a605c002604a00a604a0086eb4c0ac004c08800cc088008cc074c07c00920003301d301f00148000cc06cc07400520003301b301d001480088ccc0080052000223370000200460020024444a666046006200426464666600c00c00266006004008006604e0086eb4c09400cc004004894ccc07c00452f5c02646466044004660080086600a002466603c66ebc00400d28251302300230210013001001222533301e00214bd7009919299980e1801801099810801199802802800801899980280280080198110019810001180080091299980d8008a5ef6c6101800001018000132323232323232337606e9ccc08cdd40020011ba733023005001375860400046eb0c078004cc01801800cdd6980e001980e001180f801180e8009800800911299980d0010a5eb7bdb1804c8c8cc074c00c008ccc01401400400cc07800cc070008c0040048894ccc0600085300103d87a800013232323253330183371e00a002266e9520003301d375000497ae01333007007003005375c60320066eb4c064008c07000cc068008c0040048894ccc058008530103d87a800013232323253330163371e00a002266e9520003301b374c00497ae01333007007003005375c602e0066eacc05c008c06800cc06000888c8cc010004008dd6198061807198061807001240009008180080091129998098010a501323253330113371e00400629444ccc01401400400cc05c00cdd7180a80111299980680109800a4c294000400800c526163200530050043200332533300a3370e90000008a99980718040018a4c2a6601692011d4578706563746564206e6f206669656c647320666f7220436f6e73747200161533300a3370e90010008a99980718040018a4c2a6601692011d4578706563746564206e6f206669656c647320666f7220436f6e7374720016153300b4912b436f6e73747220696e64657820646964206e6f74206d6174636820616e7920747970652076617269616e740016300800223253330073370e9000000899191919299980798090010a4c2a66018921334c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e2065787065637465640016375c602000260200046eb4c038004c01400854ccc01ccdc3a400400226464a66601a60200042930a99805249334c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e2065787065637465640016375c601c002600a0042a660109212b436f6e73747220696e64657820646964206e6f74206d6174636820616e7920747970652076617269616e740016300500133001001480008888cccc01ccdc38008018069199980280299b8000448008c03c0040080088c018dd5000918021baa0015734ae7155ceaab9e5573eae815d0aba21",
  };

  const createChest = async () => {
    try {
      console.log("CreateChest():");
      if (lucid) {
        const block = await getLatestBlockInfo();
        const time = block["time"] * 1_000; // ms
        console.log({ time: time });

        const userAddress = await lucid.wallet.address();
        console.log({ userAddress: userAddress });

        const morbidAddress = lucid.utils.validatorToAddress(morbidScript);
        console.log({ scriptAddress: morbidAddress });

        const deadline = time;
        const creator =
          lucid.utils.getAddressDetails(userAddress).paymentCredential?.hash;
        const createChest = Data.to(
          new Constr(0, [BigInt(deadline), String(creator)])
        );
        console.log({ datum: createChest });

        const tx = await lucid
          .newTx()
          .payToContract(
            morbidAddress,
            { inline: createChest, scriptRef: morbidScript },
            { lovelace: BigInt(42_000000) }
          )
          .complete();

        const signedTx = await tx.sign().complete();
        const txHash = await signedTx.submit();
        console.log({ txHash: txHash });

        setActionResult(`TxHash: ${txHash}`);
        setChest({ txHash: txHash });
        return txHash;
      }
      throw { error: "Invalid Lucid State!" };
    } catch (x) {
      setActionResult(JSON.stringify(x));
    }
  };

  const addTreasure = async () => {
    try {
      console.log(`AddTreasure(${chest.txHash}):`);
      if (lucid && chest.txHash.length) {
        const userAddress = await lucid.wallet.address();
        console.log({ userAddress: userAddress });

        const morbidAddress = lucid.utils.validatorToAddress(morbidScript);
        console.log({ scriptAddress: morbidAddress });

        const refTxn = chest.txHash;
        const addTreasure = Data.to(new Constr(1, [String(refTxn)]));
        console.log({ datum: addTreasure });

        const tx = await lucid
          .newTx()
          .payToContract(
            morbidAddress,
            { inline: addTreasure },
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

  const delayUnlock = async () => {
    try {
      console.log(`DelayUnlock(${chest.txHash}):`);
      if (lucid && chest.txHash.length) {
        const block = await getLatestBlockInfo();
        const time = block["time"] * 1_000; // ms
        console.log({ time: time });

        const userAddress = await lucid.wallet.address();
        console.log({ userAddress: userAddress });

        const morbidAddress = lucid.utils.validatorToAddress(morbidScript);
        console.log({ scriptAddress: morbidAddress });

        const utxos = await lucid.utxosAt(morbidAddress);
        console.log({ utxos: utxos });
        if (!utxos?.length) {
          throw { emptyScriptAddress: "No UTxO to redeem." };
        }

        let treasure = 0;
        const chestUTxOs: UTxO[] = [];
        const refScript: UTxO[] = [];

        const forEachAsync = async (
          utxos: UTxO[],
          callback: { (utxo: UTxO): Promise<void>; (arg0: any): any }
        ) => {
          for (const utxo of utxos) {
            await callback(utxo);
          }
        };

        const myAsyncCallback = async (utxo: UTxO) => {
          if (!utxo.datum) return;

          const datumFields = await getDatumFields(hashDatum(utxo.datum));

          switch (datumFields.length) {
            case 2: // CreateChest
              if (utxo.txHash === chest.txHash) {
                const deadline = datumFields[0];
                const deadlineValue = deadline["int"];
                if (deadlineValue < time) {
                  refScript.push(utxo);
                  chestUTxOs.push(utxo);
                  treasure += Number.parseInt(
                    assetsToValue(utxo.assets).to_js_value()["coin"]
                  );
                }
              }
              return;

            case 1: // AddTreasure
              const refTxn = datumFields[0];
              const refTxnValue = refTxn["bytes"];
              if (refTxnValue === chest.txHash) {
                chestUTxOs.push(utxo);
                treasure += Number.parseInt(
                  assetsToValue(utxo.assets).to_js_value()["coin"]
                );
              }
              return;

            default:
              return;
          }
        };

        await forEachAsync(utxos, myAsyncCallback);

        console.log({ chestUTxOs: chestUTxOs });
        if (!chestUTxOs.length) {
          throw { nothingToUnlock: "No valid UTxO to redeem." };
        }
        console.log({ refScript: refScript });
        if (!refScript.length) {
          throw { refScriptNotFound: "No reference script found." };
        }

        const delayUnlock = Data.to(new Constr(0, [])); // redeemer
        console.log({ redeemer: delayUnlock }); // DelayUnlock

        const deadline = time + 1_000; // +1sec
        const creator =
          lucid.utils.getAddressDetails(userAddress).paymentCredential?.hash;
        const createChest = Data.to(
          new Constr(0, [BigInt(deadline), String(creator)])
        );
        console.log({ datum: createChest });

        console.log({ treasure: treasure });
        const tx = await lucid
          .newTx()
          .collectFrom(chestUTxOs, delayUnlock)
          .readFrom(refScript) // reference script
          .addSigner(userAddress)

          // normal case:
          .payToContract(
            morbidAddress, // re-create chest
            { inline: createChest, scriptRef: morbidScript },
            { lovelace: BigInt(treasure) }
          )

          // drain by recreate chest to another address:
          // .payToAddressWithData(
          //   userAddress, // drain to any address
          //   { inline: createChest },
          //   { lovelace: BigInt(treasure) }
          // )

          // drain by recreate chest to another address with multiple txOuts:
          // .payToContract(
          //   morbidAddress, // re-create chest
          //   { inline: createChest, scriptRef: morbidScript },
          //   { lovelace: BigInt(0) }
          // )
          // .payToAddress(
          //   userAddress, // drain to any address
          //   { lovelace: BigInt(treasure) }
          // )

          .validFrom(time)
          .complete();

        const signedTx = await tx.sign().complete();
        const txHash = await signedTx.submit();
        console.log({ txHash: txHash });

        setActionResult(`TxHash: ${txHash}`);
        setChest({ txHash: txHash });
        return txHash;
      }
      throw { error: "Invalid Lucid State!" };
    } catch (x) {
      setActionResult(JSON.stringify(x));
    }
  };

  const unlockChest = async () => {
    try {
      console.log(`UnlockChest(${chest.txHash}):`);
      if (lucid && chest.txHash.length) {
        const block = await getLatestBlockInfo();
        const time = block["time"] * 1_000; // ms
        console.log({ time: time });

        const morbidAddress = lucid.utils.validatorToAddress(morbidScript);
        console.log({ scriptAddress: morbidAddress });

        const utxos = await lucid.utxosAt(morbidAddress);
        console.log({ utxos: utxos });
        if (!utxos?.length) {
          throw { emptyScriptAddress: "No UTxO to redeem." };
        }

        const chestUTxOs: UTxO[] = [];
        const refScript: UTxO[] = [];

        const forEachAsync = async (
          utxos: UTxO[],
          callback: { (utxo: UTxO): Promise<void>; (arg0: any): any }
        ) => {
          for (const utxo of utxos) {
            await callback(utxo);
          }
        };

        const myAsyncCallback = async (utxo: UTxO) => {
          if (!utxo.datum) return;

          const datumFields = await getDatumFields(hashDatum(utxo.datum));

          switch (datumFields.length) {
            case 2: // CreateChest
              if (utxo.txHash === chest.txHash) {
                const deadline = datumFields[0];
                const deadlineValue = deadline["int"];
                if (deadlineValue < time) {
                  refScript.push(utxo);
                  chestUTxOs.push(utxo);
                }
              }
              return;

            case 1: // AddTreasure
              const refTxn = datumFields[0];
              const refTxnValue = refTxn["bytes"];
              if (refTxnValue === chest.txHash) {
                chestUTxOs.push(utxo);
              }
              return;

            default:
              return;
          }
        };

        await forEachAsync(utxos, myAsyncCallback);

        console.log({ chestUTxOs: chestUTxOs });
        if (!chestUTxOs.length) {
          throw { nothingToUnlock: "No valid UTxO to redeem." };
        }
        console.log({ refScript: refScript });
        if (!refScript.length) {
          throw { refScriptNotFound: "No reference script found." };
        }

        const unlockChest = Data.to(new Constr(1, [])); // redeemer
        console.log({ redeemer: unlockChest }); // UnlockChest

        const tx = await lucid
          .newTx()
          .collectFrom(chestUTxOs, unlockChest)
          .readFrom(refScript) // reference script
          .validFrom(time)
          .complete();

        const signedTx = await tx.sign().complete();
        const txHash = await signedTx.submit();
        console.log({ txHash: txHash });

        setActionResult(`TxHash: ${txHash}`);
        setChest({ txHash: "" });
        return txHash;
      }
      throw { error: "Invalid Lucid State!" };
    } catch (x) {
      setActionResult(JSON.stringify(x));
    }
  };

  return !loaded ? (
    <></>
  ) : (
    <div>
      {/* CreateChest */}
      <button className="btn btn-primary m-5" onClick={createChest}>
        Create Chest
      </button>

      {chest.txHash.length ? (
        <>
          {/* AddTreasure */}
          <button className="btn btn-secondary m-5" onClick={addTreasure}>
            Add Treasure
          </button>

          {/* DelayUnlock */}
          <button className="btn btn-secondary m-5" onClick={delayUnlock}>
            Delay Unlock
          </button>

          {/* UnlockChest */}
          <button className="btn btn-secondary m-5" onClick={unlockChest}>
            Unlock Chest
          </button>

          {/* ChestInfo */}
          <div>{`Current ChestID: ${chest.txHash}`}</div>
        </>
      ) : (
        <div>I don't remember having any chest currently...</div>
      )}
    </div>
  );
};

export default Morbid;
