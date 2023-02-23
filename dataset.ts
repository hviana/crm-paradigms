import {
  Action,
  add,
  and,
  anyo,
  appendo,
  arrayo,
  Condition,
  conso,
  delay,
  div,
  emptyo,
  eq,
  facts,
  fail,
  fbeMetaclass,
  firsto,
  ge,
  gt,
  ImmutableMap,
  Instigation,
  isLVar,
  le,
  lt,
  LVar,
  lvar,
  membero,
  mul,
  not,
  NotifyingHolon,
  numbero,
  or,
  Premise,
  resto,
  Rule,
  run,
  stringo,
  sub,
  succeed,
  walk,
} from "./deps.ts";
import { ClientFBE } from "./fbes.ts";

export class Dataset {
  static clients: { [key: string]: typeof ClientFBE } = {};
  static segment: any = {};
  static clientsOnSegment: string[] = [];
  static genClients(qty: number = 1000) {
    for (var i = 1; i < qty + 1; i++) {
      const name = `Client${i}`;
      Dataset.clients[name] = new ClientFBE({
        onNotification: (n: any) => {
          if (n.value.purchases) {
            Dataset.clients[name].purchasesValues = n.value.purchases;
            Dataset.clients[name].averageSpendValue = n.value.averageSpend;
          }
        },
      }, {
        onNotification: (n: any) => {
          if (n.value.accessedPages) {
            Dataset.clients[name].accessedPagesValues = n.value.accessedPages;
          }
        },
      }, {
        onNotification: (n: any) => {
          if (n.value.gender) {
            Dataset.clients[name].genderValue = n.value.gender;
          }
        },
      }, {
        onNotification: (n: any) => {
          if (n.value.birthMonth) {
            Dataset.clients[name].birthMonthValue = n.value.birthMonth;
          }
        },
      });
      Dataset.clients[name].randomGender.receive({
        time: Date.now(),
      });
      Dataset.clients[name].randomBirthMonth.receive({
        time: Date.now(),
      });
      Dataset.clients[name].purchasesValues = [];
      Dataset.clients[name].accessedPagesValues = [];
    }
    const segmentMethods: Function[] = [];
    for (const name in Dataset.clients) {
      const f = function (im: any, data: { [key: string]: any }) {
        if (!im["clients"]) {
          im["clients"] = [];
        }
        im["clients"].push(name);
        return {
          clients: im["clients"],
        };
      };
      Object.defineProperty(f, "name", {
        value: `add${name}`,
        writable: false,
      });
      segmentMethods.push(f);
    }
    const SegmentFBE = fbeMetaclass(
      "clients",
      ...segmentMethods,
    );
    Dataset.segment = new SegmentFBE({
      onNotification: (n: any) => Dataset.clientsOnSegment = n.value.clients,
    });
    for (const name in Dataset.clients) {
      const premise1 = new NotifyingHolon({
        f: Premise.searchInLeft((item: any) => item.value > 1000),
      });
      const premise2 = new NotifyingHolon({
        f: Premise.leftIsbiggerThan(500),
      });
      const premise3 = new NotifyingHolon({
        f: Premise.leftIs("female"),
      });
      const premise4 = new NotifyingHolon({
        f: Premise.leftIs("02"),
      });

      const premise5 = new NotifyingHolon({
        f: Premise.searchInLeft((item: any) => item.name.includes("knit")),
      });
      const premise6 = new NotifyingHolon({
        f: Premise.searchInLeft((item: any) => item.name.includes("tricot")),
      });
      const premise7 = new NotifyingHolon({
        f: Premise.searchInLeft((item: any) => item.name.includes("tailoring")),
      });
      const subCondition = new NotifyingHolon({
        f: Condition.or,
      });
      const condition = new NotifyingHolon({
        f: Condition.and,
      });
      const rule = new NotifyingHolon({
        f: Rule.default,
      });
      const action = new NotifyingHolon({
        f: Action.default,
      });
      const instigation = new NotifyingHolon({
        f: Instigation.default,
      });

      //@ts-ignore
      Dataset.clients[name].purchases.connect({ left: premise1 });
      //@ts-ignore
      Dataset.clients[name].averageSpend.connect({ left: premise2 });
      //@ts-ignore
      Dataset.clients[name].gender.connect({ left: premise3 });
      //@ts-ignore
      Dataset.clients[name].birthMonth.connect({ left: premise4 });
      //@ts-ignore
      Dataset.clients[name].accessedPages.connect({ left: premise5 });
      //@ts-ignore
      Dataset.clients[name].accessedPages.connect({ left: premise6 });
      //@ts-ignore
      Dataset.clients[name].accessedPages.connect({ left: premise7 });

      premise1.connect({ 1: condition });
      premise2.connect({ 2: condition });
      premise3.connect({ 3: condition });
      premise4.connect({ 4: condition });

      premise5.connect({ 1: subCondition });
      premise6.connect({ 2: subCondition });
      premise7.connect({ 3: subCondition });

      subCondition.connect({ 5: condition });

      condition.connect({ default: rule });
      rule.connect({ default: action });
      action.connect({ default: instigation });
      //@ts-ignore
      instigation.connect({ default: Dataset.segment["add" + name] });
    }
  }
  static treePercent(): boolean {
    return (Math.floor(Math.random() * 100) + 1) > 97;
  }
  static randomBehavior() {
    for (const clientName in Dataset.clients) {
      if (Dataset.treePercent()) {
        Dataset.clients[clientName].purchase.receive({ time: Date.now() });
      }
      if (Dataset.treePercent()) {
        Dataset.clients[clientName].accessProduct.receive({
          time: Date.now(),
        });
      }
    }
  }
  static updateFactBase(): any {
    var accessedPage: any[][] = [];
    var purchaseAmountSpent: any[][] = [];
    var averageSpend: any[][] = [];
    var productsCategoriesObj: any = {};
    var gender: any[][] = [];
    var birthMonth: any[][] = [];
    for (const clientName in Dataset.clients) {
      const client = Dataset.clients[clientName];
      for (const purchase of client.purchasesValues) {
        purchaseAmountSpent.push([clientName, purchase.value]);
      }
      for (const page of client.accessedPagesValues) {
        if (!productsCategoriesObj[page.name]) {
          if (page.name.includes("knit")) {
            productsCategoriesObj[page.name] = "knit";
          } else if (page.name.includes("sweatshirt")) {
            productsCategoriesObj[page.name] = "sweatshirt";
          } else if (page.name.includes("leather")) {
            productsCategoriesObj[page.name] = "leather";
          } else if (page.name.includes("tricot")) {
            productsCategoriesObj[page.name] = "tricot";
          } else if (page.name.includes("tailoring")) {
            productsCategoriesObj[page.name] = "tailoring";
          }
        }
        accessedPage.push([clientName, page.name]);
      }
      averageSpend.push([clientName, client.averageSpendValue]);
      gender.push([clientName, client.genderValue]);
      birthMonth.push([clientName, client.birthMonthValue]);
    }
    var productCategory: any[][] = [];
    for (var product in productsCategoriesObj) {
      productCategory.push([product, productsCategoriesObj[product]]);
    }
    return {
      accessedPage: facts(...accessedPage),
      purchaseAmountSpent: facts(...purchaseAmountSpent),
      averageSpend: facts(...averageSpend),
      productCategory: facts(...productCategory),
      gender: facts(...gender),
      birthMonth: facts(...birthMonth),
    };
  }
  static getSegmentPON(): string[] {
    return Dataset.clientsOnSegment;
  }
  static getSegmentIP(): string[] {
    const segment: string[] = [];
    for (const clientName in Dataset.clients) {
      const client = Dataset.clients[clientName];
      var purchasedOverAThousand = false;
      var accessKnitOrTricotOrTailoring = false;
      for (const purchase of client.purchasesValues) {
        if (purchase.value > 1000) {
          purchasedOverAThousand = true;
          break;
        }
      }
      for (const page of client.accessedPagesValues) {
        if (
          page.name.includes("knit") || page.name.includes("tricot") ||
          page.name.includes("tailoring")
        ) {
          accessKnitOrTricotOrTailoring = true;
          break;
        }
      }
      if (
        (client.averageSpendValue > 500) && purchasedOverAThousand &&
        accessKnitOrTricotOrTailoring && (client.genderValue == "female") &&
        (client.birthMonthValue == "02")
      ) {
        segment.push(clientName);
      }
    }
    return segment;
  }
  static async getSegmentLP(
    accessedPage: any,
    purchaseAmountSpent: any,
    averageSpend: any,
    productCategory: any,
    gender: any,
    birthMonth: any,
  ): Promise<any> {
    const segment = (x: any) => {
      let a = lvar();
      let b = lvar();
      let c = lvar();
      return and(
        () => averageSpend(x, b),
        () => gt(b, 500),
        () => gender(x, "female"),
        () => birthMonth(x, "02"),
        () => purchaseAmountSpent(x, a),
        () => gt(a, 1000),
        () => accessedPage(x, c),
        () =>
          or(
            () => productCategory(c, "knit"),
            () => productCategory(c, "tricot"),
            () => productCategory(c, "tailoring"),
          ),
      );
    };
    const x = lvar("x");
    return run([x], segment(x));
  }
  static async runBenchmark(
    iterations = 20,
    delayMs = 3000,
    datasetSize = 1000,
  ) {
    var results: any = {
      nop: [],
      ip: [],
      lp: [],
    };
    try {
      results = JSON.parse(await Deno.readTextFile("./results.json"));
    } catch (e) {
      //console.log(e);
    }
    Dataset.genClients(datasetSize);
    await delay(delayMs);
    for (var i = 1; i < iterations + 1; i++) {
      console.log(`It ${i}`);
      Dataset.randomBehavior();
      await delay(delayMs);
      const factsBase = Dataset.updateFactBase();
      const initLpTime = performance.now();
      Dataset.getSegmentLP(
        factsBase.accessedPage,
        factsBase.purchaseAmountSpent,
        factsBase.averageSpend,
        factsBase.productCategory,
        factsBase.gender,
        factsBase.birthMonth,
      );
      const endLpTime = performance.now();
      const initIpTime = performance.now();
      Dataset.getSegmentIP();
      const endIpTime = performance.now();
      const initPonTime = performance.now();
      Dataset.getSegmentPON();
      const endPonTime = performance.now();
      results.lp.push(endLpTime - initLpTime);
      results.ip.push(endIpTime - initIpTime);
      results.nop.push(endPonTime - initPonTime);
    }
    console.log(
      `Benchmark: ${results.ip.length} iterations, ${
        Object.keys(Dataset.clients).length
      } clients.`,
    );
    console.log(
      `Average - IP: ${Dataset.average(results.ip)} ms, NOP: ${
        Dataset.average(results.nop)
      } ms, LP: ${Dataset.average(results.lp)} ms.

      Deviation - IP: ${Dataset.deviation(results.ip)} ms, NOP: ${
        Dataset.deviation(results.nop)
      } ms, LP: ${Dataset.deviation(results.lp)} ms.`,
    );
    try {
      await Deno.writeTextFile("./results.json", JSON.stringify(results));
    } catch (e) {
      console.log(e);
    }
  }
  static deviation(arr: number[]): number {
    // Creating the mean with Array.reduce
    let mean = arr.reduce((acc, curr) => {
      return acc + curr;
    }, 0) / arr.length;
    // Assigning (value - mean) ^ 2 to every array item
    arr = arr.map((k) => {
      return (k - mean) ** 2;
    });
    // Calculating the sum of updated array
    let sum = arr.reduce((acc, curr) => acc + curr, 0);
    // Calculating the variance
    let variance = sum / arr.length;
    // Returning the Standered deviation
    return Math.sqrt(sum / arr.length);
  }
  static average(arr: number[]): number {
    var sum = 0;
    for (var number of arr) {
      sum += number;
    }
    const average = sum / arr.length;
    return average;
  }
}
