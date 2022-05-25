//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected

const chai = require("chai");
const path = require("path");
const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const wasm_tester = require("circom_tester").wasm;

const assert = chai.assert;
const buildPoseidon = require("circomlibjs").buildPoseidon;

function convertInputToNum(str){
  let upperCase = str.toUpperCase()
  let inputNums = []
  for (let i=0; i<upperCase.length; i++){
    inputNums.push(upperCase.charCodeAt(i) - 65)    
  }
  return inputNums
}

describe("Mastermind test", function ()  {

    this.timeout(100000);

    it("the guess was right", async() => {
        const circuit = await wasm_tester("../../contracts/circuits/MastermindVariation.circom");
        await circuit.loadConstraints();

        //The real Solution
        let solution = 'JAYZ'
        let solution_processed = convertInputToNum(solution)
        // console.log(solution_processed)
        const salt = ethers.BigNumber.from(ethers.utils.randomBytes(32));
        let poseidonJs = await buildPoseidon();
        const solutionHash = ethers.BigNumber.from(
        poseidonJs.F.toObject(poseidonJs([salt, ...solution_processed]))
        );

        //The maybe exact Guess
        const guess = 'jayz'
        const guessProcessed = convertInputToNum(guess)

        let witness;
        witness = await circuit.calculateWitness({ 
          "pubGuessA":solution_processed[0], 
          "pubGuessB":solution_processed[1],
          "pubGuessC":solution_processed[2],
          "pubGuessD":solution_processed[3],
          "pubCorrectLetters":4,
          "pubWrongLetters":0,
          "pubSolnHash":solutionHash,
          privSolnA:guessProcessed[0],
          privSolnB:guessProcessed[1],
          privSolnC:guessProcessed[2],
          privSolnD:guessProcessed[3],
          privSalt:salt}, true);
        // console.log(witness)
        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
    });

    it("the guess was wrong", async() => {
        const circuit = await wasm_tester("../../contracts/circuits/MastermindVariation.circom");
        await circuit.loadConstraints();

        //The real Solution
        let solution = 'JAYZ'
        let solution_processed = convertInputToNum(solution)
        // console.log(solution_processed)
        const salt = ethers.BigNumber.from(ethers.utils.randomBytes(32));
        let poseidonJs = await buildPoseidon();
        const solutionHash = ethers.BigNumber.from(
        poseidonJs.F.toObject(poseidonJs([salt, ...solution_processed]))
        );

        //The maybe !exact Guess
        const guess = 'jayy'
        const guessProcessed = convertInputToNum(guess)

        let witness;
        witness = await circuit.calculateWitness({ 
          "pubGuessA":solution_processed[0], 
          "pubGuessB":solution_processed[1],
          "pubGuessC":solution_processed[2],
          "pubGuessD":solution_processed[3],
          "pubCorrectLetters":3,
          "pubWrongLetters":1,
          "pubSolnHash":solutionHash,
          privSolnA:guessProcessed[0],
          privSolnB:guessProcessed[1],
          privSolnC:guessProcessed[2],
          privSolnD:guessProcessed[3],
          privSalt:salt}, true);
        // console.log(witness)
        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]), Fr.e(0)));
    });
     
});