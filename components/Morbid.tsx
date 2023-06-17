import {
  Constr,
  Data,
  Lucid,
  SpendingValidator,
  UTxO,
  assetsToValue,
} from "lucid-cardano";
import { useEffect, useState } from "react";
import { getDatumFields } from "../utils/blockfrost";
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
      "590acc590ac9010000323232323232323232323232322223232533300b33332323232323232323232323232323232322223232323253330233370e900018110010a99981199b8748000c08800c4c8c8c8c8ccc03802400c004dd7181600098160011bad302a001302100300100113253330233370e900018110010a99981199b8748008c08800c4c8c8c8c8c94ccc0a0cdc3a400000426464a66605466e1d20003029001132323232333015010003001375c606600260660046eb4c0c4004c0a000400cc0bc004c09800c0045281812800998058038009bae302a001302100300100113253330233370e900118110010a99981199b8748000c08800c4c8c8cc02801c004dd698150009810801800800899299981199b8748008c08800854ccc08ccdc3a4004604400626464646464a66605066e1d200000213232533302a3370e9000181480089919198088070009bad30310013028001003302f001302600300114a0604a0026601600e0026eb8c0a8004c08400c0040045281811801181180099bb00020032232533301e00114a22a6603e9212374786e5f756e6c6f636b5f61667465725f646561646c696e652829203f2046616c73650014a064646464a66604266e1d2002001132323233710010002a66604666e1d2002302537546603e604200a90010800899b8000148008dd69814000980f8010a99981099b87480100045288a50301f0013301b301d00148000cc88c94ccc084cdc3a400000220062a66604266e1d200200110031002301f3253330213370e90000008a6103d8798000153330213370e90020008a6103d87b80001533302153330213370e900118119baa3301d301f003480084cdc3a400460466ea8cc074c07c009200213330213370e900118119baa3301d301f002480092825114c0103d87a8000153330213370e900118119baa3301d301f00348008530103d87b800014c103d8798000301f33223253330233370e9000000899299981219b8748000004530103d87a800014c103d87980003022002153330233370e9002000899299981219b8748010004530103d87a800014c103d87b80003022002132323253330263370e90000008a60103d87b8000153330263370e90020008a6103d8798000132325333028337100080022980103d8798000153330283370e0080022980103d87a800014c103d87b8000375a605a002604800a60480086eb4c0a8004c08400cc084008cc070c07800920003301c301e00148000cc068c07000520003301a301c00148008cc064c06ccc064c06c00920004803888c8c94ccc078cdc3a4000002264646464a66604466e1d200400113232323374a90001981500125eb80c07c004c0a4004c080008530103d87a800030200013301c301e3301c301e0014800920043025001301c00214c0103d87a8000301c001323300500123371e6eb8cc068c070cc068c070cc068c07000520004800120000033758660306034660306034004900024000444646464a66603ea66603ea66603e006294454cc0812411f74786e5f7369676e65645f62795f63726561746f722829203f2046616c73650014a02a66603e004294454cc08124012074786e5f6d7573745f6e6f745f647261696e5f6164612829203f2046616c73650014a0294054ccc07c0045288a998102492174786e5f6d7573745f72656372656174655f63686573742829203f2046616c73650014a02940c8c94ccc080cdc3a4000002264646464a66604866e1d20040011323253330263370e90001812800899191919299981718188010a999815299981519b8f00100f14a22a660569211e6e65775f63726561746f72203d3d2063726561746f72203f2046616c73650014a02a66605466e2004000c5288a99815a491f6e65775f646561646c696e65203e20646561646c696e65203f2046616c73650014a0294054cc0ad241334c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e2065787065637465640016375c605e002605e0046eb4c0b4004c09000454cc09d2412a4578706563746564206f6e20696e636f727265637420636f6e7374727563746f722076617269616e742e0016302b0013022002153330244a0294454cc0952401186e6f745f696e6c696e655f646174756d203f2046616c73650014a060440026603c604000290021813800980f0010a99981025014a22a660429212a6f75747075745f776974685f696e6c696e655f646174756d5f6e6f745f666f756e64203f2046616c73650014a0603c002646600e00246464a66604466e1d20040011324a260400042940c080004cc070c0780052004375866034603866034603800a900024008646464a66604066e240040085288a99810a491f696e7075745f616461203e3d206f75747075745f616461203f2046616c73650014a06464601600266024002464601e0026eaccc074c07c0052002375866036603a0049002191918050009980880091918070009bab3301c301e3301c301e001480092002375866034603800290001980c980d8022400064660220020046eb0cc060c068cc060c06800d200048040c0040048894ccc078008530103d87a800013232533301c300300213374a90001981080125eb804ccc01401400400cc08800cc0800088ccc0080052000223370000200460020024444a666038006200426464666600c00c0026600600400800660400086eb4c07800c8c8c8c94ccc05ccdc3a4004002290000991bad301e001301500230150013253330163370e90010008a60103d87a80001323233006001489003756603a0026028004602800266008002911003001001222533301800214c103d87a800013232323253330183371e00a002266e9520003301d375000497ae01333007007003005375c60320066eb4c064008c07000cc068008c0040048894ccc058008530103d87a800013232323253330163371e00a002266e9520003301b374c00497ae01333007007003005375c602e0066eacc05c008c06800cc060008c0040048894ccc05000852f5c0264646602e6ea0c00c008ccc01401400400cc06000cc058008c0040048894ccc04800852809919299980819b8f00200314a2266600a00a002006602c0066eb8c05000800400800c526163200530050043200332533300a3370e90000008a99980718040018a4c2a6601692011d4578706563746564206e6f206669656c647320666f7220436f6e73747200161533300a3370e90010008a99980718040018a4c2a6601692011d4578706563746564206e6f206669656c647320666f7220436f6e7374720016153300b4912b436f6e73747220696e64657820646964206e6f74206d6174636820616e7920747970652076617269616e740016300800223253330073370e9000000899191919299980798090010a4c2a66018921334c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e2065787065637465640016375c602000260200046eb4c038004c01400854ccc01ccdc3a400400226464a66601a60200042930a99805249334c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e2065787065637465640016375c601c002600a0042a660109212b436f6e73747220696e64657820646964206e6f74206d6174636820616e7920747970652076617269616e740016300500133001001480008888cccc01ccdc38008018069199980280299b8000448008c03c0040080088c018dd5000918021baa0015734ae7155ceaab9e5573eae815d0aba21",
  };

  const createChest = async () => {
    try {
      console.log("CreateChest():");
      if (lucid) {
        const userAddress = await lucid.wallet.address();
        console.log({ userAddress: userAddress });

        const morbidAddress = lucid.utils.validatorToAddress(morbidScript);
        console.log({ scriptAddress: morbidAddress });

        const deadline = new Date().getTime();
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
                if (deadlineValue < new Date().getTime()) {
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

        const deadline = new Date().getTime();
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
                if (deadlineValue < new Date().getTime()) {
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
          .validFrom(new Date().getTime())
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
