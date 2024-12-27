const { readFileSync } = require("fs");
const util = require('util')

async function ApplyDiscountsSql(orderType, promo, new_state) {

  for (let i = 0; i < new_state.itemsInCart.length; i++) {
      let courseItem = new_state.itemsInCart[i];
      if (courseItem.course === undefined) courseItem.course = courseItem.couse;
  }
  //20191218 считаем общую сумму без скидок, убираем лишнией акции на подарок
  let CourseAllSum = 0;
  new_state.itemsInCart.forEach(a=> CourseAllSum += a.present ? 0 : a.course.Price * a.quantity);

  let userDiscounts = JSON.parse(readFileSync('./backend-script-data.json', { encoding: 'utf-8' }))
  //let new_state = { itemsInCart: req.body.itemsInCart };

  let percentDiscounts = userDiscounts.PercentDiscount;
  let dishsDiscounts = userDiscounts.DishDiscount;
  let allCampaign = userDiscounts.AllDiscounts;
  let dishSets = userDiscounts.SetDishDiscount;

  if (orderType == 2) {
      percentDiscounts = percentDiscounts.filter(a => a.Delivery == 1 && a.MaxSum > CourseAllSum && a.MinSum <= CourseAllSum);
      dishsDiscounts = dishsDiscounts.filter(a => a.Delivery == 1 && a.MaxSum > CourseAllSum && a.MinSum <= CourseAllSum);
      allCampaign = allCampaign.filter(a => a.Delivery == 1 && a.MaxSum > CourseAllSum && a.MinSum <= CourseAllSum);
      dishSets = dishSets.filter(a => a.dishes[0].Delivery == 1 && a.MaxSum > CourseAllSum && a.MinSum <= CourseAllSum);
  }

  if (orderType == 1) {
      percentDiscounts = percentDiscounts.filter(a => a.TakeOut == 1 && a.MaxSum > CourseAllSum && a.MinSum <= CourseAllSum);
      dishsDiscounts = dishsDiscounts.filter(a => a.TakeOut == 1 && a.MaxSum > CourseAllSum && a.MinSum <= CourseAllSum);
      allCampaign = allCampaign.filter(a => a.TakeOut == 1 && a.MaxSum > CourseAllSum && a.MinSum <= CourseAllSum);
      dishSets = dishSets.filter(a => a.dishes[0].TakeOut == 1 && a.MaxSum > CourseAllSum && a.MinSum <= CourseAllSum);
  }

  let curDishSets = [];
  //проверим все скидки, найдем наибольшую
  let maxPercentDiscount = { vcode: 0, MinSum: 0, MaxSum: 0, bonusRate: 0, discountPercent: 0 };
  percentDiscounts.forEach(a => {
      if (maxPercentDiscount.vcode == 0) {
          maxPercentDiscount = a;
      } else if (maxPercentDiscount.discountPercent < a.discountPercent) {
          maxPercentDiscount = a;
      }
  })


  //идём по всем блюдам в корзине
  for (let i = 0; i < new_state.itemsInCart.length; i++) {

      let courseItem = new_state.itemsInCart[i];
      if (courseItem.course === undefined) courseItem.course = courseItem.couse;
      if (!courseItem.present) courseItem.present = false;
      courseItem.course.priceWithDiscountOld = courseItem.course.priceWithDiscount;
      courseItem.course.priceWithDiscount = courseItem.course.Price;
      //если есть процентная скидка, сразу её ставим
      if (maxPercentDiscount !== null) {
          courseItem.campaign = maxPercentDiscount.vcode;
          courseItem.priceWithDiscount = (courseItem.course.Price * courseItem.quantity * (100 - maxPercentDiscount.discountPercent) / 100).toFixed(2);
          courseItem.course.priceWithDiscount = (courseItem.course.Price * (100 - maxPercentDiscount.discountPercent) / 100).toFixed(2);
      } else {
          courseItem.priceWithDiscount = courseItem.course.Price * courseItem.quantity;
      }
      //идём по всем сэтам и смотрим, сколько у нас наберётся элементов в сэте
      for (let j = 0; j < dishSets.length; j++) {
          let set = dishSets[j];
          //идём по всем блюдам сэта
          for (let k = 0; k < set.dishes.length; k++) {
              //если нашли блюдо из сэта, то увеличиваем счётчик сэта
              if (courseItem.course.VCode == set.dishes[k].dish && set.PresentAction == courseItem.present) {
                  let curDishSetObj = curDishSets.find(a => a.vcode == set.vcode);
                  if (curDishSetObj === undefined) {
                      curDishSetObj = { ...set, countInCart: 0 };
                      curDishSets.push(curDishSetObj);
                  }
                  curDishSetObj.countInCart += courseItem.quantity;

              }
          }
      }
      

      //идём по всем скидкам на позиции, смотрим что выгоднее, цена по акции или по общей скидки в процентах
      for (let j = 0; j < dishsDiscounts.length; j++) {
          let dishDiscount = dishsDiscounts[j];
          //нашли блюдо в акции
          if (courseItem.course.VCode == dishDiscount.dish && (dishDiscount.promocode == promo || dishDiscount.promocode == null)) {
              //если есть процентная скидка
              if (dishDiscount.price !== null && (courseItem.quantity * dishDiscount.price < courseItem.priceWithDiscount)) {
                  courseItem.campaign = dishDiscount.vcode;
                  courseItem.priceWithDiscount = courseItem.quantity * dishDiscount.price;
                  courseItem.course.priceWithDiscount = dishDiscount.price;
              }
              if (dishDiscount.discountPercent !== null && (courseItem.course.Price * (100 - dishDiscount.discountPercent) / 100) * courseItem.quantity < courseItem.priceWithDiscount) {
                  courseItem.campaign = dishDiscount.vcode;
                  courseItem.course.priceWithDiscount = (courseItem.course.Price * (100 - dishDiscount.discountPercent) / 100).toFixed(2);
                  courseItem.priceWithDiscount = (courseItem.quantity * courseItem.course.Price * (100 - dishDiscount.discountPercent) / 100).toFixed(2);
              }
          }
      }
      //new_state.itemsInCart[i] = courseItem;
  }

  for (let j = 0; j < curDishSets.length; j++) {
      if (curDishSets[j].countInCart == curDishSets[j].dishCount && (curDishSets[j].dishes[0].promocode == promo || curDishSets[j].dishes[0].promocode == null)) {
          for (let i = 0; i < new_state.itemsInCart.length; i++) {
              let courseItem = new_state.itemsInCart[i];
              let dishInSet = curDishSets[j].dishes.find(a => a.dish == courseItem.course.VCode && a.PresentAction == courseItem.present);
              if (dishInSet !== undefined) {
                  courseItem.campaign = curDishSets[j].vcode;
                  courseItem.priceWithDiscount = courseItem.quantity * dishInSet.price;
                  courseItem.course.priceWithDiscount = dishInSet.price;
              }
          }
      }
  }

  

  /*presentAction.forEach(a=> {
      let searchDish = new_state.itemsInCart.filter(b=> a.dish == b.course.VCode);
      if (searchDish.length > 0) {
          if (a.isset == 1){
              
          }
      }
  })*/

  console.log(util.inspect(new_state, false, null, true /* enable colors */))
}

