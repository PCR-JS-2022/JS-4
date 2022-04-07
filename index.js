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
    if (typeof listeners !== "object") {
      throw new Error("listeners не объект")
    }
    this.listeners = listeners
  }

  /**
   * Метод, осуществляющий продажу акций компании участнику биржи
   * @param {Company} company
   * @param {Member} member
   */
  sellShares(company, member) {
    if (!company instanceof Company ||  !member instanceof Member) {
      throw new Error("Невалидные параметры")
    }

    if (this.isCanSell(company, member)) {
      member.balance -= member.purchasedSharesNumber * company.sharePrice;
      company.shareCount -= member.purchasedSharesNumber;
    }
    else throw new Error("Невозможно купить акции")
  }

  /**
   * Метод, уведомляющий всех подписчиков компании об изменениях
   * @param {Company} company
   */
  updateCompany(company) {
    if (!(company instanceof Company)) {
      throw new Error("Невалидные параметры")
    }
    this.listeners[company.name].forEach(listener => listener(company));
  }

  /**
   * Метод, позволяющий подписаться на уведомления об изменениях компании
   * @param {string} companyName
   * @param {listenerCallBack} cb
   */
  onUpdateCompany(companyName, cb) {
    if (typeof companyName !== "string" || typeof cb !== "function") {
      throw new Error("Невалидные параметры")
    }
    if (Object.keys(this.listeners).includes(companyName)) {
      this.listeners[companyName].push(cb);
    }
    else {
      this.listeners[companyName] = [cb];
    }
  }

  isCanSell(company, member) {
    return member.balance >= member.purchasedSharesNumber * company.sharePrice &&
        company.shareCount >= member.purchasedSharesNumber;
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
    if (this.isValidConstructor(exchangeObserver,name,shareCount,sharePrice)) {
      this.exchangeObserver = exchangeObserver;
      this.name = name;
      this.shareCount = shareCount;
      this.sharePrice = sharePrice;
      this.history = [this.sharePrice];
    }
    else throw new Error("В конструктор переданы невалидные параметры")
  }

  /**
   * Метод, обновляющий цену акции компании
   * @param {number} newPrice
   */
  updatePrice(newPrice) {
    if (typeof newPrice !== "number") {
      throw new Error("Цена должна быть числом")
    }
    this.sharePrice = newPrice
    this.history.push(this.sharePrice)
    if (this.shareCount > 0) {
      this.exchangeObserver.updateCompany(this)
    }
  }

  isValidConstructor(exchangeObserver, name, shareCount, sharePrice) {
    return (exchangeObserver instanceof ExchangeObserver && typeof name === "string" &&
    typeof shareCount === "number" && typeof sharePrice === "number")
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
    interestingCompanies= [],
    purchasedSharesNumber= 10
  ) {
    if (this.isValidConstructor(
        exchangeObserver,
        balance,
        interestingCompanies,
        purchasedSharesNumber)) {
      this.exchangeObserver = exchangeObserver;
      this.balance = balance;
      this.interestingCompanies = interestingCompanies;
      this.purchasedSharesNumber = purchasedSharesNumber;

      this.interestingCompanies.forEach(company => this.exchangeObserver.onUpdateCompany(
          company.name,  (company) => {
            const lastElementIndex = company.history.length;
            if (company.history.length >= 3
                && company.history[lastElementIndex-1]
                > company.history[lastElementIndex-2]
                && company.history[lastElementIndex-2]
                < company.history[lastElementIndex-3]) {
              exchangeObserver.sellShares(company, this);
            }
          }));
    }
    else throw new Error("В конструктор переданы невалидные параметры")
  }

  isValidConstructor(exchangeObserver, balance, interestingCompanies, purchasedSharesNumber) {
    return (exchangeObserver instanceof ExchangeObserver && typeof balance === "number" &&
        Array.isArray(interestingCompanies) && typeof purchasedSharesNumber === "number")
  }
}

module.exports = { ExchangeObserver, Company, Member };
