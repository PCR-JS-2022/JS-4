/**
 * @typedef {(company: Company) => void} listenerCallBack
 */

function isCompany(company) {
  if (!company instanceof Company) {
    throw new Error('Некорректные данные company');
  }
}

function isMember(member) {
  if (!member instanceof Member) {
    throw new Error('Некорректные данные member');
  }
}

function isStr(companyName) {
  if (!typeof companyName === "string") {
    throw new Error("Некорректные данные");
  }
}

function isNum(num) {
  if (!typeof num === "number") {
    throw new Error("Некорректные данные");
  }
}

function isObj(obj) {
  if (!typeof obj === "object") {
    throw new Error("Некорректные данные");
  }
}

function isFunction(func) {
  if (!typeof func === "function") {
    throw new Error('Некорректна передана функция');
  }
}

function isArr(arr) {
  if (!Array.isArray(arr)) {
    throw new Error('Некорректно передан массив');
  }
}

/** Класс биржи */
class ExchangeObserver {
  /**
   * Создаёт экзмепляр биржи
   * @param {Object<string, Array<listenerCallBack>} listeners - словарь, в котором ключи - названия компаний,
   * а значения - функции, которые вызываются при изменении цены акции этой компании
   */
  constructor(listeners = {}) {
    isObj(listeners);
    this.listeners = listeners;
  }

  /**
   * Метод, осуществляющий продажу акций компании участнику биржи
   * @param {Company} company
   * @param {Member} member
   */
  sellShares(company, member) {
    isCompany(company);
    isMember(member);

    let priceShare = company.sharePrice * member.purchasedSharesNumber;
    if (member.purchasedSharesNumber > company.shareCount) {
      throw new Error('У компании недостаточно акций');
    }
    if (priceShare > member.balance) {
      throw new Error('У участника не хватает средств');
    }

    member.balance -= priceShare;
    company.shareCount -= member.purchasedSharesNumber;
  }

  /**
   * Метод, уведомляющий всех подписчиков компании об изменениях
   * @param {Company} company
   */
  updateCompany(company) {
    isCompany(company);
    this.listeners[company.name].forEach(func => func(company));
  }

  /**
   * Метод, позволяющий подписаться на уведомления об изменениях компании
   * @param {string} companyName
   * @param {listenerCallBack} cb
   */
  onUpdateCompany(companyName, cb) {
    isStr(companyName);
    isFunction(cb);
    if (this.listeners.hasOwnProperty(companyName)) {
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
    isObj(exchangeObserver);
    isStr(name);
    isNum(shareCount);
    isNum(sharePrice);
    this.exchangeObserver = exchangeObserver,
      this.name = name,
      this.shareCount = shareCount,
      this.sharePrice = sharePrice,
      this.prices = [sharePrice]
  }

  /**
   * Метод, обновляющий цену акции компании
   * @param {number} newPrice
   */
  updatePrice(newPrice) {
    isNum(newPrice);
    this.prices.push(newPrice);
    this.sharePrice = newPrice;
    if (this.shareCount !== 0) {
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
    isObj(exchangeObserver);
    isNum(balance);
    isArr(interestingCompanies);
    isNum(purchasedSharesNumber);
    this.exchangeObserver = exchangeObserver,
      this.balance = balance,
      this.interestingCompanies = interestingCompanies.forEach(company => {
        this.exchangeObserver.onUpdateCompany(company.name, () => {
          let prices = company.prices;
          if (prices.length > 2) {
            let lastIndex = prices.length - 1;
            if (prices[lastIndex] > prices[lastIndex - 1] && prices[lastIndex - 2] > prices[lastIndex - 1]) {
              this.exchangeObserver.sellShares(company, this)
            }
          }

        })
      }) || interestingCompanies,
      this.purchasedSharesNumber = purchasedSharesNumber;
  }
}

module.exports = { ExchangeObserver, Company, Member };
