import type { MenuItem } from "../types";

export const categories = [
  "Tacos",
  "Tortas",
  "Burritos",
  "Quesadillas",
  "Antojitos",
  "Bebidas",
  "Hot Dogs",
  "Extras",
];

export const menuItems: Record<string, MenuItem[]> = {
  Tacos: [
    {
      name: "Regular Tacos",
      price: "$2.00",
      image: "/images/regular_tacos.png",
      desc: "Elige proteína: fajita, pollo, pastor o chorizo. Barbacoa, campechano o tripa +$2.50 c/u. Pregunta por chile toreado.",
      enDesc:
        "Choose your protein: fajita, chicken, pastor or chorizo. Barbacoa, campechano or tripe +$2.50 each. Ask for grilled jalapeño.",
    },
    {
      name: "Mini Tacos",
      price: "$5.00",
      image: "/images/mini_tacos.png",
      desc: "4 mini tacos. Elige proteína: fajita, pollo, pastor o chorizo.",
      enDesc:
        "4 mini tacos. Choose your protein: fajita, chicken, pastor or chorizo.",
    },
    {
      name: "Special Tacos",
      price: "$8.00",
      image: "/images/special_tacos.png",
      desc: "4 tacos con proteína a elegir, cebolla asada, cilantro fresco y queso.",
      enDesc:
        "4 tacos with your choice of protein, grilled onions, fresh cilantro and cheese.",
    },
  ],
  Tortas: [
    {
      name: "Torta Mexicana",
      price: "$9.00",
      image: "/images/torta_mexicana.png",
      desc: "Torta mexicana preparada al momento con proteína a elegir.",
      enDesc: "Mexican torta made to order with your choice of protein.",
    },
  ],
  Burritos: [
    {
      name: "Burrito",
      price: "$11.00",
      image: "/images/burrito.png",
      desc: "Burrito preparado con proteína a elegir: pollo, fajita, pastor o chorizo.",
      enDesc:
        "Burrito made with your choice of protein: chicken, fajita, pastor or chorizo.",
    },
    {
      name: "Burrito Special",
      price: "$13.00",
      image: "/images/burrito_especial.png",
      desc: "Burrito especial con 2 proteínas a elegir.",
      enDesc: "Special burrito with your choice of 2 proteins.",
    },
  ],
  Quesadillas: [
    {
      name: "Quesadilla",
      price: "$10.00",
      image: "/images/quesadillas.png",
      desc: "Tortilla de harina con queso derretido y proteína a elegir.",
      enDesc: "Flour tortilla with melted cheese and your choice of protein.",
    },
  ],
  Antojitos: [
    {
      name: "Sope",
      price: "$11.00",
      image: "/images/sopes.png",
      desc: "3 sopes tradicionales con frijoles refritos, queso y proteína a elegir.",
      enDesc:
        "3 traditional sopes with refried beans, cheese and your choice of protein.",
    },
    {
      name: "Gordita",
      price: "$10.00",
      image: "/images/gorditas.png",
      desc: "Gordita de maíz hecha de masa, frita y rellena con proteína a elegir.",
      enDesc:
        "Corn gordita made from masa, fried and filled with your choice of protein.",
    },
  ],
  Bebidas: [
    {
      name: "Horchata",
      image: "/images/horchata.png",
      price: "$3.00",
      desc: "Agua fresca de horchata.",
      enDesc: "Traditional horchata drink.",
    },
    {
      name: "Jamaica",
      image: "/images/jamaica.png",
      price: "$3.00",
      desc: "Agua fresca de jamaica.",
      enDesc: "Fresh hibiscus drink.",
    },
    {
      name: "Pepino con Limón",
      enName: "Cucumber Lime",
      image: "/images/pepino-limon.png",
      price: "$3.00",
      desc: "Agua fresca de pepino con limón.",
      enDesc: "Fresh cucumber and lime drink.",
    },
    {
      name: "Jarritos",
      image: "/images/jarritos.png",
      price: "$2.50",
      desc: "Refresco Jarritos.",
      enDesc: "Jarritos soft drink.",
    },
    {
      name: "Coca-Cola Mexicana",
      enName: "Mexican Coke",
      image: "/images/cocacola-mexicana.png",
      price: "$3.50",
      desc: "Coca-Cola mexicana de vidrio.",
      enDesc: "Mexican Coca-Cola in a glass bottle.",
    },
    {
      name: "Coca-Cola en lata",
      enName: "Coca-Cola Can",
      image: "/images/cocacola-lata.png",
      price: "$1.50",
      desc: "Refresco Coca-Cola en lata.",
      enDesc: "Coca-Cola soft drink in a can.",
    },
  ],
  "Hot Dogs": [
    {
      name: "Street Hot Dog",
      price: "$12.00",
      image: "/images/street_hot_dog.png",
      desc: "Hot dog estilo callejero con salchicha, tocino y papas.",
      enDesc: "Street-style hot dog with sausage, bacon and fries.",
    },
  ],
  Extras: [
    {
      name: "Salchipapas",
      price: "$7.00",
      image: "/images/salchipapas.png",
      desc: "Papas fritas con salchicha y aderezos.",
      enDesc: "French fries with sliced sausage and toppings.",
    },
  ],
};
