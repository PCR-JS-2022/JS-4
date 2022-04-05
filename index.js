/**
 * @typedef {(company: Company) => void} listenerCallBack
 */

/** Класс биржи */
class ExchangeObserver {

  #listeners;
  /**
   * Создаёт экзмепляр биржи
   * @param {Object<string, Array<listenerCallBack>} listeners - словарь, в котором ключи - названия компаний,
   * а значения - функции, которые вызываются при изменении цены акции этой компании
   */
  constructor(listeners = {}) {
    if (typeof listeners !== 'object') {
        throw new TypeError('listeners must be an object');
    }
    
    this.#listeners = listeners;
  }

  /**
   * Метод, осуществляющий продажу акций компании участнику биржи
   * @param {Company} company
   * @param {Member} member
   */
  sellShares(company, member) {

    if (!company || !(company instanceof Company)) {
      throw new TypeError('company must be defined and be typeof Company');
    }

    if (!member || !(member instanceof Member)) {
      throw new TypeError('member must be defined and be typeof Member');
    }

    if (member.purchasedSharesNumber > company.shareCount) {
      throw new Error('member\'s share count is greater than comany\'s share count');
    }

    if (member.purchasedSharesNumber * company.sharePrice > member.balance) {
      throw new Error('member\'s balance is low');
    }

    company.shareCount -= member.purchasedSharesNumber;
    member.balance -= member.purchasedSharesNumber * company.sharePrice;
  }

  /**
   * Метод, уведомляющий всех подписчиков компании об изменениях
   * @param {Company} company
   */
  updateCompany(company) {
    this.#listeners[company.name]?.forEach(cb => cb(company))
  }

  /**
   * Метод, позволяющий подписаться на уведомления об изменениях компании
   * @param {string} companyName
   * @param {listenerCallBack} cb
   */
  onUpdateCompany(companyName, cb) {
    if (companyName in this.#listeners) {
      this.#listeners[companyName].push(cb);
      return;
    }

    this.#listeners[companyName] = [cb];
  }
}

/** Класс компании */
class Company {

  exchangeObserver;
  name;
  shareCount;
  sharePrice;

  /**
   * Создаёт экзмепляр компании
   * @param {ExchangeObserver} exchangeObserver - объект биржи, на которой торгует компания
   * @param {string} name - название компании
   * @param {number} [shareCount = 0] - количество акций компании, выставленных на продажу
   * @param {number} [sharePrice = 0] - цена акции за штуку
   */
  constructor(exchangeObserver, name, shareCount = 0, sharePrice = 0) {

    if (typeof shareCount !== 'number') {
      throw new TypeError('shareCount must be a number');
    }

    if (typeof sharePrice !== 'number') {
      throw new TypeError('sharePrice must be a number');
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new TypeError("name must be a string and must contain letters");
    }

    if (!isExchangeObserverValid(exchangeObserver)) {
      throw new TypeError("invalid exchangeObserver provided");
    }

    this.exchangeObserver = exchangeObserver;
    this.name = name;
    this.shareCount = shareCount;
    this.sharePrice = sharePrice;
  }

  /**
   * Метод, обновляющий цену акции компании
   * @param {number} newPrice
   */
  updatePrice(newPrice) {
    if (typeof newPrice !== 'number') {
      throw new TypeError('type number was expected');
    }

    if (newPrice < 0) {
      throw new Error('new price should be positive');
    }

    const oldPrice = this.sharePrice;
    this.sharePrice = newPrice;

    if (oldPrice < newPrice) {
      this.exchangeObserver.updateCompany(this);
    }
  }
}

/** Класс участника торгов */
class Member {
  exchangeObserver;
  balance;
  interestingCompanies;
  purchasedSharesNumber;

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

    if (typeof balance !== 'number') {
      throw new TypeError('balance must be a number');
    }

    if (typeof purchasedSharesNumber !== 'number') {
      throw new TypeError('purchasedSharesNumber must be a number');
    }

    if (!isExchangeObserverValid(exchangeObserver)) {
      throw new TypeError('invalid exchangeObserver provided');
    }

    if (!Array.isArray(interestingCompanies)) {
      throw new TypeError('interestingCompanies must be an array');
    }

    this.exchangeObserver = exchangeObserver;
    this.balance = balance;
    this.interestingCompanies = interestingCompanies;
    this.purchasedSharesNumber = purchasedSharesNumber;
    
    this.interestingCompanies.forEach(company => {
      this.exchangeObserver.onUpdateCompany(company.name, (cmp) => {
        exchangeObserver.sellShares(cmp, this);
      })
    })
    
  }
}

function isExchangeObserverValid(exchangeObserver) {
  if (!exchangeObserver || !(exchangeObserver instanceof ExchangeObserver)) {
    return false;
  }

  return true;
}

module.exports = { ExchangeObserver, Company, Member };
