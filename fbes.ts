import { fbeMetaclass } from "./deps.ts";
const ClientFBE = fbeMetaclass(
  "purchases",
  "accessedPages",
  "gender",
  "birthMonth",
  "averageSpend",
  function purchase(im: any, data: { [key: string]: any }) {
    if (!im["purchases"]) {
      im["purchases"] = [];
    }
    const min = 100;
    const max = 2000;
    im["purchases"].push({
      name: `Order ${crypto.randomUUID()}`,
      value: Math.floor(Math.random() * (max - min + 1) + min),
    });
    var sum = 0;
    for (var order of im["purchases"]) {
      sum += order.value;
    }
    const average = sum / im["purchases"].length;
    return {
      purchases: im["purchases"],
      averageSpend: average,
    };
  },
  function accessProduct(im: any, data: { [key: string]: any }) {
    if (!im["accessedPages"]) {
      im["accessedPages"] = [];
    }
    const categories = ["knit", "sweatshirt", "leather", "tricot", "tailoring"];
    im["accessedPages"].push({
      name: `Shirt of ${
        categories[Math.floor(Math.random() * categories.length)]
      }`,
    });
    return {
      accessedPages: im["accessedPages"],
    };
  },
  function randomGender(im: any, data: { [key: string]: any }) {
    const genders = ["male", "female"];
    return {
      gender: genders[Math.floor(Math.random() * genders.length)],
    };
  },
  function randomBirthMonth(im: any, data: { [key: string]: any }) {
    const months = [
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
    ];
    return {
      birthMonth: months[Math.floor(Math.random() * months.length)],
    };
  },
);

export { ClientFBE };
