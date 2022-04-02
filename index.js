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
    this.listeners = new Map();
  }

  /**
   * Метод, осуществляющий продажу акций компании участнику биржи
   * @param {Company} company
   * @param {Member} member
   */
  sellShares(company, member) {
    if(member.purchasedSharesNumber > company.shareCount)
      throw new Error(`Невозможно купить ${member.purchasedSharesNumber} акций у компании ${company.name}.
       ${company.name} выставила на продажу всего ${company.shareCount}`);
    const totalSum = member.purchasedSharesNumber * company.sharePrice;
    if(totalSum > member.balance)
      throw new Error("Недостаточно средств для покуаки акций");
    
      company.shareCount -= member.purchasedSharesNumber;
      member.balance -= totalSum;
  }

  /**
   * Метод, уведомляющий всех подписчиков компании об изменениях
   * @param {Company} company
   */
  updateCompany(company) {
    const companyListeners = this.listeners.get(company.name);
    for(let cb of companyListeners)
      cb(company);
  }

  /**
   * Метод, позволяющий подписаться на уведомления об изменениях компании
   * @param {string} companyName
   * @param {listenerCallBack} cb
   */
  onUpdateCompany(companyName, cb) {
    if(this.listeners.has(companyName))
      this.listeners[companyName].push(cb);
    else
      this.listeners.set(companyName, [cb]);
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
    if(newPrice < 0)
      throw new Error("Цена не может быть отрицательной");
    this.sharePrice = newPrice;
    this.exchangeObserver.updateCompany(this)
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
    purchasedSharesNumber = 10
  ) {
    this.companiesPrices = new Map();
      if(balance < 0)
        throw new Error("Баланс не может быть отрицательным");
      if(purchasedSharesNumber < 0)
        throw new Error("Кол-во акций на продажу не может быть отрицательным");
    this.exchangeObserver = exchangeObserver;
    this.balance = balance;
    this.interestingCompanies = interestingCompanies;
    this.purchasedSharesNumber = purchasedSharesNumber;

    for(let company of interestingCompanies){
      this.companiesPrices.set(company.name, [company.sharePrice]);
      exchangeObserver.onUpdateCompany(
        company.name,
        (company) => {
          const companyPrices = this.companiesPrices.get(company.name);
          if(companyPrices.length > 1
            && companyPrices[companyPrices.length - 2] > companyPrices[companyPrices.length - 1]
            && companyPrices[companyPrices.length - 1] < company.sharePrice)
              this.exchangeObserver.sellShares(company, this);
          companyPrices.push(company.sharePrice); 
        }
      )
    }
  }
}

module.exports = { ExchangeObserver, Company, Member };
