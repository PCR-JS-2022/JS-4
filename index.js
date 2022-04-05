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
    this.listeners = listeners;
  }

  /**
   * Метод, осуществляющий продажу акций компании участнику биржи
   * @param {Company} company
   * @param {Member} member
   */
  sellShares(company, member) {
    if(member.purchasedSharesNumber > company.shareCount) {
      throw new Error("У компании недостаточно акций");
    }
    if(member.balance < member.purchasedSharesNumber * company.sharePrice) {
      throw new Error("У вас недостаточно средств");
    }
    member.balance -= member.purchasedSharesNumber * company.sharePrice;
    company.shareCount -= member.purchasedSharesNumber;
  }

  /**
   * Метод, уведомляющий всех подписчиков компании об изменениях
   * @param {Company} company
   */
  updateCompany(company) { 
    if (!(company instanceof Company)) {
      throw new Error("Некорректный объект компании");
    }
    Object.entries(this.listeners).forEach(arr => {
      const [nameCompany, functions] = arr;
      if(nameCompany === company.name) {
        functions.map(f => f(company));
      }
    })
  }

  /**
   * Метод, позволяющий подписаться на уведомления об изменениях компании
   * @param {string} companyName
   * @param {listenerCallBack} cb
   */
  onUpdateCompany(companyName, cb) {
    if(typeof companyName !== "string" || typeof cb !== "function") {
      throw new Error("Некорректные данные");
    }
    if (this.listeners.companyName) {
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
    this.allPrices = [sharePrice];
  }

  /**
   * Метод, обновляющий цену акции компании
   * @param {number} newPrice
   */
  updatePrice(newPrice) {
    if(typeof newPrice !== "number") {
      throw new Error("Введенная цена некорректна")
    }
    this.sharePrice = newPrice;
    this.allPrices.push(this.sharePrice);
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
  constructor(exchangeObserver, balance, interestingCompanies = [], purchasedSharesNumber = 0) {
    this.exchangeObserver = exchangeObserver;
    this.balance = balance;
    this.interestingCompanies = interestingCompanies;
    this.purchasedSharesNumber = purchasedSharesNumber;

    this.interestingCompanies.forEach(company => {
      company.exchangeObserver.onUpdateCompany(company.name, () => {
        const lastPrice = company.allPrices[company.allPrices.length - 1];
        const prevPrice = company.allPrices[company.allPrices.length - 2];
        const prevprevPrice = company.allPrices[company.allPrices.length - 3];
        if(prevPrice < prevprevPrice && lastPrice > prevPrice) {
          exchangeObserver.sellShares(company, this);
        }
      })
    })
  }    
}

module.exports = { ExchangeObserver, Company, Member };
