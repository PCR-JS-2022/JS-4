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
    // средства, которые потребуются для покупки акций в кол-ве, указанном
    // в поле purchasedSharesNumber (количество купленных акций)
    let moneyForStock = member.purchasedSharesNumber * company.sharePrice;

    //  shareCount – количество акций компании, выставленных на продажу;
    //  member.balance -  баланс участника рынка;
    if (
      member.purchasedSharesNumber > company.shareCount ||
      moneyForStock > member.balance
    ) {
      throw new Error("Не хватает $ или у компании нет такого кол-ва акций");
    }

    // и вычесть это кол-во из общего кол-ва акций компании.
    // (purchasedSharesNumber (количество купленных акций))
    company.shareCount -= member.purchasedSharesNumber;
    member.balance -= moneyForStock;
  }

  /**
   * Метод, уведомляющий всех подписчиков компании об изменениях
   * @param {Company} company
   * updateCompany(company) - метод, который принимает объект класса Company
   * и вызывает все функции, которые находятся в поле listeners
   * с ключом равным названию переданной компании.
   */
  updateCompany(company) {
    if (this.listeners[company.name]) {
      this.listeners[company.name].forEach((item) => item(company));
    }
  }

  /**
   * Метод, позволяющий подписаться на уведомления об изменениях компании
   * onUpdateCompany – метод, принимающий название компании и функцию обратного вызова.
   * Метод должен добавить в массив с ключом равным названию компании новую функцию обратного вызова.
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
    this.name = name;
    this.exchangeObserver = exchangeObserver;
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

    this.interestingCompanies.forEach((interestingCompany) => {
      let previousPrice = interestingCompany.sharePrice;
      let hasDown = false;
      exchangeObserver.onUpdateCompany(interestingCompany.name, (company) => {
        if (hasDown && previousPrice < company.sharePrice) {
          exchangeObserver.sellShares(interestingCompany, this);
        }
        if (previousPrice > company.sharePrice) {
          hasDown = true;
        } else {
          hasDown = false;
        }
        previousPrice = company.sharePrice;
      });
    });
  }
}

module.exports = { ExchangeObserver, Company, Member };