const state1 = {
  itemsInCart: [
      {
          "couse": {
              "VCode": "1307324",
              "Name": "Пицца \"Цыпленок Барбекю\", 33 см",
              "CatVCode": "48",
              "Price": 589,
              "Quality": null,
              "NoResidue": true,
              "EndingOcResidue": 0,
              "CourseDescription": "Соус терияки, сыр моцарелла, куриное филе, бекон, лук фри, соус барбекю, зелень.",
              "Weigth": "650г",
              "Images": [
                  "2FDDD2B5-FB5E-47DE-851E-A2C4E500D937"
              ],
              "CompressImages": [
                  "FAF2892F-7CD1-4DA9-860D-38E711BE81B7"
              ],
              "CookingTime": 6,
              "priceWithDiscountOld": 559,
              "priceWithDiscount": 559
          },
          "quantity": 7,
          "priceWithDiscount": 3913,
          "present": false,
          "campaign": "4430"
      },
      {
          "couse": {
              "VCode": "2144216",
              "Name": "Сладкий пирог с курагой и грецким орехом на слоеном тесте (заказной)",
              "CatVCode": "71",
              "Price": 919,
              "Quality": null,
              "NoResidue": true,
              "EndingOcResidue": 0,
              "CourseDescription": "Курага, жареный грецкий орех, натуральный абрикосовый конфитюр, сахар. Слоеное тесто на натуральных сливках. \nГотовим под заказ, доставляем горячим. Если заказываете курьера, добавьте время на доставку. ",
              "Weigth": "1000г",
              "Images": [
                  "326BB502-8068-4B3B-85CB-24C4378819FE",
                  "A81CFA6B-D935-480D-A816-43329B86C894",
                  "9669FC07-6B04-47CD-8C5E-957D5AA90538",
                  "75609317-021C-4DC3-A070-EAC88AC6309A",
                  "9C76F50E-24F1-4ED7-9801-3F32A26976C9"
              ],
              "CompressImages": [
                  "82D7253B-7B20-457B-B4AA-F6A6A80B50C8",
                  "5D4038CE-2C20-4AC5-87CE-3728CAFFBA88",
                  "1AF6B73E-8818-4CAB-BD4C-8165EAB09238",
                  "B9873546-1E4F-41E2-959D-44795692B3F1",
                  "D4A16EE4-92AE-4182-B69E-75116707806C"
              ],
              "CookingTime": 30,
              "priceWithDiscount": 0.01
          },
          "quantity": 1,
          "priceWithDiscount": 919,
          "present": true,
          "campaign": "5401"
      }
  ]
}

