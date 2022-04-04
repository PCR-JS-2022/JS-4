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
    this.listeners = listeners ?? {};
  }

  /**
   * Метод, осуществляющий продажу акций компании участнику биржи
   * @param {Company} company
   * @param {Member} member
   */
  sellShares(company, member) {
    const shareTotalPrice = member.purchasedSharesNumber * company.sharePrice;
    if (
      shareTotalPrice > member.balance
      || company.shareCount < member.purchasedSharesNumber
    ) {
      throw new Error();
    }
    member.balance -= member.purchasedSharesNumber * company.sharePrice;
    company.shareCount -= member.purchasedSharesNumber;
  }

  /**
   * Метод, уведомляющий всех подписчиков компании об изменениях
   * @param {Company} company
   */
  updateCompany(company) {
    if (this.listeners[company.name]) {
      this.listeners[company.name].forEach(listener => listener(company));
    }
  }

  /**
   * Метод, позволяющий подписаться на уведомления об изменениях компании
   * @param {string} companyName
   * @param {listenerCallBack} cb
   */
  onUpdateCompany(companyName, cb) {
    if (this.listeners[companyName]) {
      this.listeners[companyName].push(cb);
    } else {
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
    this.exchangeObserver = exchangeObserver;
    this.balance = balance;
    this.interestingCompanies = interestingCompanies;
    this.purchasedSharesNumber = purchasedSharesNumber;

    interestingCompanies.forEach(interestingCompany => {
      let previousSharePrice = interestingCompany.sharePrice;
      let isGoingDown = false;
      exchangeObserver.onUpdateCompany(interestingCompany.name, company => {
        if (isGoingDown && previousSharePrice < company.sharePrice) {
          exchangeObserver.sellShares(interestingCompany, this);
        }
        if (previousSharePrice > company.sharePrice) {
          isGoingDown = true;
        } else {
          isGoingDown = false;
        }
        previousSharePrice = company.sharePrice;
      });
    });
  }
}

module.exports = { ExchangeObserver, Company, Member };
