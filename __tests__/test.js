const { Company, ExchangeObserver, Member } = require("../index");
const assert = require("assert");

describe("ExchangeObserver", () => {
  it("Объект корректно создается", () => {
    const exchange = new ExchangeObserver();

    assert.equal(typeof exchange.sellShares, "function");
    assert.equal(typeof exchange.updateCompany, "function");
    assert.equal(typeof exchange.onUpdateCompany, "function");
  });
});

describe("Company", () => {
  it("Объект корректно создается", () => {
    const exchange = new ExchangeObserver();
    const company = new Company(exchange, "Green Bank", 100, 100);

    assert.equal(company.name, "Green Bank");
    assert.equal(company.sharePrice, 100);
    assert.equal(company.exchangeObserver instanceof ExchangeObserver, true);
    assert.equal(company.shareCount, 100);
    assert.equal(typeof company.updatePrice, "function");
  });
});

describe("Member", () => {
  it("Объект корректно создается", () => {
    const exchange = new ExchangeObserver();
    const company = new Company(exchange, "Green Bank", 100, 100);
    const member = new Member(exchange, 10000, [company], 10);

    assert.equal(member.exchangeObserver instanceof ExchangeObserver, true);
    assert.equal(member.balance, 10000);
    assert.deepEqual(member.interestingCompanies, [company]);
    assert.deepEqual(member.purchasedSharesNumber, 10);
  });

  it("Вовремя покупает акции одной компании (1)", () => {
    const exchange = new ExchangeObserver();
    const company = new Company(exchange, "Green Bank", 100, 100);
    const member = new Member(exchange, 10000, [company], 10);

    company.updatePrice(70);
    company.updatePrice(73);
    assert.equal(company.shareCount, 90);
    assert.equal(member.balance, 10000 - 73 * 10);
  });

  it("Корректно обрабатывает исключение при попытке купить большее кол-во акций, чем есть у компании", () => {
    assert.throws(() => {
      const exchange = new ExchangeObserver();
      const company = new Company(exchange, "Green Bank", 100, 100);
      const member = new Member(exchange, 10000, [company], 1000);

      company.updatePrice(70);
      company.updatePrice(73);
    });
  });

  it("Корректно обрабатывает исключение при попытке купить акций на сумму превышающюю баланс", () => {
    assert.throws(() => {
      const exchange = new ExchangeObserver();
      const company = new Company(exchange, "Green Bank", 100, 100);
      const member = new Member(exchange, 10, [company], 1);

      company.updatePrice(70);
      company.updatePrice(73);
    });
  });
});
