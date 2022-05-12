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
        if (typeof listeners !== 'object')
            throw new Error('Некорректный словарь listeners')


        this.listeners = listeners
    }

    /**
     * Метод, осуществляющий продажу акций компании участнику биржи
     * @param {Company} company
     * @param {Member} member
     */
    sellShares(company, member) {
        if (!(member instanceof Member))
            throw new Error('Некорректный входной параметр участник');


        if (!(company instanceof Company))
            throw new Error('Некорректный входной параметр компания');


        if (member.purchasedSharesNumber > company.shareCount)
            throw new Error('У комапнии бабок нема :(')

        const {purchasedSharesNumber, balance} = member;
        const {sharePrice} = company;
        const totalPrice = purchasedSharesNumber * sharePrice;

        if (totalPrice > balance)
            throw new Error('У мембера бабок нема');

        member.balance-= totalPrice;

        company.shareCount -= purchasedSharesNumber;
    }

    /**
     * Метод, уведомляющий всех подписчиков компании об изменениях
     * @param {Company} company
     */
    updateCompany(company) {
        if (!(company instanceof Company))
            throw new Error('Некорректная компания')

        for (let listener of this.listeners[company.name]) {
            listener(company)
        }
    }

    /**
     * Метод, позволяющий подписаться на уведомления об изменениях компании
     * @param {string} companyName
     * @param {listenerCallBack} cb
     */
    onUpdateCompany(companyName, cb) {
        if (typeof companyName !== 'string' || !companyName)
            throw new Error('Некорректный параметр имя компании')

        if (typeof cb !== 'function')
            throw new Error('Второй параметр не функция!')

        if (this.listeners[companyName]) {
            this.listeners[companyName].push(cb)
        } else {
            this.listeners[companyName] = [cb]
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
        if (!(exchangeObserver instanceof ExchangeObserver))
            throw new Error('Некорректный параметр exchangeObserver')
        if (typeof name !== 'string' || !name)
            throw new Error('Некорректный параметр имя компании')
        if (typeof shareCount !== 'number')
            throw new Error('Некорректный параметр количество акций')
        if (typeof sharePrice !== 'number')
            throw new Error('Некорректный параметр цена акцио')


        this.exchangeObserver = exchangeObserver
        this.name = name
        this.shareCount = shareCount

        this.sharePrice = sharePrice;
        this.prevPrice = this.sharePrice;
        this.oldPrevPrice = this.prevPrice;
    }

    /**
     * Метод, обновляющий цену акции компании
     * @param {number} newPrice
     */
    updatePrice(newPrice) {
        if (typeof newPrice !== 'number')
            throw new Error('Некорректный параметр цена')

        this.oldPrevPrice = this.prevPrice;
        this.prevPrice = this.sharePrice;
        this.sharePrice = newPrice;

        if (this.shareCount !== 0) {
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
    constructor(
        exchangeObserver, balance, interestingCompanies = [], purchasedSharesNumber = 10) {
        if (!(exchangeObserver instanceof ExchangeObserver))
            throw new Error('Некорректный параметр биржа')
        if (typeof balance !== 'number')
            throw new Error('Некорректный параметр баланс участника')
        if (!Array.isArray(interestingCompanies))
            throw new Error('Некорректный параметр массив компаний')
        if (typeof purchasedSharesNumber !== 'number')
            throw new Error('Некорректный параметр количество покупаемых акций')

        this.exchangeObserver = exchangeObserver
        this.balance = balance
        this.interestingCompanies = interestingCompanies
        this.purchasedSharesNumber = purchasedSharesNumber

        this.interestingCompanies.forEach(company => {
            this.exchangeObserver.onUpdateCompany(company.name, () => {
                if (company.prevPrice < company.sharePrice && company.oldPrevPrice > company.prevPrice) {
                    this.exchangeObserver.sellShares(company, this)
                }
            })
        })
    }
}

module.exports = {ExchangeObserver, Company, Member};
