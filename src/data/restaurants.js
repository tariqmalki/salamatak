// Sample restaurant and menu data for Saudi Arabia
export const restaurants = [
  {
    id: 1,
    name: 'Al Baik',
    nameAr: 'البيك',
    cuisine: 'Fast Food',
    safetyLevel: 'green', // green = safe, yellow = unknown, red = risky
    location: { lat: 21.4858, lng: 39.1925 },
    menu: [
      { id: 101, name: 'Grilled Chicken', nameAr: 'دجاج مشوي', price: 25, ingredients: 'chicken, rice, garlic sauce, spices', image: '' },
      { id: 102, name: 'Chicken Nuggets', nameAr: 'ناغتس دجاج', price: 18, ingredients: 'chicken, breaded flour, oil, spices', image: '' },
      { id: 103, name: 'Fish Fillet', nameAr: 'فيليه سمك', price: 22, ingredients: 'fish, breaded batter, flour, tartar sauce', image: '' },
      { id: 104, name: 'Shrimp Meal', nameAr: 'وجبة ربيان', price: 30, ingredients: 'shrimp, breaded flour, cocktail sauce, fries', image: '' },
      { id: 105, name: 'Coleslaw', nameAr: 'كول سلو', price: 5, ingredients: 'cabbage, carrot, mayonnaise, egg-based dressing', image: '' },
    ],
  },
  {
    id: 2,
    name: 'Kudu',
    nameAr: 'كودو',
    cuisine: 'Fast Food',
    safetyLevel: 'yellow',
    location: { lat: 24.7136, lng: 46.6753 },
    menu: [
      { id: 201, name: 'Beef Burger', nameAr: 'برجر لحم', price: 28, ingredients: 'beef patty, bread bun, lettuce, tomato, cheese, mayo', image: '' },
      { id: 202, name: 'Chicken Sandwich', nameAr: 'ساندويتش دجاج', price: 24, ingredients: 'grilled chicken, bread, lettuce, garlic sauce', image: '' },
      { id: 203, name: 'Nutella Crepe', nameAr: 'كريب نوتيلا', price: 15, ingredients: 'flour crepe, nutella, hazelnut, cream, banana', image: '' },
      { id: 204, name: 'Caesar Salad', nameAr: 'سلطة سيزر', price: 20, ingredients: 'lettuce, parmesan cheese, croutons, egg-based dressing, anchovy', image: '' },
      { id: 205, name: 'Fries', nameAr: 'بطاطس مقلية', price: 10, ingredients: 'potato, oil, salt', image: '' },
    ],
  },
  {
    id: 3,
    name: 'Shawarmer',
    nameAr: 'شاورمر',
    cuisine: 'Middle Eastern',
    safetyLevel: 'green',
    location: { lat: 24.7250, lng: 46.6800 },
    menu: [
      { id: 301, name: 'Chicken Shawarma', nameAr: 'شاورما دجاج', price: 18, ingredients: 'chicken, pita bread, garlic paste, pickles', image: '' },
      { id: 302, name: 'Beef Shawarma', nameAr: 'شاورما لحم', price: 22, ingredients: 'beef, pita bread, tahini, pickles', image: '' },
      { id: 303, name: 'Hummus Plate', nameAr: 'حمص', price: 12, ingredients: 'chickpeas, tahini, lemon, olive oil', image: '' },
      { id: 304, name: 'Fattoush Salad', nameAr: 'فتوش', price: 14, ingredients: 'lettuce, tomato, cucumber, pita croutons, pomegranate molasses', image: '' },
      { id: 305, name: 'Falafel Wrap', nameAr: 'فلافل', price: 15, ingredients: 'chickpea falafel, bread wrap, tahini, vegetables', image: '' },
    ],
  },
  {
    id: 4,
    name: 'The Cheesecake Factory',
    nameAr: 'ذا تشيز كيك فاكتوري',
    cuisine: 'American',
    safetyLevel: 'red',
    location: { lat: 24.6900, lng: 46.6850 },
    menu: [
      { id: 401, name: 'Original Cheesecake', nameAr: 'تشيز كيك أصلي', price: 45, ingredients: 'cream cheese, eggs, butter, graham cracker crust, flour, cream', image: '' },
      { id: 402, name: 'Pasta Carbonara', nameAr: 'باستا كاربونارا', price: 55, ingredients: 'pasta, egg yolk, parmesan cheese, cream, bacon', image: '' },
      { id: 403, name: 'Grilled Salmon', nameAr: 'سلمون مشوي', price: 75, ingredients: 'salmon fillet, lemon butter sauce, vegetables, rice', image: '' },
      { id: 404, name: 'Peanut Butter Cup Fudge Ripple', nameAr: 'تشيز كيك زبدة الفول السوداني', price: 50, ingredients: 'peanut butter, chocolate, cream cheese, eggs, almond crust', image: '' },
      { id: 405, name: 'Avocado Egg Rolls', nameAr: 'لفائف الأفوكادو', price: 40, ingredients: 'avocado, egg roll wrapper, flour, cashew dipping sauce', image: '' },
    ],
  },
  {
    id: 5,
    name: 'Maestro Pizza',
    nameAr: 'مايسترو بيتزا',
    cuisine: 'Italian',
    safetyLevel: 'yellow',
    location: { lat: 24.7400, lng: 46.6500 },
    menu: [
      { id: 501, name: 'Margherita Pizza', nameAr: 'بيتزا مارغريتا', price: 35, ingredients: 'flour dough, tomato sauce, mozzarella cheese, basil', image: '' },
      { id: 502, name: 'Pepperoni Pizza', nameAr: 'بيتزا بيبروني', price: 40, ingredients: 'flour dough, tomato sauce, mozzarella cheese, pepperoni', image: '' },
      { id: 503, name: 'Seafood Pizza', nameAr: 'بيتزا بحرية', price: 50, ingredients: 'flour dough, shrimp, calamari, mozzarella cheese, garlic butter', image: '' },
      { id: 504, name: 'Chocolate Lava Cake', nameAr: 'كيك شوكولاتة', price: 25, ingredients: 'chocolate, flour, eggs, butter, cream', image: '' },
      { id: 505, name: 'Garden Salad', nameAr: 'سلطة خضراء', price: 18, ingredients: 'lettuce, tomato, cucumber, olive oil, lemon', image: '' },
    ],
  },
  {
    id: 6,
    name: 'Mama Noura',
    nameAr: 'ماما نورة',
    cuisine: 'Middle Eastern',
    safetyLevel: 'green',
    location: { lat: 24.7000, lng: 46.7100 },
    menu: [
      { id: 601, name: 'Chicken Kabsa', nameAr: 'كبسة دجاج', price: 30, ingredients: 'chicken, basmati rice, spices, tomato, onion', image: '' },
      { id: 602, name: 'Lamb Mandi', nameAr: 'مندي لحم', price: 45, ingredients: 'lamb, rice, spices, dried lime', image: '' },
      { id: 603, name: 'Mixed Grill', nameAr: 'مشاوي مشكلة', price: 55, ingredients: 'beef, chicken, lamb kebab, grilled vegetables, rice', image: '' },
      { id: 604, name: 'Lentil Soup', nameAr: 'شوربة عدس', price: 12, ingredients: 'lentils, onion, carrot, cumin, lemon', image: '' },
      { id: 605, name: 'Kunafa', nameAr: 'كنافة', price: 20, ingredients: 'shredded pastry, cheese, sugar syrup, pistachio topping', image: '' },
    ],
  },
]

// Helper function to get all unique dishes across restaurants
export function getAllDishes() {
  const dishes = []
  restaurants.forEach((r) => {
    r.menu.forEach((dish) => {
      dishes.push({ ...dish, restaurantName: r.name, restaurantNameAr: r.nameAr })
    })
  })
  return dishes
}
