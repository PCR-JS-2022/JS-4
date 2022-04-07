/**
 * @typedef {(company: Company) => void} listenerCallBack
 */

/** Класс биржи */
class ExchangeObserver {
    /**
     * Создаёт экземпляр биржи
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
        if (!(company instanceof Company)) {
            throw new Error('Передан не объект компании!');
        } else if (!(member instanceof Member)) {
            throw new Error('Передан не объект участника!');
        }
        if (company.sharePrice < member.purchasedSharesNumber) {
            throw new Error('У компании нет такого количества акций на продажу!');
        }
        const priceShares = member.purchasedSharesNumber * company.sharePrice;
        if (priceShares > member.balance) {
            throw new Error('У участника недостаточно средств для приобретения акций компании!');
        }
        member.balance -= priceShares;
        company.shareCount -= member.purchasedSharesNumber;
    }

    /**
     * Метод, уведомляющий всех подписчиков компании об изменениях
     * @param {Company} company
     */
    updateCompany(company) {
        this.listeners.get(company.name).forEach(func => func(company));
    }

    /**
     * Метод, позволяющий подписаться на уведомления об изменениях компании
     * @param {string} companyName
     * @param {listenerCallBack} cb
     */
    onUpdateCompany(companyName, cb) {
        if (this.listeners.has(companyName)) {
            this.listeners[companyName].push(cb);
        } else {
            this.listeners.set(companyName, [cb]);
        }
    }
}

/** Класс компании */
class Company {
    /**
     * Создаёт экземпляр компании
     * @param {ExchangeObserver} exchangeObserver - объект биржи, на которой торгует компания
     * @param {string} name - название компании
     * @param {number} [shareCount = 0] - количество акций компании, выставленных на продажу
     * @param {number} [sharePrice = 0] - цена акции за штуку
     */
    constructor(exchangeObserver, name, shareCount = 0, sharePrice = 0) {
        if (!(exchangeObserver instanceof ExchangeObserver)) {
            throw new Error('Переда не объект биржи!');
        }
        if (typeof name !== 'string') {
            throw new Error('Имя должно являться строкой!')
        }
        if (typeof shareCount !== 'number') {
            throw new Error('Количество акций должно быть числом!');
        }
        if (typeof sharePrice !== 'number') {
            throw new Error('Цена акций должна быть числом!');
        }
        this.exchangeObserver = exchangeObserver;
        this.name = name;
        this.shareCount = shareCount;
        this.sharePrice = sharePrice;
        this.sharePriceHistory = {
            previousPreviousPriceShare: sharePrice,
            previousPriceShare: sharePrice,
        };
    }

    /**
     * Метод, обновляющий цену акции компании
     * @param {number} newPrice
     */
    updatePrice(newPrice) {
        this.sharePriceHistory.previousPreviousPriceShare = this.sharePriceHistory.previousPriceShare;
        this.sharePriceHistory.previousPriceShare = this.sharePrice;
        this.sharePrice = newPrice;
        if (this.shareCount > 0) {
            this.exchangeObserver.updateCompany(this);
        }
    }
}

/** Класс участника торгов */
class Member {
    /**
     * Создаёт экземпляр участника торгов
     * @param {ExchangeObserver} exchangeObserver - объект биржи
     * @param {number} balance - баланс участника
     * @param {Company[]} [interestingCompanies = []] - компании, за акциями которых участнику было бы интересно следить
     * @param {number} [purchasedSharesNumber = 10] - количество акций компании, выставленных на продажу
     */
    constructor(exchangeObserver, balance, interestingCompanies = [], purchasedSharesNumber = 0) {
        if (!(exchangeObserver instanceof ExchangeObserver)) {
            throw new Error('Передан не объект биржи!');
        }
        if (typeof balance !== 'number') {
            throw new Error('Баланс должен быть числом!');
        }
        if (!Array.isArray(interestingCompanies)) {
            throw new Error('Интересные компании должны быть массивом!');
        }
        if (typeof purchasedSharesNumber !== 'number'){
            throw new Error('Количество акций должно быть числом!');
        }
        this.exchangeObserver = exchangeObserver;
        this.balance = balance;
        this.interestingCompanies = interestingCompanies;
        this.purchasedSharesNumber = purchasedSharesNumber;

        this.interestingCompanies.forEach(company => {
            this.exchangeObserver.onUpdateCompany(company.name, () => {
                if (this.isBargain(company)) {
                    this.exchangeObserver.sellShares(company, this);
                }
            });
        });
    }

    isBargain(company) {
        if (!(company instanceof Company)) {
            throw new Error('Передан не объект компании!');
        }
        return (company.sharePriceHistory.previousPriceShare < company.sharePriceHistory.previousPreviousPriceShare && company.sharePrice > company.sharePriceHistory.previousPriceShare)
    }
}

module.exports = {
    ExchangeObserver,
    Company,
    Member
};