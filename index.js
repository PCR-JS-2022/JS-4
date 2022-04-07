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
    this.Poland = undefined;
  }

  /**
   * Метод, обновляющий цену акции компании
   * @param {number} newPrice
   */
  updatePrice(newPrice) {
    this.decision(newPrice, this.sharePrice, this.Poland)
    this.sharePrice = newPrice;
    if (this.shareCount > 0)
      this.exchangeObserver.updateCompany(this);
  }
  decision(newPrice, prevPrice, prevPrevPrice) {
    if (prevPrevPrice === false
      && newPrice > prevPrice)
      this.Poland = true;
    if (newPrice === prevPrice)
      this.Poland = undefined;
    if (newPrice < prevPrice)
      this.Poland = false;
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
const exchange = new ExchangeObserver();
const greenBank = new Company(exchange, 'Green Bank', 100, 100);
const beebBank = new Company(exchange, 'BeebBank', 90, 90);
const kesha = new Member(exchange, 10000, [greenBank, beebBank], 10);
const huesha = new Member(exchange, 9000, [greenBank, beebBank], 13);

greenBank.updatePrice(70);
greenBank.updatePrice(73);
greenBank.updatePrice(73);
greenBank.updatePrice(75);
greenBank.updatePrice(73);
greenBank.updatePrice(75.5);