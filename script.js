'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Abdullahi Kamaldeen',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 8787,

  movementsDates: [
    '2023-02-27T21:31:17.178Z',
    '2023-02-29T07:42:02.383Z',
    '2023-03-17T09:15:04.904Z',
    '2023-03-19T10:17:24.185Z',
    '2023-03-20T14:11:59.604Z',
    '2023-03-24T17:01:17.194Z',
    '2023-03-25T23:36:17.929Z',
    '2023-03-26T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Ibrahim Sharafadeen',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 9898,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2023-03-19T14:18:46.235Z',
    '2023-03-20T16:33:06.386Z',
    '2023-03-24T14:43:26.374Z',
    '2023-03-25T18:49:59.371Z',
    '2023-03-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');
const alert = document.querySelector('.alert');
// const logoutBtn = document.querySelector('.logout-btn');

/////////////////////////////////////////////////
// Functions

//displaying message
const displayAlert = (text, action) => {
  alert.textContent = text;
  alert.classList.add(`alert-${action}`);
  setTimeout(() => {
    alert.textContent = '';
    alert.classList.remove(`alert-${action}`);
  }, 1500);
};

//calculate the dates
const formatMovement = (date, locale) => {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    return new Intl.DateTimeFormat(locale).format(date);
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();
    // return `${day}/${month}/${year}`;
  }
};

const formatCur = (value, locale, cur) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: cur,
  }).format(value);
};

//1. displaying the movements
const displaMovements = (acc, sort = false) => {
  containerMovements.innerHTML = ''; //delete the two movements that were there before.

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach((movement, index) => {
    const type = movement > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[index]);

    const displayDate = formatMovement(date, acc.locale);

    const html = `
          <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      index + 1
    } ${type} </div>
        <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${formatCur(
            movement,
            acc.locale,
            acc.currency
          )}</div>
        </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

//2. calculating the display message
const calcDisplayBalance = acc => {
  const balance = acc.movements.reduce((acc, cur) => {
    return acc + cur;
  }, 0);
  acc.balance = balance;
  labelBalance.innerHTML = `${formatCur(balance, acc.locale, acc.currency)}`;
};

//3. CALCULATING total sum in, sum out and interests;
const calcDisplaySummary = acc => {
  const income = acc.movements
    .filter(movement => movement > 0)
    .reduce((acc, cur) => acc + cur, 0);

  labelSumIn.innerHTML = formatCur(income, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, cur) => acc + cur, 0);

  labelSumOut.innerHTML = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(movement => movement > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((interest, i, arr) => {
      return interest >= 1;
    })
    .reduce((acc, interest) => acc + interest, 0);

  labelSumInterest.innerHTML = formatCur(interest, acc.locale, acc.currency);
};

//4. generating username
const createUsername = acct => {
  acct.forEach(el => {
    el.userName = el.owner
      .toLowerCase()
      .split(' ')
      .map(el => el.at(0))
      .join('');
  });
};
createUsername(accounts);

const updateAccount = acc => {
  //display movements
  displaMovements(acc);

  // display balance
  calcDisplayBalance(acc);

  //display summary
  calcDisplaySummary(acc);
};

//creating a timer function
const startLogOutTimer = () => {
  //start by setting the time to 5 minutes
  let time = 300;

  const tick = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, '0');
    const sec = String(time % 60).padStart(2, '0');

    //in each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    //decrease one second
    // time = time -1
    time--;

    //when the time is at 0, stop timer and log out the user
    if (time < 0) {
      clearInterval(timer);
      displayAlert(`Time's up, log in to get started again`, 'sucess');
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Log in to get started!';
    }
  };

  //call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

//4. event listeners
let currentUser, timer;

//FAKE ALWAYS LOGGED IN

// const day = `${now.getDate()}`.padStart(2, 0);
// const month = `${now.getMonth() + 1}`.padStart(2, 0);
// const year = now.getFullYear();
// const hours = `${now.getHours()}`.padStart(2, 0);
// const min = `${now.getMinutes()}`.padStart(2, 0);
// labelDate.textContent = `${day}/${month}/${year}, ${amPm(hours, min)}`;

