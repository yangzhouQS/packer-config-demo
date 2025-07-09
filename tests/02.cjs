
const get = require('lodash.get');
// console.log(get);


const entry = {
  a:"c/a.js",
  v:"c/v.js",
}
console.log(entry);

// console.log(Object.fromEntries());
console.log(Object.entries(entry));
for (const [key,value] of Object.entries(entry)) {
}
