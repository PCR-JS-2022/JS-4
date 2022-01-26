/**
 * @typedef {(company: Company) => void} listenerCallBack
 */

/** Класс биржи */
export class Exchange {
  /**
   * Создаёт экзмепляр биржи
   * @param {Object<string, Array<listenerCallBack>} listeners - словарь, в котором ключи - названия компаний,
   * а значения - функции, которые вызываются при изменении цены акции этой компании
   */
  constructor(listeners) {

  }

  /**
   * Метод, осуществляющий продажу акций компании участнику биржи
   * @param {Company} company 
   * @param {Member} member 
   */
  sellShares(company, member) {

  }

  /**
   * Метод, уведомляющий всех подписчиков компании об изменениях
   * @param {Company} company 
   */
  updateCompany(company) {

  }

  /**
   * Метод, позволяющий подписаться на уведомления об изменениях компании
   * @param {string} companyName
   * @param {listenerCallBack} cb
   */
  onUpdateCompany(companyName, cb) {

  }
}

/** Класс компании */
export class Company {
  /**
   * Создаёт экзмепляр компании
   * @param {string} name - название компании
   * @param {number} [sharePrice = 0] - цена акции за штуку
   * @param {Exchange} exchangeObserver - объект биржи, на которой торгует компания
   * @param {number} [shareCount = 0] - количество акций компании, выставленных на продажу
   */
  constructor(name, sharePrice, exchangeObserver, shareCount) {

  }

  /**
   * Метод, обновляющий цену акции компании
   * @param {number} newPrice
   */
  updatePrice(newPrice) {

  }
}

/** Класс участника торгов */
export class Member {
  /**
   * Создаёт экзмепляр участника торгов
   * @param {Exchange} exchangeObserver - объект биржи
   * @param {number} balance - баланс участника
   * @param {Company[]} [interestingCompanies = []] - компании, за акциями которых участнику было бы интересно следить
   * @param {number} [purchasedSharesNumber = 10] - количество акций компании, выставленных на продажу
   */
  constructor(exchangeObserver, balance, interestingCompanies, purchasedSharesNumber) {

  }
}
