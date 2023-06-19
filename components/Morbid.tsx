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
      "590aff590afc010000323232323232323232323232322223232533300b333323232323232323232323232323232323232323232322223232323253330283370e900018138010a99981419b8748000c09c00c4c8c8c8cc03c020004dd7181800098180009813001800800899299981419b8748000c09c00854ccc0a0cdc3a4004604e00626464646464a66605a66e1d200000213232533302f3370e9000181700089919191980b0078009bae30370013037001302d0010033034001302b00300114a060540026601600e0026eb8c0bc004c09800c0040044c94ccc0a0cdc3a4004604e0042a66605066e1d20003027003132323300a007001375a605e002604c006002002264a66605066e1d20023027002153330283370e9001181380189919191919299981699b87480000084c8c94ccc0bccdc3a4000605c002264646602201c0026eb4c0d8004c0b400400cc0d0004c0ac00c0045281815000998058038009bae302f001302600300100114a06050004605000266ec000800c88c8c8c8c94ccc098cdc3a4004002264646466e200200054ccc0a0cdc3a400460546ea8cc090c0980152002100113370000290011bad302d0013024002153330263370e90020008a5114a06048002660406044002900018048009980f18101980f1810001240009007111919299981199b87480000044c8c8c8c94ccc09ccdc3a4008002264646466e9520003302f0024bd701812000981700098128010a60103d87a80003025001330213023330213023001480092004302a001302100214c0103d87a80003021001323300400123371e6eb8cc07cc084cc07cc084cc07cc084005200048001200000337586603a603e6603a603e0049000240006002002444a6660480042980103d87a8000132325333022300300213374a90001981380125eb804ccc01401400400cc0a000cc09800888c8c8cc0140048c94ccc0880045288a99811a481177265637265617465645f6368657374203f2046616c73650014a064a66604c00229404c94ccc09c0044c8c8c94ccc098cdc3a400800226464a66605066e1d200030270011323232325333030303300213233012001232533302f00114a22a660609211b706f7374706f6e65645f61667465725f6e6f77203f2046616c73650014a0646464a66606266e1d20020011323232533303433710002016294454cc0d52411b74696d65203c206e65775f646561646c696e65203f2046616c73650014a0a666066a66606666e1d2002303537546605e606200a90010a5115330344901186e6f772e69735f696e636c7573697665203f2046616c73650014a02002266e000052002375a6070002605e0042940c0bc004cc0acc0b4005200030143302a302c3302a302c01248001200e330114a2464a66605c002294454cc0bd24011d7369676e65645f62795f6e65775f63726561746f72203f2046616c73650014a0660400220042a6605a9201334c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e2065787065637465640016375c606200260620046eb4c0bc004c09800454cc0a52412a4578706563746564206f6e20696e636f727265637420636f6e7374727563746f722076617269616e742e0016302d001302400214a06048002660406044002900218148010a50302900132330090012323253330253370e9002000899251302300214a060460026603e604200290021bac3301d301f3301d301f00548001200433004001232533302100114a22a66044921136e6f745f647261696e6564203f2046616c73650014a0646464a66604666e240040085288a9981224811f696e7075745f616461203e3d206f75747075745f616461203f2046616c73650014a06464601a00266028002460206eaccc080c088005200237586603c604000490021919180600099809800918079bab3301f30213301f302100148009200237586603a603e00290001980e180f00224000660069448c94ccc0800045288a99810a481197369676e65645f62795f63726561746f72203f2046616c73650014a06602400600444a66603a004260029445281199119299980f19b8748000004400c54ccc078cdc3a400400220062004603864a66603c66e1d200000114c103d87980001533301e3370e90020008a6103d87b80001533301e533301e3370e900118101baa3301a301c003480084cdc3a400460406ea8cc068c0700092002133301e3370e900118101baa3301a301c002480092825114c0103d87a80001533301e3370e900118101baa3301a301c00348008530103d87b800014c103d8798000301c33223253330203370e9000000899299981099b8748000004530103d87a800014c103d8798000301f002153330203370e9002000899299981099b8748010004530103d87a800014c103d87b8000301f002132323253330233370e90000008a60103d87b8000153330233370e90020008a6103d8798000132325333025337100080022980103d8798000153330253370e0080022980103d87a800014c103d87b8000375a6054002604200a60420086eb4c09c004c07800cc078008cc064c06c009200033019301b00148000cc05cc064005200033017301900148008c0040048894ccc07c00852f5c026464a66603a600600426604400466600a00a002006266600a00a00200660460066042004466600400290001119b8000100230010012222533301d0031002132323333006006001330030020040033021004375a603e0064646464a66603066e1d20020011480004c8dd6980f800980b001180b00099299980b99b8748008004530103d87a80001323233006001489003756603c002602a004602a00266008002911003001001222533301900214c103d87a800013232323253330193371e00a002266e9520003301e375000497ae01333007007003005375c60340066eb4c068008c07400cc06c008c0040048894ccc05c008530103d87a800013232323253330173371e00a002266e9520003301c374c00497ae01333007007003005375c60300066eacc060008c06c00cc064008c0040048894ccc05400852f5c026464660306ea0c00c008ccc01401400400cc06400cc05c00888c8cc010004008dd6198059806998059806801240009008180080091129998090010a501323253330103371e00400629444ccc01401400400cc05800cdd7180a0010008010018a4c2c6400a600a0086400664a66601466e1d20000011533300e3008003149854cc02d2411d4578706563746564206e6f206669656c647320666f7220436f6e73747200161533300a3370e90010008a99980718040018a4c2a6601692011d4578706563746564206e6f206669656c647320666f7220436f6e7374720016153300b4912b436f6e73747220696e64657820646964206e6f74206d6174636820616e7920747970652076617269616e740016300800223253330073370e9000000899191919299980798090010a4c2a66018921334c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e2065787065637465640016375c602000260200046eb4c038004c01400854ccc01ccdc3a400400226464a66601a60200042930a99805249334c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e2065787065637465640016375c601c002600a0042a660109212b436f6e73747220696e64657820646964206e6f74206d6174636820616e7920747970652076617269616e740016300500133001001480008888cccc01ccdc38008018069199980280299b8000448008c03c0040080088c018dd5000918021baa0015734ae7155ceaab9e5573eae815d0aba21",
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
          .payToContract(
            morbidAddress, // re-create chest
            { inline: createChest, scriptRef: morbidScript },
            { lovelace: BigInt(treasure) }
          )
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
