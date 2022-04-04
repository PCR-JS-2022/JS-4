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
    this.listeners = listeners === undefined ? new Map() : listeners;
  }

  /**
   * Метод, осуществляющий продажу акций компании участнику биржи
   * @param {Company} company
   * @param {Member} member
   */
  sellShares(company, member) {
    if (member.purchasedSharesNumber > company.shareCount)
      throw new Error('У компании недостаточно акций для продажи');
    const dealCost = member.purchasedSharesNumber * company.sharePrice;
    if (dealCost > member.balance)
      throw new Error('Недостаточно средств для покупки');
    member.balance -= dealCost;
    company.shareCount -= member.purchasedSharesNumber;
  }

  /**
   * Метод, уведомляющий всех подписчиков компании об изменениях
   * @param {Company} company
   */
  updateCompany(company) {
    this.listeners[company.name].forEach(
      (el) => el(company)
    );
  }

  /**
   * Метод, позволяющий подписаться на уведомления об изменениях компании
   * @param {string} companyName
   * @param {listenerCallBack} cb
   */
  onUpdateCompany(companyName, cb) {
    if (!this.listeners.has(companyName)) {
      this.listeners[companyName] = [];
    }
    this.listeners[companyName].push(cb);
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
  constructor(exchangeObserver, name, shareCount, sharePrice) {
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
    const oldPrice = this.sharePrice;
    this.sharePrice = newPrice;
    if (newPrice > oldPrice && this.shareCount > 0) {
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
    interestingCompanies,
    purchasedSharesNumber
  ) {

    this.exchangeObserver = exchangeObserver;
    this.balance = balance;
    this.interestingCompanies = interestingCompanies;
    this.purchasedSharesNumber = purchasedSharesNumber;

    function assignCB(company) {
      exchangeObserver.onUpdateCompany(company.name, (company) =>  exchangeObserver.sellShares(company, this))
    }

    interestingCompanies.forEach(
      el => assignCB.bind(this)(el)
    );
  }
}

module.exports = { ExchangeObserver, Company, Member };

/*
const exchange = new ExchangeObserver();
const greenBank = new Company(exchange, 'Green Bank', 100, 100);
const kesha = new Member(exchange, 10000, [greenBank], 10);

greenBank.updatePrice(70);
greenBank.updatePrice(73);

// Тут происходит покупка 10 акций по цене 73

console.log(greenBank.shareCount); // 90

kesha.purchasedSharesNumber = 100; // Меняем кол-во приобретаемых акций с 10 до 100
greenBank.updatePrice(40);
greenBank.updatePrice(45);

// Тут происходит попытка скупить 100 акций у компании greenBank
// Error('У компании недостаточно акций для продажи')
*/