import type { MenuItem } from "../types";

export const categories = [
  "Tacos",
  "Tortas",
  "Burritos",
  "Especialidades",
  "Bebidas",
  "Hot Dogs",
  "Extras",
];

export const menuItems: Record<string, MenuItem[]> = {
  Tacos: [
    {
      name: "Regular Tacos",
      price: "$2.00",
      image: "/images/Regular_tacos.jpg",
      desc: "Taco individual a tu elección",
      enDesc: "Individual taco of your choice",
    },
    {
      name: "Mini Tacos",
      price: "$5.00",
      image: "/images/Mini_tacos.jpg",
      desc: "Orden de 4 mini tacos",
      enDesc: "Order of 4 mini tacos",
    },
    {
      name: "Special Tacos",
      price: "$8.00",
      image: "/images/Special_tacos.jpg",
      desc: "Orden de 4 tacos de fajita beef",
      enDesc: "Order of 4 fajita beef tacos",
    },
  ],
  Tortas: [
    {
      name: "Torta Mexicana",
      price: "$9.00",
      image: "/images/Torta_mexicana.jpg",
      desc: "Torta mexicana preparada al momento",
      enDesc: "Mexican torta made to order",
    },
  ],
  Burritos: [
    {
      name: "Burrito",
      price: "$11.00",
      image: "/images/Burrito.jpg",
      desc: "Burrito preparado con tu proteína favorita",
      enDesc: "Burrito made with your favorite protein",
    },
    {
      name: "Burrito Special",
      price: "$13.00",
      image: "/images/Burrito_especial.jpg",
      desc: "Burrito especial con sabor auténtico",
      enDesc: "Special burrito with authentic flavor",
    },
  ],
  Especialidades: [
    {
      name: "Quesadilla",
      price: "$10.00",
      image: "/images/Quesadillas.jpg",
      desc: "Quesadilla caliente hecha al momento",
      enDesc: "Hot quesadilla made to order",
    },
    {
      name: "Sope",
      price: "$11.00",
      image: "/images/Sopes.jpg",
      desc: "Sope tradicional mexicano",
      enDesc: "Traditional Mexican sope",
    },
    {
      name: "Gordita",
      price: "$10.00",
      image: "/images/Gorditas.jpg",
      desc: "Gordita preparada con auténtico sabor",
      enDesc: "Gordita prepared with authentic flavor",
    },
  ],
Bebidas: [
  {
    name: "Horchata",
    image: "/images/horchata.png",
    price: "$3.00",
    desc: "Agua fresca tradicional mexicana",
    enDesc: "Traditional Mexican fresh drink",
  },

  {
    name: "Jamaica",
    image: "/images/jamaica.png",
    price: "$3.00",
    desc: "Agua fresca natural de jamaica",
    enDesc: "Natural hibiscus fresh drink",
  },

  {
    name: "Pepino con Limón",
    enName: "Lime Cucumber",
    image: "/images/pepino-limon.png",
    price: "$3.00",
    desc: "Refrescante bebida natural",
    enDesc: "Refreshing natural drink",
  },

  {
    name: "Jarritos",
    image: "/images/jarritos.png",
    price: "$2.50",
    desc: "Refresco mexicano embotellado",
    enDesc: "Mexican bottled soda",
  },

  {
    name: "Coca-Cola Mexicana",
    enName: "Mexican Coke",
    image: "/images/cocacola-mexicana.png",
    price: "$3.50",
    desc: "Coca-Cola mexicana original",
    enDesc: "Original Mexican Coca-Cola",
  },

  {
    name: "Coca-Cola en lata",
    enName: "Coke",
    image: "/images/cocacola-lata.png",
    price: "$1.50",
    desc: "Refresco en lata",
    enDesc: "Canned soda",
  },
],
  "Hot Dogs": [
    {
      name: "Street Hot Dog",
      price: "$12.00",
      image: "/images/Street_hot_dog.jpg",
      desc: "Hot dog estilo callejero",
      enDesc: "Street-style hot dog",
    },
  ],
  Extras: [
    {
      name: "Salchipapas",
      price: "$7.00",
      image: "/images/Salchipapas.jpg",
      desc: "Papas con salchicha estilo snack",
      enDesc: "Fries with sausage snack style",
    },
  ],
};
