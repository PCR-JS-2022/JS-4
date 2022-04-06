/**
 * @typedef {(company: Company) => void} listenerCallBack
 */

class ExchangeObserver {
	/**
	 * @param {Object<string, Array<listenerCallBack>} listeners
	 */
	constructor(listeners = {}) {
		if (typeof listeners !== 'object') {
			throw new Error("Invalid input data");
		}

		this.listeners = listeners;
	}

	/**
	 * @param {Company} company
	 * @param {Member} member
	 */
	sellShares(company, member) {
		if (!(company instanceof Company && member instanceof Member)) {
			throw new Error("Invalid input data");
		}

		const price = member.purchasedSharesNumber * company.sharePrice;

		if (price > member.balance || member.purchasedSharesNumber > company.shareCount) {
			throw new Error("Transaction is impossible");
		}

		company.shareCount -= member.purchasedSharesNumber;
		member.balance -= price;
	}

	/**
	 * @param {Company} company
	 */
	updateCompany(company) {
		if (!company instanceof Company) {
			throw new Error("Invalid input data");
		}

		this.listeners[company.name].forEach(listener => listener(company));
	}

	/**
	 * @param {string} companyName
	 * @param {listenerCallBack} callBack
	 */
	onUpdateCompany(companyName, callBack) {
		if (!(typeof callBack === 'function' && typeof companyName === 'string' && companyName)) {
			throw new Error("Invalid input data");
		}

		companyName in this.listeners
			? this.listeners[companyName].push(callBack)
			: this.listeners[companyName] = [callBack];
	}
}

class Company {
	/**
	 * @param {ExchangeObserver} exchangeObserver
	 * @param {string} name
	 * @param {number} [shareCount = 0]
	 * @param {number} [sharePrice = 0]
	 */
	constructor(exchangeObserver, name, shareCount = 0, sharePrice = 0) {
		if (!(exchangeObserver instanceof ExchangeObserver
			&& typeof name === 'string' && name
			&& typeof shareCount === 'number'
			&& typeof sharePrice === 'number')) {
			throw new Error("Invalid input data");
		}

		this.exchangeObserver = exchangeObserver;
		this.name = name;
		this.sharePrice = sharePrice;
		this.prevPrice = sharePrice;
		this.prevPrevPrice = sharePrice;
		this.shareCount = shareCount;
	}

	/**
	 * @param {number} newPrice
	 */
	updatePrice(newPrice) {
		if (typeof newPrice !== 'number') {
			throw new Error("Invalid input data");
		}

		this.prevPrevPrice = this.prevPrice;
		this.prevPrice = this.sharePrice;
		this.sharePrice = newPrice;

		if (this.shareCount !== 0) {
			this.exchangeObserver.updateCompany(this);
		}
	}
}

class Member {
	/**
	 * @param {ExchangeObserver} exchangeObserver
	 * @param {number} balance
	 * @param {Company[]} [interestingCompanies = []]
	 * @param {number} [purchasedSharesNumber = 10]
	 */
	constructor(exchangeObserver, balance, interestingCompanies = [], purchasedSharesNumber = 10) {
		if (!(exchangeObserver instanceof ExchangeObserver
				&& typeof balance === 'number'
				&& typeof purchasedSharesNumber === 'number')
			&& Array.isArray(interestingCompanies)) {
			throw new Error("Invalid input data");
		}

		this.exchangeObserver = exchangeObserver;
		this.balance = balance;
		this.interestingCompanies = interestingCompanies;
		this.purchasedSharesNumber = purchasedSharesNumber;

		this.interestingCompanies.forEach(interestingCompany => {
			this.exchangeObserver.onUpdateCompany(interestingCompany.name, () => {
				if (interestingCompany.prevPrice >= interestingCompany.sharePrice || interestingCompany.prevPrevPrice <= interestingCompany.prevPrice)
					return;
				this.exchangeObserver.sellShares(interestingCompany, this);
			});
		});
	}
}

module.exports = { ExchangeObserver, Company, Member };
