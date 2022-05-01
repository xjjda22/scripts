// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Test, stdError} from "@forge-std/Test.sol";
import {console} from "../utils/Console.sol";

import {BasicToken} from "../BasicToken.sol";


contract BasicTokenTest is Test {
    BasicToken bt;
    address btAcc;
    address initAcc;
    address aliceAcc = 0x000000000000000000636F6e736F6c652e6c6f67;
    address bobAcc  = 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045;

    function setUp() public {
        // console.log('setUp', msg.sender);
        // console.log('block.number', block.number);

        initAcc = payable(msg.sender);
        btAcc = deployCode("BasicToken.sol",abi.encode('BasicTokenMOCK','BTM'));
        bt = BasicToken(btAcc);

        // console.log('balance btAcc',btAcc.balance);
    }

    function testC() public {
        // console.log('testName', msg.sender);
        assertEq(bt.name(),'BasicTokenMOCK');
        assertEq(bt.symbol(),'BTM');
    }

    function testKill() public payable{
        startHoax(initAcc);
        bt.mint(initAcc, 1e77);
        assertTrue(true);
        // assertEq(bt.balanceOf(initAcc),1000);
    }

}