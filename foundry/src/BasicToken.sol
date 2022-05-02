// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract BasicToken {

    mapping(address => uint256) private _balances;

    uint256 private _totalSupply;
    string private _name;
    string private _symbol;


    event Transfer(address indexed from, address indexed to, uint256 value);

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    function name() public view virtual returns (string memory) {
        return _name;
    }
    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }
    function totalSupply() public view virtual returns (uint256) {
        return _totalSupply;
    }
    function balanceOf(address account) public view virtual returns (uint256) {
        return _balances[account];
    }

    function mint(address account, uint256 amount) public virtual {
        require(account != address(0), "ERC20: mint to the zero address");

        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);
    }

    // function kill(address payable target) external {
    //     selfdestruct(target);
    // }
}