btnLogin.addEventListener('click', e => {
  //prevent form from submitting
  e.preventDefault();
  currentUser = accounts.find(act => act.userName === inputLoginUsername.value);

  console.log(currentUser);

  if (currentUser?.pin === +inputLoginPin.value) {
    //DIisplay Ui and  a welcome message
    labelWelcome.textContent = `Welcome back ${
      currentUser.owner.split(' ')[0]
    }!`;
    containerApp.style.opacity = 1;

    // implementing the log out button funtionality
    // logoutBtn.classList.remove('hide');
    // logoutBtn.addEventListener('click', () => {
    //   containerApp.style.opacity = 0;
    //   currentUser = currentUser;
    //   labelWelcome.textContent = 'Log in to get started';
    //   console.log('log out');
    // });

    //clear input field
    inputLoginUsername.value = inputLoginPin.value = ''; //because assingment operator works from right to left. inputloginpin wil be an empty string and then inputloginusername will be an empty string too
    inputLoginPin.blur(); //remove the focus from the inputs

    displayAlert(`welome back ${currentUser.owner}`, 'sucess');

    //start log out timer;
    //timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    //display movement, //display balance, and //display Summarry

    updateAccount(currentUser);

    //COMPUTING THE DATE WITH INTERNATIONLIZATION API
    const now = new Date();

    //defining options object
    // const options = {
    //   hour: 'numeric',
    //   minute: 'numeric',
    //   day: 'numeric',
    //   month: 'long',
    //   year: 'numeric',
    //   weekday: 'long',
    // };
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long',
    };

    //WE SHOULDN'T SET THE LOCAL MANUALLY BUT WE SHOULD GET IT FROM THE USER'S BROWSERS;

    // const locale = navigator.language;
    // console.log(locale);

    labelDate.textContent = new Intl.DateTimeFormat(
      currentUser.locale,
      options
    ).format(now); //will format the date as it is in the US
  }
});

