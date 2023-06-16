import { Constr, Data, Lucid, SpendingValidator } from "lucid-cardano";
import { useEffect, useState } from "react";
import { getDatumFields } from "../utils/blockfrost";

const VestingScript = (props: {
  lucid: Lucid;
  setActionResult: (actionResult: string) => void;
}) => {
  const lucid = props.lucid;
  const setActionResult = props.setActionResult;

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const vestingScript: SpendingValidator = {
    type: "PlutusV2",
    script:
      "5903ab5903a801000032323232323232323232322223232533300a33332323222232323232323232323232533301a3370e9001000899299980d8038a511004301800214a0603000266028602c0129001299980b80108008a5032323232533301a3370e9001000899191919b8900b001533301c3370e9001180f1baa33018301a0054800840044cdc0000a40046eb4c080004c06000854ccc068cdc3a40080022944528180c0009980a180b000a4000664464a66603466e1d200000110031533301a3370e900100088018801180c19299980d19b87480000045300103d87980001533301a3370e90020008a6103d87b80001533301a533301a3370e9001180e1baa330163018003480084cdc3a400460386ea8cc058c0600092002133301a3370e9001180e1baa330163018002480092825114c0103d87a80001533301a3370e9001180e1baa33016301800348008530103d87b800014c103d87980003018332232533301c3370e9000000899299980e99b8748000004530103d87a800014c103d8798000301b0021533301c3370e9002000899299980e99b8748010004530103d87a800014c103d87b8000301b0021323232533301f3370e90000008a60103d87b80001533301f3370e90020008a6103d8798000132325333021337100080022980103d8798000153330213370e0080022980103d87a800014c103d87b8000375a604a002603a00a603a0086eb4c088004c06800cc068008cc054c05c009200033015301700148000cc04cc054005200033013301500148008cc048c05000d200e33009002004330080010043300f301100448000dd6998071808002a40006eb8cc034c03c0112004375c66018601c00690011119198020008011bac3300a300c00248040c0040048894ccc04400852809919299980799b8f00200314a2266600a00a00200660280066eb8c04800800400800c526163200532533300a3370e90000008991919191919299980a180b0010a4c2a66022921334c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e2065787065637465640016375c602800260280046eb8c048004c048008dd6980800098040028a99805a4812b436f6e73747220696e64657820646964206e6f74206d6174636820616e7920747970652076617269616e740016300800453330083370e900018051baa002149858cc0040052000222233330073370e0020060184666600a00a66e000112002300e001002002230063754002460086ea80055cd2b9c5573aaae7955cfaba15745",
  };

  const lockVesting = async () => {
    try {
      console.log("LockVesting():");
      if (lucid) {
        const userAddress = await lucid.wallet.address();
        console.log({ userAddress: userAddress });

        const vestingAddress = lucid.utils.validatorToAddress(vestingScript);
        console.log({ scriptAddress: vestingAddress });

        const lockUntil = new Date().getTime();
        const owner =
          lucid.utils.getAddressDetails(userAddress).paymentCredential?.hash;
        const beneficiary = owner;
        const datum = Data.to(
          new Constr(0, [BigInt(lockUntil), String(owner), String(beneficiary)])
        );
        console.log({ datum: datum });

        const tx = await lucid
          .newTx()
          .payToContract(
            vestingAddress,
            { asHash: datum, scriptRef: vestingScript },
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

  const redeemVesting = async () => {
    try {
      console.log("RedeemVesting():");
      if (lucid) {
        const userAddress = await lucid.wallet.address();
        console.log({ userAddress: userAddress });
        const pkh =
          lucid.utils.getAddressDetails(userAddress).paymentCredential?.hash;
        console.log({ pkh: pkh });

        const vestingAddress = lucid.utils.validatorToAddress(vestingScript);
        console.log({ scriptAddress: vestingAddress });

        const beneficiary =
          lucid.utils.getAddressDetails(userAddress).paymentCredential?.hash;

        const utxos = (await lucid.utxosAt(vestingAddress))?.filter(
          async (utxo) => {
            if (!utxo.datumHash) return false;

            const datumFields = await getDatumFields(utxo.datumHash);

            const lockUntil = datumFields[0];
            // console.log({ lockUntil: lockUntil });
            const lockUntilValue = lockUntil["int"];
            // console.log({ lockUntilValue: lockUntilValue });

            const owner = datumFields[1];
            // console.log({ owner: owner });
            const ownerValue = owner["bytes"];
            // console.log({ ownerValue: ownerValue });

            const beneficiary = datumFields[2];
            // console.log({ beneficiary: beneficiary });
            const beneficiaryValue = beneficiary["bytes"];
            // console.log({ beneficiaryValue: beneficiaryValue });

            const is_owner = () => ownerValue === pkh;
            const is_beneficiary_after_deadline = () =>
              beneficiaryValue === beneficiary &&
              new Date().getTime() >= lockUntilValue;
            return is_owner() || is_beneficiary_after_deadline();
          }
        );
        console.log({ utxos: utxos });
        if (!utxos?.length) {
          throw { nothingToUnlock: "No valid UTxO to redeem." };
        }

        const empty = Data.to(new Constr(0, [])); // redeemer
        console.log({ redeemer: empty }); // Void

        const tx = await lucid
          .newTx()
          .collectFrom(utxos, empty)
          .addSigner(userAddress)
          .readFrom([utxos[0]]) // reference script
          .validFrom(new Date().getTime())
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

  return !loaded ? (
    <></>
  ) : (
    <div>
      {/* Vest button */}
      <button className="btn btn-primary m-5" onClick={lockVesting}>
        Lock to VestingScript
      </button>

      {/* Redeem button */}
      <button className="btn btn-secondary m-5" onClick={redeemVesting}>
        Unlock from VestingScript
      </button>
    </div>
  );
};

export default VestingScript;