const state2 = {
  "itemsInCart": [
      {
          "couse": {
              "VCode": "1307324",
              "Name": "Пицца \"Цыпленок Барбекю\", 33 см",
              "CatVCode": "48",
              "Price": 589,
              "Quality": null,
              "NoResidue": true,
              "EndingOcResidue": 0,
              "CourseDescription": "Соус терияки, сыр моцарелла, куриное филе, бекон, лук фри, соус барбекю, зелень.",
              "Weigth": "650г",
              "Images": [
                  "2FDDD2B5-FB5E-47DE-851E-A2C4E500D937"
              ],
              "CompressImages": [
                  "FAF2892F-7CD1-4DA9-860D-38E711BE81B7"
              ],
              "CookingTime": 6,
              "priceWithDiscountOld": 559,
              "priceWithDiscount": 559
          },
          "quantity": 7,
          "priceWithDiscount": 3913,
          "present": false,
          "campaign": "4430"
      },
      {
          "couse": {
              "VCode": "2155625",
              "Name": "Сладкий пирог с яблоком и домашней карамелью на слоеном тесте (заказной)",
              "CatVCode": "71",
              "Price": 699,
              "Quality": null,
              "NoResidue": true,
              "EndingOcResidue": 0,
              "CourseDescription": "Свежие яблоки, свежесваренная натуральная карамель, сахар. Слоеное тесто на натуральных сливках. \nДумаете, все знаете про вкусы с яблоком? Вы нежно удивитесь! \nГотовим под заказ, доставляем горячим. Если заказываете курьера, добавьте время на доставку. ",
              "Weigth": "1000г",
              "Images": [
                  "55978008-B682-4DC7-A82D-3AA24392FA3A",
                  "B710C469-54D4-4955-8D75-260FD4DCBC73",
                  "9F6AB660-BCBA-4696-914E-6D329E965A7E",
                  "1FBF6FA7-0A75-480D-BCFA-2D7D946C79F4",
                  "449D6370-9C50-4285-8CE6-2A19DCE6BC00"
              ],
              "CompressImages": [
                  "5CBD9CE9-3AEB-42DD-80D2-D731A45823F9",
                  "5AFBB3F8-B1E9-4F1E-B843-4C78F4F55730",
                  "CC8BDB23-605F-4224-8638-E3DE0F29D825",
                  "4EA49A83-DF08-423A-93D4-6AA3CE2452A0",
                  "E32DB6A4-2F85-44F5-9D0E-043D44CE15C7"
              ],
              "CookingTime": 30,
              "priceWithDiscountOld": "699.00",
              "priceWithDiscount": "699.00"
          },
          "quantity": 1,
          "priceWithDiscount": 699,
          "present": true,
          "campaign": "36"
      }
  ]
}
ApplyDiscountsSql(1, null, state1)