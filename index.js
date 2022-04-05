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
  // constructor(listeners) {
  //   this.listeners = listeners ?? new Map();
  // };
  constructor(listeners = {}) {
    if (typeof listeners !== "object")
      throw new Error("Некорректный словарь listeners");

    this.listeners = listeners;
  }
  /**
   * Метод, осуществляющий продажу акций компании участнику биржи
   * @param {Company} company
   * @param {Member} member
   */
  sellShares(company, member) {
    if (!(company instanceof Company) || !(company instanceof Member)) {
      throw new Error("Некорректный ввод");
    }

    if (member.purchasedSharesNumber > company.shareCount) {
      throw new Error("У компании нет нужного количества акций");
    }

    const finalPrice = member.purchasedSharesNumber * company.shareCount;

    if (finalPrice > member.balance) {
      throw new Error("У покупателя недостаточно средств");
    }

    member.balance -= finalPrice;
    company.shareCount -= member.purchasedSharesNumber;
  }

  /**
   * Метод, уведомляющий всех подписчиков компании об изменениях
   * @param {Company} company
   */
  updateCompany(company) {
    this.listeners.get(company.name).forEach((e) => e(company));
  }

  /**
   * Метод, позволяющий подписаться на уведомления об изменениях компании
   * @param {string} companyName
   * @param {listenerCallBack} cb
   */
  onUpdateCompany(companyName, cb) {
    if (companyName in this.listeners) {
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
    this.oldPrice = [sharePrice];
  }

  /**
   * Метод, обновляющий цену акции компании
   * @param {number} newPrice
   */
  updatePrice(newPrice) {
    if (typeof newPrice !== "number") {
      throw new Error("Некорректная цена акции");
    }
    this.sharePrice = newPrice;
    this.oldPrice.push(this.sharePrice);
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

    this.interestingCompanies.forEach((company) => {
      this.exchangeObserver.onUpdateCompany(company.name, () => {
        let lastE = company.oldPrice.length - 1;
        if (
          company.oldPrice[lastE - 1] < company.oldPrice[lastE] &&
          company.oldPrice[lastE - 2] > company.oldPrice[lastE - 1]
        ) {
          this.exchangeObserver.sellShares(company, this);
        }
      });
    });
  }
}

module.exports = { ExchangeObserver, Company, Member };
