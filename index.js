/**
 * @typedef {(company: Company) => void} listenerCallBack
 */

const { 
  // Хе, спалился питонист... По привычке написал через нижнее подчёркивание всё
  check_function,
  check_name,
  check_valid_debiting_operation_with_balance,
  check_valid_debiting_operation_with_stock,
  check_valid_price,
  check_valid_count_stock,
  check_interesting_companies,
  check_balance
} = require("./validate");

/** Класс биржи */
class ExchangeObserver {
  /**
   * Создаёт экзмепляр биржи
   * @param {Object<string, Array<listenerCallBack>} listeners - словарь, в котором ключи - названия компаний,
   * а значения - функции, которые вызываются при изменении цены акции этой компании
   */
  constructor(listeners = {}) {
    if (typeof listeners !== 'object') {
			throw new Error("Неверные данные")
		}
		this.listeners = listeners
  }

  /**
   * Метод, осуществляющий продажу акций компании участнику биржи
   * @param {Company} company
   * @param {Member} member
   */
  sellShares(company, member) {
    check_company(company)
    check_member(member)
    const price = member.purchasedSharesNumber * company.sharePrice
    check_valid_debiting_operation_with_balance(price, member.balance)
    check_valid_debiting_operation_with_stock(member.purchasedSharesNumber, company.shareCount)
		company.shareCount -= member.purchasedSharesNumber
		member.balance -= price
  }

  /**
   * Метод, уведомляющий всех подписчиков компании об изменениях
   * @param {Company} company
   */
  updateCompany(company) {
    check_company(company)
    this.listeners[company.name].forEach(listener => listener(company))
  }

  /**
   * Метод, позволяющий подписаться на уведомления об изменениях компании
   * @param {string} companyName
   * @param {listenerCallBack} cb
   */
  onUpdateCompany(companyName, cb) {
    check_function(cb)
    check_name(companyName)

		companyName in this.listeners
			? this.listeners[companyName].push(cb)
			: this.listeners[companyName] = [cb]
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
  constructor(
    exchangeObserver, 
    name, 
    shareCount = 0, 
    sharePrice = 0
  ) {
    check_name(name)
    check_valid_count_stock(shareCount)
    check_valid_price(sharePrice)
    check_exchange(exchangeObserver)

    this.exchangeObserver = exchangeObserver
		this.name = name
		this.sharePrice = sharePrice
    this.prevPrice = sharePrice
    this.prevPrevPrice = sharePrice
		this.shareCount = shareCount
  }

  /**
   * Метод, обновляющий цену акции компании
   * @param {number} newPrice
   */
  updatePrice(newPrice) {
    check_valid_price(newPrice)

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
    check_interesting_companies(interestingCompanies)
    check_valid_count_stock(purchasedSharesNumber)
    check_exchange(exchangeObserver)
    check_balance(balance)

    this.exchangeObserver = exchangeObserver
    this.balance = balance
    this.interestingCompanies = interestingCompanies
    this.purchasedSharesNumber = purchasedSharesNumber

    this.interestingCompanies.forEach(interestingCompany => {
      this.exchangeObserver.onUpdateCompany(interestingCompany.name, () => {
        if (interestingCompany.sharePrice <= interestingCompany.prevPrice  
            || interestingCompany.prevPrevPrice <= interestingCompany.prevPrice)
          return;
        this.exchangeObserver.sellShares(interestingCompany, this)
      })
    })
  }
}


const check_company = (company) => {
  if (!(company instanceof Company)) {
      throw new Error("Неверные данные о компании");
  }
}


const check_member = (member) => {
  if (!(member instanceof Member)) {
      throw new Error("Неверные данные об участнике");
  }
}


const check_exchange = (exchange) => {
  if (!(exchange instanceof ExchangeObserver)) {
      throw new Error("Неверный объект биржи");
  }
}


module.exports = { ExchangeObserver, Company, Member };