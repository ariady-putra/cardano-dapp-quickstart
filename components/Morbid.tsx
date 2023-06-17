import { Constr, Data, Lucid, SpendingValidator, UTxO } from "lucid-cardano";
import { useEffect, useState } from "react";
import { getDatumFields } from "../utils/blockfrost";
import { hashDatum } from "../utils/cardano";

const Morbid = (props: {
  lucid: Lucid;
  setActionResult: (actionResult: string) => void;
}) => {
  const lucid = props.lucid;
  const setActionResult = props.setActionResult;

  const [chest, setChest] = useState("");

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const morbidScript: SpendingValidator = {
    type: "PlutusV2",
    script:
      "59064e59064b010000323232323232323232323232322223232533300b33332323232322223232323253330173370e9000180b0010a99980b99b8748000c05800c4c8c8c8cc03c020004dd7180f800980f800980a801800800899299980b99b8748000c05800854ccc05ccdc3a4004602c00626464646464a66603866e1d200000213232533301e3370e9000180e80089919191980b0078009bae30260013026001301c0010033023001301a00300114a060320026601600e0026eb8c078004c05400c0040044c94ccc05ccdc3a4004602c0042a66602e66e1d2000301600313232323300b00100233015301733015301700748001200e375a603c002602a006002002264a66602e66e1d20023016002153330173370e9001180b00189919191919299980e19b87480000084c8c94ccc078cdc3a4000603a00226464646602400200466038603c66038603c01c90002401c6eb4c094004c07000400cc08c004c06800c004528180c800998058038009bae301e001301500300100114a0602e004602e00266ec000800c88c8c8c94ccc050cdc3a4004002264646466e2001c0054ccc058cdc3a400460306ea8cc048c0500152002100113370000290011bad301b0013012002153330143370e90020008a5114a060240026601c60200029000199119299980a19b8748000004400c54ccc050cdc3a400400220062004602464a66602866e1d200000114c0103d8798000153330143370e90020008a6103d87b80001533301453330143370e9001180b1baa330103012003480084cdc3a4004602c6ea8cc040c048009200213330143370e9001180b1baa330103012002480092825114c0103d87a8000153330143370e9001180b1baa33010301200348008530103d87b800014c103d8798000301233223253330163370e9000000899299980b99b8748000004530103d87a800014c103d87980003015002153330163370e9002000899299980b99b8748010004530103d87a800014c103d87b80003015002132323253330193370e90000008a60103d87b8000153330193370e90020008a6103d879800013232533301b337100080022980103d87980001533301b3370e0080022980103d87a800014c103d87b8000375a6040002602e00a602e0086eb4c074004c05000cc050008cc03cc04400920003300f301100148000cc034c03c00920003300d300f0024800888c8c94ccc048cdc3a4000002264646464a66602c66e1d200400113232323374a90001980f00125eb80c04c004c074004c050008530103d87a800030140013301030123301030120014800920043019001301000214c0103d87a80003010001323300400123371e6eb8cc038c040cc038c040cc038c0400052000480012000003375866018601c66018601c0049000240006002002444a6660260042980103d87a8000132325333011300300213374a90001980b00125eb804ccc01401400400cc05c00cc05400888c94ccc048004528099299980980089919b8f001004375c602a0042940c054004dd61980498059980498058012400090080008010018a4c2c6400a600a0086400664a66601466e1d20000011533300e3008003149854cc02d2411d4578706563746564206e6f206669656c647320666f7220436f6e73747200161533300a3370e90010008a99980718040018a4c2a6601692011d4578706563746564206e6f206669656c647320666f7220436f6e7374720016153300b4912b436f6e73747220696e64657820646964206e6f74206d6174636820616e7920747970652076617269616e740016300800223253330073370e9000000899191919299980798090010a4c2a66018921334c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e2065787065637465640016375c602000260200046eb4c038004c01400854ccc01ccdc3a400400226464a66601a60200042930a99805249334c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e2065787065637465640016375c601c002600a0042a660109212b436f6e73747220696e64657820646964206e6f74206d6174636820616e7920747970652076617269616e740016300500133001001480008888cccc01ccdc38008018069199980280299b8000448008c03c0040080088c018dd5000918021baa0015734ae7155ceaab9e5573eae815d0aba21",
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
        const datum = Data.to(
          new Constr(0, [BigInt(deadline), String(creator)])
        );
        console.log({ datum: datum });

        const tx = await lucid
          .newTx()
          .payToContract(
            morbidAddress,
            { inline: datum, scriptRef: morbidScript },
            { lovelace: BigInt(42_000000) }
          )
          .complete();

        const signedTx = await tx.sign().complete();
        const txHash = await signedTx.submit();
        console.log({ txHash: txHash });

        setActionResult(`TxHash: ${txHash}`);
        setChest(txHash);
        return txHash;
      }
      throw { error: "Invalid Lucid State!" };
    } catch (x) {
      setActionResult(JSON.stringify(x));
    }
  };

  const unlockChest = async () => {
    try {
      console.log(`UnlockChest(${chest}):`);
      if (lucid && chest.length) {
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
              if (utxo.txHash === chest) {
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
              if (refTxnValue === chest) {
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
        setChest("");
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

      {chest.length ? (
        <>
          {/* UnlockChest */}
          <button className="btn btn-secondary m-5" onClick={unlockChest}>
            Unlock Chest
          </button>

          {/* ChestInfo */}
          <div>{`Chest: ${chest}`}</div>
        </>
      ) : (
        <div>
          I'm sorry, my memory is bad. I don't remember having any chest
          currently...
        </div>
      )}
    </div>
  );
};

export default Morbid;
