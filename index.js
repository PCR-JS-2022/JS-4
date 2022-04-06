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
    constructor(listeners = new Map()) {
        this.listeners = listeners;
    }

    /**
     * Метод, осуществляющий продажу акций компании участнику биржи
     * @param {Company} company
     * @param {Member} member
     */
    sellShares(company, member) {
        let totalPrice = member.purchasedSharesNumber * company.sharePrice;

        if (company.shareCount < member.purchasedSharesNumber || totalPrice > member.balance)
            throw new Error();

        company.shareCount -= member.purchasedSharesNumber;
        member.balance -= totalPrice;
    }

    /**
     * Метод, уведомляющий всех подписчиков компании об изменениях
     * @param {Company} company
     */
    updateCompany(company) {
        this.listeners.get(company.name).forEach(callFunc => callFunc(company));
    }

    /**
     * Метод, позволяющий подписаться на уведомления об изменениях компании
     * @param {string} companyName
     * @param {listenerCallBack} cb
     */
    onUpdateCompany(companyName, cb) {
        if (this.listeners.has(companyName)) {
            this.listeners.get(companyName).push(cb);
        } else {
            this.listeners.set(companyName, [cb]);
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
        this.stockGraph = {
            prePrevious: sharePrice,
            previous: sharePrice
        }
    }

    /**
     * Метод, обновляющий цену акции компании
     * @param {number} newPrice
     */
    updatePrice(newPrice) {
        this.stockGraph.prePrevious = this.stockGraph.previous;
        this.stockGraph.previous = this.sharePrice;
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
    constructor(exchangeObserver, balance, interestingCompanies = [], purchasedSharesNumber = 10) {
        this.exchangeObserver = exchangeObserver;
        this.balance = balance;
        this.interestingCompanies = interestingCompanies;
        this.purchasedSharesNumber = purchasedSharesNumber;

        this.interestingCompanies.forEach(company => {
            this.exchangeObserver.onUpdateCompany(company.name, () => {
                if (this.isItGoodPrice(company)) {
                    this.exchangeObserver.sellShares(company, this);
                }
            })
        })
    }

    isItGoodPrice(company) {
        return (company.stockGraph.prePrevious > company.stockGraph.previous)
            && (company.stockGraph.previous < company.sharePrice)
    }
}

module.exports = {ExchangeObserver, Company, Member};
