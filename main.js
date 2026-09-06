// ==========================================
// 1. GLOBAL STATE (The Application Data)
// ==========================================
// Arrays holding items and DOM elements
let itemsList = ['🍎', '🍋', '🍒', '⭐', '🎰'];
let slotColumns = document.querySelectorAll('.SlotD');

// Simple number trackers for our game math
let walletBalance = 500;
let currentBetAmount = 5;
let minBetValue = 20;
let maxBetValue = 100;
let winMultiplier = 10;
let isCurrentlySpinning = false;

// ==========================================
// 2. HELPER FUNCTIONS (The Utilities)
// ==========================================

// Traditional array shuffler loop
function shuffleArray(arrayToShuffle) {
  let workingArray = arrayToShuffle.slice(); // Make a clean copy of the array
  let currentIndex = workingArray.length;
  
  while (currentIndex !== 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex = currentIndex - 1;

    // Swap the elements manually
    let temporaryValue = workingArray[currentIndex];
    workingArray[currentIndex] = workingArray[randomIndex];
    workingArray[randomIndex] = temporaryValue;
  }
  return workingArray;
}

// Update text inside the HTML elements directly using their unique IDs
function updateScreenDisplays() {
  let walletTextElement = document.getElementById('wallet');
  let betTextElement = document.getElementById('current-bet');
  
  walletTextElement.textContent = walletBalance;
  betTextElement.textContent = currentBetAmount;
}

// ==========================================
// 3. CORE GAME LOGIC (The Slots Setup & Spin)
// ==========================================

// Prepares the boxes inside the slots or loads a static question mark
function setupSlots(isInitialPageLoad) {
  let results = [];

  // Loop through each of our 3 slot windows one by one
  for (let i = 0; i < slotColumns.length; i++) {
    let currentColumn = slotColumns[i];
    let boxesContainer = currentColumn.querySelector('.boxes');
    
    // Clear out any old elements inside this column container
    boxesContainer.innerHTML = ''; 

    if (isInitialPageLoad === true) {
      // Just put a single placeholder box inside the window
      let placeholderBox = document.createElement('div');
      placeholderBox.classList.add('box');
      placeholderBox.style.width = currentColumn.clientWidth + 'px';
      placeholderBox.style.height = currentColumn.clientHeight + 'px';
      placeholderBox.textContent = '❓';
      boxesContainer.appendChild(placeholderBox);
      
      // Reset the physical position back to normal top orientation
      boxesContainer.style.transitionDuration = '0s';
      boxesContainer.style.transform = 'translateY(0px)';
    } else {
      // Create a large dynamic array list to simulate a spinning reel strip
      let longItemList = [];
      
      // Duplicate our items list twice to make the strip longer
      for (let repeat = 0; repeat < 2; repeat++) {
        for (let itemIndex = 0; itemIndex < itemsList.length; itemIndex++) {
          longItemList.push(itemsList[itemIndex]);
        }
      }

      // Randomize the order of our generated item strip
      let randomizedStrip = shuffleArray(longItemList);
      
      // The element at position 0 is what will land in the slot view window
      let finalWinningSymbol = randomizedStrip[0];
      results.push(finalWinningSymbol);

      // Create a bottom-placed default base question mark box 
      let baseBox = document.createElement('div');
      baseBox.classList.add('box');
      baseBox.style.width = currentColumn.clientWidth + 'px';
      baseBox.style.height = currentColumn.clientHeight + 'px';
      baseBox.textContent = '❓';
      boxesContainer.appendChild(baseBox);

      // Build the rest of the dynamic randomized boxes above it inside the strip container
      for (let k = 0; k < randomizedStrip.length; k++) {
        let newBox = document.createElement('div');
        newBox.classList.add('box');
        newBox.style.width = currentColumn.clientWidth + 'px';
        newBox.style.height = currentColumn.clientHeight + 'px';
        newBox.textContent = randomizedStrip[k];
        boxesContainer.appendChild(newBox);
      }

      // Snap the strip directly down to its absolute bottom position instantly (hidden from view)
      let dynamicTotalHeight = currentColumn.clientHeight * randomizedStrip.length;
      boxesContainer.style.transitionDuration = '0s';
      boxesContainer.style.transform = 'translateY(-' + dynamicTotalHeight + 'px)';
    }
  }

  return results; // Return the winning combination list array
}

// Handles the movement animation trigger and financial calculation steps
function triggerSpinCycle() {
  // Guard Check 1: Stop execution if machine is currently animating active moves
  if (isCurrentlySpinning === true) {
    return;
  }

  // Guard Check 2: Stop execution if player does not have enough money
  if (walletBalance < currentBetAmount) {
    alert("Insufficient funds! Choose a lower bet or reset.");
    return;
  }

  // Deduct money from the wallet balance data variables
  isCurrentlySpinning = true;
  walletBalance = walletBalance - currentBetAmount;
  updateScreenDisplays();

  // Pick our randomized winning icons right now during generation setup
  let spinResults = setupSlots(false);

  // Trigger the CSS slide animation by resetting transform to 0 over 2 seconds
  for (let i = 0; i < slotColumns.length; i++) {
    let boxesContainer = slotColumns[i].querySelector('.boxes');
    
    // Force browser layout engine update before applying smooth sliding transitions
    void boxesContainer.offsetHeight; 
    
    boxesContainer.style.transitionDuration = '2s';
    boxesContainer.style.transform = 'translateY(0px)';
  }

  // Wait 2000 milliseconds (2 seconds) for the sliding transition to finish spinning
  setTimeout(function () {
    // Read individual slot values out of our recorded arrays
    let symbol1 = spinResults[0];
    let symbol2 = spinResults[1];
    let symbol3 = spinResults[2];

    // Check if all three values are mathematically equal to each other
    if (symbol1 === symbol2 && symbol2 === symbol3) {
      let calculatedPrizeAmount = currentBetAmount * winMultiplier;
      walletBalance = walletBalance + calculatedPrizeAmount;
      alert("🎉 WINNER! Match 3! Payout: $" + calculatedPrizeAmount);
    } else if (walletBalance <= 0) {
      currentBetAmount = 0;
    }

    // Spin cycle completed: unlock button operations and refresh labels
    isCurrentlySpinning = false;
    updateScreenDisplays();
  }, 2000);
}

// ==========================================
// 4. ACTION INTERFACES (The Button Hooks)
// ==========================================

// Connect standard click actions to simple variable mutation assignments
document.getElementById('spinner').addEventListener('click', function () {
  triggerSpinCycle();
});

document.getElementById('minBet').addEventListener('click', function () {
  if (isCurrentlySpinning === false) {
    currentBetAmount = minBetValue;
    updateScreenDisplays();
  }
});

document.getElementById('maxBet').addEventListener('click', function () {
  if (isCurrentlySpinning === false) {
    // Set bet to max limit or maximum remaining wallet amount
    if (walletBalance < maxBetValue) {
      currentBetAmount = walletBalance;
    } else {
      currentBetAmount = maxBetValue;
    }
    updateScreenDisplays();
  }
});

document.getElementById('reseter').addEventListener('click', function () {
  if (isCurrentlySpinning === false) {
    walletBalance = 500;
    currentBetAmount = minBetValue;
    updateScreenDisplays();
    setupSlots(true);
  }
});

// ==========================================
// 5. APPLICATION INITIALIZATION (First Boot)
// ==========================================
setupSlots(true);
updateScreenDisplays();



