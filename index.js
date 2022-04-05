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
    this.listeners = listeners ?? new Map();
	}

	/**
	 * Метод, осуществляющий продажу акций компании участнику биржи
	 * @param {Company} company
	 * @param {Member} member
	 */
	sellShares(company, member) {
		if ((!(company instanceof Company)) || (!(member instanceof Member))){
      throw new Error('Некорректная ввод')
    }
			
		if (member.purchasedSharesNumber > company.shareCount){
      throw new Error('Недостаточно акций у компании')
    }
			
		const finalPrice = member.purchasedSharesNumber * company.sharePrice

		if (finalPrice > member.balance){
      throw new Error('Недостаточно средств у участника')
    }
			
    company.shareCount -= member.purchasedSharesNumber
		member.balance -= finalPrice
		
	}

	/**
	 * Метод, уведомляющий всех подписчиков компании об изменениях
	 * @param {Company} company
	 */
	updateCompany(company) {
		if (!(company instanceof Company)){
      throw new Error('Некорректный ввод')
    }
		this.listeners[company.name].forEach(listener => listener(company))
	}

	/**
	 * Метод, позволяющий подписаться на уведомления об изменениях компании
	 * @param {string} companyName
	 * @param {listenerCallBack} cb
	 */
	onUpdateCompany(companyName, cb) {
		if (typeof companyName !== 'string' || !companyName || typeof cb !== 'function'){
      throw new Error('Некорректный ввод')
    }
			
		if (companyName in this.listeners) {
			this.listeners[companyName].push(cb)
		} 
    else {
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
		if (!(exchangeObserver instanceof ExchangeObserver)){
      throw new Error('Некорректная биржа')
    }
			
		if (typeof name !== 'string' || !name){
      throw new Error('Некорректное имя компании')
    }
			
		if (typeof shareCount !== 'number'){
      throw new Error('Некорректное кол-во акций')
    }
			
		if (typeof sharePrice !== 'number'){
      throw new Error('Некорректная цена акции')
    }
			
		this.exchangeObserver = exchangeObserver
		this.name = name
		this.shareCount = shareCount
		this.sharePrice = sharePrice
		this.previousPrice = sharePrice
		this.oldPrice = sharePrice
	}

	/**
	 * Метод, обновляющий цену акции компании
	 * @param {number} newPrice
	 */
	updatePrice(newPrice) {
		if (typeof newPrice !== 'number'){
      throw new Error('Некорректный ввод новой цены акции')
    }
			
		this.oldPrice = this.previousPrice
		this.previousPrice = this.sharePrice
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
	constructor(exchangeObserver, balance, interestingCompanies = [], purchasedSharesNumber = 10) {
		if (!(exchangeObserver instanceof ExchangeObserver)){
      throw new Error('Некорректный ввод названия биржи')
    }

		if (typeof balance !== 'number'){
      throw new Error('Некорректный ввод баланса участника')
    }

		if (!Array.isArray(interestingCompanies)){
      throw new Error('Некорректный ввод массива компаний')
    }

		if (typeof purchasedSharesNumber !== 'number'){
      throw new Error('Некорректное ввод количества покупаемых акций')
    }
			
		this.exchangeObserver = exchangeObserver
		this.balance = balance
		this.interestingCompanies = interestingCompanies
		this.purchasedSharesNumber = purchasedSharesNumber

		this.interestingCompanies.forEach(company => {
			this.exchangeObserver.onUpdateCompany(company.name, () => {
				if (company.previousPrice < company.sharePrice && company.oldPrice > company.previousPrice) {
					this.exchangeObserver.sellShares(company, this)
				}
			})
		})
	}
}

module.exports = {ExchangeObserver, Company, Member};