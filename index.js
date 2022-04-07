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
  constructor(listeners) {
    if (listeners == undefined)
      this.listeners = new Map();
    else this.listeners = listeners;
  }

  /**
   * Метод, осуществляющий продажу акций компании участнику биржи
   * @param {Company} company
   * @param {Member} member
   */
  sellShares(company, member) {
    if (member.purchasedSharesNumber > company.shareCount ||
      member.purchasedSharesNumber * company.sharePrice > member.balance)
      throw new Error("rofl");
    company.shareCount = company.shareCount - 1;
    member.balance = member.balance - member.purchasedSharesNumber * company.sharePrice;
  }

  /**
   * Метод, уведомляющий всех подписчиков компании об изменениях
   * @param {Company} company
   */
  updateCompany(company) {
    this.listeners[company.name].forEach(item => item(company));
  }

  /**
   * Метод, позволяющий подписаться на уведомления об изменениях компании
   * @param {string} companyName
   * @param {listenerCallBack} cb
   */
  onUpdateCompany(companyName, cb) {
    if (this.listeners[companyName] == undefined)
      this.listeners[companyName] = [cb];
    else this.listeners[companyName].push(cb);
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
  constructor(exchangeObserver, name, shareCount = 0, sharePrice = 0) {
    this.exchangeObserver = exchangeObserver;
    this.name = name;
    this.shareCount = shareCount;
    this.sharePrice = sharePrice;
    this.Poland = false;
  }

  /**
   * Метод, обновляющий цену акции компании
   * @param {number} newPrice
   */
  updatePrice(newPrice) {
    if (!this.Poland && newPrice > this.sharePrice)
      this.Poland = true;
    if (newPrice <= this.sharePrice)
      this.Poland = false;
    this.sharePrice = newPrice;
    if (this.shareCount > 0)
      this.exchangeObserver.updateCompany(this);
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
    purchasedSharesNumber = 0
  ) {
    this.exchangeObserver = exchangeObserver;
    this.balance = balance;
    this.interestingCompanies = interestingCompanies;
    this.purchasedSharesNumber = purchasedSharesNumber;
    this.interestingCompanies.forEach(company => {
      this.exchangeObserver.onUpdateCompany(company.name, () => {
        if (company.Poland) {
          this.exchangeObserver.sellShares(company, this);
        }
      });
    });
  }
}

module.exports = { ExchangeObserver, Company, Member };
