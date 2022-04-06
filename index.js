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
    if(typeof listeners !== 'object'){
      throw new Error('Некорректные данные');
    }

    this.listeners = listeners;
  }

  /**
   * Метод, осуществляющий продажу акций компании участнику биржи
   * @param {Company} company
   * @param {Member} member
   */
  sellShares(company, member) {
    if(!(company instanceof Company) || !(member instanceof Member)){
      throw new Error('Некорректные данные');
    }

    const price = company.sharePrice;
    const memberSharesCount = member.purchasedSharesNumber;

    if(company.shareCount < memberSharesCount){
      throw new Error('Недостаточное количество акций компании');
    }
    if(member.balance < price * memberSharesCount){
      throw new Error('Недостаточно средств');
    }

    member.balance -= price * memberSharesCount;
    company.shareCount -= memberSharesCount;
  }

  /**
   * Метод, уведомляющий всех подписчиков компании об изменениях
   * @param {Company} company
   */
  updateCompany(company) {
    if(!(company instanceof Company)){
      throw new Error('Некорректные данные');
    }

    this.listeners[company.name].forEach(e => {
      e(company);
    });
  }

  /**
   * Метод, позволяющий подписаться на уведомления об изменениях компании
   * @param {string} companyName
   * @param {listenerCallBack} cb
   */
  onUpdateCompany(companyName, cb) {
    if(typeof companyName !== 'string' || typeof cb !== 'function'){
      throw new Error('Некорректные данные');
    }

    if(!Array.isArray(this.listeners[companyName])) {
      this.listeners[companyName] = [cb];
    }
    else{
      this.listeners[companyName].push(cb);
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
    if(!(exchangeObserver instanceof ExchangeObserver)
      || typeof name !== 'string'
      || typeof shareCount !== 'number'
      || typeof sharePrice !== 'number'){
        throw new Error('Некорректные данные');
    }

    this.exchangeObserver = exchangeObserver;
    this.name = name;
    this.shareCount = shareCount;
    this.sharePrice = sharePrice;
    this.lastPrices = [sharePrice]; //массив последних 3-х цен 
  }

  /**
   * Метод, обновляющий цену акции компании
   * @param {number} newPrice
   */
  updatePrice(newPrice) {
    if(typeof newPrice !== 'number'){
      throw new Error('Некорректные данные');
    }

    this.sharePrice = newPrice;
    this.lastPrices.push(newPrice);

    // lastPrices должен быть длины 3
    if(this.lastPrices.length > 3){
      this.lastPrices = this.lastPrices.splice(0, 1);
    }

    if(this.shareCount > 0){
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
    if(!(exchangeObserver instanceof ExchangeObserver)
      || typeof balance !== 'number'
      || !Array.isArray(interestingCompanies)
      || typeof purchasedSharesNumber !== 'number'){
        throw new Error('Некорректные данные');
    }

    this.exchangeObserver = exchangeObserver;
    this.balance = balance;
    this.interestingCompanies = interestingCompanies;
    this.purchasedSharesNumber = purchasedSharesNumber;

    interestingCompanies.forEach(e => {
      e.exchangeObserver.onUpdateCompany(e.name, () => {
        const prices = e.lastPrices;
        if(prices[1] < prices[0] && prices[2] > prices[1]){
          exchangeObserver.sellShares(e, this);
        }
      })
    })
  }
}

module.exports = { ExchangeObserver, Company, Member };
