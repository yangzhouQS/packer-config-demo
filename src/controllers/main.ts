console.log("http://127.0.0.1:3013");

function fnTest(...args: any[]) {
  console.log("arguments");
  console.log(args);
}
fnTest(1, 2, 3);
