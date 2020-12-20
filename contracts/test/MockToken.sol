pragma solidity ^0.6.6;
import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";
import "@chainlink/contracts/src/v0.6/VRFRequestIDBase.sol";
import "@chainlink/contracts/src/v0.6/vendor/SafeMathChainlink.sol";

contract MockToken is VRFRequestIDBase {
  
  using SafeMathChainlink for uint256;

  mapping (address => uint256) public balances;

  mapping(bytes32 /* provingKey */ => mapping(address /* consumer */ => uint256))
  private nonces;

  // used to set the "random" result for testing
  // 0 = heads = false
  // 1 = tails = true
  // >= 2 auto
  uint testResult = 2;

  event RandomValue(bytes32 requestId, uint256 value);
  event CallbackFailure(bytes32 requestId);

  function setRandomResult(uint256 result) public {
    testResult = result;
  }

  function mint(address _address, uint256 amount) public {
    balances[_address] += amount;
  }

  function balanceOf(address owner) external view returns (uint256 balance) {
    return balances[owner];
  }

  function transferAndCall(address to, uint256 value, bytes calldata data) external returns (bool success) {
    balances[msg.sender] -= value;
    balances[to] += value;
    _onTokenTransfer(msg.sender, data);
    return true;
  }

  /*
   * modified functions from Chainlink VRFCoordinator to emulate
   * fulfilling the random call
  */

  /**
   * @notice Called by LINK.transferAndCall, on successful LINK transfer
   *
   * @dev To invoke this, use the requestRandomness method in VRFConsumerBase.
   *
   * @dev The VRFCoordinator will call back to the calling contract when the
   * @dev oracle responds, on the method fulfillRandomness. See
   * @dev VRFConsumerBase.fulfilRandomness for its signature. Your consuming
   * @dev contract should inherit from VRFConsumerBase, and implement
   * @dev fulfilRandomness.
   *
   * @param _sender address: who sent the LINK (must be a contract)
   * @param _data abi-encoded call to randomnessRequest
   */
  function _onTokenTransfer(address _sender, bytes memory _data) internal
  {
    (bytes32 keyHash, uint256 seed) = abi.decode(_data, (bytes32, uint256));
    randomnessRequest(keyHash, seed, _sender);
  }

  /**
   * @notice creates the chainlink request for randomness
   *
   * @param _keyHash ID of the VRF public key against which to generate output
   * @param _consumerSeed Input to the VRF, from which randomness is generated
   * @param _sender Requesting contract; to be called back with VRF output
   *
   * @dev _consumerSeed is mixed with key hash, sender address and nonce to
   * @dev obtain preSeed, which is passed to VRF oracle, which mixes it with the
   * @dev hash of the block containing this request, to compute the final seed.
   *
   * @dev The requestId used to store the request data is constructed from the
   * @dev preSeed and keyHash.
   */
  function randomnessRequest(
    bytes32 _keyHash,
    uint256 _consumerSeed,
    address _sender
  )
    internal
  {
    uint256 nonce = nonces[_keyHash][_sender];
    uint256 preSeed = makeVRFInputSeed(_keyHash, _consumerSeed, _sender, nonce);
    bytes32 requestId = makeRequestId(_keyHash, preSeed);
    
    // Cryptographically guaranteed by preSeed including an increasing nonce
    // assert(callbacks[requestId].callbackContract == address(0));
    // callbacks[requestId].callbackContract = _sender;
    // assert(_feePaid < 1e27); // Total LINK fits in uint96
    // callbacks[requestId].randomnessFee = uint96(_feePaid);
    // callbacks[requestId].seedAndBlockNum = keccak256(abi.encodePacked(
    //   preSeed, block.number));
    // emit RandomnessRequest(_keyHash, preSeed, serviceAgreements[_keyHash].jobID,
    //   _sender, _feePaid, requestId);

    nonces[_keyHash][_sender] = nonces[_keyHash][_sender].add(1);
    uint256 randomness = getRandom(requestId);
    
    callBackWithRandomness(requestId, randomness, _sender);
  }

  function getRandom(bytes32 requestId) internal view returns (uint256) {
    if (testResult < 2) {
      // return the test value
      return testResult;
    }

    // generate a random-ish value
    return  uint256(keccak256(abi.encodePacked(requestId, block.timestamp)));
  }

  function callBackWithRandomness(bytes32 requestId, uint256 randomness,
    address consumerContract) internal {
    // Dummy variable; allows access to method selector in next line. See
    // https://github.com/ethereum/solidity/issues/3506#issuecomment-553727797
    VRFConsumerBase v;
    bytes memory resp = abi.encodeWithSelector(
      v.rawFulfillRandomness.selector, requestId, randomness);
    // The bound b here comes from https://eips.ethereum.org/EIPS/eip-150. The
    // actual gas available to the consuming contract will be b-floor(b/64).
    // This is chosen to leave the consuming contract ~200k gas, after the cost
    // of the call itself.
    uint256 b = 206000;
    require(gasleft() >= b, "not enough gas for consumer");
    // A low-level call is necessary, here, because we don't want the consuming
    // contract to be able to revert this execution, and thus deny the oracle
    // payment for a valid randomness response. This also necessitates the above
    // check on the gasleft, as otherwise there would be no indication if the
    // callback method ran out of gas.
    //
    // solhint-disable-next-line avoid-low-level-calls
    (bool success,) = consumerContract.call(resp);
    // Avoid unused-local-variable warning. (success is only present to prevent
    // a warning that the return value of consumerContract.call is unused.)
    if (success) {
      emit RandomValue(requestId, randomness);
    } else {
      emit CallbackFailure(requestId);
    }
  }
}
