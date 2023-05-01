
import { faker } from '@faker-js/faker';
import { createObjectCsvWriter } from 'csv-writer';
import _flatten from 'lodash.flatten';

/**
 * Returns a random number of items from an array.
 * 
 * @param {*} arr The source array.
 * @param {*} numberOfItems The number of items to return.
 *
 * @returns An array containing a random number of items from the input array.
 */
const getRandomItemsFromArray = (arr, numberOfItems) => {
  const items = [];
  for (let i = 0; i < numberOfItems; i++) {
    items.push(arr[Math.floor(Math.random() * arr.length)]);
  }
  return items;
};

/**
 * Returns a random set of customers.
 *
 * @returns An array of customers objects.
 */
const generateCustomers = () => {
  const customers = [];
  for (let i = 1; i <= 200; i++) {
    const customer = {
      customer_id: i,
      age: faker.datatype.number({ min: 18, max: 80 }),
      gender: faker.helpers.arrayElement(['Male', 'Female', 'Other']),
      signup_date: faker.date.past(3).toISOString().split('T')[0],
      location: faker.helpers.arrayElement(['Portland', 'Chicago', 'Toronto', 'New York', 'San Francisco', 'Los Angeles']),
      customer_segment: faker.helpers.arrayElement(['A', 'B', 'C', 'D']),
    };
    customers.push(customer);
  }
  return customers;
};

/**
 * Returns a random set of orders and products.
 *
 * @param {*} customers The customers array.
 * 
 * @returns An object containing orders and products.
 */
const generateOrdersAndProducts = (customers) => {
  const orders = [];
  const products = [];

  for (let i = 1; i <= 50; i++) {
    const product = {
      product_id: i,
      product_name: faker.commerce.productName(),
      category: faker.helpers.arrayElement(['Electronics', 'Books', 'Home', 'Toys', 'Beauty']),
      price: faker.commerce.price(1, 100),
    };

    products.push(product);
  }

  for (let i = 1; i <= 200; i++) {
    const order_customer = customers[Math.floor(Math.random() * customers.length)];
    const order_products = getRandomItemsFromArray(products, faker.datatype.number({ min: 1, max: 5 }));

    // Create order object, and associate the customer and products with the order.
    const order = {
      order_id: i,
      customer_id: order_customer.customer_id,
      order_date: faker.date.past(1).toISOString().split('T')[0],
      order_products: order_products.map((product) => {
        // Associate the products with the order, and add a random quantity.
        return { ...product, order_id: i, quantity: faker.datatype.number({ min: 1, max: 5 }) };
      }),
    };

    // Calculate the total amount for the order.
    order.total_amount = order.order_products.reduce((total, product) => {
      return total + (parseFloat(product.price) * product.quantity);
    }, 0);

    orders.push(order);
  }

  return orders;
}

///////////////////////////////////////////////////////////////////////////////

const customers = generateCustomers();
const orders = generateOrdersAndProducts(customers);

const csvWriterCustomers = createObjectCsvWriter({
  path: './reports/customers.csv',
  header: [
    { id: 'customer_id', title: 'customer_id' },
    { id: 'age', title: 'age' },
    { id: 'gender', title: 'gender' },
    { id: 'signup_date', title: 'signup_date' },
    { id: 'location', title: 'location' },
    { id: 'customer_segment', title: 'customer_segment' },
  ],
});

const csvWriterOrders = createObjectCsvWriter({
  path: './reports/orders.csv',
  header: [
    { id: 'order_id', title: 'order_id' },
    { id: 'customer_id', title: 'customer_id' },
    { id: 'order_date', title: 'order_date' },
    { id: 'total_amount', title: 'total_amount' },
  ],
});

const csvWriterProducts = createObjectCsvWriter({
  path: './reports/products.csv',
  header: [
    { id: 'product_id', title: 'product_id' },
    { id: 'product_name', title: 'product_name' },
    { id: 'order_id', title: 'order_id' },
    { id: 'category', title: 'category' },
    { id: 'price', title: 'price' },
    { id: 'quantity', title: 'quantity' },
  ],
});

csvWriterCustomers
  .writeRecords(customers)
  .then(() => {
    console.log('Customers data has been written to reports/customers.csv');
  })
  .catch((error) => {
    console.error('Error writing to CSV file:', error);
  });

csvWriterOrders
  .writeRecords(orders)
  .then(() => {
    console.log('Orders data has been written to reports/orders.csv');
  })
  .catch((error) => {
    console.error('Error writing to CSV file:', error);
  });

csvWriterProducts
  .writeRecords(_flatten(orders.map((order) => order.order_products)))
  .then(() => {
    console.log('Products data has been written to reports/products.csv');
  })
  .catch((error) => {
    console.error('Error writing to CSV file:', error);
  });
