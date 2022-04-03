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
        this.listeners = listeners;
    }

    /**
     * Метод, осуществляющий продажу акций компании участнику биржи
     * @param {Company} company
     * @param {Member} member
     */
    sellShares(company, member) {
        const bestMomentForSell = member.lastPriceBuying
            ? member.lastPriceBuying > company.sharePrice && company.sharePrice < company.initialPrice && company.sharePrice > company.prevLowPrice
            : company.sharePrice < company.initialPrice && company.sharePrice > company.prevLowPrice;

        if (!bestMomentForSell) {
            return;
        }

        if (
            company.shareCount >= member.purchasedSharesNumber
            && member.balance >= member.purchasedSharesNumber * company.sharePrice
        ) {
            member.balance -= member.purchasedSharesNumber * company.sharePrice;
            company.shareCount -= member.purchasedSharesNumber;
            member.lastPriceBuying = company.sharePrice;
        } else {
            throw new Error('Недостаточно средств для покупки либо у компании недостаточно акций для продажи');
        }
    }

    /**
     * Метод, уведомляющий всех подписчиков компании об изменениях
     * @param {Company} company
     */
    updateCompany(company) {
        if (
            this.listeners
            && Object.entries(this.listeners).length
            && company.name
            && Object.entries(this.listeners).filter(item => item[0] === company.name).length
        ) {
            Object.entries(this.listeners).filter(item => item[0] === company.name)[0][1].map(func => func(company));
        }
    }

    /**
     * Метод, позволяющий подписаться на уведомления об изменениях компании
     * @param {string} companyName
     * @param {listenerCallBack} cb
     */
    onUpdateCompany(companyName, cb) {
        if (!companyName && typeof cb !== 'function') {
            return;
        }

        if (this.listeners === undefined || this.listeners === null) {
            this.listeners = {
                [companyName]: [cb]
            }
        } else {
            for (let listener in this.listeners) {
                if (listener === companyName) {
                    this.listeners[listener].push(cb);
                }
            }
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
        this.initialPrice = sharePrice;
    }

    /**
     * Метод, обновляющий цену акции компании
     * @param {number} newPrice
     */
    updatePrice(newPrice) {
        if (typeof newPrice !== 'number') {
            return;
        }
        this.prevLowPrice = this.sharePrice;
        this.sharePrice = newPrice;
        if (this.shareCount) {
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

        this.interestingCompanies.forEach(item => exchangeObserver.onUpdateCompany(
            item.name,
            (company) => {
                exchangeObserver.sellShares(company, this);
            }
        ));
    }
}

module.exports = { ExchangeObserver, Company, Member };
