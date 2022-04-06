/**
 * @typedef {(company: Company) => void} listenerCallBack
 */

/** Класс биржи */
class ExchangeObserver {
    /**
     * Создаёт экзмепляр биржи
     * @param {Map<string, Array<listenerCallBack>>} listeners - словарь, в котором ключи - названия компаний,
     * а значения - функции, которые вызываются при изменении цены акции этой компании
     */
    constructor(listeners = new Map()) {
        if (!(listeners instanceof Map))
            listeners = new Map(Object.entries(listeners));

        this.listeners = listeners;
    }

    /**
     * Метод, осуществляющий продажу акций компании участнику биржи
     * @param {Company} company
     * @param {Member} member
     */
    sellShares(company, member) {
        if (this.isSellingPossible(company, member)) {
            company.shareCount -= member.purchasedSharesNumber;
            member.balance -= member.purchasedSharesNumber * company.sharePrice;
        } else {
            throw Error("Невозможно купить акции");
        }
    }

    /**
     * Метод, уведомляющий всех подписчиков компании об изменениях
     * @param {Company} company
     */
    updateCompany(company) {
        const callBacks = this.listeners.get(`${company.name}`);
        callBacks.forEach((callBack) => {
            callBack(company);
        });
    }

    /**
     * Метод, позволяющий подписаться на уведомления об изменениях компании
     * @param {string} companyName
     * @param {listenerCallBack} cb
     */
    onUpdateCompany(companyName, cb) {
        if (this.listeners.has(companyName))
            this.listeners.get(companyName).push(cb);
        else this.listeners.set(companyName, [cb]);
    }

    isSellingPossible(company, member) {
        return !(
            company.shareCount < member.purchasedSharesNumber ||
            company.sharePrice * member.purchasedSharesNumber > member.balance
        );
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
        this.priceHistory = [sharePrice];
    }

    /**
     * Метод, обновляющий цену акции компании
     * @param {number} newPrice
     */
    updatePrice(newPrice) {
        this.sharePrice = newPrice;
        this.priceHistory.push(newPrice);

        if (this.shareCount !== 0) {
            this.exchangeObserver.updateCompany(this);
        }
    }

    isPriceBeneficial() {
        if (this.priceHistory.length < 3) {
            return false;
        } else {
            const lastIndex = this.priceHistory.length - 1;
            return (
                this.priceHistory[lastIndex - 2] >
                    this.priceHistory[lastIndex - 1] &&
                this.priceHistory[lastIndex - 1] < this.priceHistory[lastIndex]
            );
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
        purchasedSharesNumber = 10
    ) {
        this.exchangeObserver = exchangeObserver;
        this.balance = balance;
        this.interestingCompanies = interestingCompanies;
        this.purchasedSharesNumber = purchasedSharesNumber;

        this.interestingCompanies.forEach((interestingCompany) =>
            exchangeObserver.onUpdateCompany(
                interestingCompany.name,
                (company) => {
                    if (company.isPriceBeneficial())
                        this.exchangeObserver.sellShares(
                            interestingCompany,
                            this
                        );
                }
            )
        );
    }
}

module.exports = { ExchangeObserver, Company, Member };
