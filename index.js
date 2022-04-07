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
    this.listeners = listeners;
  }

  /**
   * Метод, осуществляющий продажу акций компании участнику биржи
   * @param {Company} company
   * @param {Member} member
   */
  sellShares(company, member) {
    const sharesToBuy = member.purchasedSharesNumber;
    const price = company.sharePrice;
    const totalPrice = sharesToBuy * price;
    if (!(sharesToBuy <= company.shareCount && member.balance >= totalPrice)) {
      throw new Error('Ошибка: не удалось купить акции');
    }
    company.shareCount -= sharesToBuy;
    member.balance -= totalPrice;
  }

  /**
   * Метод, уведомляющий всех подписчиков компании об изменениях
   * @param {Company} company
   */
  updateCompany(company) {
    if (typeof (company) !== 'object') {
      throw new Error('Ошибка: не удалось обновить компанию')
    }
    this.listeners[company.name].forEach(x => x(company));
  }

  /**
   * Метод, позволяющий подписаться на уведомления об изменениях компании
   * @param {string} companyName
   * @param {listenerCallBack} cb
   */
  onUpdateCompany(companyName, cb) {
    if (typeof (companyName) !== 'string' || typeof (cb) !== 'function' || !companyName) {
      throw new Error('Ошибка: onUpdateCompany');
    }
    if (this.listeners[companyName]) {
      this.listeners[companyName].push(cb);
    }
    else {
      this.listeners[companyName] = [cb];
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
  constructor(exchangeObserver, name, shareCount = 0, sharePrice = 0) {
    if (typeof (name) !== 'string' || !name ||
      typeof (shareCount) !== "number" || !shareCount ||
      typeof (sharePrice) !== "number" || !sharePrice ||
      !exchangeObserver instanceof ExchangeObserver) {
      throw new Error('Ошибка: не удалось создать компанию');
    }
    this.exchangeObserver = exchangeObserver;
    this.name = name;
    this.shareCount = shareCount;
    this.sharePrice = sharePrice;

    this.flag = 0;
  }

  /**
   * Метод, обновляющий цену акции компании
   * @param {number} newPrice
   */
  updatePrice(newPrice) {

    if (newPrice < this.sharePrice) {
      this.flag = -1;
    }
    else if (this.flag === -1 && newPrice > this.sharePrice) {
      this.flag = 1;
    }
    this.sharePrice = newPrice;
    if (this.shareCount > 0) {
      this.exchangeObserver.updateCompany(this);
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
    purchasedSharesNumber = 0
  ) {
    if (typeof (balance) !== "number" || !balance ||
      !Array.isArray(interestingCompanies) ||
      typeof (purchasedSharesNumber) != "number" ||
      !exchangeObserver instanceof ExchangeObserver) {
      throw new Error('Ошибка: не удалось создать участника торгов');
    }
    this.exchangeObserver = exchangeObserver;
    this.balance = balance;
    this.interestingCompanies = interestingCompanies;
    this.purchasedSharesNumber = purchasedSharesNumber;

    this.interestingCompanies.forEach(company => {
      this.exchangeObserver.onUpdateCompany(company.name, () => {
        if (company.flag === 1) {
          this.exchangeObserver.sellShares(company, this);
        }
      })
    })
  }
}

module.exports = {
  ExchangeObserver,
  Company,
  Member
};
