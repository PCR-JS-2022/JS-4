/**
 * @typedef {(company: Company) => void} listenerCallBack
 */

class ExchangeObserver {
    /**
     * Создаёт экзмепляр биржи
     * @param {Object<string, Array<listenerCallBack>} listeners - словарь, в котором ключи - названия компаний,
     * а значения - функции, которые вызываются при изменении цены акции этой компании
     */
    constructor(listeners) {
        this.listeners = typeof listeners !== 'object' ? new Map() : listeners;
    }

    /**
     * Метод, осуществляющий продажу акций компании участнику биржи
     * @param {Company} company
     * @param {Member} member
     */
    sellShares(company, member) {
        const totalPrice = member.purchasedSharesNumber * company.sharePrice;

        if (totalPrice > member.balance) {
            throw new Error('Сумма превышает баланс пользователя');
        };

        if (member.purchasedSharesNumber > company.shareCount) {
            throw new Error('У компании не хватает акций');
        };

        company.shareCount -= member.purchasedSharesNumber;
        member.balance -= totalPrice;
    }

    /**
     * Метод, уведомляющий всех подписчиков компании об изменениях
     * @param {Company} company
     */
    updateCompany(company) {
        this.listeners[company.name].forEach(listener => listener(company));
    }

    /**
     * Метод, позволяющий подписаться на уведомления об изменениях компании
     * @param {string} companyName
     * @param {listenerCallBack} cb
     */
    onUpdateCompany(companyName, cb) {
        if (typeof companyName !== "string") {
            throw new Error("Некорректное имя компании");
        };

        if (!this.listeners[companyName]) {
            this.listeners[companyName] = [cb];
        }
        else {
            this.listeners[companyName].push(cb);
        };
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
        if (typeof name !== 'string' || typeof shareCount !== 'number' || typeof sharePrice !== 'number') {
            throw new Error('Некорректные данные компании');
        };

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
        if (typeof newPrice !== 'number') {
            throw new Error('Цена акции некорректна');
        };

        const previousPrice = this.sharePrice;
        this.sharePrice = newPrice;

        if (this.shareCount > 0 && previousPrice < newPrice) {
            this.exchangeObserver.updateCompany(this);
        };
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

        this.interestingCompanies.forEach(company => {
            exchangeObserver.onUpdateCompany(company.name, (comp) => { exchangeObserver.sellShares(comp, this); });
        });
    }
}

module.exports = { ExchangeObserver, Company, Member };
