const check_name = (name) => {
    if (typeof name !== 'string') {
        throw new Error("Неверное имя")
    }
}


const check_function = (func) => {
    if (typeof func !== 'function') {
        throw new Error("Неверная функция")
    }
} 


const check_valid_debiting_operation_with_balance = (
        price, 
        balance
    ) => {
    if (price > balance) {
        throw new Error("Недостаточно средств");
    }
}


const check_valid_debiting_operation_with_stock = (
        purchasedSharesNumber, 
        shareCount
    ) => {
    if (purchasedSharesNumber > shareCount) {
        throw new Error("Нет данного количество акций в обороте");
    }
}


const check_valid_count_stock = (count_stock) => {
    if (typeof count_stock !== 'number') {
        throw new Error("Некоректно введено количество акций");
    }
}


const check_valid_price = (price) => {
    if (typeof price !== 'number') {
        throw new Error("Некоректно введена цена");
    }
}


const check_balance = (balance) => {
    if (typeof balance !== 'number') {
        throw new Error("Некоректно введен баланс");
    }
}


const check_interesting_companies = (interestingCompanies) => {
    if (! Array.isArray(interestingCompanies)) {
        throw new Error("Неверные компании");
    }
}

module.exports = {
    check_function,
    check_name,
    check_valid_debiting_operation_with_balance,
    check_valid_debiting_operation_with_stock,
    check_valid_price,
    check_valid_count_stock,
    check_interesting_companies,
    check_balance
}