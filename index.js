
class ExchangeObserver {

  constructor(listeners = {}) { 
    this.listeners = listeners;
  };
  
  sellShares(company, member) {

    if (!company instanceof Company || !member instanceof Member)
      throw new Error('Неверные входные данные');

    if (member.balance < (member.purchasedSharesNumber * company.bestPrice))
      throw new Error ('На балансе клиента не достаточно средств');
      
    if (company.shareCount < member.purchasedSharesNumber)
      throw new Error ('У компании недостаточно акций для продажи');

    member.balance -= (member.purchasedSharesNumber * company.bestPrice);
    company.shareCount -= member.purchasedSharesNumber;
  };

  updateCompany(company) {

		if (!company instanceof Company)
			throw new Error('Некорректная компания');

		this.listeners[company.name].forEach(listener => listener(company));
  };
  
  onUpdateCompany(companyName, cb) {

    if (!companyName === 'string' || !companyName)
      throw new Error('Некорректное имя компании');
      
    if (!cb === 'function')
      throw new Error('вторым параметром должна быть функция');

    if (this.listeners[companyName] === undefined){
      this.listeners = {
        [companyName]: [cb]
      };
    }
    else 
      this.listeners[companyName].push(cb);
  };
};

class Company {

  constructor(exchangeObserver, name, shareCount = 0, sharePrice = 0) {

    if (!exchangeObserver instanceof ExchangeObserver || 
      !name === 'string' || !name || 
      !shareCount === 'number' ||
      !sharePrice === 'number')
      throw new Error('Не верные входные данные');

    this.exchangeObserver = exchangeObserver;
    this.name = name;
    this.shareCount = shareCount;
    this.sharePrice = sharePrice;
    this.previosPrice = undefined;
    this.priceflow = undefined;
    this.bestPrice = undefined;
  };
  
  updatePrice(newPrice) {
    
    if (!typeof(newPrice) === "number" || !newPrice)
      throw new Error ("Входные данные не корреткны");
    
    if (newPrice > this.sharePrice){

      if (this.previosPrice > this.sharePrice && this.priceflow === 'falling')
        this.bestPrice = newPrice;
      
      this.priceflow = 'rising';
    };
   
    if(newPrice < this.sharePrice)
      this.priceflow = 'falling';

    this.previosPrice = this.sharePrice;
    this.sharePrice = newPrice;
    
    if(this.shareCount > 0)
      this.exchangeObserver.updateCompany(this);
  };
};

class Member {

  constructor(
    exchangeObserver,
    balance,
    interestingCompanies = [],
    purchasedSharesNumber = 0
  ) {

    if (!exchangeObserver === ExchangeObserver ||
      !balance === 'number' ||
      !purchasedSharesNumber === 'number')
      throw new Error('Не верные входные данные');

    this.exchangeObserver = exchangeObserver;
    this.balance = balance;
    this.interestingCompanies = interestingCompanies;
    this.purchasedSharesNumber = purchasedSharesNumber;

    this.interestingCompanies.forEach(company => 
      this.exchangeObserver.onUpdateCompany(
      company.name, () =>{

        if (company.previosPrice < company.sharePrice && company.priceflow === "rising")
          this.exchangeObserver.sellShares(company, this);
      })); 
  };
};

module.exports = { ExchangeObserver, Company, Member };

