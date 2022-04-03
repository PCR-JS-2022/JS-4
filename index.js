/**
 * @typedef {(company: Company) => void} listenerCallBack
 */

/** Класс биржи */
class ExchangeObserver {
	/**
	 * Создаёт экзмепляр биржи
	 * @param {Object<string, Array<listenerCallBack>} listeners - словарь, в котором ключи - названия компаний,
	 * а значения - функции, которые вызываются при изменении цены акции этой компании
	 */
	constructor(listeners = {}) {
		if (typeof listeners !== 'object')
			throw new Error('Некорректный словарь listeners')

		this.listeners = listeners
	}

	/**
	 * Метод, осуществляющий продажу акций компании участнику биржи
	 * @param {Company} company
	 * @param {Member} member
	 */
	sellShares(company, member) {
		if (!(company instanceof Company))
			throw new Error('Некорректная компания')

		if (!(member instanceof Member))
			throw new Error('Некорректный участник')

		if (member.purchasedSharesNumber > company.shareCount)
			throw new Error('У компании недостаточно акций')

		const totalPrice = member.purchasedSharesNumber * company.sharePrice

		if (totalPrice > member.balance)
			throw new Error('У участника недостаточно средств для покупки')

		member.balance -= totalPrice
		company.shareCount -= member.purchasedSharesNumber
	}

	/**
	 * Метод, уведомляющий всех подписчиков компании об изменениях
	 * @param {Company} company
	 */
	updateCompany(company) {
		if (!(company instanceof Company))
			throw new Error('Некорректная компания')

		this.listeners[company.name].forEach(listener => listener(company))
	}

	/**
	 * Метод, позволяющий подписаться на уведомления об изменениях компании
	 * @param {string} companyName
	 * @param {listenerCallBack} cb
	 */
	onUpdateCompany(companyName, cb) {
		if (typeof companyName !== 'string' || !companyName)
			throw new Error('Некорректное имя компании')

		if (typeof cb !== 'function')
			throw new Error('Некорректная функция callback')

		if (companyName in this.listeners) {
			this.listeners[companyName].push(cb)
		} else {
			this.listeners[companyName] = [cb]
		}
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
	constructor(exchangeObserver, name, shareCount= 0, sharePrice= 0) {
		if (!(exchangeObserver instanceof ExchangeObserver))
			throw new Error('Некорректная биржа')

		if (typeof name !== 'string' || !name)
			throw new Error('Некорректное имя компании')

		if (typeof shareCount !== 'number')
			throw new Error('Некорректное кол-во акций')

		if (typeof sharePrice !== 'number')
			throw new Error('Некорректная цена акции')

		this.exchangeObserver = exchangeObserver
		this.name = name
		this.shareCount = shareCount
		this.sharePrice = sharePrice
		this.prevPrice = sharePrice
		this.prevPrevPrice = sharePrice
	}

	/**
	 * Метод, обновляющий цену акции компании
	 * @param {number} newPrice
	 */
	updatePrice(newPrice) {
		if (typeof newPrice !== 'number')
			throw new Error('Новая цена акции некорректна')

		this.prevPrevPrice = this.prevPrice
		this.prevPrice = this.sharePrice
		this.sharePrice = newPrice

		if (this.shareCount !== 0) {
			this.exchangeObserver.updateCompany(this)
		}
	}
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
		interestingCompanies = [],
		purchasedSharesNumber = 10
	) {
		if (!(exchangeObserver instanceof ExchangeObserver))
			throw new Error('Некорректная биржа')

		if (typeof balance !== 'number')
			throw new Error('Некорректный баланс участника')

		if (!Array.isArray(interestingCompanies))
			throw new Error('Некорректный массив компаний')

		if (typeof purchasedSharesNumber !== 'number')
			throw new Error('Некорректное кол-во покупаемых акций')

		this.exchangeObserver = exchangeObserver
		this.balance = balance
		this.interestingCompanies = interestingCompanies
		this.purchasedSharesNumber = purchasedSharesNumber

		this.interestingCompanies.forEach(company => {
			this.exchangeObserver.onUpdateCompany(company.name, () => {
				if (company.prevPrevPrice > company.prevPrice && company.prevPrice < company.sharePrice) {
					this.exchangeObserver.sellShares(company, this)
				}
			})
		})
	}
}

module.exports = {ExchangeObserver, Company, Member};
