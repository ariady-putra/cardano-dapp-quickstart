import {
  Constr,
  Data,
  Json,
  Lucid,
  MintingPolicy,
  SpendingValidator,
  UTxO,
  applyDoubleCborEncoding,
  applyParamsToScript,
  fromText,
} from "lucid-cardano";
import { useEffect, useState } from "react";
import {
  getAssetMetadata,
  getLatestBlockInfo,
  getTxMetadata,
} from "../utils/blockfrost";

const GiftCard = (props: {
  lucid: Lucid;
  setActionResult: (actionResult: string) => void;
}) => {
  const lucid = props.lucid;
  const setActionResult = props.setActionResult;

  const [reclaimAddress, setReclaimAddress] = useState("");

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const compiledCode = {
    mintBurn:
      "59035001000032323232323232323232323222322232533300b3232533300d3370e900000089919191919191919191919299980c19b87480000244ccccc8c88888c94ccc08c00452809929998120008991919191919809800919980b00080200499809000919980a00080224004660229448c8cc0300048cdd7998111812000a40000146eb0cc080c088cc080c088029200048000dd718120011bad3024001302600214a0604c0026600e0080066002002444a66603e00429404c8c94ccc074c00c0085288999802802800801981180198108010078050098088a99980c19b87480080244c94ccc074004528099299980f00089919191919806000919980780080180c19805a51233300d00100348004dd7180f0011bad301e001302000214a060400026600201e014294088c8c8c8c94ccc074cdc3a4004002297adef6c6013237566048002603600460360026600a0020066600c0029110037566602a602e6602a602e0049000240106002002444a666038004298103d87a8000132323232533301c3371e00a002266e95200033021374c00497ae01333007007003005375c603a0066eacc074008c08000cc078008c0040048894ccc06800852f5bded8c0264646464a66603466e3c014004400c4cc07ccdd81ba9001374c00466600e00e00600a6eb8c06c00cdd5980d801180f001980e00111299980a00109800a4c2940888cdc380100091119b8f002001300e005375c602800260160042940c02c004cc01cc0240092002149858c800cc94ccc02ccdc3a40000022a66601e60120062930a9980624811d4578706563746564206e6f206669656c647320666f7220436f6e73747200161533300b3370e90010008a99980798048018a4c2a6601892011d4578706563746564206e6f206669656c647320666f7220436f6e73747200161533300b3370e90020008a99980798048018a4c2a6601892011d4578706563746564206e6f206669656c647320666f7220436f6e7374720016153300c4912b436f6e73747220696e64657820646964206e6f74206d6174636820616e7920747970652076617269616e7400163009002375c0026600200290001111199980399b8700100300d233330050053370000890011807800801001118031baa001230043754002ae695ce2ab9d5573caae7d5d02ba15745",
    redeem:
      "5905160100003232323232323232323232322322322322223232533301032323232323232323253330193370e9001180c0010a99980c801800899999191919191111929998130008a5013253330270011323232323300a00123371e006010660129448cdc3801a40026eb8c09c008dd6981380098148010a5030290013232323253330253370e90010008a5eb7bdb1804c8dd59816000981180118118009980380080219804000a4410037566603a603e6603a603e00690002401044a66603e00426002930a503001001222533302200214c0103d87a800013232323253330223371e00a002266e95200033027374c00497ae01333007007003005375c60460066eacc08c008c09800cc090008c0040048894ccc08000852f5bded8c0264646464a66604066e3c014004400c4cc094cdd81ba9001374c00466600e00e00600a6eb8c08400cdd5981080118120019811001006009808800899299980c99b8748010c06000854ccc06400c4c8ccc8c0040048894ccc08400852809919299980f99b8f00200314a2266600a00a002006604a0066eb8c08c008004040dd61980a980b9980a980b8062400090080008008a5030190023370e9001180c1baa30190013376000e66602a002980103d87a80004c0103d87980003371000a002a66602666e1d2002301537546601e602200690010800899b8000148008dd6980c000980799299980919b8748008c044004400454cc04d24012a4578706563746564206f6e20696e636f727265637420636f6e7374727563746f722076617269616e742e00163300d300f00148000c8cc88c94ccc050cdc3a400000220062a66602866e1d20020011003100230123253330143370e90000008a60103d8798000153330143370e90020008a6103d87b80001533301453330143370e9001180b1baa330103012003480084cdc3a4004602c6ea8cc040c048009200213330143370e9001180b1baa330103012002480092825114c0103d87a8000153330143370e9001180b1baa33010301200348008530103d87b800014c103d8798000301233223253330163370e9000000899299980b99b8748000004530103d87a800014c103d87980003015002153330163370e9002000899299980b99b8748010004530103d87a800014c103d87b80003015002132323253330193370e90000008a60103d87b8000153330193370e90020008a6103d879800013232533301b337100080022980103d87980001533301b3370e0080022980103d87a800014c103d87b8000375a6040002602e00a602e0086eb4c074004c05000cc050008cc03cc04400920003300f301100148000cc034c03c00520003300d300f00148008cc030c038cc030c03800d20004803852616375a0086400664a66601e66e1d200000115333013300d003149854cc04124011d4578706563746564206e6f206669656c647320666f7220436f6e73747200161533300f3370e90010008a99980998068018a4c2a6602092011d4578706563746564206e6f206669656c647320666f7220436f6e73747200161533300f3370e90020008a99980998068018a4c2a6602092011d4578706563746564206e6f206669656c647320666f7220436f6e737472001615330104912b436f6e73747220696e64657820646964206e6f74206d6174636820616e7920747970652076617269616e740016300d002375c0026eb8004dd700099800800a40004444666600e66e1c00400c0348cccc014014cdc000224004601e0020040044600c6ea80048c010dd5000ab9a5738aae7555cf2ab9f5740ae855d11",
  };

  const redeemerAction = {
    mint: Data.to(new Constr(0, [])),
    burn: Data.to(new Constr(1, [])),
    reclaim: Data.to(new Constr(2, [])),
  };

  const giftCard = {
    name: "Gift Card 42t₳",
    image: "ipfs://QmXsupSzGzUxBmv54zSNrytZvfuP7LD1ntMybmofhBchh5",
  };

  const mintGiftCard = async () => {
    try {
      console.log("MintGiftCard():");
      if (lucid) {
        const userAddress = await lucid.wallet.address();
        console.log({ userAddress: userAddress });

        const utxos = await lucid.wallet.getUtxos();
        console.log({ utxos: utxos });
        if (!utxos.length) {
          throw { emptyWalletAddress: "No UTxO to consume." };
        }

        const tokenName = fromText(giftCard.name);

        // validator params of `mint_burn`
        const mintBurnParams = {
          utxoRef: new Constr(0, [
            new Constr(0, [String(utxos[0].txHash)]), // TxHash
            BigInt(utxos[0].outputIndex), // TxIndex
          ]), // OutputReference
          tokenName: tokenName, // AssetName
        };
        const mintBurn = applyParamsToScript(compiledCode.mintBurn, [
          mintBurnParams.utxoRef,
          mintBurnParams.tokenName,
        ]);
        const mintBurnScript: MintingPolicy = {
          type: "PlutusV2",
          script: applyDoubleCborEncoding(mintBurn), // cborHex
        };
        const mintBurnScriptHash = lucid.utils.validatorToScriptHash({
          type: "PlutusV2",
          script: mintBurn,
        }); // used as `policy_id`

        const assetName = `${mintBurnScriptHash}${tokenName}`;

        // validator params of `redeem`
        const redeemParams = {
          policyId: mintBurnScriptHash, // PolicyId
          tokenName: tokenName, // AssetName
          reclaimableBy:
            lucid.utils.getAddressDetails(userAddress).paymentCredential?.hash, // PubKeyHash
        };
        if (!redeemParams.reclaimableBy) {
          throw { unreclaimablePKH: "Unreclaimable after expired." };
        }
        const redeem = applyParamsToScript(compiledCode.redeem, [
          redeemParams.policyId,
          redeemParams.tokenName,
          redeemParams.reclaimableBy,
        ]);
        const redeemScript: SpendingValidator = {
          type: "PlutusV2",
          script: applyDoubleCborEncoding(redeem), // cborHex
        };
        const redeemScriptAddress = lucid.utils.validatorToAddress({
          type: "PlutusV2",
          script: redeem,
        });

        const block = await getLatestBlockInfo();
        const time = block["time"] * 1_000; // ms
        console.log({ time: time });

        const validThru = BigInt(time + 600_000); // +10mins
        console.log({ validThru: validThru });
        const datum = Data.to(validThru);

        const tx = await lucid
          .newTx()
          .collectFrom([utxos[0]])
          .attachMintingPolicy(mintBurnScript)
          .mintAssets({ [assetName]: BigInt(1) }, redeemerAction.mint)
          .payToContract(
            redeemScriptAddress,
            { asHash: datum, scriptRef: redeemScript },
            { lovelace: BigInt(42_000000) }
          )
          .attachMetadata(721, {
            [mintBurnScriptHash]: {
              [tokenName]: {
                name: giftCard.name,
                image: giftCard.image,
                redeem_from: redeemScriptAddress,
                ref_hash: utxos[0].txHash,
                ref_index: utxos[0].outputIndex,
                description: "WHY IS THIS NOT ATTACHED ONCHAIN?!",
              },
            },
          })
          .complete();

        const signedTx = await tx.sign().complete();
        const txHash = await signedTx.submit();
        console.log({ txHash: txHash });

        setActionResult(`TxHash: ${txHash}`);
        setReclaimAddress(redeemScriptAddress);
        return txHash;
      }
      throw { error: "Invalid Lucid State!" };
    } catch (x) {
      setActionResult(JSON.stringify(x));
    }
  };

  const redeemGiftCard = async () => {
    try {
      console.log("RedeemGiftCard():");
      if (lucid) {
        const utxos = await lucid.wallet.getUtxos();
        console.log({ utxos: utxos });
        if (!utxos.length) {
          throw { emptyWalletAddress: "No UTxO to consume." };
        }

        let txRaw = lucid.newTx();
        const giftCardUTxOs: UTxO[] = [];

        const forEachAsync = async (
          utxos: UTxO[],
          callback: { (utxo: UTxO): Promise<void>; (arg0: any): any }
        ) => {
          for (const utxo of utxos) {
            await callback(utxo);
          }
        };

        let foundGiftCard = false;
        const myAsyncCallback = async (utxo: UTxO) => {
          if (foundGiftCard) return; // just process 1 gift card for now
          let hasGiftCard = false;
          for (const asset in utxo.assets) {
            try {
              if (asset === "lovelace") continue;
              // console.log({ asset: asset, qty: utxo.assets[asset] });
              const assetMetadata = await getAssetMetadata(asset);
              console.log({ assetMetadata: assetMetadata });
              const tokenName = assetMetadata["asset_name"];

              const onchainMetadata =
                assetMetadata["onchain_metadata"] ||
                (await getTxMetadata(assetMetadata["initial_mint_tx_hash"]))[
                  "json_metadata"
                ][assetMetadata["policy_id"]][fromText(giftCard.name)]; //"Gift Card"];
              console.log({ onchainMetadata: onchainMetadata });
              const redeemFrom = onchainMetadata["redeem_from"];
              const refHash = onchainMetadata["ref_hash"];
              const refIndex = onchainMetadata["ref_index"];

              // validator params of `mint_burn`
              const mintBurnParams = {
                utxoRef: new Constr(0, [
                  new Constr(0, [String(refHash)]), // TxHash
                  BigInt(refIndex), // TxIndex
                ]), // OutputReference
                tokenName: tokenName, // AssetName
              };
              const mintBurn = applyParamsToScript(compiledCode.mintBurn, [
                mintBurnParams.utxoRef,
                mintBurnParams.tokenName,
              ]);
              const mintBurnScript: MintingPolicy = {
                type: "PlutusV2",
                script: applyDoubleCborEncoding(mintBurn), // cborHex
              };

              const scriptRef = (await lucid.utxosAt(redeemFrom))[0];
              giftCardUTxOs.push(scriptRef);

              txRaw = txRaw
                .mintAssets({ [asset]: BigInt(-1) }, redeemerAction.burn)
                .attachMintingPolicy(mintBurnScript)
                .readFrom([scriptRef]);
              hasGiftCard = true;
              break; // just process the first gift card found for now
            } catch (x) {
              setActionResult(JSON.stringify(x));
            }
          }
          if (hasGiftCard) {
            giftCardUTxOs.push(utxo);
            foundGiftCard = true;
          }
        };

        await forEachAsync(utxos, myAsyncCallback);

        if (!foundGiftCard) {
          throw { noGiftCard: "No Gift Card was found." };
        }

        const block = await getLatestBlockInfo();
        const time = block["time"] * 1_000; // ms
        console.log({ time: time });

        const tx = await txRaw
          .collectFrom(giftCardUTxOs, redeemerAction.burn)
          .validFrom(time)
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

  const reclaimGiftCard = async () => {
    try {
      console.log(`ReclaimGiftCard(${reclaimAddress}):`);
      if (lucid && reclaimAddress.length) {
        const block = await getLatestBlockInfo();
        const time = block["time"] * 1_000; // ms
        console.log({ time: time });

        const userAddress = await lucid.wallet.address();
        console.log({ userAddress: userAddress });

        const utxos = await lucid.utxosAt(reclaimAddress);
        console.log({ utxos: utxos });
        if (!utxos?.length) {
          throw { emptyScriptAddress: "No UTxO to redeem." };
        }

        const tx = await lucid
          .newTx()
          .collectFrom(utxos, redeemerAction.reclaim)
          .readFrom(utxos) // reference script
          .validFrom(time)
          .addSigner(userAddress)
          .complete();

        const signedTx = await tx.sign().complete();
        const txHash = await signedTx.submit();
        console.log({ txHash: txHash });

        setActionResult(`TxHash: ${txHash}`);
        setReclaimAddress("");
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
      {/* Mint button */}
      <button className="btn btn-primary m-5" onClick={mintGiftCard}>
        Mint GiftCard
      </button>

      {/* Redeem button */}
      <button className="btn btn-secondary m-5" onClick={redeemGiftCard}>
        Redeem GiftCard
      </button>

      {/* Reclaim button */}
      {reclaimAddress.length ? (
        <button className="btn btn-secondary m-5" onClick={reclaimGiftCard}>
          Reclaim GiftCard
        </button>
      ) : (
        <></>
      )}
    </div>
  );
};

export default GiftCard;
