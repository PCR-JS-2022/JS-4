/**
 * @typedef {(company: Company) => void} listenerCallBack
 */

class ExchangeObserver {
	/**
	 * @param {Object<string, Array<listenerCallBack>} listeners
	 */
	constructor(listeners = {}) {
		typeof listeners === 'object'
			? this.listeners = listeners
			: throw new Error("Invalid input data");
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
		company instanceof Company
			? this.listeners[company.name].forEach(listener => listener(company))
			: throw new Error("Invalid input data");
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

/** Класс компании */
class Company {
  /**
   * Создаёт экзмепляр компании
   * @param {ExchangeObserver} exchangeObserver - объект биржи, на которой торгует компания
   * @param {string} name - название компании
   * @param {number} [shareCount = 0] - количество акций компании, выставленных на продажу
   * @param {number} [sharePrice = 0] - цена акции за штуку
   */
  constructor(exchangeObserver, name, shareCount, sharePrice) {}

  /**
   * Метод, обновляющий цену акции компании
   * @param {number} newPrice
   */
  updatePrice(newPrice) {}
}

/** Класс участника торгов */
class Member {
  /**
   * Создаёт экзмепляр участника торгов
   * @param {ExchangeObserver} exchangeObserver - объект биржи
   * @param {number} balance - баланс участника
   * @param {Company[]} [interestingCompanies = []] - компании, за акциями которых участнику было бы интересно следить
   * @param {number} [purchasedSharesNumber = 10] - количество акций компании, выставленных на продажу
   */
  constructor(
    exchangeObserver,
    balance,
    interestingCompanies,
    purchasedSharesNumber
  ) {}
}

module.exports = { ExchangeObserver, Company, Member };
