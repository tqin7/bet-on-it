pragma solidity ^0.4.11;

contract Dao {

	address private creator;
	mapping(address => uint) deposits;
	mapping(string => address[]) tasksUpvoters;
	mapping(string => address[]) tasksDownvoters;
	uint totalFund;
	uint oneEther = 1 ether;
	uint numActive;

	event Vote(address _voter);

	modifier onlyBy(address _account) {
		require(msg.sender == _account);
		_;
	}

	modifier hasValue() {
		require(msg.value > 0);
		_;
	}

	modifier approved(address _account) {
		require(deposits[_account] > 0);
		_;
	}

	modifier enoughBalance(uint amount, address _account) {
		require(amount <= deposits[_account]);
		_;
	}

	function Dao() public payable {
		creator = msg.sender;
		totalFund = 0;
		numActive = 1;
		deposits[creator] = msg.value;
	}

	function approveAccount() external payable hasValue {
		numActive += 1;
		totalFund += msg.value;
		deposits[msg.sender] += msg.value;
	}

	function pushRequest() external returns (bool) {
		return deposits[msg.sender] > 0;
	}

	function pushTask(string id) external payable approved(msg.sender) {
		tasksUpvoters[id].push(msg.sender);
		totalFund += msg.value;
	}

	function vote() external approved(msg.sender) {
		Vote(msg.sender);
	}

	function upVote(string id) external payable hasValue {
		totalFund += msg.value;
		tasksUpvoters[id].push(msg.sender);
	}

	function downVote(string id) external payable hasValue {
		totalFund += msg.value;
		tasksDownvoters[id].push(msg.sender);
	}

	function withdraw(uint amount) external approved(msg.sender) enoughBalance(amount, msg.sender) returns (bool) {
		if (!msg.sender.send(amount)) {
			return false;
		}
		totalFund -= amount;
		deposits[msg.sender] -= amount;
		if (deposits[msg.sender] == 0) {
			numActive -= 1;
		}
	}

	function settle(string id, bool supportersWin) external onlyBy(creator) returns (bool) {
		uint numOfSupporters = tasksUpvoters[id].length;
		uint numOfEnemies = tasksDownvoters[id].length;

		if (supportersWin) {
			uint val1 = oneEther * (numOfSupporters + numOfEnemies) / numOfSupporters;
			for (uint32 i = 0; i < numOfSupporters; i++) {
				if (!tasksUpvoters[id][i].send(val1)) {
					return false;
				}
			}
		} else {
			uint val2 = oneEther * (numOfSupporters + numOfEnemies) / numOfEnemies;
			for (uint32 j = 0; j < numOfEnemies; j++) {
				if (!tasksDownvoters[id][i].send(val2)) {
					return false;
				}
			}
		}
		return true;
	}


	function balanceCheck() constant returns (uint) {
		return deposits[msg.sender];
	}

	function totalFundGetter() constant returns (uint) {
		return totalFund;
	}

	function() public payable {
		deposits[msg.sender] += msg.value;
		totalFund += msg.value;
	}

	function destroy() public onlyBy(creator) {
		require(numActive == 1);
		selfdestruct(creator);
	}
}