btnTransfer.addEventListener('click', e => {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAccount = accounts.find(
    acc => acc.userName === inputTransferTo.value
  );

  //clearing the deposits
  inputTransferTo.value = inputTransferAmount.value = '';

  if (
    amount > 0 &&
    receiverAccount &&
    currentUser.balance >= amount &&
    receiverAccount?.userName !== currentUser.userName
  ) {
    //doing the transfer
    currentUser.movements.push(-amount);
    receiverAccount.movements.push(amount);

    //add transfer date
    currentUser.movementsDates.push(new Date().toISOString());
    receiverAccount.movementsDates.push(new Date().toISOString());

    //update UI
    updateAccount(currentUser);

    displayAlert(
      `${formatCur(
        amount,
        currentUser.locale,
        currentUser.currency
      )} transferred to ${receiverAccount.owner}`,
      'danger'
    );

    //resetting the timer;
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', e => {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);

  //if the amount is greater than zero and if any of deposit is greater than 10% of the amount
  if (amount > 0 && currentUser.movements.some(mov => mov >= amount * 0.1)) {
    //add the amount to the movements
    setTimeout(() => {
      currentUser.movements.push(amount);

      //update the movement's date
      currentUser.movementsDates.push(new Date().toISOString());

      //update the UI
      updateAccount(currentUser);

      displayAlert(
        `your loan of ${formatCur(
          amount,
          currentUser.locale,
          currentUser.currency
        )} has been approved`,
        'sucess'
      );

      //reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 3000);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', e => {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentUser.userName &&
    +inputClosePin.value === currentUser.pin
  ) {
    const index = accounts.findIndex(
      act => act.userName === currentUser.userName
    );
    //delete account
    accounts.splice(index, 1);

    // display alert
    displayAlert(`acount closed`, 'danger');

    //Hide UI
    containerApp.style.opacity = 0;

    labelWelcome.textContent = 'Log in to get started!';
    logoutBtn.classList.add('hide');
  }
  //clearing the input fields
  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', () => {
  displaMovements(currentUser, !sorted);

  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
// console.log(23 === 23.0);
// console.log(0.1 + 0.2); //0.3000000000004
// console.log(0.1 + 0.2 === 0.3); //false

// //coverting string to number
// //1. thorough the number method and + operator
// console.log(Number('23')); //23
// console.log(+'23'); //23

// //2. through parsing
// console.log(parseInt('   30px   ')); //30

// console.log(Number.parseInt('30pcx', 10)); //30//the second argument is the reddix which is mostly in base 10

// console.log(parseInt('px30')); //NAN

// console.log(Number.parseFloat('2.5rem'));
// //2.5;
// console.log(parseFloat('2.5rem')); //2.5

// //Number.isNaN() We can use it to check if a number is not a number. returns true if a value is not a number and false if it is
// console.log(Number.isNaN(20));
// console.log(Number.isNaN('20'));
// console.log(Number.isNaN(+'20x'));
// console.log(Number.isNaN(20 / 0)); //because diving by 0 will give infinity so it's a number
// console.log(Number.isNaN(20 / 5));

// //isFinite() will return true if a value is a number and false if it isn't. iit is the opposite of isNaN
// console.log(Number.isFinite(20)); //true
// console.log(Number.isFinite('20')); //false
// console.log(Number.isFinite(+'20X')); //false
// console.log(Number.isFinite(20 / 0)); //false because 20/0 gives infinity so it's not a number

// //IsInteger-- will return true if a value is an integer and false if it isn't

// console.log(Number.isInteger(23));
// console.log(Number.isInteger(23.5));
// console.log(Number.isInteger(20 / 0));

//MATH AND ROUNDING
// console.log(Math.sqrt(25));
// console.log(25 ** (1 / 2));
// console.log(8 ** 1 / 3);
// console.log(Math.max(5, 3, 21, 11, 17, 18));
// console.log(Math.max(5, 3, '21', 11, 17, 18));
// console.log(Math.max(5, 3, '21px', 11, 17, 18));

// console.log(Math.min(5, 3, 21, 11, 17, 18));

// console.log(Math.PI * Number.parseFloat('10px') ** 2);
// console.log(Number.parseFloat('10px'));

// console.log(Math.trunc(Math.random() * 6) + 1);

// //this function will give a number always between min and max
// const randomInt = (min, max) =>
//   Math.floor(Math.random() * (max - min) + 1) + min;

// console.log(randomInt(-2, 6));

// //rouding integers
// console.log(Math.trunc(23.3)); //23
// console.log(Math.round(23.3)); //23
// console.log(Math.round(23.8)); //24

// console.log(Math.ceil(23.3)); //24
// console.log(Math.ceil(23.8)); //24

// console.log(Math.floor(23.3)); //23
// console.log(Math.floor(23.8)); //23

// console.log(Math.floor(-23.3)); //-24
// console.log(Math.trunc(-23.3)); //- 23

// //rounding decimal
// console.log((2.7).toFixed(0)); //'3'
// console.log((2.7).toFixed(3)); //'2.700'
// console.log((2.7).toFixed(1)); //'2.7' //toFixed always return a string
// console.log(+(2.7).toFixed(0));

//THE REMAINDER OPERATOR %;
// console.log(5 % 2); //1
// console.log(8 % 3); //2

// console.log(6 % 2); //0 therefore 6 is even number
// console.log(7 % 2); //1 so 7 is an odd number

// const isEven = n => n % 2 === 0;
// console.log(isEven(2));
// console.log(isEven(23));
// console.log(isEven(514));

// labelBalance.addEventListener('click', e => {
//   Array.from(document.querySelectorAll('.movements__row'), (el, i) => {
//     if (i % 2 === 0) el.style.backgroundColor = 'orangered';
//     if (i % 2 === 1) el.style.backgroundColor = 'blue';
//   });
// });

// const movementsUI = Array.from(
//     document.querySelectorAll('.movements__value'),
//     el => Number(el.textContent.replace('€', ''))
//   );

//NUMERIC SEPERATORS
//it is use to give meanings to numbers  in our code..
//
// const diameter = 287_460_000_000;
// console.log(diameter); //this will see the numbers without the underscores

// const priceCents = 345_99;
// console.log(priceCents);

// const PI = 3.1415; //error // we are not allowed to place the underscores after or before a point, at the bbeggining of a number and at the end. we can't also place two underscores in a row.

// console.log(Number('230000'));
// console.log(Number('230_000')); //NAN meaninng we can't put the underscores when we want to run our code. we can onlu put it on our code to seperates number
// console.log(parseInt('230_000')); //230

// //BIGINT
// console.log(2 ** 53 - 1);
// console.log(Number.MAX_SAFE_INTEGER);
// console.log(64444444444444444444444444446464n);
// console.log(BigInt(64444444444));

// //OPERATIONS WITH BIGiNT// operations work the same in bigInt

// console.log(10000n + 10000n); //20000n
// console.log(4646464838393821101013838383n + 5755984939393n);

// const huge = 464743939384712029389494n;
// const reg = 23;
// // console.log(huge * reg); //error

// console.log(huge * BigInt(reg));

// console.log(20n > 15);
// console.log(20n === 20);
// console.log(typeof 20n);
// console.log(20 == 20n);

// console.log(11n / 3n);
// console.log(11 / 3);

//CREATING DATES
//there are 4 ways of creating date
// 1.
// const now = new Date();
// console.log(now);
// //2. is to parse a date from a date string
// console.log(new Date('Aug 02 2020 18:05:41'));
// console.log(new Date('December 24 2015'));

// console.log(new Date(account1.movementsDates[0]));

// //3. passing in year, month, day, hours, minutes, seconds
// console.log(new Date(2021, 10, 12, 16, 45, 15));
// console.log(new Date(2021, 10, 33, 16, 45, 15));

// //4. we can also pass in no of millisecnds which will be calculated from jan 1 1970

// //getting 3 days after jan 1 , 1979
// console.log(new Date(3 * 24 * 60 * 60 * 1000));

//WORKING WITH DATES
// const future = new Date(2027, 10, 19, 15, 23);
// console.log(future);
// //to get the year of the date
// console.log(future.getFullYear());
// console.log(future.getMonth());
// console.log(future.getDate());
// console.log(future.getDay());
// console.log(future.getHours());
// console.log(future.getMinutes());
// console.log(future.getSeconds());
// console.log(future.toISOString());
// console.log(future.getTime());

// console.log(Date.now());

// future.setFullYear(2040);
// console.log(future);

//OPERATION WITH DATES
// const future = new Date(2027, 10, 19, 15, 23);
// console.log(+future); //converting the dates to numbers in milliseconds. we can use Number(future), (+future) and future.getTime()
// const now = Date.now();
// console.log(now);

// const daysPassed = (date1, date2) =>
//   Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

// console.log(daysPassed(new Date(2037, 3, 14), new Date(2037, 3, 4))); // 10 days

//INTERNALIZING Numbers..experimenting with it
// const number = 3884764.23;

// const options = {
//   style: 'currency',
//   unit: 'celsius',
//   currency: 'EUR',
//   // useGrouping: false,
// };

// console.log('US: ', new Intl.NumberFormat('en-US', options).format(number));
// console.log('GER: ', new Intl.NumberFormat('de-DE', options).format(number));
// console.log('SYRIA: ', new Intl.NumberFormat('ar-SY', options).format(number));
// console.log(
//   'Browser: ',
//   new Intl.NumberFormat(navigator.language, options).format(number)
// );

//SETTIMEOUT AND SETINTERVAL;

//setTimeOut==Simply schedules a function to run after an amountof time and the function is excuted once

// setTimeout(() => console.log('Here is your Pizza'), 3000);
// console.log('waiting......');

// //passing arguments to the setTimeOut function

// setTimeout(
//   (ing1, ing2) => console.log(`Here is your pizza 🍕 with ${ing1} and ${ing2}`),
//   3000,
//   'olive',
//   'spinach'
// );

// const ingredients = ['olive', 'spinanch'];
// const pizzerTime = setTimeout(
//   (ing1, ing2) => console.log(`Here is your pizza 🍕 with ${ing1} and ${ing2}`),
//   3000,
//   ...ingredients
// );

// if (ingredients.includes('spinanch')) clearTimeout(pizzerTime);

// //SETINTERVAL==simply schedules a function to run every inputed period or time;

// const dateTime = setInterval(() => {
//   const now = new Date();
//   const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
//   console.log(time);

//   if (time === `3:50:40`) clearInterval(dateTime);
// }, 1000);
