'use strict';

// BANKIST APP

// Data

// DIFFERENT DATA! Contains movementsDates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

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

let currentAccount;
let sorted = false;

// Computing Usernames
const createUserNames = (accounts) => {
  // Sample: 'Steven Thomas Williams' => Output: stw

  // NOTE: Add a new property called "userName" into each account object by taking the first letter of each word in the owner's name and converting to lowerCase.
  accounts.forEach(
    (account) =>
      (account.userName = account.owner
        .toLowerCase()
        .split(' ')
        .map((word) => word.at(0))
        .join(''))
  );
};
createUserNames(accounts);

// Display Movements
const displayMovements = (movements, sort = false) => {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach((movement, index) => {
    const type = movement > 0 ? 'deposit' : 'withdrawal';

    const html = `
      <div class="movements__row">
          <div class="movements__type movements__type--${type}">
          ${index + 1} ${type}
          </div>
          <div class="movements__value">${movement} €</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// Calculate and Display Balance
const calcDisplayBalance = (currentAccount) => {
  const initialValue = 0;

  // Calculate balance and store it into currentAccount object
  currentAccount.balance = currentAccount?.movements.reduce(
    (accumulator, currentMovement) => {
      return accumulator + currentMovement;
    },
    initialValue
  );

  labelBalance.textContent = `${currentAccount?.balance} €`;
};

// Calculate and Display Summary (Chaining Methods)
const calcDisplaySummary = (currentAccount) => {
  const income = currentAccount?.movements
    .filter((movement) => movement > 0) // take all deposit
    .reduce((accumulator, currentDeposit) => {
      return accumulator + currentDeposit;
    }, 0);

  labelSumIn.textContent = `${income} €`;

  const out = currentAccount?.movements
    .filter((movement) => movement < 0) // take all withdrawal
    .reduce((accumulator, currentWithdrawal) => {
      return accumulator + currentWithdrawal;
    }, 0);

  labelSumOut.textContent = `${Math.abs(out)} €`;

  const interest = currentAccount?.movements
    .filter((movement) => movement > 0) // take all deposit
    .map((deposit) => deposit * (currentAccount?.interestRate / 100)) // apply interestRate
    .filter((interest, index, array) => {
      // rule: interest will be added if it is greater than or equal to 1.
      // console.log(array);
      return interest >= 1;
    })
    .reduce((accumulator, currentInterest) => {
      return accumulator + currentInterest;
    }, 0);

  labelSumInterest.textContent = `${interest} €`;
};

// Update UI
const updateUI = (currentAccount) => {
  // Display Movements
  displayMovements(currentAccount?.movements);

  // Display Balance
  calcDisplayBalance(currentAccount);

  // Display Summary
  calcDisplaySummary(currentAccount);
};

//* Event handler
btnLogin.addEventListener('click', (e) => {
  e.preventDefault();

  // Find current user account
  currentAccount = accounts.find(
    (account) => account.userName === inputLoginUsername.value
  );

  // Check Pin
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and Welcome Message
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner
      .split(' ')
      .at(0)}!`;
    containerApp.style.opacity = 100;

    // Update UI
    updateUI(currentAccount);

    // Clear Input Fields
    inputLoginUsername.value = '';
    inputLoginPin.value = '';
    inputLoginPin.blur();
  }
});

btnTransfer.addEventListener('click', (e) => {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value.trim());
  const receiverUserName = inputTransferTo.value.toLowerCase().trim();
  // const currentBalance = Number(labelBalance.innerText.split(' ').at(0));

  // Find the recipient account
  const recipientAccount = accounts.find(
    (account) => account.userName === receiverUserName
  );

  if (
    amount > 0 &&
    currentAccount?.balance >= amount &&
    recipientAccount &&
    receiverUserName !== currentAccount.userName
  ) {
    // Add negative movement to current user
    currentAccount.movements.push(-amount);

    // Add positive movement to recipient
    recipientAccount.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  } else {
    const message =
      receiverUserName === currentAccount.userName
        ? `You can't transfer money into your own account!`
        : currentAccount?.balance < amount
        ? `You don't have enough money!`
        : amount === 0
        ? `Please enter valid amount of money!`
        : recipientAccount?.userName === undefined
        ? `Account doesn't exist!`
        : null;

    alert(`Something went wrong: ${message}`);
  }

  // Clear Input Fields
  inputTransferTo.value = '';
  inputTransferAmount.value = '';
  inputTransferAmount.blur();
});

btnLoan.addEventListener('click', (e) => {
  e.preventDefault();

  const loanAmount = Number(inputLoanAmount.value);

  if (
    loanAmount > 0 &&
    currentAccount.movements.some((movement) => movement >= loanAmount * 0.1)
  ) {
    // Add positive movement to current user
    currentAccount.movements.push(loanAmount);

    // Update UI
    updateUI(currentAccount);
  }

  // Clear Input Fields
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', (e) => {
  e.preventDefault();

  const closeUsername = inputCloseUsername.value.toLowerCase().trim();
  const closePin = Number(inputClosePin.value.trim());

  if (
    closeUsername === currentAccount.userName &&
    closePin === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      (account) => account.userName === currentAccount.userName
    );

    accounts.splice(index, 1); // Delete user account from database
    containerApp.style.opacity = 0; // Logout (Hide UI)
    labelWelcome.textContent = `Log in to get started`;

    console.log(accounts);
  } else {
    alert('Invalid User Credential!');
  }

  // Clear Input Fields
  inputCloseUsername.value = '';
  inputClosePin.value = '';
});

btnSort.addEventListener('click', () => {
  // Sort the movements
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});
