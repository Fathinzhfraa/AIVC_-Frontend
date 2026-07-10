const menuData = [
  {
    category: "COFFEE",
    icon: "local_cafe",
    iconBg: "bg-primary-fixed",
    iconColor: "text-primary",
    items: [
      {
        name: "Autentic Espresso",
        price: "$3.50",
        description:
          "Our signature blend. Bold, heavy body with notes of dark chocolate and raw sugar.",
        tags: ["Hot"],
        image:
          "/images/espresso.jpg",
      },
      {
        name: "Caffè Latte",
        price: "$4.50",
        description:
          "Smooth espresso with steamed whole milk and a light layer of microfoam.",
        tags: ["Hot", "Iced"],
        image:
          "/images/latte.jpg",
      },
      {
        name: "Cappuccino",
        price: "$4.50",
        description:
          "Bold espresso topped with thick, airy foam and a dusting of cocoa.",
        tags: ["Hot"],
        image:
          "/images/cappuccino.jpg",
      },
      {
        name: "Flat White",
        price: "$4.75",
        description:
          "Double ristretto poured over silky steamed milk for an intense yet smooth taste.",
        tags: ["Hot"],
        image:
          "/images/flat-white.jpg",
      },
      {
        name: "Pour Over",
        price: "$4.50",
        description: "Rotating single-origin beans, meticulously hand-brewed.",
        tags: ["Hot"],
        image:
          "/images/pour-over.jpg",
      },
      {
        name: "Iced Latte",
        price: "$4.75",
        description:
          "Chilled espresso over milk and ice, refreshingly bold.",
        tags: ["Iced"],
        image:
          "/images/iced-latte.jpg",
      },
      {
        name: "Cold Brew",
        price: "$5.00",
        description:
          "Slow-steeped for 20 hours. Smooth, naturally sweet, and low in acidity.",
        tags: ["Iced"],
        image:
          "/images/cold-brew.jpg",
      },
    ],
  },
  {
    category: "NON COFFEE",
    icon: "emoji_food_beverage",
    iconBg: "bg-tertiary-fixed",
    iconColor: "text-tertiary",
    items: [
      {
        name: "Matcha Latte",
        price: "$5.00",
        description:
          "Ceremonial-grade matcha whisked with steamed oat milk. Earthy and vibrant.",
        tags: ["Hot", "Iced"],
        image:
          "/images/matcha-latte.jpg",
      },
      {
        name: "Dark Hot Chocolate",
        price: "$4.75",
        description:
          "Rich, velvety Belgian dark chocolate steamed with whole milk.",
        tags: ["Hot"],
        image:
          "/images/hot-chocolate.jpg",
      },
      {
        name: "Chai Latte",
        price: "$4.75",
        description:
          "House-spiced chai concentrate with steamed milk and a hint of honey.",
        tags: ["Hot", "Iced"],
        image:
          "/images/chai-latte.jpg",
      },
      {
        name: "Fresh Lemonade",
        price: "$3.75",
        description:
          "Freshly squeezed lemons, a touch of cane sugar, and sparkling water.",
        tags: ["Iced"],
        image:
          "/images/lemonade.jpg",
      },
      {
        name: "Matcha Lemonade",
        price: "$5.25",
        description:
          "A vibrant twist — premium matcha swirled into fresh lemonade.",
        tags: ["Iced"],
        image:
          "/images/matcha-lemonade.jpg",
      },
    ],
  },
  {
    category: "SIGNATURE",
    icon: "water_drop",
    iconBg: "bg-secondary-fixed",
    iconColor: "text-on-surface",
    items: [
      {
        name: "Amber Cold Brew",
        price: "$5.50",
        description:
          "Steeped for 24 hours, topped with a smoked amber syrup cold foam.",
        tags: ["Iced"],
        image:
          "/images/amber-cold-brew.jpg",
      },
      {
        name: "The Roaster's Tonic",
        price: "$6.00",
        description:
          "Espresso over artisanal tonic water with a twist of grapefruit peel.",
        tags: ["Iced"],
        image:
          "/images/roasters-tonic.jpg",
      },
      {
        name: "Salted Caramel Espresso",
        price: "$5.75",
        description:
          "Double espresso with house-made salted caramel and steamed milk.",
        tags: ["Hot", "Iced"],
        image:
          "/images/salted-caramel.jpg",
      },
      {
        name: "Smoky Vanilla Nitro",
        price: "$6.50",
        description:
          "Nitro cold brew infused with smoked vanilla bean. Velvety smooth.",
        tags: ["Iced"],
        image:
          "/images/vanilla-nitro.jpg",
      },
    ],
  },
  {
    category: "PASTRY",
    icon: "bakery_dining",
    iconBg: "bg-primary-fixed",
    iconColor: "text-primary",
    items: [
      {
        name: "Brutal Butter Croissant",
        price: "$4.00",
        description:
          "Laminated with high-fat European butter. Shatteringly crisp outside, airy inside.",
        tags: ["Vegan Opt"],
        image:
          "/images/croissant.jpg",
      },
      {
        name: "Cardamom Knot",
        price: "$4.25",
        description: "Spiced sweet dough, tightly twisted and baked dark.",
        tags: [],
        image:
          "/images/cardamom-knot.jpg",
      },
      {
        name: "Chocolate Pain Au Chocolat",
        price: "$4.75",
        description:
          "Dark chocolate batons enveloped in flaky, butter laminated dough.",
        tags: [],
        image:
          "/images/pain-chocolat.jpg",
      },
      {
        name: "Blueberry Muffin",
        price: "$3.75",
        description:
          "Bursting with wild blueberries, crowned with a crunchy streusel.",
        tags: ["Vegan"],
        image:
          "/images/blueberry-muffin.jpg",
      },
      {
        name: "Cinnamon Roll",
        price: "$4.50",
        description:
          "Soft, swirled dough with brown sugar cinnamon filling and cream cheese glaze.",
        tags: [],
        image:
          "/images/cinnamon-roll.jpg",
      },
    ],
  },
  {
    category: "MODERN FOOD",
    icon: "restaurant_menu",
    iconBg: "bg-tertiary-fixed",
    iconColor: "text-tertiary",
    items: [
      {
        name: "Avocado Toast",
        price: "$8.50",
        description:
          "Smashed avocado on sourdough, cherry tomatoes, microgreens, and chili flakes.",
        tags: ["Vegan"],
        image:
          "/images/avocado-toast.jpg",
      },
      {
        name: "Truffle Mushroom Toast",
        price: "$9.50",
        description:
          "Sautéed wild mushrooms on toasted brioche with truffle oil and parmesan.",
        tags: [],
        image:
          "/images/mushroom-toast.jpg",
      },
      {
        name: "Smoked Salmon Bowl",
        price: "$11.00",
        description:
          "Quinoa, smoked salmon, avocado, pickled onion, sesame, and ginger dressing.",
        tags: [],
        image:
          "/images/salmon-bowl.jpg",
      },
      {
        name: "Caesar Salad",
        price: "$8.00",
        description:
          "Crisp romaine, house-made Caesar dressing, croutons, and shaved parmesan.",
        tags: ["Vegan Opt"],
        image:
          "/images/caesar-salad.jpg",
      },
      {
        name: "Grilled Chicken Wrap",
        price: "$9.00",
        description:
          "Herb-marinated chicken, mixed greens, tomato, and garlic aioli in a flour tortilla.",
        tags: [],
        image:
          "/images/chicken-wrap.jpg",
      },
      {
        name: "Pasta Aglio Olio",
        price: "$10.00",
        description:
          "Spaghetti tossed in garlic-infused olive oil, chili, parsley, and toasted breadcrumbs.",
        tags: ["Vegan"],
        image:
          "/images/pasta-aglio-olio.jpg",
      },
    ],
  },
];

export default menuData;
