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
    this.listeners = listeners ?? new Map();
  }

  /**
   * Метод, осуществляющий продажу акций компании участнику биржи
   * @param {Company} company
   * @param {Member} member
   */
  sellShares(company, member) {
    const wrongStockCount = new Error('Ошибка количества акций "sellShares"');
    if (company.shareCount < member.purchasedSharesNumber
      || member.balance < member.purchasedSharesNumber * company.sharePrice) {
      throw wrongStockCount;
    }
    member.balance -= member.purchasedSharesNumber * company.sharePrice
    company.shareCount -= member.purchasedSharesNumber
  }

  /**
   * Метод, уведомляющий всех подписчиков компании об изменениях
   * @param {Company} company
   */
  updateCompany(company) {
    this.listeners[company.name].forEach(isItTimeToBuy => {
      isItTimeToBuy(company)
    })
  }

  /**
   * Метод, позволяющий подписаться на уведомления об изменениях компании
   * @param {string} companyName
   * @param {listenerCallBack} cb
   */
  onUpdateCompany(companyName, cb) {
    (this.listeners[companyName])
      ? this.listeners[companyName].push(cb)
      : this.listeners[companyName] = [cb]
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
    this.exchangeObserver = exchangeObserver
    this.name = name
    this.shareCount = shareCount
    this.sharePrice = sharePrice
    this.priceHistory = [sharePrice];
  }

  /**
   * Метод, обновляющий цену акции компании
   * @param {number} newPrice
   */
  updatePrice(newPrice) {
    this.sharePrice = newPrice
    this.priceHistory.push(this.sharePrice)
    if (this.shareCount > 0) {
      this.exchangeObserver.updateCompany(this)
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
    this.exchangeObserver = exchangeObserver
    this.balance = balance
    this.interestingCompanies = interestingCompanies
    this.purchasedSharesNumber = purchasedSharesNumber

    this.interestingCompanies.forEach(company => {
      this.exchangeObserver.onUpdateCompany(company.name, () => {
        let last = company.priceHistory.length - 1
        if (company.priceHistory[last - 2] > company.priceHistory[last - 1]
          && company.priceHistory[last - 1] < company.priceHistory[last]) {
          this.exchangeObserver.sellShares(company, this)
        }
      })
    })
  }
}

module.exports = { ExchangeObserver, Company, Member };


/*
Тут я хочу чтобы мне проверили js1

...........#####...........#####.................#####
...........#####.......############............#######
...........#####......#####....#####........##########
...........#####.......#####..............#####..#####
...........#####..........#####..................#####
...........#####.............#####...............#####
..#####....#####......#####....#####.............#####
...############........############..............#####
.......#####...............#####.................#####

Тут я хочу чтобы мне проверили js1
*/